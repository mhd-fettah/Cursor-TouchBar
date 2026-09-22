'use strict';

// Curated commands offered first in the picker, because Cursor's own command
// IDs carry no discoverable title — they exist only in the workbench bundle.
// The panel appends titles harvested from installed extensions and then every
// remaining ID from vscode.commands.getCommands(), so this list is a shortcut,
// not a limit.
const COMMAND_GROUPS = [
  {
    id: 'panels',
    label: 'Panels and layout',
    commands: [
      {
        command: 'workbench.action.toggleSidebarVisibility',
        title: 'Toggle left panel',
        description: 'Show or hide the primary sidebar (Explorer, Search, Source Control).'
      },
      {
        command: 'workbench.action.togglePanel',
        title: 'Toggle bottom panel',
        description: 'Show or hide the bottom panel (Terminal, Problems, Output).'
      },
      {
        command: 'workbench.action.toggleAuxiliaryBar',
        title: 'Toggle right panel',
        description: 'Show or hide the secondary sidebar on the right.'
      },
      {
        command: 'workbench.action.toggleUnifiedSidebar',
        title: 'Toggle unified sidebar',
        description: 'Cursor layouts that combine the chat and sidebar use this instead of the right panel.'
      },
      {
        command: 'workbench.action.toggleMaximizedPanel',
        title: 'Maximize bottom panel',
        description: 'Expand the bottom panel to fill the window, or restore it.'
      },
      {
        command: 'workbench.action.toggleZenMode',
        title: 'Toggle Zen mode',
        description: 'Hide all chrome and center the editor.'
      },
      {
        command: 'workbench.action.terminal.toggleTerminal',
        title: 'Toggle terminal',
        description: 'Show or hide the integrated terminal.'
      }
    ]
  },
  {
    id: 'chat',
    label: 'Chat',
    commands: [
      {
        command: 'aichat.newchataction',
        title: 'New chat',
        description: 'Start a fresh chat thread.'
      },
      {
        command: 'composer.duplicateChat',
        title: 'Duplicate chat',
        description: 'Branch the current thread into a copy so you can try another direction.'
      },
      {
        command: 'composer.focusComposer',
        title: 'Focus chat input',
        description: 'Put the cursor in the chat box.'
      },
      {
        command: 'composer.toggleVoiceDictation',
        title: 'Toggle voice dictation',
        description: 'Start or stop dictating into the chat box.'
      },
      {
        command: 'composer.nextChatTab',
        title: 'Next chat tab',
        description: 'Move to the next open chat.'
      },
      {
        command: 'composer.previousChatTab',
        title: 'Previous chat tab',
        description: 'Move to the previous open chat.'
      },
      {
        command: 'composer.cancelComposerStep',
        title: 'Stop generating',
        description: 'Cancel the agent mid-run.'
      },
      {
        command: 'composer.openModelToggle',
        title: 'Open model picker',
        description: 'Choose which model the current chat uses.'
      }
    ]
  },
  {
    id: 'modes',
    label: 'Chat modes',
    commands: [
      {
        command: 'composerMode.agent',
        title: 'Agent mode',
        description: 'Let Cursor plan, search, edit, and run commands.'
      },
      {
        command: 'composerMode.chat',
        title: 'Ask mode',
        description: 'Ask questions about the codebase without edits.'
      },
      {
        command: 'composerMode.plan',
        title: 'Plan mode',
        description: 'Draft a detailed plan before any code is written.'
      },
      {
        command: 'composerMode.spec',
        title: 'Spec mode',
        description: 'Build a structured plan with implementation steps.'
      },
      {
        command: 'composerMode.triage',
        title: 'Triage mode',
        description: 'Coordinate long tasks across delegated subagents.'
      },
      {
        command: 'composerMode.multitask',
        title: 'Multitask mode',
        description: 'Run and coordinate several tasks in parallel.'
      },
      {
        command: 'composer.cycleMode',
        title: 'Cycle chat mode',
        description: 'Rotate through the modes with one button instead of several.'
      },
      {
        command: 'composer.openModeMenu',
        title: 'Open mode menu',
        description: 'Pick a mode from Cursor\u2019s own menu.'
      }
    ]
  },
  {
    id: 'edits',
    label: 'Agent edits',
    commands: [
      {
        command: 'aipopup.action.modal.generate',
        title: 'Inline generate',
        description: 'Open the inline AI prompt at the cursor (the Cmd+K box).'
      },
      {
        command: 'editor.action.inlineDiffs.acceptAll',
        title: 'Accept all edits',
        description: 'Keep every pending change in the active file.'
      },
      {
        command: 'editor.action.inlineDiffs.rejectAll',
        title: 'Reject all edits',
        description: 'Discard every pending change in the active file.'
      },
      {
        command: 'undo',
        title: 'Undo',
        description: 'Undo the last edit.'
      },
      {
        command: 'redo',
        title: 'Redo',
        description: 'Redo the last undone edit.'
      }
    ]
  },
  {
    id: 'git',
    label: 'Git',
    commands: [
      {
        command: 'workbench.view.scm',
        title: 'Open Source Control',
        description: 'Show the Source Control view.'
      },
      {
        command: 'git.stageAll',
        title: 'Stage all changes',
        description: 'Add every change to the index.'
      },
      {
        command: 'git.commitStaged',
        title: 'Commit staged',
        description: 'Commit what is already staged.'
      },
      {
        command: 'git.sync',
        title: 'Sync',
        description: 'Pull then push the current branch.'
      },
      {
        command: 'git.checkout',
        title: 'Switch branch',
        description: 'Check out another branch.'
      },
      {
        command: 'git.branch',
        title: 'Create branch',
        description: 'Start a new branch from HEAD.'
      }
    ]
  },
  {
    id: 'editor',
    label: 'Editor',
    commands: [
      {
        command: 'workbench.action.showCommands',
        title: 'Command palette',
        description: 'Open the command palette.'
      },
      {
        command: 'workbench.action.quickOpen',
        title: 'Go to file',
        description: 'Open the fuzzy file picker.'
      },
      {
        command: 'workbench.action.files.save',
        title: 'Save',
        description: 'Save the active file.'
      },
      {
        command: 'workbench.action.files.saveAll',
        title: 'Save all',
        description: 'Save every dirty file.'
      },
      {
        command: 'workbench.action.findInFiles',
        title: 'Search in files',
        description: 'Search across the workspace.'
      },
      {
        command: 'editor.action.formatDocument',
        title: 'Format document',
        description: 'Run the formatter on the active file.'
      },
      {
        command: 'editor.action.commentLine',
        title: 'Toggle comment',
        description: 'Comment or uncomment the selection.'
      },
      {
        command: 'workbench.action.closeActiveEditor',
        title: 'Close editor',
        description: 'Close the active tab.'
      },
      {
        command: 'workbench.action.splitEditor',
        title: 'Split editor',
        description: 'Open a second editor group beside this one.'
      }
    ]
  }
];

const COMMANDS = new Map();
for (const group of COMMAND_GROUPS) {
  for (const entry of group.commands) {
    COMMANDS.set(entry.command, { ...entry, group: group.id });
  }
}

module.exports = { COMMAND_GROUPS, COMMANDS };
