'use strict';

// Built-in Cursor Agent skills — https://cursor.com/docs/skills
const PRESETS = [
  { id: 'review', label: 'review', group: 'Review', prompt: '/review' },
  { id: 'review-bugbot', label: 'review-bugbot', group: 'Review', prompt: '/review-bugbot' },
  { id: 'review-security', label: 'review-security', group: 'Review', prompt: '/review-security' },
  { id: 'cursor-blame', label: 'cursor-blame', group: 'Review', prompt: '/cursor-blame' },
  { id: 'automate', label: 'automate', group: 'Workflow', prompt: '/automate' },
  { id: 'autopilot', label: 'autopilot', group: 'Workflow', prompt: '/autopilot' },
  { id: 'loop', label: 'loop', group: 'Workflow', prompt: '/loop' },
  { id: 'migrate-to-skills', label: 'migrate-to-skills', group: 'Workflow', prompt: '/migrate-to-skills' },
  { id: 'create-rule', label: 'create-rule', group: 'Customize', prompt: '/create-rule' },
  { id: 'create-skill', label: 'create-skill', group: 'Customize', prompt: '/create-skill' },
  { id: 'create-hook', label: 'create-hook', group: 'Customize', prompt: '/create-hook' },
  { id: 'update-cursor-settings', label: 'update-cursor-settings', group: 'Customize', prompt: '/update-cursor-settings' },
  { id: 'update-cli-config', label: 'update-cli-config', group: 'Customize', prompt: '/update-cli-config' },
  { id: 'statusline', label: 'statusline', group: 'Customize', prompt: '/statusline' },
  { id: 'canvas', label: 'canvas', group: 'Build', prompt: '/canvas' },
  { id: 'sdk', label: 'sdk', group: 'Build', prompt: '/sdk' },
  { id: 'split-to-prs', label: 'split-to-prs', group: 'Build', prompt: '/split-to-prs' },
  { id: 'create-subagent', label: 'create-subagent', group: 'Build', prompt: '/create-subagent' },
  { id: 'shell', label: 'shell', group: 'Build', prompt: '/shell' }
];

const GROUPS = ['Review', 'Workflow', 'Customize', 'Build'];

module.exports = { PRESETS, GROUPS };
