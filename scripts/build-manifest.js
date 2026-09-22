'use strict';

const fs = require('fs');
const path = require('path');
const { ICONS, SLOTS, FIXED_BUTTONS, PAGE_SIZE, pickableIconIds, describeButton } = require('../catalog');
const { defaultButtons } = require('../state');

const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const icons = pickableIconIds();
const commands = [];
const touchBar = [];

function addCommand(id, title, iconId, category) {
  commands.push({
    command: id,
    title,
    category,
    icon: ICONS[iconId].file
  });
}

function addMenu(id, order, when) {
  touchBar.push({
    command: id,
    group: '1_row@' + order,
    when
  });
}

addCommand('shipbar.configure', 'Configure Buttons', 'settings', 'ShipBar');
touchBar.push({
  command: 'shipbar.configure',
  group: '9_gear@1',
  when: 'config.shipbar.showConfigButton'
});

for (const button of FIXED_BUTTONS) {
  addCommand(button.command, button.title, button.icon, 'ShipBar');
  addMenu(button.command, button.order, button.when);
}

const buttons = defaultButtons();
for (const slot of SLOTS) {
  const position = Number(slot.id.slice(4));
  for (const iconId of icons) {
    const id = 'shipbar.' + slot.id + '.' + iconId;
    addCommand(id, 'Slot ' + position + ' · ' + ICONS[iconId].label, iconId, 'ShipBar Icons');
    addMenu(
      id,
      position,
      '(!shipbar.page || shipbar.page == main) && config.shipbar.buttons.' + slot.id + '.enabled && config.shipbar.buttons.' + slot.id + '.icon == ' + iconId
    );
  }
}

for (let index = 1; index <= PAGE_SIZE; index++) {
  for (const iconId of icons) {
    const id = 'shipbar.item' + index + '.' + iconId;
    addCommand(id, 'Skill ' + index + ' · ' + ICONS[iconId].label, iconId, 'ShipBar Icons');
    addMenu(
      id,
      index + 1,
      '(shipbar.page == skills || shipbar.page == group) && shipbar.item' + index + ' == ' + iconId
    );
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
      page: { type: 'string', enum: ['', 'modes', 'skills'], default: button.page, description: 'Row to open when type is page.' }
    }
  };
}

pkg.scripts = Object.assign({}, pkg.scripts, {
  manifest: 'node scripts/build-manifest.js'
});
pkg.contributes.commands = commands;
pkg.contributes.menus = { touchBar };
pkg.contributes.configuration = {
  title: 'ShipBar',
  properties: {
    'shipbar.showConfigButton': {
      type: 'boolean',
      default: true,
      description: 'Show the gear button that opens ShipBar settings. It stays visible on every row.'
    },
    'shipbar.buttons': {
      type: 'object',
      description: 'The six main Touch Bar buttons. Each one runs a command or opens Modes or Skills.',
      default: buttons,
      properties: slotProperties
    },
    'shipbar.skills': {
      type: 'array',
      description: 'Skills you added. Tapping one opens a new chat with the text filled in. Press Enter to send.',
      default: [],
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string', description: 'Name shown in ShipBar settings.' },
          prompt: { type: 'string', description: 'Text placed in a new chat.' },
          icon: { type: 'string', description: 'Icon shown on the Touch Bar.' },
          group: { type: 'string', description: 'Optional group. Skills that share a group open together.' }
        }
      }
    }
  }
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('commands ' + commands.length + ', touch bar items ' + touchBar.length);
