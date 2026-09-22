'use strict';

const vscode = acquireVsCodeApi();
const { icons: ICON_GROUPS, commands: COMMANDS, maxButtons: MAX_BUTTONS, mainPage: MAIN_PAGE } =
  window.cursorTouchBar;

const ICON_URLS = new Map();
const ICON_LABELS = new Map();
for (const group of ICON_GROUPS) {
  for (const icon of group.icons) {
    ICON_URLS.set(icon.id, icon.url);
    ICON_LABELS.set(icon.id, icon.label);
  }
}

const els = {
  preview: document.getElementById('preview'),
  previewNote: document.getElementById('previewNote'),
  pages: document.getElementById('pages'),
  buttons: document.getElementById('buttons'),
  addButton: document.getElementById('addButton'),
  deletePage: document.getElementById('deletePage'),
  status: document.getElementById('status'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalSearch: document.getElementById('modalSearch'),
  modalBody: document.getElementById('modalBody'),
  modalClose: document.getElementById('modalClose')
};

let layout = { main: [], pages: {} };
let page = MAIN_PAGE;
let dirty = false;

function currentRow() {
  return page === MAIN_PAGE ? layout.main : layout.pages[page] || [];
}

function setRow(row) {
  if (page === MAIN_PAGE) {
    layout.main = row;
  } else {
    layout.pages[page] = row;
  }
}

function pageNames() {
  return [MAIN_PAGE, ...Object.keys(layout.pages)];
}

function markDirty() {
  dirty = true;
  setStatus('Unsaved changes', false);
}

function setStatus(text, good = true) {
  els.status.textContent = text;
  els.status.classList.toggle('muted', !good);
  els.status.classList.toggle('show', Boolean(text));
}

function firstFreeIcon(row) {
  const taken = new Set(row.map((button) => button.icon));
  for (const group of ICON_GROUPS) {
    for (const icon of group.icons) {
      if (!taken.has(icon.id)) {
        return icon.id;
      }
    }
  }
  return null;
}

// Mirrors src/layout.js: a press is resolved by icon, so a row cannot show the
// same icon twice.
function problemFor(button) {
  const { action } = button;
  if (action.type === 'command' && !(action.command || '').trim()) {
    return 'No command chosen.';
  }
  if (action.type === 'prompt' && !(action.text || '').trim()) {
    return 'No prompt text.';
  }
  if (action.type === 'page') {
    if (!action.page) {
      return 'No page chosen.';
    }
    if (!pageNames().includes(action.page)) {
      return 'That page no longer exists.';
    }
    if (action.page === page) {
      return 'A page button cannot open its own row.';
    }
  }
  return null;
}

function commandTitle(commandId) {
  const found = COMMANDS.find((entry) => entry.command === commandId);
  return found ? found.title : commandId;
}

/* Rendering */

function renderPreview() {
  const shown = currentRow().filter((button) => button.enabled);
  els.preview.replaceChildren();

  for (const button of shown) {
    const slot = document.createElement('div');
    slot.className = 'preview-slot';
    const img = document.createElement('img');
    img.src = ICON_URLS.get(button.icon);
    img.alt = button.label;
    slot.title = button.label;
    slot.append(img);
    els.preview.append(slot);
  }

  if (page !== MAIN_PAGE) {
    const back = document.createElement('div');
    back.className = 'preview-slot empty back';
    back.textContent = 'Back';
    els.preview.prepend(back);
  }

  const off = currentRow().length - shown.length;
  const parts = [`${shown.length} of ${MAX_BUTTONS} buttons on the bar`];
  if (off) {
    parts.push(`${off} turned off`);
  }
  if (page !== MAIN_PAGE) {
    parts.push('a Back button is added for you');
  }
  els.previewNote.textContent = `${parts.join(', ')}.`;
}

function renderPages() {
  els.pages.replaceChildren();

  for (const name of pageNames()) {
    const tab = document.createElement('button');
    tab.className = `page-tab${name === page ? ' active' : ''}`;
    tab.textContent = name === MAIN_PAGE ? 'Main row' : name;
    tab.addEventListener('click', () => {
      page = name;
      vscode.postMessage({ type: 'preview', page: name });
      render();
    });
    els.pages.append(tab);
  }

  const add = document.createElement('button');
  add.className = 'page-tab';
  add.textContent = '+ Add page';
  add.addEventListener('click', addPage);
  els.pages.append(add);
}

function renderButtons() {
  const row = currentRow();
  els.buttons.replaceChildren();

  if (!row.length) {
    const note = document.createElement('p');
    note.className = 'empty-note';
    note.textContent = 'This row has no buttons yet. Add one below.';
    els.buttons.append(note);
  }

  row.forEach((button, index) => els.buttons.append(renderCard(button, index, row)));
  els.addButton.disabled = row.length >= MAX_BUTTONS;
  els.deletePage.hidden = page === MAIN_PAGE;
}

function renderCard(button, index, row) {
  const card = document.createElement('div');
  card.className = `card${button.enabled ? '' : ' disabled'}`;
  card.draggable = true;
  card.dataset.index = String(index);

  const grip = document.createElement('div');
  grip.className = 'grip';
  grip.textContent = '⠿';
  grip.title = 'Drag to reorder';

  const iconButton = document.createElement('button');
  iconButton.className = 'icon-button';
  iconButton.title = `${ICON_LABELS.get(button.icon)} — click to change`;
  const iconImg = document.createElement('img');
  iconImg.src = ICON_URLS.get(button.icon);
  iconImg.alt = '';
  iconButton.append(iconImg);
  iconButton.addEventListener('click', () => pickIcon(index));

  const fields = document.createElement('div');
  fields.className = 'fields';

  const topRow = document.createElement('div');
  topRow.className = 'field-row';

  const label = document.createElement('input');
  label.type = 'text';
  label.className = 'label-input';
  label.value = button.label;
  label.placeholder = 'Button name';
  label.addEventListener('input', () => {
    button.label = label.value;
    markDirty();
    renderPreview();
  });

  const type = document.createElement('select');
  for (const [value, text] of [
    ['command', 'Runs a command'],
    ['prompt', 'Opens a chat prompt'],
    ['page', 'Opens a page']
  ]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    option.selected = button.action.type === value;
    type.append(option);
  }
  type.addEventListener('change', () => {
    button.action = { type: type.value };
    markDirty();
    render();
  });

  topRow.append(label, type);
  fields.append(topRow, renderActionDetail(button));

  const problem = problemFor(button);
  if (problem) {
    const warning = document.createElement('div');
    warning.className = 'problem';
    warning.textContent = problem;
    fields.append(warning);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const toggle = document.createElement('label');
  toggle.className = 'toggle';
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = button.enabled;
  check.addEventListener('change', () => {
    button.enabled = check.checked;
    markDirty();
    render();
  });
  toggle.append(check, document.createTextNode('On bar'));

  const remove = document.createElement('button');
  remove.className = 'danger';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => {
    row.splice(index, 1);
    markDirty();
    render();
  });

  actions.append(toggle, remove);
  card.append(grip, iconButton, fields, actions);
  attachDrag(card, row);
  return card;
}

function renderActionDetail(button) {
  const wrap = document.createElement('div');
  wrap.className = 'action-detail';

  if (button.action.type === 'command') {
    const pick = document.createElement('button');
    pick.className = 'secondary';
    pick.textContent = button.action.command
      ? commandTitle(button.action.command)
      : 'Choose a command…';
    pick.addEventListener('click', () => pickCommand(button));

    const id = document.createElement('span');
    id.className = 'command-id';
    id.textContent = button.action.command || '';
    wrap.append(pick, id);
    return wrap;
  }

  if (button.action.type === 'prompt') {
    const text = document.createElement('textarea');
    text.value = button.action.text || '';
    text.placeholder = 'Text to put in a new chat, for example: Review my staged changes.';
    text.addEventListener('input', () => {
      button.action.text = text.value;
      markDirty();
    });
    wrap.classList.add('block');
    wrap.append(text);
    return wrap;
  }

  const select = document.createElement('select');
  const blank = document.createElement('option');
  blank.value = '';
  blank.textContent = 'Choose a page…';
  blank.selected = !button.action.page;
  select.append(blank);

  for (const name of pageNames()) {
    if (name === MAIN_PAGE || name === page) {
      continue;
    }
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    option.selected = button.action.page === name;
    select.append(option);
  }
  select.addEventListener('change', () => {
    button.action.page = select.value;
    markDirty();
    render();
  });
  wrap.append(select);
  return wrap;
}

function render() {
  renderPages();
  renderButtons();
  renderPreview();
}

/* Reordering */

let dragIndex = null;

function attachDrag(card, row) {
  card.addEventListener('dragstart', () => {
    dragIndex = Number(card.dataset.index);
    card.classList.add('dragging');
  });

  card.addEventListener('dragend', () => {
    dragIndex = null;
    card.classList.remove('dragging');
    card.classList.remove('drop-target');
  });

  card.addEventListener('dragover', (event) => {
    if (dragIndex === null) {
      return;
    }
    event.preventDefault();
    card.classList.add('drop-target');
  });

  card.addEventListener('dragleave', () => card.classList.remove('drop-target'));

  card.addEventListener('drop', (event) => {
    event.preventDefault();
    card.classList.remove('drop-target');
    const to = Number(card.dataset.index);
    if (dragIndex === null || dragIndex === to) {
      return;
    }
    const [moved] = row.splice(dragIndex, 1);
    row.splice(to, 0, moved);
    dragIndex = null;
    markDirty();
    render();
  });
}

/* Pickers */

let closeModal = () => {};

function openModal(title, build) {
  els.modalTitle.textContent = title;
  els.modalSearch.value = '';
  els.modal.hidden = false;

  const refresh = () => build(els.modalSearch.value.trim().toLowerCase());
  refresh();
  els.modalSearch.oninput = refresh;
  els.modalSearch.focus();

  closeModal = () => {
    els.modal.hidden = true;
    els.modalSearch.oninput = null;
    els.modalBody.replaceChildren();
  };
}

function pickIcon(index) {
  const row = currentRow();
  const button = row[index];
  const taken = new Set(row.filter((_, i) => i !== index).map((item) => item.icon));

  openModal('Choose an icon', (query) => {
    els.modalBody.replaceChildren();
    let shown = 0;

    for (const group of ICON_GROUPS) {
      const matches = group.icons.filter(
        (icon) =>
          !query ||
          icon.id.includes(query) ||
          icon.label.toLowerCase().includes(query) ||
          group.label.toLowerCase().includes(query)
      );
      if (!matches.length) {
        continue;
      }

      const heading = document.createElement('div');
      heading.className = 'icon-group-label';
      heading.textContent = group.label;

      const grid = document.createElement('div');
      grid.className = 'icon-grid';

      for (const icon of matches) {
        const choice = document.createElement('button');
        const isTaken = taken.has(icon.id);
        choice.className = `icon-choice${icon.id === button.icon ? ' current' : ''}${isTaken ? ' taken' : ''}`;
        choice.title = isTaken ? `${icon.label} — already used in this row` : icon.label;
        choice.disabled = isTaken;
        const img = document.createElement('img');
        img.src = icon.url;
        img.alt = icon.label;
        choice.append(img);
        choice.addEventListener('click', () => {
          const usingIconLabel = button.label === ICON_LABELS.get(button.icon);
          button.icon = icon.id;
          if (usingIconLabel) {
            button.label = icon.label;
          }
          closeModal();
          markDirty();
          render();
        });
        grid.append(choice);
        shown += 1;
      }

      els.modalBody.append(heading, grid);
    }

    if (!shown) {
      const note = document.createElement('p');
      note.className = 'empty-note';
      note.textContent = 'No icon matches that search.';
      els.modalBody.append(note);
    }
  });
}

function pickCommand(button) {
  openModal('Choose a command', (query) => {
    els.modalBody.replaceChildren();

    const matches = COMMANDS.filter(
      (entry) =>
        !query ||
        entry.command.toLowerCase().includes(query) ||
        entry.title.toLowerCase().includes(query) ||
        (entry.description || '').toLowerCase().includes(query)
    ).slice(0, 200);

    if (!matches.length) {
      const note = document.createElement('p');
      note.className = 'empty-note';
      note.textContent = 'No command matches that search.';
      els.modalBody.append(note);
      return;
    }

    let group = null;
    for (const entry of matches) {
      if (entry.group !== group) {
        group = entry.group;
        const heading = document.createElement('div');
        heading.className = 'command-group-label';
        heading.textContent = group;
        els.modalBody.append(heading);
      }

      const choice = document.createElement('button');
      choice.className = 'command-choice';

      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = entry.title;

      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = entry.description
        ? `${entry.command} — ${entry.description}`
        : entry.command;

      choice.append(title, meta);
      choice.addEventListener('click', () => {
        button.action = { type: 'command', command: entry.command };
        if (!button.label.trim() || button.label === ICON_LABELS.get(button.icon)) {
          button.label = entry.title;
        }
        closeModal();
        markDirty();
        render();
      });
      els.modalBody.append(choice);
    }
  });
}

/* Pages */

function addPage() {
  const name = `page${Object.keys(layout.pages).length + 1}`;
  layout.pages[name] = [];
  page = name;
  markDirty();
  render();
}

/* Wiring */

els.addButton.addEventListener('click', () => {
  const row = currentRow();
  const icon = firstFreeIcon(row);
  if (!icon) {
    setStatus('Every icon is already used in this row', false);
    return;
  }
  row.push({
    icon,
    label: ICON_LABELS.get(icon),
    enabled: true,
    action: { type: 'command', command: '' }
  });
  setRow(row);
  markDirty();
  render();
});

els.deletePage.addEventListener('click', () => {
  const removed = page;
  delete layout.pages[removed];
  for (const row of [layout.main, ...Object.values(layout.pages)]) {
    for (const button of row) {
      if (button.action.type === 'page' && button.action.page === removed) {
        button.action.page = '';
      }
    }
  }
  page = MAIN_PAGE;
  markDirty();
  render();
});

document.getElementById('save').addEventListener('click', () => {
  vscode.postMessage({ type: 'save', layout });
});

document.getElementById('reset').addEventListener('click', () => {
  vscode.postMessage({ type: 'reset' });
});

document.getElementById('export').addEventListener('click', () => {
  vscode.postMessage({ type: 'export', layout });
});

document.getElementById('import').addEventListener('click', () => {
  vscode.postMessage({ type: 'import' });
});

els.modalClose.addEventListener('click', () => closeModal());

els.modal.addEventListener('click', (event) => {
  if (event.target === els.modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !els.modal.hidden) {
    closeModal();
  }
});

window.addEventListener('message', (event) => {
  const message = event.data;
  if (message.type === 'state') {
    // A save or an external settings edit is the source of truth; local edits in
    // progress are only kept when nothing has been committed yet.
    if (!dirty) {
      layout = message.layout;
      if (!pageNames().includes(page)) {
        page = MAIN_PAGE;
      }
      render();
    }
    return;
  }

  if (message.type === 'saved') {
    dirty = false;
    setStatus('Saved');
    setTimeout(() => setStatus(''), 1800);
  }
});

vscode.postMessage({ type: 'ready' });
