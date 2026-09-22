'use strict';

const { ICONS } = require('./catalog/icons.js');
const { MAX_BUTTONS, DEFAULT_LAYOUT, LEGACY_SLOT_ICONS } = require('./catalog/defaults.js');

const MAIN_PAGE = 'main';
const ACTION_TYPES = ['command', 'page', 'prompt'];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultLayout() {
  return clone(DEFAULT_LAYOUT);
}

function readAction(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const type = ACTION_TYPES.includes(source.type) ? source.type : 'command';

  if (type === 'page') {
    return { type, page: typeof source.page === 'string' ? source.page.trim() : '' };
  }
  if (type === 'prompt') {
    return { type, text: typeof source.text === 'string' ? source.text : '' };
  }
  return { type, command: typeof source.command === 'string' ? source.command.trim() : '' };
}

// A button is dropped rather than repaired when its icon is unknown or already
// taken in the same row: the Touch Bar resolves a press by icon, so a row with
// two of the same icon would be ambiguous.
function readRow(raw, takenIcons = new Set()) {
  if (!Array.isArray(raw)) {
    return [];
  }

  const row = [];
  for (const item of raw) {
    if (row.length >= MAX_BUTTONS) {
      break;
    }
    const source = item && typeof item === 'object' ? item : {};
    const icon = typeof source.icon === 'string' ? source.icon : '';
    if (!ICONS.has(icon) || takenIcons.has(icon)) {
      continue;
    }
    takenIcons.add(icon);
    row.push({
      icon,
      label: typeof source.label === 'string' && source.label.trim()
        ? source.label.trim()
        : ICONS.get(icon).label,
      enabled: source.enabled !== false,
      action: readAction(source.action)
    });
  }
  return row;
}

function readLayout(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const pages = {};
  const rawPages = source.pages && typeof source.pages === 'object' ? source.pages : {};

  for (const [name, row] of Object.entries(rawPages)) {
    if (name === MAIN_PAGE || !name.trim()) {
      continue;
    }
    pages[name] = readRow(row);
  }

  return { main: readRow(source.main), pages };
}

// Pre-0.2.0 stored six slots whose icons were welded to the slot position.
function migrateLegacyButtons(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const main = [];
  for (const [slot, icon] of Object.entries(LEGACY_SLOT_ICONS)) {
    const stored = raw[slot];
    if (!stored || typeof stored !== 'object') {
      continue;
    }
    main.push({
      icon,
      label: ICONS.get(icon).label,
      enabled: stored.enabled !== false,
      action: { type: 'command', command: typeof stored.command === 'string' ? stored.command : '' }
    });
  }

  return main.length ? { main, pages: {} } : null;
}

function rowOf(layout, page) {
  const row = page === MAIN_PAGE ? layout.main : layout.pages[page];
  return Array.isArray(row) ? row : [];
}

function hasPage(layout, page) {
  return page === MAIN_PAGE || Array.isArray(layout.pages[page]);
}

function pageNames(layout) {
  return [MAIN_PAGE, ...Object.keys(layout.pages)];
}

// Reasons a button will not do anything, surfaced in the panel so a misconfigured
// button is visible before it is pressed.
function buttonProblem(button, layout) {
  const { action } = button;
  if (action.type === 'command' && !action.command) {
    return 'No command chosen.';
  }
  if (action.type === 'prompt' && !action.text.trim()) {
    return 'No prompt text.';
  }
  if (action.type === 'page') {
    if (!action.page) {
      return 'No page chosen.';
    }
    if (!hasPage(layout, action.page)) {
      return `Page "${action.page}" does not exist.`;
    }
  }
  return null;
}

module.exports = {
  MAIN_PAGE,
  ACTION_TYPES,
  defaultLayout,
  readLayout,
  readRow,
  migrateLegacyButtons,
  rowOf,
  hasPage,
  pageNames,
  buttonProblem
};
