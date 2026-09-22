'use strict';

const { ICON_IDS, RESERVED_ICONS, iconFile } = require('./catalog/icons.js');
const { MAX_BUTTONS } = require('./catalog/defaults.js');

// Touch Bar buttons are contributions, not runtime objects: an icon is bound to
// a command in package.json and cannot be swapped once Cursor has loaded. So
// every icon gets its own command, and every (icon, position) pair gets a menu
// entry guarded by a context key the extension sets for whichever row is
// showing. Exactly one entry per position is ever visible.
const COMMAND_PREFIX = 'shipbar.run.';
const BUTTON_GROUP = '2_buttons';
const CONFIGURE_COMMAND = 'shipbar.configure';
const BACK_COMMAND = 'shipbar.back';

function runCommandId(iconId) {
  return `${COMMAND_PREFIX}${iconId}`;
}

// Context key holding the icon shown at a position in the active row.
function positionKey(position) {
  return `shipbar.btn${position}.icon`;
}

function buildCommands() {
  const commands = [
    {
      command: BACK_COMMAND,
      title: 'Back to Main Row',
      category: 'ShipBar',
      icon: iconFile(RESERVED_ICONS.back)
    },
    {
      command: CONFIGURE_COMMAND,
      title: 'Configure Buttons',
      category: 'ShipBar',
      icon: iconFile(RESERVED_ICONS.configure)
    }
  ];

  for (const iconId of ICON_IDS) {
    commands.push({
      command: runCommandId(iconId),
      title: `Run Button (${iconId})`,
      category: 'ShipBar',
      icon: iconFile(iconId)
    });
  }

  return commands;
}

function buildTouchBarMenu() {
  const items = [
    { command: BACK_COMMAND, group: '1_back', when: 'shipbar.page != main' }
  ];

  for (const iconId of ICON_IDS) {
    for (let position = 1; position <= MAX_BUTTONS; position++) {
      items.push({
        command: runCommandId(iconId),
        group: `${BUTTON_GROUP}@${position}`,
        when: `${positionKey(position)} == ${iconId}`
      });
    }
  }

  items.push({
    command: CONFIGURE_COMMAND,
    group: '3_settings',
    when: 'config.shipbar.showConfigButton'
  });

  return items;
}

// Commands the palette should offer. The per-icon runners are an implementation
// detail, so they stay hidden behind a `false` when clause.
function buildCommandPalette() {
  return [
    { command: BACK_COMMAND, when: 'false' },
    ...ICON_IDS.map((iconId) => ({ command: runCommandId(iconId), when: 'false' }))
  ];
}

function buildConfiguration() {
  const button = {
    type: 'object',
    required: ['icon', 'action'],
    properties: {
      icon: {
        type: 'string',
        enum: ICON_IDS,
        description: 'Which bundled icon this button shows. Must be unique within its row.'
      },
      label: {
        type: 'string',
        description: 'Name shown in the configuration panel. Not drawn on the Touch Bar.'
      },
      enabled: {
        type: 'boolean',
        default: true,
        description: 'Uncheck to keep the button configured but off the Touch Bar.'
      },
      action: {
        type: 'object',
        required: ['type'],
        properties: {
          type: {
            type: 'string',
            enum: ['command', 'page', 'prompt'],
            enumDescriptions: [
              'Run a Cursor or VS Code command.',
              'Replace the row with another page of buttons.',
              'Open a new chat pre-filled with text. You still press Enter to send.'
            ],
            default: 'command'
          },
          command: { type: 'string', description: 'Command ID, when type is "command".' },
          page: { type: 'string', description: 'Page name, when type is "page".' },
          text: { type: 'string', description: 'Chat text, when type is "prompt".' }
        }
      }
    }
  };

  const row = { type: 'array', maxItems: MAX_BUTTONS, items: button };

  return {
    title: 'ShipBar',
    properties: {
      'shipbar.showConfigButton': {
        type: 'boolean',
        default: true,
        order: 1,
        description: 'Show the gear button that opens the ShipBar configuration panel.'
      },
      'shipbar.layout': {
        type: 'object',
        order: 2,
        // eslint-disable-next-line max-len
        markdownDescription: 'Buttons on the Touch Bar. Easiest edited from the panel: run **ShipBar: Configure Buttons**, or tap the gear on the Touch Bar.',
        properties: {
          main: { ...row, description: `The main row, up to ${MAX_BUTTONS} buttons.` },
          pages: {
            type: 'object',
            description: 'Extra rows a "page" button can open. Each key is a page name.',
            additionalProperties: row
          }
        }
      }
    }
  };
}

module.exports = {
  COMMAND_PREFIX,
  CONFIGURE_COMMAND,
  BACK_COMMAND,
  runCommandId,
  positionKey,
  buildCommands,
  buildTouchBarMenu,
  buildCommandPalette,
  buildConfiguration
};
