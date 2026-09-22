'use strict';

// Every icon a button can wear. Touch Bar icons are painted from a PNG file
// inside the extension, so each id here must have a matching icons/<id>.png
// produced by icons-download.sh, and a generated command in package.json.
// Ids are Lucide icon names — see https://lucide.dev.
const ICON_GROUPS = [
  {
    id: 'layout',
    label: 'Layout',
    icons: [
      { id: 'panel-left', label: 'Left panel' },
      { id: 'panel-right', label: 'Right panel' },
      { id: 'panel-bottom', label: 'Bottom panel' },
      { id: 'panel-top', label: 'Top panel' },
      { id: 'panel-left-close', label: 'Collapse left' },
      { id: 'panel-right-close', label: 'Collapse right' },
      { id: 'layout-dashboard', label: 'Dashboard' },
      { id: 'layout-grid', label: 'Grid' },
      { id: 'layout-list', label: 'List layout' },
      { id: 'columns-3', label: 'Columns' },
      { id: 'maximize', label: 'Maximize' },
      { id: 'minimize', label: 'Minimize' }
    ]
  },
  {
    id: 'ai',
    label: 'Chat and AI',
    icons: [
      { id: 'message-square-plus', label: 'New chat' },
      { id: 'message-square', label: 'Chat' },
      { id: 'message-circle', label: 'Ask' },
      { id: 'messages-square', label: 'Chats' },
      { id: 'bot', label: 'Agent' },
      { id: 'sparkles', label: 'Sparkles' },
      { id: 'wand-sparkles', label: 'Magic wand' },
      { id: 'brain', label: 'Brain' },
      { id: 'zap', label: 'Generate' },
      { id: 'infinity', label: 'Infinity' },
      { id: 'mic', label: 'Microphone' },
      { id: 'mic-off', label: 'Microphone off' },
      { id: 'audio-lines', label: 'Voice' },
      { id: 'circle-question-mark', label: 'Question' }
    ]
  },
  {
    id: 'plan',
    label: 'Plans and tasks',
    icons: [
      { id: 'list-checks', label: 'Plan' },
      { id: 'list-todo', label: 'To-do' },
      { id: 'clipboard-list', label: 'Checklist' },
      { id: 'notebook-pen', label: 'Notes' },
      { id: 'milestone', label: 'Milestone' },
      { id: 'route', label: 'Route' },
      { id: 'workflow', label: 'Workflow' },
      { id: 'waypoints', label: 'Waypoints' },
      { id: 'rocket', label: 'Rocket' },
      { id: 'shapes', label: 'Shapes' }
    ]
  },
  {
    id: 'edits',
    label: 'Edits and history',
    icons: [
      { id: 'circle-check', label: 'Accept' },
      { id: 'circle-x', label: 'Reject' },
      { id: 'check', label: 'Check' },
      { id: 'check-check', label: 'Accept all' },
      { id: 'x', label: 'Close' },
      { id: 'undo-2', label: 'Undo' },
      { id: 'redo-2', label: 'Redo' },
      { id: 'rotate-ccw', label: 'Revert' },
      { id: 'rotate-cw', label: 'Redo circle' },
      { id: 'rotate-ccw-clock', label: 'History' },
      { id: 'pencil-line', label: 'Edit' },
      { id: 'file-pen', label: 'Edit file' }
    ]
  },
  {
    id: 'git',
    label: 'Git',
    icons: [
      { id: 'git-branch', label: 'Branch' },
      { id: 'git-branch-plus', label: 'New branch' },
      { id: 'git-commit-horizontal', label: 'Commit' },
      { id: 'git-compare', label: 'Compare' },
      { id: 'git-merge', label: 'Merge' },
      { id: 'git-pull-request', label: 'Pull request' },
      { id: 'split', label: 'Split' },
      { id: 'upload', label: 'Push' },
      { id: 'download', label: 'Pull' },
      { id: 'refresh-cw', label: 'Sync' }
    ]
  },
  {
    id: 'files',
    label: 'Files',
    icons: [
      { id: 'folder', label: 'Folder' },
      { id: 'folder-open', label: 'Open folder' },
      { id: 'folder-tree', label: 'Folder tree' },
      { id: 'file', label: 'File' },
      { id: 'file-code', label: 'Code file' },
      { id: 'files', label: 'Files' },
      { id: 'file-search', label: 'Find in file' },
      { id: 'file-plus', label: 'New file' },
      { id: 'file-diff', label: 'Diff' },
      { id: 'save', label: 'Save' },
      { id: 'save-all', label: 'Save all' },
      { id: 'archive', label: 'Archive' }
    ]
  },
  {
    id: 'search',
    label: 'Search',
    icons: [
      { id: 'search', label: 'Search' },
      { id: 'search-code', label: 'Search code' },
      { id: 'text-search', label: 'Find text' },
      { id: 'replace', label: 'Replace' },
      { id: 'command', label: 'Command palette' },
      { id: 'keyboard', label: 'Keyboard' },
      { id: 'list-filter', label: 'Filter' },
      { id: 'list-sort-ascending', label: 'Sort' }
    ]
  },
  {
    id: 'run',
    label: 'Terminal and run',
    icons: [
      { id: 'terminal', label: 'Terminal' },
      { id: 'square-terminal', label: 'Terminal panel' },
      { id: 'play', label: 'Run' },
      { id: 'square-play', label: 'Run task' },
      { id: 'pause', label: 'Pause' },
      { id: 'circle-stop', label: 'Stop' },
      { id: 'bug', label: 'Debug' },
      { id: 'bug-play', label: 'Start debugging' },
      { id: 'square-function', label: 'Function' },
      { id: 'activity', label: 'Activity' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icons: [
      { id: 'settings', label: 'Settings' },
      { id: 'settings-2', label: 'Preferences' },
      { id: 'sliders-horizontal', label: 'Sliders' },
      { id: 'wrench', label: 'Wrench' },
      { id: 'cog', label: 'Cog' },
      { id: 'toggle-left', label: 'Toggle' },
      { id: 'lock', label: 'Lock' },
      { id: 'lock-open', label: 'Unlock' }
    ]
  },
  {
    id: 'text',
    label: 'Text',
    icons: [
      { id: 'text-align-start', label: 'Align' },
      { id: 'list-indent-increase', label: 'Indent' },
      { id: 'text-wrap', label: 'Wrap' },
      { id: 'pilcrow', label: 'Paragraph' },
      { id: 'type', label: 'Type' },
      { id: 'list', label: 'List' },
      { id: 'table-2', label: 'Table' },
      { id: 'code', label: 'Code' },
      { id: 'code-xml', label: 'Markup' },
      { id: 'braces', label: 'Braces' }
    ]
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icons: [
      { id: 'arrow-left', label: 'Left' },
      { id: 'arrow-right', label: 'Right' },
      { id: 'arrow-up', label: 'Up' },
      { id: 'arrow-down', label: 'Down' },
      { id: 'chevron-left', label: 'Back' },
      { id: 'chevron-right', label: 'Forward' },
      { id: 'chevron-up', label: 'Previous' },
      { id: 'chevron-down', label: 'Next' },
      { id: 'corner-down-left', label: 'Enter' },
      { id: 'external-link', label: 'Open external' }
    ]
  },
  {
    id: 'marks',
    label: 'Marks and alerts',
    icons: [
      { id: 'star', label: 'Star' },
      { id: 'heart', label: 'Heart' },
      { id: 'bookmark', label: 'Bookmark' },
      { id: 'flag', label: 'Flag' },
      { id: 'pin', label: 'Pin' },
      { id: 'tag', label: 'Tag' },
      { id: 'bell', label: 'Bell' },
      { id: 'bell-off', label: 'Bell off' },
      { id: 'eye', label: 'Show' },
      { id: 'eye-off', label: 'Hide' },
      { id: 'lightbulb', label: 'Idea' },
      { id: 'info', label: 'Info' },
      { id: 'triangle-alert', label: 'Warning' },
      { id: 'target', label: 'Target' }
    ]
  },
  {
    id: 'system',
    label: 'System and data',
    icons: [
      { id: 'database', label: 'Database' },
      { id: 'server', label: 'Server' },
      { id: 'cpu', label: 'CPU' },
      { id: 'hard-drive', label: 'Disk' },
      { id: 'chart-line', label: 'Chart' },
      { id: 'gauge', label: 'Gauge' },
      { id: 'globe', label: 'Globe' },
      { id: 'link', label: 'Link' },
      { id: 'share-2', label: 'Share' },
      { id: 'package', label: 'Package' }
    ]
  },
  {
    id: 'time',
    label: 'Time',
    icons: [
      { id: 'clock', label: 'Clock' },
      { id: 'timer', label: 'Timer' },
      { id: 'calendar', label: 'Calendar' },
      { id: 'hourglass', label: 'Hourglass' },
      { id: 'alarm-clock', label: 'Alarm' }
    ]
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icons: [
      { id: 'sun', label: 'Light' },
      { id: 'moon', label: 'Dark' },
      { id: 'monitor', label: 'Monitor' },
      { id: 'laptop', label: 'Laptop' },
      { id: 'palette', label: 'Palette' },
      { id: 'paintbrush', label: 'Paintbrush' },
      { id: 'droplet', label: 'Droplet' },
      { id: 'image', label: 'Image' }
    ]
  }
];

// Icons the extension's own fixed buttons wear. Both are already in the
// catalog above, so they need no extra PNG.
const RESERVED_ICONS = { configure: 'settings', back: 'chevron-left' };

const ICONS = new Map();
for (const group of ICON_GROUPS) {
  for (const icon of group.icons) {
    ICONS.set(icon.id, { ...icon, group: group.id });
  }
}

const ICON_IDS = [...ICONS.keys()];

function iconFile(iconId) {
  return `icons/${iconId}.png`;
}

module.exports = { ICON_GROUPS, ICONS, ICON_IDS, RESERVED_ICONS, iconFile };
