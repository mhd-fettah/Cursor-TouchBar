'use strict';

const ID = 'cursorTouchBar';
const DISPLAY_NAME = 'Cursor Touch Bar';

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
  settings: { label: 'Settings', file: 'icons/settings.png' },
  'logo-brand': { label: 'N3XTTECH', file: 'icons/logo-brand.png' },
  home: { label: 'Home', file: 'icons/home.png' },
  copy: { label: 'Copy', file: 'icons/copy.png' },
  'refresh-cw': { label: 'Refresh', file: 'icons/refresh-cw.png' },
  link: { label: 'Link', file: 'icons/link.png' },
  bookmark: { label: 'Bookmark', file: 'icons/bookmark.png' },
  'layout-grid': { label: 'Grid', file: 'icons/layout-grid.png' },
  keyboard: { label: 'Keyboard', file: 'icons/keyboard.png' },
  'trash-2': { label: 'Trash', file: 'icons/trash-2.png' },
  download: { label: 'Download', file: 'icons/download.png' },
  upload: { label: 'Upload', file: 'icons/upload.png' },
  filter: { label: 'Filter', file: 'icons/filter.png' },
  moon: { label: 'Moon', file: 'icons/moon.png' },
  sun: { label: 'Sun', file: 'icons/sun.png' },
  'redo-2': { label: 'Redo', file: 'icons/redo-2.png' },
  'clipboard-copy': { label: 'Clipboard', file: 'icons/clipboard-copy.png' },
  scissors: { label: 'Cut', file: 'icons/scissors.png' },
  'git-commit-vertical': { label: 'Commit', file: 'icons/git-commit-vertical.png' },
  'git-merge': { label: 'Merge', file: 'icons/git-merge.png' },
  'git-pull-request': { label: 'Pull request', file: 'icons/git-pull-request.png' },
  rocket: { label: 'Deploy', file: 'icons/rocket.png' },
  'flask-conical': { label: 'Test', file: 'icons/flask-conical.png' },
  package: { label: 'Package', file: 'icons/package.png' },
  database: { label: 'Database', file: 'icons/database.png' },
  cloud: { label: 'Cloud', file: 'icons/cloud.png' },
  server: { label: 'Server', file: 'icons/server.png' },
  bell: { label: 'Bell', file: 'icons/bell.png' },
  clock: { label: 'History', file: 'icons/clock.png' },
  'file-code': { label: 'Code file', file: 'icons/file-code.png' },
  'file-plus': { label: 'New file', file: 'icons/file-plus.png' },
  'folder-open': { label: 'Open folder', file: 'icons/folder-open.png' },
  send: { label: 'Send', file: 'icons/send.png' },
  'share-2': { label: 'Share', file: 'icons/share-2.png' },
  'external-link': { label: 'External link', file: 'icons/external-link.png' },
  palette: { label: 'Palette', file: 'icons/palette.png' },
  'circle-alert': { label: 'Alert', file: 'icons/circle-alert.png' },
  lightbulb: { label: 'Idea', file: 'icons/lightbulb.png' },
  'book-open': { label: 'Docs', file: 'icons/book-open.png' },
  archive: { label: 'Archive', file: 'icons/archive.png' },
  mail: { label: 'Mail', file: 'icons/mail.png' },
  'messages-square': { label: 'Messages', file: 'icons/messages-square.png' },
  replace: { label: 'Replace', file: 'icons/replace.png' },
  diff: { label: 'Diff', file: 'icons/diff.png' },
  'panel-top': { label: 'Top panel', file: 'icons/panel-top.png' },
  'layout-dashboard': { label: 'Dashboard', file: 'icons/layout-dashboard.png' },
  'app-window': { label: 'Window', file: 'icons/app-window.png' },
  monitor: { label: 'Monitor', file: 'icons/monitor.png' },
  pause: { label: 'Pause', file: 'icons/pause.png' },
  square: { label: 'Square', file: 'icons/square.png' },
  brackets: { label: 'Brackets', file: 'icons/brackets.png' },
  'square-code': { label: 'Snippet', file: 'icons/square-code.png' },
  lock: { label: 'Lock', file: 'icons/lock.png' },
  star: { label: 'Star', file: 'icons/star.png' },
  heart: { label: 'Heart', file: 'icons/heart.png' },
  user: { label: 'User', file: 'icons/user.png' },
  plug: { label: 'Plug', file: 'icons/plug.png' },
  cpu: { label: 'CPU', file: 'icons/cpu.png' },
  'hard-drive': { label: 'Storage', file: 'icons/hard-drive.png' },
  wifi: { label: 'Wi‑Fi', file: 'icons/wifi.png' },
  'volume-2': { label: 'Volume', file: 'icons/volume-2.png' },
  'log-out': { label: 'Log out', file: 'icons/log-out.png' },
  'circle-question-mark': { label: 'Help', file: 'icons/circle-question-mark.png' },
  target: { label: 'Target', file: 'icons/target.png' },
  workflow: { label: 'Workflow', file: 'icons/workflow.png' },
  blocks: { label: 'Blocks', file: 'icons/blocks.png' },
  puzzle: { label: 'Puzzle', file: 'icons/puzzle.png' },
  'rotate-ccw': { label: 'Rotate', file: 'icons/rotate-ccw.png' },
  repeat: { label: 'Repeat', file: 'icons/repeat.png' },
  inbox: { label: 'Inbox', file: 'icons/inbox.png' },
  'file-text': { label: 'Text file', file: 'icons/file-text.png' },
  contrast: { label: 'Contrast', file: 'icons/contrast.png' },
  'grip-vertical': { label: 'Grip', file: 'icons/grip-vertical.png' }
};

const ACTIONS = [
  {
    group: 'Layout',
    label: 'Layout',
    description: 'Open panel and terminal shortcuts on the bar.',
    icon: 'panel-left',
    type: 'page',
    page: 'layout'
  },
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
    label: 'Chat',
    description: 'Open chat shortcuts on the bar.',
    icon: 'message-square-plus',
    type: 'page',
    page: 'chat'
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
    label: 'Modes',
    description: 'Open Ask, Plan, and Agent on the bar.',
    icon: 'layers',
    type: 'page',
    page: 'modes'
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
    group: 'Skills',
    label: 'Skills',
    description: 'Open your skills on the bar.',
    icon: 'folder',
    type: 'page',
    page: 'skills'
  },
  {
    group: 'Review',
    label: 'Review',
    description: 'Open generate and accept or reject on the bar.',
    icon: 'circle-check',
    type: 'page',
    page: 'review'
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
    label: 'General',
    description: 'Open palette and save on the bar.',
    icon: 'search',
    type: 'page',
    page: 'general'
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

const MAX_SLOTS = 10;
const MAX_ICON_BUTTONS = 10;

const DEFAULT_SLOTS = [
  { id: 'slot1', enabled: true, icon: 'panel-left', type: 'command', command: 'workbench.action.toggleSidebarVisibility' },
  { id: 'slot2', enabled: true, icon: 'panel-bottom', type: 'command', command: 'workbench.action.togglePanel' },
  { id: 'slot3', enabled: true, icon: 'panel-right', type: 'command', command: 'workbench.action.toggleAuxiliaryBar' },
  {
    id: 'slot4',
    enabled: true,
    icon: 'message-square-plus',
    type: 'command',
    command: 'aichat.newchataction',
    spaceBefore: true
  },
  { id: 'slot5', enabled: true, icon: 'mic', type: 'command', command: 'composer.toggleVoiceDictation' },
  { id: 'slot6', enabled: true, icon: 'layers', type: 'page', page: 'modes', spaceBefore: true },
  { id: 'slot7', enabled: true, icon: 'folder', type: 'page', page: 'skills', spaceBefore: true }
];

const SLOTS = [];
for (let index = 1; index <= MAX_SLOTS; index++) {
  const id = 'slot' + index;
  const preset = DEFAULT_SLOTS.find((slot) => slot.id === id);
  SLOTS.push(preset || { id, enabled: false, icon: 'plus', type: 'command', command: '', page: '' });
}

const FIXED_BUTTONS = [
  {
    command: ID + '.back',
    title: 'Back',
    icon: 'chevron-left',
    group: '2_back@1',
    when: ID + '.page == modes || ' + ID + '.page == skills || ' +
      ID + '.page == layout || ' + ID + '.page == chat || ' + ID + '.page == review || ' + ID + '.page == general'
  },
  {
    command: ID + '.mode.ask',
    title: 'Ask',
    icon: 'message-circle',
    group: '3_modes@2',
    when: ID + '.page == modes',
    run: 'composerMode.chat'
  },
  {
    command: ID + '.mode.plan',
    title: 'Plan',
    icon: 'list-checks',
    group: '3_modes@3',
    when: ID + '.page == modes',
    run: 'composerMode.plan'
  },
  {
    command: ID + '.mode.agent',
    title: 'Agent',
    icon: 'bot',
    group: '3_modes@4',
    when: ID + '.page == modes',
    run: 'composerMode.agent'
  },
  {
    command: ID + '.skillPrev',
    title: 'Previous skills',
    icon: 'chevron-left',
    group: '2_skillprev@1',
    when: ID + '.page == skills && ' + ID + '.hasPrev'
  },
  {
    command: ID + '.next',
    title: 'Next',
    icon: 'chevron-right',
    group: '4_next@1',
    when: ID + '.hasNext'
  },
  {
    command: ID + '.addSkill',
    title: 'Add',
    icon: 'plus',
    group: '3_skills@1',
    when: ID + '.showAdd'
  }
];

const PAGE_SIZE = 8;
const SKILL_PAGE = 4;
const ACTION_ROW = 8;
const LABEL_FACES = 32;

function skillFaceToken(face) {
  return 'f' + face;
}

function skillSlotCommand(face, index) {
  return ID + '.skill.' + skillFaceToken(face) + '.' + index;
}

const ACTION_PAGE_GROUPS = {
  layout: 'Layout',
  chat: 'Chat',
  review: 'Review',
  general: 'General'
};

function actionsForPage(page) {
  const group = ACTION_PAGE_GROUPS[page];
  if (!group) {
    return [];
  }
  return ACTIONS.filter((item) => item.group === group && item.type === 'command');
}

// Built-in Touch Bar commands. We hide them so only this extension's buttons show.
const HIDDEN_TOUCHBAR = [
  'workbench.action.navigateBack',
  'workbench.action.navigateForward',
  'workbench.action.debug.start',
  'workbench.action.debug.run',
  'workbench.action.debug.continue',
  'workbench.action.debug.pause',
  'workbench.action.debug.stepInto',
  'workbench.action.debug.stepOut',
  'workbench.action.debug.stepOver',
  'workbench.action.debug.restart',
  'workbench.action.debug.stop',
  'workbench.action.debug.disconnect'
];
const PAGES = ['modes', 'skills', 'layout', 'chat', 'review', 'general'];

function pickableIconIds() {
  return Object.keys(ICONS).filter((id) => id !== 'settings' && id !== 'logo-brand').sort();
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
  ID,
  DISPLAY_NAME,
  ICONS,
  ACTIONS,
  SLOTS,
  MAX_SLOTS,
  MAX_ICON_BUTTONS,
  FIXED_BUTTONS,
  PAGE_SIZE,
  SKILL_PAGE,
  ACTION_ROW,
  LABEL_FACES,
  skillFaceToken,
  skillSlotCommand,
  ACTION_PAGE_GROUPS,
  actionsForPage,
  HIDDEN_TOUCHBAR,
  PAGES,
  pickableIconIds,
  describeButton
};
