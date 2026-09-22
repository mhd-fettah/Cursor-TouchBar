'use strict';

const vscode = require('vscode');
const {
  ID,
  DISPLAY_NAME,
  ICONS,
  SLOTS,
  ACTIONS,
  FIXED_BUTTONS,
  SKILL_PAGE,
  ACTION_ROW,
  LABEL_FACES,
  ACTION_PAGE_GROUPS,
  skillFaceToken,
  skillSlotCommand,
  HIDDEN_TOUCHBAR,
  pickableIconIds
} = require('./catalog');
const { writeSkillLabel, writeEmptySkillLabel, skillLabelPath } = require('./labels');
const {
  defaultButtons,
  defaultSkills,
  defaultSkillGroups,
  readUserButtons,
  normalizeButtons,
  normalizeSkills,
  normalizeSkillGroups,
  mainView,
  normalizeView,
  pageItems,
  backView,
  nextView,
  pageStep,
  isActionPage
} = require('./state');
const { renderPanel } = require('./panel');

let configPanel;
let extensionPath = '';
let view = mainView();
let barSync = Promise.resolve();
let shownToken = '';
let shownFace = '';
const faceByLabel = new Map();

function extensionConfig() {
  return vscode.workspace.getConfiguration(ID);
}

function getButtons() {
  return readUserButtons(extensionConfig().inspect('buttons'));
}

function getSkills() {
  return normalizeSkills(extensionConfig().get('skills'));
}

function getSkillGroups() {
  return normalizeSkillGroups(extensionConfig().get('skillGroups'), getSkills());
}

function getUiOptions() {
  const config = extensionConfig();
  return {
    showConfigButton: config.get('showConfigButton', true) !== false,
    showNextStackLogo: config.get('showNextStackLogo', true) !== false
  };
}

function detail(err) {
  return err && err.message ? err.message : String(err);
}

async function setBarContext(key, value) {
  await vscode.commands.executeCommand('setContext', key, value);
}

function skillText(item) {
  if (!item) {
    return '';
  }
  if (item.kind === 'group') {
    return item.name;
  }
  const label = item.skill.label || '';
  return label.charAt(0) === '/' ? label : '/' + label;
}

function claimFace(signature) {
  const existing = faceByLabel.get(signature);
  if (existing !== undefined) {
    return existing;
  }
  const face = faceByLabel.size % LABEL_FACES;
  if (faceByLabel.size >= LABEL_FACES) {
    for (const [key, value] of faceByLabel) {
      if (value === face) {
        faceByLabel.delete(key);
        break;
      }
    }
  }
  faceByLabel.set(signature, face);
  return face;
}

function paintSkillLabels(face, slots) {
  slots.forEach((slot) => {
    const file = skillLabelPath(extensionPath, slot.index, face);
    try {
      if (slot.text) {
        writeSkillLabel(file, slot.text, slot.isGroup, extensionPath);
      } else {
        writeEmptySkillLabel(file);
      }
    } catch (err) {
      void err;
    }
  });
}

async function syncBar() {
  const run = barSync.then(paintBar, paintBar);
  barSync = run.then(() => {}, () => {});
  return run;
}

function viewToken(next) {
  return next.name + '\0' + (next.group || '') + '\0' + (next.offset || 0);
}

async function paintBar() {
  const skills = getSkills();
  const current = normalizeView(view, skills);
  view = current;
  const token = viewToken(current);
  const visible = pageItems(current, skills);
  const onSkills = current.name === 'skills';
  const onActions = isActionPage(current.name);
  const slots = [];
  const still = () => viewToken(view) === token;

  for (let index = 1; index <= SKILL_PAGE; index++) {
    const item = onSkills ? visible.items[index - 1] : null;
    const text = skillText(item);
    slots.push({
      index,
      text,
      isGroup: Boolean(item && item.kind === 'group'),
      show: onSkills && Boolean(text)
    });
  }

  if (!still()) {
    return;
  }

  if (!onSkills) {
    await setBarContext(ID + '.page', current.name);
  }

  let faceChanged = false;
  if (onSkills) {
    // The Touch Bar keeps the first image it loaded for a path, so each label set gets its own files.
    const face = claimFace(slots.map((slot) => (slot.isGroup ? 'g:' : 's:') + slot.text).join('\n'));
    const tokenFace = skillFaceToken(face);
    faceChanged = tokenFace !== shownFace;
    paintSkillLabels(face, slots);
    await setBarContext(ID + '.face', tokenFace);
    shownFace = tokenFace;
  }

  if (!still()) {
    return;
  }

  for (const slot of slots) {
    await setBarContext(ID + '.skill' + slot.index, slot.show);
  }

  for (let index = 1; index <= ACTION_ROW; index++) {
    const item = visible.items[index - 1];
    const action = onActions && item && item.kind === 'action' ? item.action : null;
    await setBarContext(ID + '.pf' + index, Boolean(action));
    await setBarContext(ID + '.pr' + index, action ? action.icon : '');
  }

  if (!still()) {
    return;
  }

  if (onSkills) {
    await setBarContext(ID + '.page', current.name);
  }
  await setBarContext(ID + '.skillGroup', onSkills && current.group ? current.group : '');
  await setBarContext(ID + '.hasNext', visible.hasNext);
  await setBarContext(ID + '.hasPrev', onSkills && (current.offset || 0) > 0);
  await setBarContext(ID + '.showAdd', visible.add);
  if (faceChanged && still()) {
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
  if (still()) {
    shownToken = token;
  }
}

async function hideBuiltIns() {
  const config = vscode.workspace.getConfiguration('keyboard');
  const current = config.get('touchbar.ignored');
  const list = Array.isArray(current) ? current.slice() : [];
  let changed = false;
  for (const id of HIDDEN_TOUCHBAR) {
    if (list.indexOf(id) === -1) {
      list.push(id);
      changed = true;
    }
  }
  if (changed) {
    await config.update('touchbar.ignored', list, vscode.ConfigurationTarget.Global);
  }
}

async function runCommand(command, label) {
  const target = (command || '').trim();
  if (!target) {
    vscode.window.showWarningMessage(DISPLAY_NAME + ': ' + label + ' has no command. Run "Cursor Touch Bar: Configure Buttons" to set one.');
    return;
  }
  try {
    await vscode.commands.executeCommand(target);
  } catch (err) {
    vscode.window.showErrorMessage(DISPLAY_NAME + ' (' + label + ') failed: ' + detail(err));
  }
}

async function runSlot(slotId) {
  const button = getButtons()[slotId];
  if (!button || button.enabled === false) {
    return;
  }
  if (button.type === 'page') {
    view = { name: button.page, group: '', offset: 0 };
    await syncBar();
    return;
  }
  const action = ACTIONS.find((item) => item.type === 'command' && item.command === button.command);
  await runCommand(button.command, action ? action.label : 'Custom command');
}

async function runItem(index) {
  const skills = getSkills();
  view = normalizeView(view, skills);
  if (viewToken(view) !== shownToken) {
    await syncBar();
    return;
  }
  const item = pageItems(view, skills).items[index];
  if (!item) {
    return;
  }
  if (item.kind === 'group') {
    view = normalizeView({ name: 'skills', group: item.name, offset: 0 }, skills);
    await syncBar();
    return;
  }
  if (item.kind === 'action') {
    await runCommand(item.action.command, item.action.label);
    return;
  }
  try {
    await vscode.commands.executeCommand('workbench.action.chat.open', { query: item.skill.prompt });
  } catch (err) {
    vscode.window.showErrorMessage(DISPLAY_NAME + ' (' + item.skill.label + ') failed: ' + detail(err));
  }
}

function openConfigPanel(context, focus) {
  if (configPanel) {
    configPanel.reveal(vscode.ViewColumn.Active);
    configPanel.webview.postMessage({ type: 'focus', target: focus || '' });
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    ID + 'Config',
    DISPLAY_NAME,
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [context.extensionUri]
    }
  );
  configPanel = panel;

  const subscriptions = [];
  context.subscriptions.push(panel);
  context.subscriptions.push(panel.onDidDispose(() => {
    configPanel = undefined;
    subscriptions.forEach((item) => item.dispose());
  }));

  const refresh = (nextFocus) => {
    panel.webview.html = renderPanel(panel.webview, context.extensionUri, {
      buttons: getButtons(),
      skills: getSkills(),
      groups: getSkillGroups(),
      defaults: defaultButtons(),
      focus: nextFocus || '',
      ...getUiOptions()
    });
  };
  refresh(focus);

  panel.webview.onDidReceiveMessage(async (message) => {
    if (!message || (message.type !== 'save' && message.type !== 'resetAll' && message.type !== 'setUi')) {
      return;
    }

    try {
      const config = extensionConfig();
      if (message.type === 'setUi') {
        if (typeof message.showConfigButton === 'boolean') {
          await config.update('showConfigButton', message.showConfigButton, vscode.ConfigurationTarget.Global);
        }
        if (typeof message.showNextStackLogo === 'boolean') {
          await config.update('showNextStackLogo', message.showNextStackLogo, vscode.ConfigurationTarget.Global);
        }
        return;
      }
      if (message.type === 'resetAll') {
        await config.update('buttons', defaultButtons(), vscode.ConfigurationTarget.Global);
        await config.update('skills', defaultSkills(), vscode.ConfigurationTarget.Global);
        await config.update('skillGroups', defaultSkillGroups(), vscode.ConfigurationTarget.Global);
        await config.update('showConfigButton', true, vscode.ConfigurationTarget.Global);
        await config.update('showNextStackLogo', true, vscode.ConfigurationTarget.Global);
        refresh();
        vscode.window.setStatusBarMessage(DISPLAY_NAME + ': reset to defaults', 2000);
        return;
      }

      if (!Array.isArray(message.skills)) {
        panel.webview.postMessage({ type: 'error', text: 'Skills could not be saved.' });
        return;
      }
      for (const skill of message.skills) {
        const label = skill && typeof skill.label === 'string' ? skill.label.trim() : '';
        const prompt = skill && typeof skill.prompt === 'string' ? skill.prompt.trim() : '';
        if (!label || !prompt) {
          panel.webview.postMessage({ type: 'error', text: 'Each skill needs a name and the text to put in chat.' });
          return;
        }
      }

      await config.update('buttons', normalizeButtons(message.buttons), vscode.ConfigurationTarget.Global);
      await config.update('skills', normalizeSkills(message.skills), vscode.ConfigurationTarget.Global);
      await config.update('skillGroups', normalizeSkillGroups(message.groups, message.skills), vscode.ConfigurationTarget.Global);
      panel.webview.postMessage({ type: 'saved' });
      vscode.window.setStatusBarMessage(DISPLAY_NAME + ': configuration saved', 2000);
    } catch (err) {
      const text = DISPLAY_NAME + ': could not update configuration. ' + detail(err);
      panel.webview.postMessage({ type: 'error', text });
      vscode.window.showErrorMessage(text);
    }
  }, undefined, subscriptions);
}

function activate(context) {
  extensionPath = context.extensionPath;
  for (const slot of SLOTS) {
    if (!ICONS[slot.icon] || slot.icon === 'settings') {
      throw new Error(DISPLAY_NAME + ' slot ' + slot.id + ' references unknown icon "' + slot.icon + '"');
    }
  }
  for (const action of ACTIONS) {
    if (!ICONS[action.icon]) {
      throw new Error(DISPLAY_NAME + ' action "' + action.label + '" references unknown icon "' + action.icon + '"');
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(ID + '.configure', () => openConfigPanel(context)),
    vscode.commands.registerCommand(ID + '.configureBrand', () => openConfigPanel(context)),
    vscode.commands.registerCommand(ID + '.back', async () => {
      view = backView(view, getSkills());
      await syncBar();
    }),
    vscode.commands.registerCommand(ID + '.skillPrev', async () => {
      if ((view.offset || 0) <= 0) return;
      view = Object.assign({}, view, { offset: Math.max(0, view.offset - pageStep(view)) });
      await syncBar();
    }),
    vscode.commands.registerCommand(ID + '.next', async () => {
      view = nextView(view);
      await syncBar();
    }),
    vscode.commands.registerCommand(ID + '.addSkill', () => openConfigPanel(context, 'skills')),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(ID)) {
        syncBar();
      }
    })
  );

  for (const button of FIXED_BUTTONS) {
    if (!button.run) {
      continue;
    }
    context.subscriptions.push(
      vscode.commands.registerCommand(button.command, () => runCommand(button.run, button.title))
    );
  }

  for (const slot of SLOTS) {
    for (const iconId of pickableIconIds()) {
      context.subscriptions.push(
        vscode.commands.registerCommand(ID + '.' + slot.id + '.' + iconId, () => runSlot(slot.id))
      );
    }
  }

  for (let face = 0; face < LABEL_FACES; face++) {
    for (let index = 1; index <= SKILL_PAGE; index++) {
      const position = index;
      context.subscriptions.push(
        vscode.commands.registerCommand(skillSlotCommand(face, position), () => runItem(position - 1))
      );
    }
  }

  for (const page of Object.keys(ACTION_PAGE_GROUPS)) {
    for (let index = 1; index <= ACTION_ROW; index++) {
      for (const iconId of pickableIconIds()) {
        const position = index;
        context.subscriptions.push(
          vscode.commands.registerCommand(
            ID + '.page.' + page + '.' + position + '.' + iconId,
            () => runItem(position - 1)
          )
        );
      }
    }
  }

  return hideBuiltIns().catch(() => {}).then(() => syncBar());
}

function deactivate() {}

module.exports = { activate, deactivate };
