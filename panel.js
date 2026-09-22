'use strict';

const crypto = require('crypto');
const vscode = require('vscode');
const { ICONS, ACTIONS } = require('./catalog');

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
    slotIds: Object.keys(model.buttons),
    focus: model.focus || ''
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
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 16px 20px 40px; }
  h1 { font-size: 1.3em; margin: 0 0 4px; }
  h2 { font-size: 1.05em; margin: 28px 0 8px; }
  p { margin: 0 0 8px; }
  .muted { opacity: 0.75; font-size: 0.92em; }
  .preview { display: flex; gap: 14px; margin: 18px 0 8px; flex-wrap: wrap; }
  .preview-cell { width: 72px; text-align: center; }
  .preview-cell.off { opacity: 0.35; }
  .preview-cell img, .icon-btn img, .choice img { width: 28px; height: 28px; }
  .preview-label { font-size: 0.75em; margin-top: 4px; }
  .card, .skill { padding: 14px 0; border-bottom: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.25)); }
  .card-top, .skill-top { display: flex; gap: 12px; align-items: flex-start; }
  .card-copy { flex: 1; }
  .title { font-weight: 600; }
  .actions, .bar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
  button, .icon-btn {
    background: var(--vscode-button-background); color: var(--vscode-button-foreground);
    border: none; border-radius: 3px; padding: 6px 12px; cursor: pointer; font-family: inherit;
  }
  button.secondary, .icon-btn {
    background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground);
  }
  button:hover, .icon-btn:hover { background: var(--vscode-button-hoverBackground); }
  input[type=text], textarea {
    width: 100%; box-sizing: border-box; margin-top: 6px;
    background: var(--vscode-input-background); color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent); border-radius: 3px; padding: 6px 8px;
    font-family: inherit; font-size: inherit;
  }
  textarea { min-height: 72px; resize: vertical; }
  label.field { display: block; margin-top: 8px; font-size: 0.85em; opacity: 0.8; }
  .error { color: var(--vscode-errorForeground); min-height: 1.2em; }
  .saved { color: var(--vscode-testing-iconPassed, #4caf50); opacity: 0; }
  .saved.show { opacity: 1; }
  #picker { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; }
  #picker.hidden { display: none; }
  .sheet { width: min(560px, 92vw); max-height: 80vh; overflow: auto; padding: 16px; border-radius: 6px; background: var(--vscode-editor-background); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px; margin-top: 12px; }
  .choice { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; font-size: 0.75em; }
  .action { display: block; width: 100%; text-align: left; margin-top: 6px; background: transparent; color: inherit; border: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.25)); }
  .group-label { margin-top: 14px; font-size: 0.8em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.04em; }
  a { color: var(--vscode-textLink-foreground); }
</style>
</head>
<body>
  <div id="app"></div>
  <div id="picker" class="hidden"></div>
<script nonce="${nonce}">
const vscodeApi = acquireVsCodeApi();
const model = ${json};
model.picker = null;

function h(tag, attrs) {
  const node = document.createElement(tag);
  const data = attrs || {};
  Object.keys(data).forEach((key) => {
    if (key === 'class') node.className = data[key];
    else if (key === 'text') node.textContent = data[key];
    else node.setAttribute(key, data[key]);
  });
  for (let i = 2; i < arguments.length; i++) {
    if (arguments[i]) node.append(arguments[i]);
  }
  return node;
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

function groupsOf(skills) {
  const order = [];
  const map = {};
  skills.forEach((skill) => {
    const name = (skill.group || '').trim() || 'Skills';
    if (!map[name]) {
      map[name] = true;
      order.push(name);
    }
  });
  return order;
}

function skillsSummary() {
  const ready = model.skills.filter((skill) => skill.label.trim() && skill.prompt.trim());
  if (!ready.length) return 'No skills yet. Add one, then tap Skills on the bar.';
  const groups = groupsOf(ready);
  if (groups.length < 2) return 'They show up in order when you tap Skills. The bar shows the icon; the name stays on this page.';
  return 'The Skills button opens groups: ' + groups.join(', ') + '.';
}

function render() {
  const app = document.getElementById('app');
  app.replaceChildren();
  app.append(h('h1', { text: 'ShipBar' }));
  app.append(h('p', { text: 'These buttons are already on your Touch Bar.' }));
  app.append(h('p', { class: 'muted', text: 'Pick an action and an icon for each one. Modes and Skills open another row. The gear button stays on the bar and opens this page.' }));

  const preview = h('div', { class: 'preview' });
  model.slotIds.forEach((id) => {
    const button = model.buttons[id];
    const info = describe(button);
    const cell = h('div', { class: 'preview-cell' + (button.enabled ? '' : ' off') });
    cell.append(h('img', { src: iconSrc(button.icon), alt: info.label }));
    cell.append(h('div', { class: 'preview-label', text: info.label }));
    preview.append(cell);
  });
  app.append(preview);

  const bar = h('div', { class: 'bar' });
  bar.append(h('button', { 'data-act': 'save', text: 'Save' }));
  bar.append(h('span', { id: 'saved', class: 'saved', text: 'Saved' }));
  app.append(bar);
  app.append(h('p', { id: 'form-error', class: 'error' }));

  app.append(h('h2', { text: 'Buttons' }));
  model.slotIds.forEach((id, index) => {
    const button = model.buttons[id];
    const info = describe(button);
    const card = h('div', { class: 'card' });
    const top = h('div', { class: 'card-top' });
    const toggle = h('input', { type: 'checkbox', 'data-enabled': id });
    if (button.enabled) toggle.checked = true;
    const copy = h('div', { class: 'card-copy' });
    copy.append(h('div', { class: 'title', text: (index + 1) + '. ' + info.label }));
    copy.append(h('div', { class: 'muted', text: info.description }));
    const actions = h('div', { class: 'actions' });
    actions.append(h('button', { class: 'secondary', 'data-act': 'action', 'data-slot': id, text: 'Change action' }));
    actions.append(h('button', { class: 'icon-btn', 'data-act': 'icon', 'data-slot': id }, h('img', { src: iconSrc(button.icon), alt: '' }), document.createTextNode(' Icon')));
    actions.append(h('button', { class: 'secondary', 'data-act': 'reset-slot', 'data-slot': id, text: 'Reset' }));
    copy.append(actions);
    top.append(toggle, copy);
    card.append(top);
    app.append(card);
  });

  app.append(h('h2', { id: 'skills', text: 'Skills' }));
  app.append(h('p', { class: 'muted', text: 'A skill opens a new chat with your text filled in. Press Enter to send.' }));
  app.append(h('p', { id: 'skills-summary', class: 'muted', text: skillsSummary() }));
  model.skills.forEach((skill, index) => {
    const box = h('div', { class: 'skill' });
    box.append(h('label', { class: 'field', text: 'Name' }));
    box.append(h('input', { type: 'text', 'data-skill-field': 'label', 'data-index': String(index), value: skill.label, placeholder: 'Review' }));
    box.append(h('label', { class: 'field', text: 'Text to put in chat' }));
    const prompt = h('textarea', { 'data-skill-field': 'prompt', 'data-index': String(index), placeholder: 'Review the current changes and list the risks.' });
    prompt.value = skill.prompt;
    box.append(prompt);
    box.append(h('label', { class: 'field', text: 'Group, optional' }));
    box.append(h('input', { type: 'text', 'data-skill-field': 'group', 'data-index': String(index), value: skill.group, placeholder: 'Git' }));
    const actions = h('div', { class: 'actions' });
    actions.append(h('button', { class: 'icon-btn', 'data-act': 'skill-icon', 'data-index': String(index) }, h('img', { src: iconSrc(skill.icon), alt: '' }), document.createTextNode(' Icon')));
    actions.append(h('button', { class: 'secondary', 'data-act': 'delete-skill', 'data-index': String(index), text: 'Delete' }));
    box.append(actions);
    app.append(box);
  });
  app.append(h('div', { class: 'bar' }, h('button', { class: 'secondary', 'data-act': 'add-skill', text: 'Add skill' })));
  app.append(h('div', { class: 'bar' }, h('button', { 'data-act': 'save', text: 'Save' }), h('button', { class: 'secondary', 'data-act': 'reset-all', text: 'Reset everything' })));
  app.append(h('p', { class: 'muted' }, document.createTextNode('Built by '), h('a', { href: 'https://x.com/_Max_Blackwell', target: '_blank', text: '@_Max_Blackwell' })));

  if (model.focus === 'skills') {
    const heading = document.getElementById('skills');
    if (heading) heading.scrollIntoView();
    model.focus = '';
  }
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
    let group = '';
    model.actions.forEach((action) => {
      if (action.group !== group) {
        group = action.group;
        sheet.append(h('div', { class: 'group-label', text: group, 'data-filter': group.toLowerCase() }));
      }
      const row = h('button', {
        class: 'action',
        'data-filter': (action.group + ' ' + action.label + ' ' + action.description).toLowerCase(),
        'data-act': 'pick-action',
        'data-label': action.label
      });
      row.append(h('div', { class: 'title', text: action.label }));
      row.append(h('div', { class: 'muted', text: action.description }));
      sheet.append(row);
    });
    const custom = h('div', { id: 'custom-block' });
    custom.append(h('div', { class: 'group-label', text: 'Custom' }));
    custom.append(h('input', { id: 'custom-command', type: 'text', placeholder: 'workbench.action.files.save' }));
    custom.append(h('div', { class: 'bar' }, h('button', { 'data-act': 'use-custom', text: 'Use command id' })));
    sheet.append(custom);
  } else {
    const grid = h('div', { class: 'grid' });
    model.icons.forEach((icon) => {
      const choice = h('button', {
        class: 'choice secondary',
        'data-filter': icon.label.toLowerCase(),
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
  search.focus();
}

document.body.addEventListener('click', (event) => {
  const picker = document.getElementById('picker');
  if (event.target === picker) {
    closePicker();
    return;
  }
  const node = event.target.closest('[data-act]');
  if (!node) return;
  const act = node.getAttribute('data-act');
  const slotId = node.getAttribute('data-slot');
  const index = Number(node.getAttribute('data-index'));

  if (act === 'save') {
    const missing = model.skills.some((skill) => !skill.label.trim() || !skill.prompt.trim());
    const error = document.getElementById('form-error');
    if (missing) {
      error.textContent = 'Each skill needs a name and the text to put in chat.';
      return;
    }
    error.textContent = '';
    vscodeApi.postMessage({
      type: 'save',
      buttons: model.buttons,
      skills: model.skills.map((skill) => ({
        id: skill.id,
        label: skill.label.trim(),
        prompt: skill.prompt.trim(),
        icon: skill.icon,
        group: skill.group.trim()
      }))
    });
    return;
  }
  if (act === 'reset-all') {
    if (!confirm('Reset buttons to the defaults and remove every skill?')) return;
    vscodeApi.postMessage({ type: 'resetAll' });
    return;
  }
  if (act === 'reset-slot') {
    model.buttons[slotId] = JSON.parse(JSON.stringify(model.defaults[slotId]));
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
  if (act === 'skill-icon') {
    model.picker = { kind: 'skill-icon', index };
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
    const error = document.getElementById('form-error');
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
    error.textContent = '';
    closePicker();
    render();
    return;
  }
  if (act === 'pick-icon') {
    const icon = node.getAttribute('data-icon');
    if (model.picker.kind === 'skill-icon') model.skills[model.picker.index].icon = icon;
    else model.buttons[model.picker.slotId].icon = icon;
    closePicker();
    render();
    return;
  }
  if (act === 'add-skill') {
    model.skills.push({ id: 'skill-' + Date.now().toString(36), label: '', prompt: '', icon: 'sparkles', group: '' });
    render();
    return;
  }
  if (act === 'delete-skill') {
    model.skills.splice(index, 1);
    render();
  }
});

document.body.addEventListener('change', (event) => {
  const id = event.target.getAttribute('data-enabled');
  if (!id) return;
  model.buttons[id].enabled = event.target.checked;
  render();
});

document.body.addEventListener('input', (event) => {
  const field = event.target.getAttribute('data-skill-field');
  if (field) {
    model.skills[Number(event.target.getAttribute('data-index'))][field] = event.target.value;
    const summary = document.getElementById('skills-summary');
    if (summary) summary.textContent = skillsSummary();
    return;
  }
  if (event.target.id === 'search') {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll('[data-filter]').forEach((row) => {
      row.hidden = query.length > 0 && row.getAttribute('data-filter').toLowerCase().indexOf(query) === -1;
    });
  }
});

window.addEventListener('message', (event) => {
  const message = event.data || {};
  if (message.type === 'saved') {
    const saved = document.getElementById('saved');
    if (!saved) return;
    saved.classList.add('show');
    setTimeout(() => saved.classList.remove('show'), 1500);
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
