'use strict';

const { ICONS, SLOTS, PAGE_SIZE, PAGES } = require('./catalog');

function defaultSlot(slot) {
  return {
    enabled: slot.enabled !== false,
    icon: slot.icon,
    type: slot.type === 'page' ? 'page' : 'command',
    command: slot.command || '',
    page: slot.page || ''
  };
}

function defaultButtons() {
  const buttons = {};
  for (const slot of SLOTS) {
    buttons[slot.id] = defaultSlot(slot);
  }
  return buttons;
}

function knownIcon(icon) {
  return typeof icon === 'string' && ICONS[icon] && icon !== 'settings';
}

function normalizeButtons(stored) {
  const source = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : null;
  if (!source) {
    return defaultButtons();
  }

  const buttons = {};
  for (const slot of SLOTS) {
    const raw = source[slot.id];
    const item = raw && typeof raw === 'object' ? raw : null;
    if (!item) {
      buttons[slot.id] = defaultSlot(slot);
      continue;
    }

    const type = item.type === 'page' || item.type === 'command' ? item.type : 'command';
    let page = typeof item.page === 'string' ? item.page.trim() : '';
    if (type === 'page' && PAGES.indexOf(page) === -1) {
      page = slot.page && PAGES.indexOf(slot.page) !== -1 ? slot.page : 'modes';
    }

    buttons[slot.id] = {
      enabled: typeof item.enabled === 'boolean' ? item.enabled : slot.enabled !== false,
      icon: knownIcon(item.icon) ? item.icon : slot.icon,
      type,
      command: typeof item.command === 'string' ? item.command.trim() : (slot.command || ''),
      page: type === 'page' ? page : ''
    };
  }
  return buttons;
}

function readUserButtons(inspected) {
  const layers = [inspected.globalValue, inspected.workspaceValue, inspected.workspaceFolderValue];
  const merged = {};
  let found = false;
  for (const layer of layers) {
    if (!layer || typeof layer !== 'object' || Array.isArray(layer)) {
      continue;
    }
    found = true;
    for (const slot of SLOTS) {
      if (layer[slot.id] && typeof layer[slot.id] === 'object') {
        merged[slot.id] = Object.assign({}, merged[slot.id], layer[slot.id]);
      }
    }
  }
  return found ? normalizeButtons(merged) : defaultButtons();
}

function normalizeSkills(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const skills = [];
  const seen = new Set();
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    const prompt = typeof raw.prompt === 'string' ? raw.prompt.trim() : '';
    if (!label || !prompt || !knownIcon(raw.icon)) {
      continue;
    }
    let id = typeof raw.id === 'string' ? raw.id.trim() : '';
    if (!id || seen.has(id)) {
      id = 'skill-' + (skills.length + 1);
    }
    while (seen.has(id)) {
      id += 'x';
    }
    seen.add(id);
    skills.push({
      id,
      label,
      prompt,
      icon: raw.icon,
      group: typeof raw.group === 'string' ? raw.group.trim() : ''
    });
  }
  return skills;
}

function groupSkills(skills) {
  const order = [];
  const map = new Map();
  for (const skill of skills) {
    const name = skill.group || 'Skills';
    if (!map.has(name)) {
      map.set(name, []);
      order.push(name);
    }
    map.get(name).push(skill);
  }
  return order.map((name) => ({ name, skills: map.get(name) }));
}

function mainView() {
  return { name: 'main', group: '', offset: 0 };
}

function normalizeView(view, skills) {
  const next = {
    name: view && view.name ? view.name : 'main',
    group: view && typeof view.group === 'string' ? view.group : '',
    offset: view && view.offset > 0 ? view.offset : 0
  };
  if (['main', 'modes', 'skills', 'group'].indexOf(next.name) === -1) {
    return mainView();
  }
  if (next.name !== 'group') {
    return next;
  }
  const groups = groupSkills(skills);
  if (groups.length < 2 || !groups.some((group) => group.name === next.group)) {
    return { name: 'skills', group: '', offset: 0 };
  }
  return next;
}

function pageSource(view, skills) {
  const groups = groupSkills(skills);
  if (view.name === 'group') {
    const group = groups.find((item) => item.name === view.group);
    return (group ? group.skills : []).map((skill) => ({ kind: 'skill', icon: skill.icon, skill }));
  }
  if (groups.length > 1) {
    return groups.map((group) => ({
      kind: 'group',
      icon: group.skills[0].icon,
      name: group.name
    }));
  }
  return skills.map((skill) => ({ kind: 'skill', icon: skill.icon, skill }));
}

function pageItems(view, skills) {
  const current = normalizeView(view, skills);
  if (current.name !== 'skills' && current.name !== 'group') {
    return { add: false, hasNext: false, items: [] };
  }
  if (current.name === 'skills' && skills.length === 0) {
    return { add: true, hasNext: false, items: [] };
  }
  const source = pageSource(current, skills);
  return {
    add: false,
    hasNext: current.offset + PAGE_SIZE < source.length,
    items: source.slice(current.offset, current.offset + PAGE_SIZE)
  };
}

function backView(view, skills) {
  const current = normalizeView(view, skills);
  if ((current.name === 'skills' || current.name === 'group') && current.offset > 0) {
    return Object.assign({}, current, { offset: Math.max(0, current.offset - PAGE_SIZE) });
  }
  if (current.name === 'group') {
    return { name: 'skills', group: '', offset: 0 };
  }
  return mainView();
}

function nextView(view) {
  return Object.assign({}, view, { offset: (view.offset || 0) + PAGE_SIZE });
}

module.exports = {
  defaultButtons,
  normalizeButtons,
  readUserButtons,
  normalizeSkills,
  groupSkills,
  mainView,
  normalizeView,
  pageItems,
  backView,
  nextView
};
