'use strict';

const crypto = require('crypto');
const vscode = require('vscode');
const { ICONS, ACTIONS, MAX_ICON_BUTTONS } = require('./catalog');

function iconList(webview, extensionUri) {
  return Object.keys(ICONS)
    .filter((id) => id !== 'settings')
    .map((id) => ({
      id,
      label: ICONS[id].label,
      src: webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ICONS[id].file)).toString()
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function renderPanel(webview, extensionUri, model) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const state = {
    buttons: model.buttons,
    skills: model.skills,
    groups: Array.isArray(model.groups) && model.groups.length ? model.groups : ['Main'],
    defaults: model.defaults,
    actions: ACTIONS.map((action) => ({
      group: action.group,
      label: action.label,
      description: action.description,
      icon: action.icon,
      type: action.type,
      command: action.command || '',
      page: action.page || ''
    })),
    icons: iconList(webview, extensionUri),
    settingsSrc: webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ICONS.settings.file)).toString(),
    brandSrc: webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ICONS['logo-brand'].file)).toString(),
    slotIds: Object.keys(model.buttons).sort((a, b) => Number(a.slice(4)) - Number(b.slice(4))),
    focus: model.focus || '',
    maxIcons: MAX_ICON_BUTTONS,
    showConfigButton: model.showConfigButton !== false,
    showNextStackLogo: model.showNextStackLogo !== false
  };
  const json = JSON.stringify(state)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
<style nonce="${nonce}">
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 20px 22px 48px; max-width: 720px; }
  h1 { font-size: 1.25em; font-weight: 600; margin: 0 0 4px; }
  h2 { font-size: 1em; font-weight: 600; margin: 28px 0 6px; }
  .section-lead { margin: 0 0 10px; font-size: 0.92em; opacity: 0.72; }
  p { margin: 0 0 8px; }
  .muted { opacity: 0.72; font-size: 0.92em; }
  .panel-box {
    border-radius: 8px; border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.35));
    box-sizing: border-box;
  }
  .bar-panel, .skills-panel {
    background: #161616; border-radius: 12px; overflow: hidden;
    border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.35));
    box-sizing: border-box;
  }
  .scroller { overflow-x: auto; max-width: 100%; }
  .tb-halo {
    display: flex; align-items: center; flex: none; overflow: hidden; border-radius: 8px;
    background: #4f6bed; box-shadow: 0 0 0 2px rgba(79,107,237,0.35);
  }
  .tb-halo button.move-side {
    width: 22px; height: 36px; padding: 0; font-size: 18px; line-height: 1; color: #fff;
    background: rgba(0,0,0,0.22); border: none; cursor: pointer; flex: none;
  }
  .tb-halo button.move-side:hover { background: rgba(0,0,0,0.32); }
  .tb-halo .tb, .tb-halo .spacer {
    margin: 0; border-radius: 0; box-shadow: none !important; background: transparent !important;
  }
  .tb-halo.space-halo .spacer { width: 24px; }
  .touch { display: flex; align-items: center; width: max-content; min-width: 100%; padding: 10px 12px; box-sizing: border-box; }
  .cluster { display: flex; align-items: center; background: #2c2c2e; border-radius: 8px; flex: none; overflow: hidden; }
  button.tb, button.spacer, button.chip, button.scroll-btn, div.tb {
    border: none; color: #fff; font-family: inherit; cursor: pointer; flex: none; background: transparent;
  }
  button.tb, div.tb {
    width: 44px; height: 36px; background: #2c2c2e; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .cluster button.tb { background: transparent; border-radius: 0; }
  button.tb.on, button.spacer.on {
    background: #4f6bed; box-shadow: 0 0 0 2px rgba(79,107,237,0.45);
  }
  .cluster button.tb.on { border-radius: 6px; }
  .gear { opacity: 0.85; margin-left: 8px; }
  .tb.brand {
    width: auto; min-width: 44px; height: 36px; padding: 0 8px; margin-left: 4px;
    background: #2c2c2e; border-radius: 8px;
  }
  .tb.brand img { width: auto; height: 16px; max-width: 96px; pointer-events: none; }
  .bar-options { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
  .bar-options label { display: flex; align-items: center; gap: 8px; font-size: 0.92em; cursor: pointer; }
  .bar-options input { margin: 0; }
  button.tb img, div.tb img { width: 20px; height: 20px; pointer-events: none; }
  button.spacer { width: 28px; height: 36px; margin: 0 6px; border-radius: 6px; box-shadow: inset 0 0 0 1px #4a4a4a; }
  .detail {
    margin-top: 10px; padding: 10px 12px;
  }
  .detail .title { font-weight: 600; margin-bottom: 4px; }
  .detail .muted { margin-bottom: 8px; }
  .detail-actions { display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap; }
  button.pick {
    flex: 1; min-width: 120px; display: flex; align-items: center; justify-content: center; gap: 8px;
    box-sizing: border-box; height: 44px; min-height: 44px; padding: 0 12px;
    background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground);
    border: none; border-radius: 4px; cursor: pointer; font-family: inherit;
  }
  button.pick img { width: 22px; height: 22px; }
  button.pick.icon-only {
    flex: 0 0 auto; min-width: 0; width: 44px; height: 44px; padding: 0;
    justify-content: center;
  }
  button.pick.icon-only img { width: 24px; height: 24px; }
  button.pick.action-wide { flex: 1; min-width: 120px; }
  button.pick.action-filled {
    height: 44px; min-height: 44px; padding: 0 12px;
    justify-content: flex-start; overflow: hidden;
  }
  .action-pick-line {
    min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    text-align: left; font-size: 0.9em;
  }
  .action-pick-line .action-pick-title { font-weight: 600; }
  .action-pick-line .action-pick-sep { opacity: 0.55; margin: 0 0.35em; font-weight: 400; }
  .action-pick-line .action-pick-desc { opacity: 0.72; font-weight: 400; }
  button.pick:disabled { opacity: 0.55; cursor: not-allowed; }
  .space-visual {
    flex: 0 0 auto; width: 44px; height: 44px; padding: 0;
    box-shadow: inset 0 0 0 1px var(--vscode-widget-border, rgba(128,128,128,0.45));
    border-radius: 4px; background: transparent;
  }
  .space-info {
    flex: 1; min-width: 120px; pointer-events: none; display: flex; align-items: center;
    height: 44px; min-height: 44px; padding: 0 12px; box-sizing: border-box; border-radius: 4px;
    background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground);
  }
  .detail-actions.confirm-row { width: 100%; }
  .detail-actions.confirm-row button.pick { flex: 1; min-width: 0; height: 44px; padding: 0 12px; }
  .detail-actions > button.pick.danger { height: 44px; }
  button.pick.danger, button.act.danger {
    flex: none; min-width: auto;
    background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
    color: var(--vscode-inputValidation-errorForeground, #f88);
  }
  .skills-editor label.field { margin-top: 8px; }
  .skills-editor label.field:first-child { margin-top: 0; }
  .skills-editor .detail-actions { margin-top: 12px; justify-content: space-between; }
  .skills-editor .detail-actions button.pick { flex: 0 0 auto; min-width: 0; }
  button.pick.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .skill-group { flex: none; margin: 0 4px 0 2px; font-size: 0.72em; opacity: 0.65; }
  .skill-gap { width: 12px; flex: none; }
  .skills-divider {
    height: 0; margin: 0; border: none;
    border-top: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.35));
  }
  .skills-row {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; box-sizing: border-box;
  }
  .skills-row-items {
    flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; overflow-x: auto;
  }
  button.skills-item {
    border: none; background: transparent; font-family: inherit; font-size: 0.9em;
    cursor: pointer; padding: 4px 8px; border-radius: 6px; flex: none; color: #fff;
  }
  button.skills-item.skill-item { color: #d6b25e; }
  button.skills-item.on { background: #4f6bed; color: #fff; }
  .tb-halo button.skills-item { background: transparent; border-radius: 0; }
  .tb-halo button.skills-item.on { background: transparent; }
  button.skills-add {
    flex: none; display: inline-flex; align-items: center; gap: 6px; margin-left: auto;
    border: none; background: transparent; color: inherit; opacity: 0.88;
    font-family: inherit; font-size: 0.88em; cursor: pointer; padding: 4px 0; white-space: nowrap;
  }
  button.skills-add img { width: 14px; height: 14px; pointer-events: none; opacity: 0.9; }
  select.group-select {
    width: 100%; box-sizing: border-box; margin-top: 4px; height: 32px;
    background: var(--vscode-input-background); color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent); border-radius: 4px; padding: 4px 8px;
    font-family: inherit; font-size: inherit;
  }
  .page-save { margin-top: 20px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .page-save button.act {
    height: 44px; padding: 0 16px; box-sizing: border-box;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .page-save button.act.saved-flash {
    background: #2f7d4a; color: #fff;
  }
  button.chip {
    height: 36px; padding: 0 14px; border-radius: 8px; background: #2c2c2e; color: #fff; font-size: 0.95em;
  }
  .editor { margin-top: 14px; }
  .title { font-weight: 600; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
  button.act {
    background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground);
    border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-family: inherit;
  }
  button.act.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  button.act.danger { background: var(--vscode-inputValidation-errorBackground, #5a1d1d); color: var(--vscode-inputValidation-errorForeground, #f88); }
  input[type=text], textarea {
    width: 100%; box-sizing: border-box; margin-top: 4px;
    background: var(--vscode-input-background); color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent); border-radius: 4px; padding: 6px 8px;
    font-family: inherit; font-size: inherit;
  }
  textarea { min-height: 72px; resize: vertical; }
  label.field { display: block; margin-top: 10px; font-size: 0.85em; opacity: 0.8; }
  .error { color: var(--vscode-errorForeground); min-height: 1.2em; margin-top: 8px; }
  #picker { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
  #picker.hidden { display: none; }
  .sheet { width: min(560px, 92vw); max-height: 80vh; overflow: auto; padding: 16px; border-radius: 8px; background: var(--vscode-editor-background); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px; margin-top: 12px; }
  button.choice {
    display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; font-size: 0.75em;
    background: transparent; color: inherit; border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.35));
    border-radius: 4px; cursor: pointer; font-family: inherit;
  }
  button.choice img { width: 28px; height: 28px; }
  #picker [hidden] { display: none !important; }
  button.action {
    display: block; width: 100%; text-align: left; margin-top: 6px; padding: 8px 10px;
    background: transparent; color: inherit; border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.35));
    border-radius: 4px; cursor: pointer; font-family: inherit;
  }
  button.action.action-page-row {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .action-page-row .action-row-body { flex: 1; min-width: 0; text-align: left; }
  .action-page-mark { width: 20px; height: 20px; opacity: 0.85; flex: none; }
  #reset-modal, #editor-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
  #reset-modal.hidden, #editor-modal.hidden { display: none; }
  .sheet.sheet-narrow { width: min(380px, 92vw); }
  .sheet-narrow .modal-actions { display: flex; gap: 8px; margin-top: 14px; }
  .sheet-narrow .modal-actions button.pick { flex: 1; min-width: 0; height: 44px; }
  .group-label { margin-top: 14px; font-size: 0.8em; opacity: 0.7; }
</style>
</head>
<body>
  <div id="app"></div>
  <div id="picker" class="hidden"></div>
  <div id="reset-modal" class="hidden"></div>
  <div id="editor-modal" class="hidden"></div>
<script nonce="${nonce}">
const vscodeApi = acquireVsCodeApi();
const model = ${json};
const MAX_ICON_BUTTONS = model.maxIcons;
model.picker = null;
model.pick = { kind: 'add' };
model.confirm = null;
model.resetConfirm = false;
model.tailSpace = false;
model.skillIndex = -1;
model.groups = Array.isArray(model.groups) && model.groups.length ? model.groups.slice() : ['Main'];
if (model.groups.indexOf('Main') === -1) model.groups.unshift('Main');
model.groupName = 'Main';
model.editor = null;
model.focusEditor = false;
model.drag = null;

function h(tag, attrs) {
  const node = document.createElement(tag);
  const data = attrs || {};
  Object.keys(data).forEach((key) => {
    if (key === 'class') node.className = data[key];
    else if (key === 'text') node.textContent = data[key];
    else if (key === 'disabled') { if (data[key]) node.disabled = true; }
    else if (data[key] != null) node.setAttribute(key, data[key]);
  });
  for (let i = 2; i < arguments.length; i++) {
    if (arguments[i]) node.append(arguments[i]);
  }
  return node;
}

function skillParts(label) {
  const name = (label || '').trim();
  const bare = name.charAt(0) === '/' ? name.slice(1) : name;
  return bare || 'name';
}

function skillDisplayText(label) {
  return '/' + skillParts(label);
}

function iconSrc(id) {
  const icon = model.icons.find((item) => item.id === id);
  return icon ? icon.src : '';
}

function describe(button) {
  const action = model.actions.find((item) => {
    if (item.type !== button.type) return false;
    return item.type === 'page' ? item.page === button.page : item.command === button.command;
  });
  if (action) return action;
  if (button.type === 'page') return { label: 'Another row', description: 'Opens a second row on the Touch Bar.' };
  if (button.command) return { label: 'Custom command', description: button.command };
  return { label: 'Empty', description: 'Choose an action for this button.' };
}

function enabledIds() {
  return model.slotIds.filter((id) => model.buttons[id].enabled);
}

function iconCount() {
  return enabledIds().length;
}

function canAddIcon() {
  return iconCount() < MAX_ICON_BUTTONS;
}

function insertIndexForAdd(seq) {
  let index = seq.length;
  if (model.pick && model.pick.kind === 'button') {
    const at = seq.findIndex((item) => item.button === model.pick.button);
    if (at >= 0) index = at + 1;
  } else if (model.pick && model.pick.kind === 'add') {
    while (index > 0 && seq[index - 1].kind === 'space') index--;
  }
  return index;
}

function blankButton() {
  return { enabled: false, icon: 'plus', type: 'command', command: '', page: '', spaceBefore: false };
}

function sortSlotIds() {
  model.slotIds.sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
}

function reserveSlotId() {
  const free = model.slotIds.find((id) => !model.buttons[id].enabled);
  if (free) return free;
  let index = 1;
  while (model.buttons['slot' + index]) index++;
  const id = 'slot' + index;
  model.buttons[id] = blankButton();
  model.slotIds.push(id);
  sortSlotIds();
  return id;
}

function actionConfigured(button) {
  return button.type === 'page' ? Boolean(button.page) : Boolean((button.command || '').trim());
}

function iconConfigured(button) {
  return Boolean(button.icon && button.icon !== 'plus');
}

function writeEnabled(items) {
  const leftovers = model.slotIds
    .map((id) => model.buttons[id])
    .filter((button) => items.indexOf(button) === -1);
  const next = {};
  items.forEach((button, index) => {
    button.enabled = true;
    if (index === 0) button.spaceBefore = false;
    next[model.slotIds[index]] = button;
  });
  for (let index = items.length; index < model.slotIds.length; index++) {
    const spare = leftovers.shift() || blankButton();
    spare.enabled = false;
    spare.spaceBefore = false;
    next[model.slotIds[index]] = spare;
  }
  model.buttons = next;
}

function readSequence() {
  const seq = [];
  enabledIds().forEach((id) => {
    const button = model.buttons[id];
    if (button.spaceBefore) seq.push({ kind: 'space' });
    seq.push({ kind: 'button', button });
  });
  if (model.tailSpace) seq.push({ kind: 'space' });
  return seq;
}

function writeSequence(seq) {
  const buttons = [];
  const spaces = [];
  let gap = false;
  let tail = false;
  seq.forEach((item) => {
    if (item.kind === 'space') {
      if (buttons.length) {
        gap = true;
        tail = true;
      }
      return;
    }
    spaces.push(gap);
    gap = false;
    tail = false;
    buttons.push(item.button);
  });
  model.tailSpace = tail;
  buttons.forEach((button, index) => {
    button.spaceBefore = index > 0 && spaces[index] === true;
  });
  writeEnabled(buttons);
}

function slotOf(button) {
  return model.slotIds.find((id) => model.buttons[id] === button) || '';
}

function moveButtonTo(fromId, toId) {
  const seq = readSequence();
  const from = seq.findIndex((item) => item.kind === 'button' && slotOf(item.button) === fromId);
  const to = seq.findIndex((item) => item.kind === 'button' && slotOf(item.button) === toId);
  if (from < 0 || to < 0 || from === to) return;
  const item = seq.splice(from, 1)[0];
  seq.splice(to, 0, item);
  writeSequence(seq);
  model.pick = { kind: 'button', button: item.button };
  render();
}

function moveSkill(from, to) {
  if (from === to || from < 0 || to < 0 || to >= model.skills.length) return;
  const item = model.skills.splice(from, 1)[0];
  model.skills.splice(to, 0, item);
  model.skillIndex = to;
  render();
}

function confirmBlock(target) {
  const box = h('div', { class: 'confirm' });
  const row = h('div', { class: 'detail-actions confirm-row' });
  row.append(h('button', { class: 'pick danger', 'data-act': 'confirm-delete', 'data-target': target, text: 'Confirm delete' }));
  row.append(h('button', { class: 'pick', 'data-act': 'cancel-delete', text: 'Cancel' }));
  box.append(row);
  return box;
}

function renderDetail() {
  const box = h('div', { class: 'detail panel-box', id: 'detail' });
  const pick = model.pick || { kind: 'add' };
  if (pick.kind === 'add') {
    const row = h('div', { class: 'detail-actions' });
    const addIcon = h('button', {
      class: 'pick',
      text: canAddIcon() ? 'Add icon' : 'Limit reached · ' + MAX_ICON_BUTTONS + ' icons'
    });
    if (canAddIcon()) addIcon.setAttribute('data-act', 'add-icon');
    else addIcon.disabled = true;
    row.append(addIcon, h('button', { class: 'pick', 'data-act': 'add-space', text: 'Add space' }));
    box.append(row);
    return box;
  }
  if (pick.kind === 'space') {
    if (model.confirm === 'space') {
      box.append(confirmBlock('space'));
      return box;
    }
    const row = h('div', { class: 'detail-actions' });
    row.append(h('div', { class: 'space-visual', 'aria-hidden': 'true' }));
    const info = h('div', { class: 'pick action-wide action-filled space-info' });
    const line = h('div', { class: 'action-pick-line' });
    line.append(h('span', { class: 'action-pick-title', text: 'Space' }));
    line.append(h('span', { class: 'action-pick-sep', text: '·' }));
    line.append(h('span', { class: 'action-pick-desc', text: 'A gap between button groups on the Touch Bar.' }));
    info.append(line);
    row.append(info, h('button', { class: 'pick danger', 'data-act': 'remove-space', text: 'Delete' }));
    box.append(row);
    return box;
  }
  const id = slotOf(pick.button);
  const info = describe(pick.button);
  const button = pick.button;
  if (model.confirm === 'button') {
    box.append(confirmBlock('button'));
    return box;
  }
  const row = h('div', { class: 'detail-actions' });
  const iconLabel = iconConfigured(button) ? 'Change icon' : 'Select icon';
  const iconBtn = h('button', { class: 'pick icon-only', 'data-act': 'icon', 'data-slot': id, title: iconLabel });
  iconBtn.append(h('img', { src: iconSrc(button.icon), alt: iconLabel }));
  const actionBtn = h('button', {
    class: 'pick action-wide' + (actionConfigured(button) ? ' action-filled' : ''),
    'data-act': 'action',
    'data-slot': id,
    title: actionConfigured(button) ? 'Change action' : 'Select action'
  });
  if (actionConfigured(button)) {
    const line = h('div', { class: 'action-pick-line' });
    line.append(h('span', { class: 'action-pick-title', text: info.label }));
    line.append(h('span', { class: 'action-pick-sep', text: '·' }));
    line.append(h('span', { class: 'action-pick-desc', text: info.description }));
    actionBtn.append(line);
  } else {
    actionBtn.textContent = 'Select action';
  }
  row.append(iconBtn, actionBtn, h('button', { class: 'pick danger', 'data-act': 'remove-button', text: 'Delete' }));
  box.append(row);
  return box;
}

function moveSide(dir, act) {
  return h('button', {
    class: 'move-side',
    'data-act': act || 'nudge',
    'data-dir': String(dir),
    title: dir < 0 ? 'Move left' : 'Move right',
    text: dir < 0 ? '‹' : '›'
  });
}

function wrapHalo(center, space, act) {
  const wrap = h('div', { class: 'tb-halo' + (space ? ' space-halo' : '') });
  wrap.append(moveSide(-1, act), center, moveSide(1, act));
  return wrap;
}

function render() {
  if (!model.pick) model.pick = { kind: 'add' };
  if (model.skillIndex >= model.skills.length) model.skillIndex = model.skills.length - 1;

  const app = document.getElementById('app');
  app.replaceChildren();
  app.append(h('h1', { text: 'Cursor Touch Bar' }));
  app.append(h('p', { class: 'muted', text: 'Click a button to change it. Add chooses an icon or a space.' }));

  const bar = h('div', { class: 'touch' });
  const seq = readSequence();
  let cluster = null;
  const flush = () => {
    if (!cluster) return;
    bar.append(cluster);
    cluster = null;
  };
  seq.forEach((item, index) => {
    if (item.kind === 'space') {
      flush();
      const on = model.pick && model.pick.kind === 'space' && model.pick.index === index;
      const spacer = h('button', {
        class: 'spacer',
        'data-act': 'select-space',
        'data-index': String(index),
        title: 'Space'
      });
      bar.append(on ? wrapHalo(spacer, true) : spacer);
      return;
    }
    const id = slotOf(item.button);
    const info = describe(item.button);
    const on = model.pick && model.pick.kind === 'button' && model.pick.button === item.button;
    const node = h('button', {
      class: 'tb',
      'data-act': 'select',
      'data-slot': id,
      title: info.label
    });
    node.draggable = true;
    node.append(h('img', { src: iconSrc(item.button.icon), alt: info.label }));
    if (on) {
      flush();
      bar.append(wrapHalo(node, false));
      return;
    }
    if (!cluster) cluster = h('div', { class: 'cluster' });
    cluster.append(node);
  });
  flush();

  if (model.showConfigButton) {
    bar.append(h('div', { class: 'tb gear', title: 'Settings' }, h('img', { src: model.settingsSrc, alt: 'Settings' })));
  }
  if (model.showNextStackLogo) {
    bar.append(h('div', { class: 'tb brand', title: 'N3XTTECH' }, h('img', { src: model.brandSrc, alt: 'N3XTTECH' })));
  }
  app.append(h('div', { class: 'bar-panel' }, h('div', { class: 'scroller' }, bar)));
  const detailWrap = h('div', { class: 'detail-wrap' });
  detailWrap.append(renderDetail());
  const opts = h('div', { class: 'bar-options' });
  const gearOpt = h('label');
  const gearCb = h('input', { type: 'checkbox', 'data-ui': 'showConfigButton' });
  gearCb.checked = model.showConfigButton !== false;
  gearOpt.append(gearCb, document.createTextNode('Show settings button'));
  const brandOpt = h('label');
  const brandCb = h('input', { type: 'checkbox', 'data-ui': 'showNextStackLogo' });
  brandCb.checked = model.showNextStackLogo !== false;
  brandOpt.append(brandCb, document.createTextNode('Show N3XTTECH logo'));
  opts.append(gearOpt, brandOpt);
  detailWrap.append(opts);
  app.append(detailWrap);

  const skillsBlock = h('div', { id: 'skills-block' });
  skillsBlock.append(h('h2', { id: 'skills', text: 'Skills' }));
  skillsBlock.append(h('p', {
    class: 'section-lead',
    text: 'Open Agent chat with a preset prompt or Cursor /skill.'
  }));
  skillsBlock.append(renderSkillsPanel());
  app.append(skillsBlock);

  const save = h('div', { class: 'row page-save' });
  save.append(h('button', { class: 'act primary', id: 'save-button', 'data-act': 'save', text: 'Save' }));
  save.append(h('button', { class: 'act', 'data-act': 'reset-all', text: 'Reset' }));
  app.append(save);
  app.append(h('p', { id: 'form-error', class: 'error' }));

  if (model.focusEditor) {
    const input = document.querySelector('#editor-modal [data-modal-field]');
    if (input) input.focus();
    model.focusEditor = false;
  }
  if (model.focus === 'skills') {
    const heading = document.getElementById('skills');
    if (heading) heading.scrollIntoView();
    model.focus = '';
  }
  drawResetModal();
  drawEditorModal();
}

function skillGroupName(skill) {
  const name = skill && (skill.group || '').trim();
  return name || 'Main';
}

function skillsAddButton(act, label) {
  const btn = h('button', { class: 'skills-add', 'data-act': act });
  const plusSrc = iconSrc('plus');
  if (plusSrc) btn.append(h('img', { src: plusSrc, alt: '' }));
  btn.append(document.createTextNode(label));
  return btn;
}

function renderSkillsPanel() {
  const panel = h('div', { class: 'skills-panel' });
  const groupRow = h('div', { class: 'skills-row' });
  const groupItems = h('div', { class: 'skills-row-items', id: 'group-scroller' });
  model.groups.forEach((name) => {
    const on = model.groupName === name;
    groupItems.append(h('button', {
      class: 'skills-item group-item' + (on ? ' on' : ''),
      'data-act': 'select-group',
      'data-group': name,
      text: name
    }));
  });
  groupRow.append(groupItems, skillsAddButton('open-add-group', 'Add group'));
  panel.append(groupRow);
  panel.append(h('div', { class: 'skills-divider' }));
  const skillRow = h('div', { class: 'skills-row' });
  const skillItems = h('div', { class: 'skills-row-items', id: 'skill-scroller' });
  model.skills.forEach((skill, index) => {
    if (skillGroupName(skill) !== model.groupName) return;
    const on = model.skillIndex === index;
    const item = h('button', {
      class: 'skills-item skill-item' + (on ? ' on' : ''),
      'data-act': 'select-skill',
      'data-index': String(index),
      title: skill.prompt || 'Skill',
      text: skillDisplayText(skill.label)
    });
    item.draggable = true;
    skillItems.append(on ? wrapHalo(item, false, 'skill-nudge') : item);
  });
  skillRow.append(skillItems, skillsAddButton('open-add-skill', 'Add skill'));
  panel.append(skillRow);
  return panel;
}

function persistConfig() {
  const error = document.getElementById('form-error');
  const missing = model.skills.some((skill) => !skill.label.trim() || !skill.prompt.trim());
  if (missing) {
    if (error) error.textContent = 'Each skill needs a name and the text to put in chat.';
    return false;
  }
  if (error) error.textContent = '';
  vscodeApi.postMessage({
    type: 'save',
    buttons: model.buttons,
    skills: model.skills.map((skill) => ({
      id: skill.id,
      label: skill.label.trim(),
      prompt: skill.prompt.trim(),
      group: skillGroupName(skill)
    })),
    groups: model.groups
  });
  return true;
}

function openSkillEditor(index) {
  model.editor = {
    kind: 'skill',
    mode: index >= 0 ? 'edit' : 'add',
    index: index >= 0 ? index : -1
  };
  model.focusEditor = true;
  drawEditorModal();
}

function openGroupEditor(name, mode) {
  model.editor = {
    kind: 'group',
    mode: mode || (name ? 'edit' : 'add'),
    group: name || ''
  };
  model.focusEditor = true;
  drawEditorModal();
}

function closeEditorModal() {
  model.editor = null;
  const root = document.getElementById('editor-modal');
  if (!root) return;
  root.classList.add('hidden');
  root.replaceChildren();
}

function readEditorFields() {
  const root = document.getElementById('editor-modal');
  if (!root) return {};
  const out = {};
  root.querySelectorAll('[data-modal-field]').forEach((node) => {
    out[node.getAttribute('data-modal-field')] = node.value;
  });
  return out;
}

function drawEditorModal() {
  const root = document.getElementById('editor-modal');
  if (!root) return;
  const editor = model.editor;
  if (!editor) {
    root.classList.add('hidden');
    root.replaceChildren();
    return;
  }
  root.classList.remove('hidden');
  const sheet = h('div', { class: 'sheet sheet-narrow' });
  if (editor.kind === 'skill') {
    const skill = editor.mode === 'edit' ? model.skills[editor.index] : null;
    sheet.append(h('div', { class: 'title', text: editor.mode === 'edit' ? 'Edit skill' : 'Add skill' }));
    sheet.append(h('label', { class: 'field', text: 'Name' }));
    sheet.append(h('input', {
      type: 'text',
      'data-modal-field': 'label',
      value: skill ? skill.label : '',
      placeholder: 'Review'
    }));
    sheet.append(h('label', { class: 'field', text: 'Text to put in chat' }));
    const prompt = h('textarea', {
      'data-modal-field': 'prompt',
      placeholder: 'Review the current changes and list the risks.'
    });
    if (skill) prompt.value = skill.prompt;
    sheet.append(prompt);
    sheet.append(h('label', { class: 'field', text: 'Group' }));
    const group = h('select', { class: 'group-select', 'data-modal-field': 'group' });
    model.groups.forEach((name) => group.append(h('option', { value: name, text: name })));
    group.value = skill ? skillGroupName(skill) : (model.groupName || 'Main');
    sheet.append(group);
    const row = h('div', { class: 'modal-actions' });
    row.append(h('button', { class: 'pick primary', 'data-act': 'modal-save-skill', text: 'Save' }));
    if (editor.mode === 'edit') {
      row.append(h('button', { class: 'pick danger', 'data-act': 'modal-delete-skill', text: 'Delete' }));
    }
    sheet.append(row);
  } else {
    const isMain = editor.mode === 'edit' && editor.group === 'Main';
    sheet.append(h('div', { class: 'title', text: editor.mode === 'edit' ? 'Edit group' : 'Add group' }));
    sheet.append(h('label', { class: 'field', text: 'Group name' }));
    sheet.append(h('input', {
      type: 'text',
      'data-modal-field': 'name',
      value: editor.mode === 'edit' ? editor.group : '',
      placeholder: 'Design',
      disabled: isMain
    }));
    const row = h('div', { class: 'modal-actions' });
    row.append(h('button', { class: 'pick primary', 'data-act': 'modal-save-group', text: 'Save' }));
    if (editor.mode === 'edit' && !isMain) {
      row.append(h('button', { class: 'pick danger', 'data-act': 'modal-delete-group', text: 'Delete' }));
    }
    sheet.append(row);
  }
  root.replaceChildren(sheet);
}

function drawResetModal() {
  const root = document.getElementById('reset-modal');
  if (!root) return;
  if (!model.resetConfirm) {
    root.classList.add('hidden');
    root.replaceChildren();
    return;
  }
  root.classList.remove('hidden');
  const sheet = h('div', { class: 'sheet' });
  sheet.append(h('p', {
    text: 'Are you sure you want to erase all your data and reset to the default?'
  }));
  const row = h('div', { class: 'detail-actions confirm-row' });
  row.append(h('button', { class: 'pick danger', 'data-act': 'confirm-reset', text: 'Confirm reset' }));
  row.append(h('button', { class: 'pick', 'data-act': 'cancel-reset', text: 'Cancel' }));
  sheet.append(row);
  root.replaceChildren(sheet);
}

function closePicker() {
  model.picker = null;
  const root = document.getElementById('picker');
  root.classList.add('hidden');
  root.replaceChildren();
}

function applyAction(slotId, action) {
  const button = model.buttons[slotId];
  button.type = action.type;
  button.command = action.command || '';
  button.page = action.page || '';
  button.icon = action.icon;
  closePicker();
  render();
}

function filterPicker(query) {
  const q = (query || '').trim().toLowerCase();
  document.querySelectorAll('#picker [data-filter]').forEach((row) => {
    const hay = (row.getAttribute('data-filter') || '').toLowerCase();
    row.hidden = q.length > 0 && hay.indexOf(q) === -1;
  });
}

function drawPicker() {
  const root = document.getElementById('picker');
  root.replaceChildren();
  const picker = model.picker;
  if (!picker) {
    root.classList.add('hidden');
    return;
  }
  root.classList.remove('hidden');
  const sheet = h('div', { class: 'sheet' });
  const search = h('input', { id: 'search', type: 'text', placeholder: picker.kind === 'action' ? 'Search actions' : 'Search icons' });
  sheet.append(h('div', { class: 'title', text: picker.kind === 'action' ? 'Choose an action' : 'Choose an icon' }));
  sheet.append(search);

  if (picker.kind === 'action') {
    const layersSrc = iconSrc('layers');
    let group = '';
    model.actions.forEach((action) => {
      const filterText = (action.group + ' ' + action.label + ' ' + action.description).toLowerCase();
      if (action.group !== group) {
        group = action.group;
        sheet.append(h('div', { class: 'group-label', text: group, 'data-filter': group.toLowerCase() }));
      }
      const isPage = action.type === 'page';
      const row = h('button', {
        class: 'action' + (isPage ? ' action-page-row' : ''),
        'data-filter': filterText,
        'data-act': 'pick-action',
        'data-label': action.label
      });
      const body = h('div', { class: isPage ? 'action-row-body' : '' });
      body.append(h('div', { class: 'title', text: action.label }));
      body.append(h('div', { class: 'muted', text: action.description }));
      row.append(body);
      if (isPage && layersSrc) row.append(h('img', { class: 'action-page-mark', src: layersSrc, alt: '' }));
      sheet.append(row);
    });
    const custom = h('div', { id: 'custom-block', 'data-filter': 'custom command' });
    custom.append(h('div', { class: 'group-label', text: 'Custom' }));
    custom.append(h('input', { id: 'custom-command', type: 'text', placeholder: 'workbench.action.files.save' }));
    custom.append(h('div', { class: 'row' }, h('button', { class: 'act', 'data-act': 'use-custom', text: 'Use command id' })));
    sheet.append(custom);
  } else {
    const grid = h('div', { class: 'grid' });
    model.icons.forEach((icon) => {
      const choice = h('button', {
        class: 'choice',
        'data-filter': (icon.id + ' ' + icon.label).toLowerCase(),
        'data-act': 'pick-icon',
        'data-icon': icon.id
      });
      choice.append(h('img', { src: icon.src, alt: '' }));
      choice.append(document.createTextNode(icon.label));
      grid.append(choice);
    });
    sheet.append(grid);
  }

  root.append(sheet);
  search.addEventListener('input', () => filterPicker(search.value));
  search.focus();
}

document.body.addEventListener('click', (event) => {
  const picker = document.getElementById('picker');
  if (event.target === picker) {
    closePicker();
    return;
  }
  const resetModal = document.getElementById('reset-modal');
  if (event.target === resetModal) {
    model.resetConfirm = false;
    drawResetModal();
    return;
  }
  const editorModal = document.getElementById('editor-modal');
  if (event.target === editorModal && model.editor) {
    closeEditorModal();
    return;
  }
  const node = event.target.closest('[data-act]');
  if (!node) {
    const inSkills = event.target.closest('#skills-block');
    if (inSkills && model.skillIndex >= 0) {
      const skillBar = event.target.closest('#skill-scroller');
      const emptyBar = skillBar && !event.target.closest('button, .tb-halo, .skills-item');
      if (emptyBar) {
        model.confirm = null;
        model.skillIndex = -1;
        render();
      }
    }
    if (!inSkills && model.pick && model.pick.kind !== 'add') {
      const scroller = event.target.closest('.scroller');
      const inApp = event.target.closest('#app');
      const onBar = scroller && !event.target.closest('button, .tb-halo');
      const outsideDetail = inApp && !event.target.closest('#detail') && !event.target.closest('.scroller');
      if (onBar || outsideDetail) {
        model.confirm = null;
        model.pick = { kind: 'add' };
        render();
      }
    }
    return;
  }
  const act = node.getAttribute('data-act');
  const slotId = node.getAttribute('data-slot') || slotOf(model.pick && model.pick.button);

  if (act === 'save') {
    persistConfig();
    return;
  }
  if (act === 'reset-all') {
    model.resetConfirm = true;
    drawResetModal();
    return;
  }
  if (act === 'cancel-reset') {
    model.resetConfirm = false;
    drawResetModal();
    return;
  }
  if (act === 'confirm-reset') {
    model.resetConfirm = false;
    drawResetModal();
    vscodeApi.postMessage({ type: 'resetAll' });
    return;
  }
  if (act === 'select') {
    const button = model.buttons[slotId];
    model.confirm = null;
    model.pick = { kind: 'button', button };
    render();
    return;
  }
  if (act === 'select-space') {
    const index = Number(node.getAttribute('data-index'));
    model.confirm = null;
    model.pick = { kind: 'space', index };
    render();
    return;
  }
  if (act === 'skill-nudge') {
    moveSkill(model.skillIndex, model.skillIndex + Number(node.getAttribute('data-dir')));
    return;
  }
  if (act === 'add-icon') {
    if (!canAddIcon()) return;
    const disabledId = reserveSlotId();
    const button = model.buttons[disabledId];
    button.icon = 'plus';
    button.type = 'command';
    button.command = '';
    button.page = '';
    const seq = readSequence();
    const index = insertIndexForAdd(seq);
    seq.splice(index, 0, { kind: 'button', button });
    writeSequence(seq);
    model.pick = { kind: 'button', button };
    render();
    return;
  }
  if (act === 'add-space') {
    const seq = readSequence();
    const index = insertIndexForAdd(seq);
    if (seq[index - 1] && seq[index - 1].kind === 'space') return;
    if (seq[index] && seq[index].kind === 'space') return;
    seq.splice(index, 0, { kind: 'space' });
    writeSequence(seq);
    model.pick = { kind: 'space', index: Math.min(index, readSequence().length - 1) };
    render();
    return;
  }
  if (act === 'remove-button') {
    if (!model.pick || model.pick.kind !== 'button') return;
    model.confirm = 'button';
    render();
    return;
  }
  if (act === 'remove-space') {
    if (!model.pick || model.pick.kind !== 'space') return;
    model.confirm = 'space';
    render();
    return;
  }
  if (act === 'cancel-delete') {
    model.confirm = null;
    render();
    return;
  }
  if (act === 'confirm-delete') {
    const target = node.getAttribute('data-target');
    if (target === 'button' && model.pick && model.pick.kind === 'button') {
      const seq = readSequence().filter((item) => item.button !== model.pick.button);
      writeSequence(seq);
      model.pick = { kind: 'add' };
    } else if (target === 'space' && model.pick && model.pick.kind === 'space') {
      const seq = readSequence();
      seq.splice(model.pick.index, 1);
      writeSequence(seq);
      model.pick = { kind: 'add' };
    }
    model.confirm = null;
    render();
    return;
  }
  if (act === 'nudge') {
    const seq = readSequence();
    let index = -1;
    if (model.pick && model.pick.kind === 'button') index = seq.findIndex((item) => item.button === model.pick.button);
    if (model.pick && model.pick.kind === 'space') index = model.pick.index;
    const next = index + Number(node.getAttribute('data-dir'));
    if (index < 0 || next < 0 || next >= seq.length) return;
    const item = seq[index];
    if (item.kind === 'space' && next === 0) return;
    seq.splice(index, 1);
    seq.splice(next, 0, item);
    writeSequence(seq);
    model.pick = item.kind === 'space' ? { kind: 'space', index: next } : { kind: 'button', button: item.button };
    render();
    return;
  }
  if (act === 'action') {
    model.picker = { kind: 'action', slotId };
    drawPicker();
    return;
  }
  if (act === 'icon') {
    model.picker = { kind: 'icon', slotId };
    drawPicker();
    return;
  }
  if (act === 'pick-action') {
    const action = model.actions.find((item) => item.label === node.getAttribute('data-label'));
    if (action) applyAction(model.picker.slotId, action);
    return;
  }
  if (act === 'use-custom') {
    const command = document.getElementById('custom-command').value.trim();
    if (!command) return;
    const known = model.actions.find((item) => item.type === 'command' && item.command === command);
    if (known) {
      applyAction(model.picker.slotId, known);
      return;
    }
    const button = model.buttons[model.picker.slotId];
    button.type = 'command';
    button.command = command;
    button.page = '';
    closePicker();
    render();
    return;
  }
  if (act === 'pick-icon') {
    model.buttons[model.picker.slotId].icon = node.getAttribute('data-icon');
    closePicker();
    render();
    return;
  }
  if (act === 'select-group') {
    model.confirm = null;
    const name = node.getAttribute('data-group') || 'Main';
    if (model.groupName === name) {
      openGroupEditor(name, 'edit');
      return;
    }
    model.groupName = name;
    if (model.skillIndex >= 0 && skillGroupName(model.skills[model.skillIndex]) !== model.groupName) {
      model.skillIndex = -1;
    }
    render();
    return;
  }
  if (act === 'select-skill') {
    model.confirm = null;
    const index = Number(node.getAttribute('data-index'));
    if (model.skillIndex === index) {
      openSkillEditor(index);
      return;
    }
    model.skillIndex = index;
    render();
    return;
  }
  if (act === 'open-add-group') {
    openGroupEditor('', 'add');
    return;
  }
  if (act === 'open-add-skill') {
    openSkillEditor(-1);
    return;
  }
  if (act === 'modal-save-skill') {
    const editor = model.editor;
    if (!editor || editor.kind !== 'skill') return;
    const fields = readEditorFields();
    const label = (fields.label || '').trim();
    const prompt = (fields.prompt || '').trim();
    const group = (fields.group || 'Main').trim() || 'Main';
    const error = document.getElementById('form-error');
    if (!label || !prompt) {
      if (error) error.textContent = 'Each skill needs a name and the text to put in chat.';
      return;
    }
    if (error) error.textContent = '';
    if (editor.mode === 'add') {
      model.skills.push({ id: 'skill-' + Date.now().toString(36), label, prompt, group });
      model.skillIndex = model.skills.length - 1;
    } else {
      const skill = model.skills[editor.index];
      skill.label = label;
      skill.prompt = prompt;
      skill.group = group;
    }
    model.groupName = group;
    closeEditorModal();
    persistConfig();
    render();
    return;
  }
  if (act === 'modal-delete-skill') {
    const editor = model.editor;
    if (!editor || editor.kind !== 'skill' || editor.mode !== 'edit') return;
    model.skills.splice(editor.index, 1);
    model.skillIndex = Math.min(editor.index, model.skills.length - 1);
    closeEditorModal();
    persistConfig();
    render();
    return;
  }
  if (act === 'modal-save-group') {
    const editor = model.editor;
    if (!editor || editor.kind !== 'group') return;
    const fields = readEditorFields();
    const name = (fields.name || '').trim();
    const error = document.getElementById('form-error');
    if (!name) {
      if (error) error.textContent = 'A group needs a name.';
      return;
    }
    const taken = model.groups.some((item) => item.toLowerCase() === name.toLowerCase());
    const sameEdit = editor.mode === 'edit' && editor.group.toLowerCase() === name.toLowerCase();
    if (taken && !sameEdit) {
      if (error) error.textContent = 'That group already exists.';
      return;
    }
    if (error) error.textContent = '';
    if (editor.mode === 'add') {
      model.groups.push(name);
      model.groupName = name;
      model.skillIndex = -1;
    } else if (editor.group !== name) {
      const old = editor.group;
      const idx = model.groups.indexOf(old);
      if (idx >= 0) model.groups[idx] = name;
      model.skills.forEach((skill) => {
        if (skillGroupName(skill) === old) skill.group = name;
      });
      if (model.groupName === old) model.groupName = name;
    }
    closeEditorModal();
    persistConfig();
    render();
    return;
  }
  if (act === 'modal-delete-group') {
    const editor = model.editor;
    if (!editor || editor.kind !== 'group' || editor.mode !== 'edit' || editor.group === 'Main') return;
    const old = editor.group;
    model.skills.forEach((skill) => {
      if (skillGroupName(skill) === old) skill.group = 'Main';
    });
    model.groups = model.groups.filter((item) => item !== old);
    model.groupName = 'Main';
    model.skillIndex = -1;
    closeEditorModal();
    persistConfig();
    render();
  }
});

document.body.addEventListener('change', (event) => {
  const ui = event.target.getAttribute('data-ui');
  if (ui === 'showConfigButton' || ui === 'showNextStackLogo') {
    if (ui === 'showConfigButton') model.showConfigButton = event.target.checked;
    if (ui === 'showNextStackLogo') model.showNextStackLogo = event.target.checked;
    vscodeApi.postMessage({
      type: 'setUi',
      showConfigButton: model.showConfigButton,
      showNextStackLogo: model.showNextStackLogo
    });
    render();
    return;
  }
});

document.body.addEventListener('input', (event) => {
  if (event.target.id === 'search') filterPicker(event.target.value);
});

document.body.addEventListener('dragstart', (event) => {
  const slot = event.target.closest('[data-act="select"]');
  const skill = event.target.closest('[data-act="select-skill"]');
  if (slot) model.drag = { kind: 'button', id: slot.getAttribute('data-slot') };
  else if (skill) model.drag = { kind: 'skill', index: Number(skill.getAttribute('data-index')) };
  else return;
  event.dataTransfer.setData('text/plain', 'x');
  event.dataTransfer.effectAllowed = 'move';
});

document.body.addEventListener('dragover', (event) => {
  if (model.drag && event.target.closest('.tb, [data-act="select-skill"]')) event.preventDefault();
});

document.body.addEventListener('drop', (event) => {
  const drag = model.drag;
  model.drag = null;
  if (!drag) return;
  event.preventDefault();
  if (drag.kind === 'button') {
    const target = event.target.closest('[data-act="select"]');
    if (target) moveButtonTo(drag.id, target.getAttribute('data-slot'));
    return;
  }
  const target = event.target.closest('[data-act="select-skill"]');
  if (target) moveSkill(drag.index, Number(target.getAttribute('data-index')));
});

window.addEventListener('message', (event) => {
  const message = event.data || {};
  if (message.type === 'saved') {
    const button = document.getElementById('save-button');
    if (!button) return;
    button.textContent = 'Saved';
    button.classList.add('saved-flash');
    setTimeout(() => {
      button.textContent = 'Save';
      button.classList.remove('saved-flash');
    }, 1500);
  } else if (message.type === 'error') {
    const error = document.getElementById('form-error');
    if (error) error.textContent = message.text || '';
  } else if (message.type === 'focus' && message.target === 'skills') {
    const heading = document.getElementById('skills');
    if (heading) heading.scrollIntoView();
  }
});

render();
</script>
</body>
</html>`;
}

module.exports = { renderPanel };
