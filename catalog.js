'use strict';

// Touch Bar icons are PNG files. This catalog is the source for the
// manifest script and the config panel.
const ICONS = {
  'panel-left': { label: 'Left panel', file: 'icons/panel-left.png' },
  'panel-bottom': { label: 'Bottom panel', file: 'icons/panel-bottom.png' },
  'panel-right': { label: 'Right panel', file: 'icons/panel-right.png' },
  'message-square-plus': { label: 'New chat', file: 'icons/message-square-plus.png' },
  'message-circle': { label: 'Ask', file: 'icons/message-circle.png' },
  'list-checks': { label: 'Plan', file: 'icons/list-checks.png' },
  bot: { label: 'Agent', file: 'icons/bot.png' },
  folder: { label: 'Folder', file: 'icons/folder.png' },
  layers: { label: 'Layers', file: 'icons/layers.png' },
  zap: { label: 'Zap', file: 'icons/zap.png' },
  'circle-check': { label: 'Check', file: 'icons/circle-check.png' },
  'circle-x': { label: 'Close', file: 'icons/circle-x.png' },
  split: { label: 'Branch', file: 'icons/split.png' },
  mic: { label: 'Mic', file: 'icons/mic.png' },
  sparkles: { label: 'Sparkles', file: 'icons/sparkles.png' },
  terminal: { label: 'Terminal', file: 'icons/terminal.png' },
  'git-branch': { label: 'Git', file: 'icons/git-branch.png' },
  search: { label: 'Search', file: 'icons/search.png' },
  plus: { label: 'Plus', file: 'icons/plus.png' },
  play: { label: 'Play', file: 'icons/play.png' },
  file: { label: 'File', file: 'icons/file.png' },
  save: { label: 'Save', file: 'icons/save.png' },
  'undo-2': { label: 'Undo', file: 'icons/undo-2.png' },
  eye: { label: 'Eye', file: 'icons/eye.png' },
  pin: { label: 'Pin', file: 'icons/pin.png' },
  list: { label: 'List', file: 'icons/list.png' },
  pencil: { label: 'Pencil', file: 'icons/pencil.png' },
  bug: { label: 'Bug', file: 'icons/bug.png' },
  wrench: { label: 'Wrench', file: 'icons/wrench.png' },
  'message-square': { label: 'Message', file: 'icons/message-square.png' },
  code: { label: 'Code', file: 'icons/code.png' },
  'chevron-left': { label: 'Back', file: 'icons/chevron-left.png' },
  'chevron-right': { label: 'Next', file: 'icons/chevron-right.png' },
  settings: { label: 'Settings', file: 'icons/settings.png' }
};

const ACTIONS = [
  {
    group: 'Layout',
    label: 'Left panel',
    description: 'Show or hide the left sidebar.',
    icon: 'panel-left',
    type: 'command',
    command: 'workbench.action.toggleSidebarVisibility'
  },
  {
    group: 'Layout',
    label: 'Bottom panel',
    description: 'Show or hide the bottom panel.',
    icon: 'panel-bottom',
    type: 'command',
    command: 'workbench.action.togglePanel'
  },
  {
    group: 'Layout',
    label: 'Right panel',
    description: 'Show or hide the right sidebar.',
    icon: 'panel-right',
    type: 'command',
    command: 'workbench.action.toggleAuxiliaryBar'
  },
  {
    group: 'Layout',
    label: 'Unified sidebar',
    description: 'Show or hide the unified sidebar, if that is where your chat sits.',
    icon: 'panel-right',
    type: 'command',
    command: 'workbench.action.toggleUnifiedSidebar'
  },
  {
    group: 'Layout',
    label: 'Terminal',
    description: 'Show or hide the terminal.',
    icon: 'terminal',
    type: 'command',
    command: 'workbench.action.terminal.toggleTerminal'
  },
  {
    group: 'Chat',
    label: 'New chat',
    description: 'Start a new chat.',
    icon: 'message-square-plus',
    type: 'command',
    command: 'aichat.newchataction'
  },
  {
    group: 'Chat',
    label: 'Duplicate chat',
    description: 'Duplicate the current chat into a new thread.',
    icon: 'split',
    type: 'command',
    command: 'composer.duplicateChat'
  },
  {
    group: 'Chat',
    label: 'Voice',
    description: 'Turn voice dictation on or off.',
    icon: 'mic',
    type: 'command',
    command: 'composer.toggleVoiceDictation'
  },
  {
    group: 'Modes',
    label: 'Ask',
    description: 'Switch the current chat to Ask.',
    icon: 'message-circle',
    type: 'command',
    command: 'composerMode.chat'
  },
  {
    group: 'Modes',
    label: 'Plan',
    description: 'Switch the current chat to Plan.',
    icon: 'list-checks',
    type: 'command',
    command: 'composerMode.plan'
  },
  {
    group: 'Modes',
    label: 'Agent',
    description: 'Switch the current chat to Agent.',
    icon: 'bot',
    type: 'command',
    command: 'composerMode.agent'
  },
  {
    group: 'Modes',
    label: 'Cycle modes',
    description: 'Cycle the current chat through its modes.',
    icon: 'layers',
    type: 'command',
    command: 'composer.cycleMode'
  },
  {
    group: 'Pages',
    label: 'Modes',
    description: 'Open Ask, Plan, and Agent on the bar.',
    icon: 'layers',
    type: 'page',
    page: 'modes'
  },
  {
    group: 'Pages',
    label: 'Skills',
    description: 'Open your skills on the bar.',
    icon: 'folder',
    type: 'page',
    page: 'skills'
  },
  {
    group: 'Review',
    label: 'Generate',
    description: 'Open inline generate at the cursor.',
    icon: 'zap',
    type: 'command',
    command: 'aipopup.action.modal.generate'
  },
  {
    group: 'Review',
    label: 'Accept all',
    description: 'Accept all pending edits.',
    icon: 'circle-check',
    type: 'command',
    command: 'editor.action.inlineDiffs.acceptAll'
  },
  {
    group: 'Review',
    label: 'Reject all',
    description: 'Reject all pending edits.',
    icon: 'circle-x',
    type: 'command',
    command: 'editor.action.inlineDiffs.rejectAll'
  },
  {
    group: 'General',
    label: 'Command palette',
    description: 'Open the command palette.',
    icon: 'search',
    type: 'command',
    command: 'workbench.action.showCommands'
  },
  {
    group: 'General',
    label: 'Save',
    description: 'Save the current file.',
    icon: 'save',
    type: 'command',
    command: 'workbench.action.files.save'
  }
];

const SLOTS = [
  { id: 'slot1', enabled: true, icon: 'panel-left', type: 'command', command: 'workbench.action.toggleSidebarVisibility' },
  { id: 'slot2', enabled: true, icon: 'panel-bottom', type: 'command', command: 'workbench.action.togglePanel' },
  { id: 'slot3', enabled: true, icon: 'panel-right', type: 'command', command: 'workbench.action.toggleAuxiliaryBar' },
  { id: 'slot4', enabled: true, icon: 'message-square-plus', type: 'command', command: 'aichat.newchataction' },
  { id: 'slot5', enabled: true, icon: 'layers', type: 'page', page: 'modes' },
  { id: 'slot6', enabled: true, icon: 'folder', type: 'page', page: 'skills' }
];

const FIXED_BUTTONS = [
  {
    command: 'shipbar.back',
    title: 'Back',
    icon: 'chevron-left',
    order: 1,
    when: 'shipbar.page == modes || shipbar.page == skills || shipbar.page == group'
  },
  {
    command: 'shipbar.mode.ask',
    title: 'Ask',
    icon: 'message-circle',
    order: 2,
    when: 'shipbar.page == modes',
    run: 'composerMode.chat'
  },
  {
    command: 'shipbar.mode.plan',
    title: 'Plan',
    icon: 'list-checks',
    order: 3,
    when: 'shipbar.page == modes',
    run: 'composerMode.plan'
  },
  {
    command: 'shipbar.mode.agent',
    title: 'Agent',
    icon: 'bot',
    order: 4,
    when: 'shipbar.page == modes',
    run: 'composerMode.agent'
  },
  {
    command: 'shipbar.next',
    title: 'Next',
    icon: 'chevron-right',
    order: 7,
    when: 'shipbar.hasNext'
  },
  {
    command: 'shipbar.addSkill',
    title: 'Add skill',
    icon: 'plus',
    order: 2,
    when: 'shipbar.showAdd'
  }
];

const PAGE_SIZE = 5;
const PAGES = ['modes', 'skills'];

function pickableIconIds() {
  return Object.keys(ICONS).filter((id) => id !== 'settings').sort();
}

function describeButton(button) {
  const action = ACTIONS.find((item) => {
    if (item.type !== button.type) {
      return false;
    }
    return item.type === 'page' ? item.page === button.page : item.command === button.command;
  });
  if (action) {
    return { label: action.label, description: action.description };
  }
  if (button.type === 'page') {
    return { label: 'Another row', description: 'Opens a second row on the Touch Bar.' };
  }
  if (button.command) {
    return { label: 'Custom command', description: button.command };
  }
  return { label: 'Empty', description: 'Choose an action for this button.' };
}

module.exports = {
  ICONS,
  ACTIONS,
  SLOTS,
  FIXED_BUTTONS,
  PAGE_SIZE,
  PAGES,
  pickableIconIds,
  describeButton
};
