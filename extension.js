'use strict';

const vscode = require('vscode');
const { ID, DISPLAY_NAME, ICONS, SLOTS, ACTIONS, FIXED_BUTTONS, pickableIconIds } = require('./catalog');
const {
  defaultButtons,
  readUserButtons,
  normalizeButtons,
  normalizeSkills,
  mainView,
  normalizeView,
  pageItems,
  backView,
  nextView
} = require('./state');
const { renderPanel } = require('./panel');

let configPanel;
let view = mainView();

function extensionConfig() {
  return vscode.workspace.getConfiguration(ID);
}

function getButtons() {
  return readUserButtons(extensionConfig().inspect('buttons'));
}

function getSkills() {
  return normalizeSkills(extensionConfig().get('skills'));
}

function detail(err) {
  return err && err.message ? err.message : String(err);
}

async function setBarContext(key, value) {
  await vscode.commands.executeCommand('setContext', key, value);
}

async function syncBar() {
  view = normalizeView(view, getSkills());
  const visible = pageItems(view, getSkills());
  await setBarContext(ID + '.page', view.name);
  await setBarContext(ID + '.hasNext', visible.hasNext);
  await setBarContext(ID + '.showAdd', visible.add);
  for (let index = 1; index <= 5; index++) {
    const item = visible.items[index - 1];
    await setBarContext(ID + '.item' + index, item ? item.icon : '');
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
  const item = pageItems(view, getSkills()).items[index];
  if (!item) {
    return;
  }
  if (item.kind === 'group') {
    view = { name: 'group', group: item.name, offset: 0 };
    await syncBar();
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
      defaults: defaultButtons(),
      focus: nextFocus || ''
    });
  };
  refresh(focus);

  panel.webview.onDidReceiveMessage(async (message) => {
    if (!message || (message.type !== 'save' && message.type !== 'resetAll')) {
      return;
    }

    try {
      const config = extensionConfig();
      if (message.type === 'resetAll') {
        await config.update('buttons', defaultButtons(), vscode.ConfigurationTarget.Global);
        await config.update('skills', [], vscode.ConfigurationTarget.Global);
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
        if (!skill.icon || !ICONS[skill.icon] || skill.icon === 'settings') {
          panel.webview.postMessage({ type: 'error', text: 'Pick an icon for each skill.' });
          return;
        }
      }

      await config.update('buttons', normalizeButtons(message.buttons), vscode.ConfigurationTarget.Global);
      await config.update('skills', normalizeSkills(message.skills), vscode.ConfigurationTarget.Global);
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
    vscode.commands.registerCommand(ID + '.back', async () => {
      view = backView(view, getSkills());
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

  for (let index = 1; index <= 5; index++) {
    for (const iconId of pickableIconIds()) {
      const position = index;
      context.subscriptions.push(
        vscode.commands.registerCommand(ID + '.item' + position + '.' + iconId, () => runItem(position - 1))
      );
    }
  }

  return syncBar();
}

function deactivate() {}

module.exports = { activate, deactivate };
