'use strict';

const fs = require('fs');
const path = require('path');
const {
  ID,
  DISPLAY_NAME,
  ICONS,
  SLOTS,
  FIXED_BUTTONS,
  SKILL_PAGE,
  ACTION_ROW,
  LABEL_FACES,
  skillFaceToken,
  skillSlotCommand,
  ACTION_PAGE_GROUPS,
  HIDDEN_TOUCHBAR,
  pickableIconIds,
  describeButton,
  PAGES
} = require('../catalog');
const { defaultButtons, defaultSkills, defaultSkillGroups } = require('../state');

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const icons = pickableIconIds();
const commands = [];
const touchBar = [];
const commandPalette = [];

function addCommand(id, title, iconFile, category) {
  const command = { command: id, title, category };
  if (iconFile) {
    command.icon = iconFile;
  }
  commands.push(command);
}

function addMenu(id, group, when) {
  touchBar.push({ command: id, group, when });
}

addCommand(ID + '.configure', 'Configure Buttons', ICONS.settings.file, DISPLAY_NAME);
addMenu(
  ID + '.configure',
  '9_gear@1',
  'config.' + ID + '.showConfigButton && (!' + ID + '.page || ' + ID + '.page == main)'
);
addCommand(ID + '.configureBrand', 'Configure Buttons', ICONS['logo-brand'].file, DISPLAY_NAME);
addMenu(
  ID + '.configureBrand',
  '9_gear@2',
  'config.' + ID + '.showNextStackLogo && (!' + ID + '.page || ' + ID + '.page == main)'
);

for (const button of FIXED_BUTTONS) {
  addCommand(button.command, button.title, ICONS[button.icon].file, DISPLAY_NAME);
  addMenu(button.command, button.group, button.when);
}

function clusterWhen(position, leader) {
  const parts = [];
  if (leader > 1) {
    parts.push('config.' + ID + '.buttons.slot' + leader + '.spaceBefore');
  }
  for (let index = leader + 1; index <= position; index++) {
    parts.push('!config.' + ID + '.buttons.slot' + index + '.spaceBefore');
  }
  return parts.length ? ' && ' + parts.join(' && ') : '';
}

const buttons = defaultButtons();
for (const slot of SLOTS) {
  const position = Number(slot.id.slice(4));
  for (const iconId of icons) {
    const id = ID + '.' + slot.id + '.' + iconId;
    addCommand(id, 'Slot ' + position + ' · ' + ICONS[iconId].label, ICONS[iconId].file, DISPLAY_NAME + ' Icons');
    const base = '(!' + ID + '.page || ' + ID + '.page == main) && config.' + ID + '.buttons.' + slot.id + '.enabled && config.' + ID + '.buttons.' + slot.id + '.icon == ' + iconId;
    for (let leader = 1; leader <= position; leader++) {
      addMenu(id, '5_' + String(leader).padStart(2, '0') + '@' + position, base + clusterWhen(position, leader));
    }
  }
}

for (let face = 0; face < LABEL_FACES; face++) {
  const token = skillFaceToken(face);
  for (let index = 1; index <= SKILL_PAGE; index++) {
    const id = skillSlotCommand(face, index);
    addCommand(id, 'Skill ' + index, 'icons/labels/' + token + '/skill-' + index + '.png', DISPLAY_NAME);
    addMenu(
      id,
      '3_skill' + String(index).padStart(2, '0') + '@1',
      ID + '.page == skills && ' + ID + '.skill' + index + " && " + ID + ".face == '" + token + "'"
    );
    commandPalette.push({ command: id, when: 'false' });
  }
}

for (const page of Object.keys(ACTION_PAGE_GROUPS)) {
  for (let index = 1; index <= ACTION_ROW; index++) {
    for (const iconId of icons) {
      const id = ID + '.page.' + page + '.' + index + '.' + iconId;
      addCommand(id, page + ' · ' + index, ICONS[iconId].file, DISPLAY_NAME + ' Icons');
      addMenu(
        id,
        '3_' + page + '@' + index,
        ID + '.page == ' + page + ' && ' + ID + '.pf' + index + ' && ' + ID + '.pr' + index + ' == ' + iconId
      );
    }
  }
}

const slotProperties = {};
for (const slot of SLOTS) {
  const button = buttons[slot.id];
  const described = describeButton(button);
  slotProperties[slot.id] = {
    type: 'object',
    description: described.label + '. ' + described.description,
    properties: {
      enabled: { type: 'boolean', default: button.enabled, description: 'Show this button on the main row.' },
      icon: { type: 'string', default: button.icon, description: 'Icon file name from the bundled set.' },
      type: { type: 'string', enum: ['command', 'page'], default: button.type },
      command: { type: 'string', default: button.command, description: 'Command id to run when type is command.' },
      page: { type: 'string', enum: [''].concat(PAGES), default: button.page, description: 'Row to open when type is page.' },
      spaceBefore: { type: 'boolean', default: false, description: 'Leave a gap before this button. Off groups it with the button on its left.' }
    }
  };
}

pkg.scripts = Object.assign({}, pkg.scripts, {
  manifest: 'node scripts/build-manifest.js'
});
pkg.contributes.commands = commands;
pkg.contributes.menus = { commandPalette, touchBar };
pkg.contributes.configurationDefaults = {
  'keyboard.touchbar.ignored': HIDDEN_TOUCHBAR
};
pkg.contributes.configuration = {
  title: DISPLAY_NAME,
  properties: {
    [ID + '.showConfigButton']: {
      type: 'boolean',
      default: true,
      description: 'Show the gear button that opens Cursor Touch Bar settings on the main row.'
    },
    [ID + '.showNextStackLogo']: {
      type: 'boolean',
      default: true,
      description: 'Show the N3XTTECH logo next to the settings button on the main row.'
    },
    [ID + '.buttons']: {
      type: 'object',
      description: 'Touch Bar buttons in order. Each one runs a command or opens another row.',
      default: buttons,
      properties: slotProperties
    },
    [ID + '.skillGroups']: {
      type: 'array',
      description: 'Skill groups. Main is always present and cannot be removed.',
      default: defaultSkillGroups(),
      items: { type: 'string' }
    },
    [ID + '.skills']: {
      type: 'array',
      description: 'Skills you added. Tapping one opens a new chat with the text filled in. Press Enter to send.',
      default: defaultSkills(),
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string', description: 'Name shown on the Touch Bar button.' },
          prompt: { type: 'string', description: 'Text placed in a new chat.' },
          group: { type: 'string', description: 'Optional group. Skills that share a group open together.' }
        }
      }
    }
  }
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('commands ' + commands.length + ', touch bar items ' + touchBar.length);
