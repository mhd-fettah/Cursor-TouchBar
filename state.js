'use strict';

const { ICONS, SLOTS, PAGE_SIZE, SKILL_PAGE, PAGES, ACTION_PAGE_GROUPS, actionsForPage } = require('./catalog');
const { PRESETS: SKILL_PRESETS, GROUPS: SKILL_PRESET_GROUPS } = require('./skill-presets');

function isActionPage(name) {
  return Boolean(ACTION_PAGE_GROUPS[name]);
}

function defaultSlot(slot) {
  return {
    enabled: slot.enabled !== false,
    icon: slot.icon,
    type: slot.type === 'page' ? 'page' : 'command',
    command: slot.command || '',
    page: slot.page || '',
    spaceBefore: slot.spaceBefore === true
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

function orderedSlotIds(source) {
  const ids = new Set(SLOTS.map((slot) => slot.id));
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    Object.keys(source).forEach((key) => {
      if (/^slot\d+$/.test(key)) {
        ids.add(key);
      }
    });
  }
  return [...ids].sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
}

function slotTemplate(id) {
  return SLOTS.find((slot) => slot.id === id) || {
    id,
    enabled: false,
    icon: 'plus',
    type: 'command',
    command: '',
    page: ''
  };
}

function normalizeButtons(stored) {
  const source = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : null;
  if (!source) {
    return defaultButtons();
  }

  const buttons = {};
  for (const id of orderedSlotIds(source)) {
    const slot = slotTemplate(id);
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
      page: type === 'page' ? page : '',
      spaceBefore: item.spaceBefore === true
    };
  }
  buttons.slot1.spaceBefore = false;
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
    for (const key of Object.keys(layer)) {
      if (/^slot\d+$/.test(key) && layer[key] && typeof layer[key] === 'object') {
        merged[key] = Object.assign({}, merged[key], layer[key]);
      }
    }
  }
  return found ? normalizeButtons(merged) : defaultButtons();
}

function defaultSkills() {
  return SKILL_PRESETS.map((skill) => Object.assign({}, skill));
}

function defaultSkillGroups() {
  return SKILL_PRESET_GROUPS.slice();
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
    if (!label || !prompt) {
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
      group: typeof raw.group === 'string' ? raw.group.trim() : ''
    });
  }
  return skills;
}

function normalizeSkillGroups(input, skills) {
  const groups = ['Main'];
  const add = (name) => {
    const clean = typeof name === 'string' ? name.trim() : '';
    if (!clean || clean.toLowerCase() === 'main') return;
    if (groups.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
    groups.push(clean);
  };
  if (Array.isArray(input)) input.forEach(add);
  if (Array.isArray(skills)) skills.forEach((skill) => add(skill && skill.group));
  return groups;
}

function groupSkills(skills) {
  const order = [];
  const map = new Map();
  for (const skill of skills) {
    const name = (skill.group || '').trim() || 'Main';
    if (!map.has(name)) {
      map.set(name, []);
      order.push(name);
    }
    map.get(name).push(skill);
  }
  return order.map((name) => ({ name, skills: map.get(name) }));
}

function findSkillGroup(groups, name) {
  const want = (name || '').trim();
  if (!want) {
    return null;
  }
  const exact = groups.find((group) => group.name === want);
  if (exact) {
    return exact;
  }
  const lower = want.toLowerCase();
  return groups.find((group) => group.name.toLowerCase() === lower) || null;
}

function onSkillsPage(view) {
  return view && view.name === 'skills';
}

function pageStep(view) {
  return onSkillsPage(view) ? SKILL_PAGE : PAGE_SIZE;
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
  if (next.name === 'group') {
    next.name = 'skills';
  }
  if (['main', 'modes', 'skills'].indexOf(next.name) === -1 && !isActionPage(next.name)) {
    return mainView();
  }
  if (next.name !== 'skills' || !next.group) {
    return next;
  }
  const groups = groupSkills(skills);
  const picked = findSkillGroup(groups, next.group);
  if (!picked) {
    return { name: 'skills', group: '', offset: 0 };
  }
  next.group = picked.name;
  return next;
}

function pageSource(view, skills) {
  if (isActionPage(view.name)) {
    return actionsForPage(view.name).map((action) => ({ kind: 'action', action }));
  }
  const groups = groupSkills(skills);
  if (view.name === 'skills' && view.group) {
    const group = findSkillGroup(groups, view.group);
    return (group ? group.skills : []).map((skill) => ({ kind: 'skill', skill }));
  }
  if (view.name === 'skills' && groups.length > 1) {
    return groups.map((group) => ({ kind: 'group', name: group.name }));
  }
  return skills.map((skill) => ({ kind: 'skill', skill }));
}

function pageItems(view, skills) {
  const current = normalizeView(view, skills);
  if (onSkillsPage(current) || isActionPage(current.name)) {
    if (onSkillsPage(current) && skills.length === 0 && !current.group) {
      return { add: true, hasNext: false, items: [] };
    }
    const source = pageSource(current, skills);
    return {
      add: false,
      hasNext: current.offset + pageStep(current) < source.length,
      items: source.slice(current.offset, current.offset + pageStep(current))
    };
  }
  return { add: false, hasNext: false, items: [] };
}

function backView(view, skills) {
  const current = normalizeView(view, skills);
  if (isActionPage(current.name) && current.offset > 0) {
    return Object.assign({}, current, { offset: Math.max(0, current.offset - pageStep(current)) });
  }
  if (onSkillsPage(current) && current.group) {
    return { name: 'skills', group: '', offset: 0 };
  }
  if (onSkillsPage(current)) {
    return mainView();
  }
  return mainView();
}

function nextView(view) {
  return Object.assign({}, view, { offset: (view.offset || 0) + pageStep(view) });
}

module.exports = {
  defaultButtons,
  defaultSkills,
  defaultSkillGroups,
  normalizeButtons,
  orderedSlotIds,
  readUserButtons,
  normalizeSkills,
  normalizeSkillGroups,
  groupSkills,
  isActionPage,
  mainView,
  normalizeView,
  pageItems,
  backView,
  nextView,
  pageStep
};
