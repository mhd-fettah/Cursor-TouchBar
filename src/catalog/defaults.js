'use strict';

// The bar can hold this many buttons per row. Cursor builds the Touch Bar from
// ten segmented-control groups, and ten icon buttons is also about all that
// fits beside the Control Strip.
const MAX_BUTTONS = 10;

const SKILLS_PAGE = 'skills';

// What a fresh install looks like: the panels, chat, and modes on the main row,
// with two slots left off so the row never overflows. Everything here is
// editable from the configuration panel.
const DEFAULT_LAYOUT = {
  main: [
    {
      icon: 'panel-left',
      label: 'Left panel',
      enabled: true,
      action: { type: 'command', command: 'workbench.action.toggleSidebarVisibility' }
    },
    {
      icon: 'panel-bottom',
      label: 'Bottom panel',
      enabled: true,
      action: { type: 'command', command: 'workbench.action.togglePanel' }
    },
    {
      icon: 'panel-right',
      label: 'Right panel',
      enabled: true,
      action: { type: 'command', command: 'workbench.action.toggleAuxiliaryBar' }
    },
    {
      icon: 'message-square-plus',
      label: 'New chat',
      enabled: true,
      action: { type: 'command', command: 'aichat.newchataction' }
    },
    {
      icon: 'message-circle',
      label: 'Ask mode',
      enabled: true,
      action: { type: 'command', command: 'composerMode.chat' }
    },
    {
      icon: 'list-checks',
      label: 'Plan mode',
      enabled: true,
      action: { type: 'command', command: 'composerMode.plan' }
    },
    {
      icon: 'bot',
      label: 'Agent mode',
      enabled: true,
      action: { type: 'command', command: 'composerMode.agent' }
    },
    {
      icon: 'folder',
      label: 'Skills',
      enabled: true,
      action: { type: 'page', page: SKILLS_PAGE }
    },
    {
      icon: 'circle-check',
      label: 'Accept all edits',
      enabled: false,
      action: { type: 'command', command: 'editor.action.inlineDiffs.acceptAll' }
    },
    {
      icon: 'circle-x',
      label: 'Reject all edits',
      enabled: false,
      action: { type: 'command', command: 'editor.action.inlineDiffs.rejectAll' }
    }
  ],
  pages: {
    [SKILLS_PAGE]: [
      {
        icon: 'git-pull-request',
        label: 'Review changes',
        enabled: true,
        action: { type: 'prompt', text: 'Review my uncommitted changes and list anything risky.' }
      },
      {
        icon: 'git-commit-horizontal',
        label: 'Write commit',
        enabled: true,
        action: { type: 'prompt', text: 'Write a commit message for my staged changes.' }
      },
      {
        icon: 'bug',
        label: 'Explain error',
        enabled: true,
        action: { type: 'prompt', text: 'Explain the errors in the Problems panel and how to fix them.' }
      }
    ]
  }
};

// Maps ShipBar's `shipbar.buttons` slots onto the icons they were locked to.
const LEGACY_SLOT_ICONS = {
  slot1: 'zap',
  slot2: 'circle-check',
  slot3: 'circle-x',
  slot4: 'split',
  slot5: 'mic',
  slot6: 'sparkles'
};

module.exports = { MAX_BUTTONS, SKILLS_PAGE, DEFAULT_LAYOUT, LEGACY_SLOT_ICONS };
