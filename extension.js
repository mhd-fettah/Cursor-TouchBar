'use strict';

const crypto = require('crypto');
const vscode = require('vscode');

// Touch Bar icons cannot be swapped at runtime. They are fixed on the
// commands in package.json. This catalog is the runtime source of truth
// for which icon file, label, and default command each slot uses — keep
// it in sync with contributes.commands and contributes.menus.touchBar.
// `settings` is the gear button, not a slot.
const ICONS = {
  zap: { label: 'Zap', file: 'icons/zap.png' },
  'circle-check': { label: 'Check', file: 'icons/circle-check.png' },
  'circle-x': { label: 'Close', file: 'icons/circle-x.png' },
  split: { label: 'Branch', file: 'icons/split.png' },
  mic: { label: 'Mic', file: 'icons/mic.png' },
  sparkles: { label: 'Chat', file: 'icons/sparkles.png' },
  settings: { label: 'Settings', file: 'icons/settings.png' }
};

const SLOTS = [
  { id: 'slot1', icon: 'zap', enabled: true, command: 'aipopup.action.modal.generate' },
  { id: 'slot2', icon: 'circle-check', enabled: true, command: 'editor.action.inlineDiffs.acceptAll' },
  { id: 'slot3', icon: 'circle-x', enabled: true, command: 'editor.action.inlineDiffs.rejectAll' },
  { id: 'slot4', icon: 'split', enabled: true, command: 'composer.duplicateChat' },
  { id: 'slot5', icon: 'mic', enabled: true, command: 'composer.toggleVoiceDictation' },
  { id: 'slot6', icon: 'sparkles', enabled: true, command: 'aichat.newchataction' }
];

const PRESETS = [
  { label: 'Generate (inline AI prompt)', command: 'aipopup.action.modal.generate' },
  { label: 'Accept all edits', command: 'editor.action.inlineDiffs.acceptAll' },
  { label: 'Reject all edits', command: 'editor.action.inlineDiffs.rejectAll' },
  { label: 'Duplicate chat', command: 'composer.duplicateChat' },
  { label: 'Toggle voice dictation', command: 'composer.toggleVoiceDictation' },
  { label: 'New chat', command: 'aichat.newchataction' },
  { label: 'Toggle terminal', command: 'workbench.action.terminal.toggleTerminal' },
  { label: 'Open command palette', command: 'workbench.action.showCommands' }
];

function shipbarConfig() {
  return vscode.workspace.getConfiguration('shipbar');
}

function defaultButtons() {
  const buttons = {};
  for (const slot of SLOTS) {
    buttons[slot.id] = { enabled: slot.enabled, command: slot.command };
  }
  return buttons;
}

function readSlot(slot, raw) {
  const item = raw && typeof raw === 'object' ? raw : {};
  return {
    enabled: typeof item.enabled === 'boolean' ? item.enabled : slot.enabled,
    command: typeof item.command === 'string' ? item.command : slot.command
  };
}

function getButtons() {
  const stored = shipbarConfig().get('buttons');
  const source = stored && typeof stored === 'object' ? stored : {};
  const buttons = {};
  for (const slot of SLOTS) {
    buttons[slot.id] = readSlot(slot, source[slot.id]);
  }
  return buttons;
}

function buttonsFromMessage(input) {
  const source = input && typeof input === 'object' ? input : {};
  const buttons = {};
  for (const slot of SLOTS) {
    const raw = source[slot.id];
    const item = raw && typeof raw === 'object' ? raw : {};
    buttons[slot.id] = {
      enabled: item.enabled === true,
      command: typeof item.command === 'string' ? item.command.trim() : slot.command
    };
  }
  return buttons;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slotLabel(slot, index) {
  return `Slot ${index + 1} — ${ICONS[slot.icon].label} icon`;
}

function renderConfigHtml(buttons) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const rows = SLOTS.map((slot, index) => {
    const button = buttons[slot.id];
    const isPreset = PRESETS.some((preset) => preset.command === button.command);
    const options = PRESETS.map((preset) => {
      const selected = button.command === preset.command ? ' selected' : '';
      return `<option value="${escapeHtml(preset.command)}"${selected}>${escapeHtml(preset.label)}</option>`;
    }).join('');
    const customValue = isPreset ? '' : button.command;

    return `
      <div class="row" data-slot="${slot.id}">
        <label class="enabled-toggle">
          <input type="checkbox" class="enabled"${button.enabled ? ' checked' : ''} />
        </label>
        <div class="slot-info">
          <div class="slot-label">${escapeHtml(slotLabel(slot, index))}</div>
          <select class="preset">
            ${options}
            <option value="__custom__"${isPreset ? '' : ' selected'}>Custom command ID…</option>
          </select>
          <input type="text" class="custom" placeholder="e.g. workbench.action.files.save"
                 value="${escapeHtml(customValue)}"
                 style="display:${isPreset ? 'none' : 'block'}" />
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
<style nonce="${nonce}">
  body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    padding: 16px 20px;
  }
  h1 { font-size: 1.3em; margin-bottom: 4px; }
  .subtitle { opacity: 0.7; margin-bottom: 20px; font-size: 0.9em; }
  .row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--vscode-widget-border, rgba(128,128,128,0.2));
  }
  .enabled-toggle { padding-top: 2px; }
  .slot-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .slot-label { font-weight: 600; }
  select, input[type=text] {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, transparent);
    padding: 5px 8px;
    border-radius: 3px;
    font-family: inherit;
    font-size: inherit;
  }
  .actions { margin-top: 20px; display: flex; gap: 10px; }
  button {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 7px 16px;
    border-radius: 3px;
    cursor: pointer;
    font-family: inherit;
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
  button.secondary {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }
  .hint { opacity: 0.6; font-size: 0.85em; margin-top: 16px; }
  .hint a { color: var(--vscode-textLink-foreground); }
  .hint a:hover { color: var(--vscode-textLink-activeForeground); }
  .saved { color: var(--vscode-testing-iconPassed, #4caf50); font-size: 0.85em; margin-left: 8px; opacity: 0; transition: opacity 0.2s; }
  .saved.show { opacity: 1; }
</style>
</head>
<body>
  <h1>⚡ ShipBar — Configure Buttons</h1>
  <div class="subtitle">Toggle a button on/off, or pick what it runs. Icons are fixed per slot; only the command and visibility are configurable.</div>
  <div id="rows">${rows}</div>
  <div class="actions">
    <button id="save">Save</button>
    <button id="reset" class="secondary">Reset all to defaults</button>
    <span id="saved" class="saved">Saved ✓</span>
  </div>
  <div class="hint">Find more command IDs via Cmd+Shift+P → "Preferences: Open Keyboard Shortcuts (JSON)".</div>
  <div class="hint">Built by <a href="https://x.com/_Max_Blackwell" target="_blank" rel="noopener">@_Max_Blackwell</a> — follow along for updates.</div>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();

  document.querySelectorAll('.preset').forEach((sel) => {
    sel.addEventListener('change', () => {
      const customInput = sel.closest('.row').querySelector('.custom');
      customInput.style.display = sel.value === '__custom__' ? 'block' : 'none';
    });
  });

  function collect() {
    const buttons = {};
    document.querySelectorAll('.row').forEach((row) => {
      const preset = row.querySelector('.preset').value;
      const custom = row.querySelector('.custom').value.trim();
      buttons[row.getAttribute('data-slot')] = {
        enabled: row.querySelector('.enabled').checked,
        command: preset === '__custom__' ? custom : preset
      };
    });
    return buttons;
  }

  function flashSaved() {
    const saved = document.getElementById('saved');
    saved.classList.add('show');
    setTimeout(() => saved.classList.remove('show'), 1500);
  }

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'saved') {
      flashSaved();
    }
  });

  document.getElementById('save').addEventListener('click', () => {
    vscode.postMessage({ type: 'save', buttons: collect() });
  });

  document.getElementById('reset').addEventListener('click', () => {
    vscode.postMessage({ type: 'resetAll' });
  });
</script>
</body>
</html>`;
}

let configPanel;

function openConfigPanel(context) {
  if (configPanel) {
    configPanel.reveal(vscode.ViewColumn.Active);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'shipbarConfig',
    'ShipBar Configuration',
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: true }
  );
  configPanel = panel;

  const subscriptions = [];
  context.subscriptions.push(panel);
  context.subscriptions.push(panel.onDidDispose(() => {
    configPanel = undefined;
    subscriptions.forEach((item) => item.dispose());
  }));

  const refresh = () => {
    panel.webview.html = renderConfigHtml(getButtons());
  };
  refresh();

  panel.webview.onDidReceiveMessage(async (message) => {
    if (!message || (message.type !== 'save' && message.type !== 'resetAll')) {
      return;
    }

    try {
      const config = shipbarConfig();
      if (message.type === 'save') {
        await config.update('buttons', buttonsFromMessage(message.buttons), vscode.ConfigurationTarget.Global);
        panel.webview.postMessage({ type: 'saved' });
        vscode.window.setStatusBarMessage('ShipBar: configuration saved', 2000);
        return;
      }

      await config.update('buttons', defaultButtons(), vscode.ConfigurationTarget.Global);
      refresh();
      vscode.window.setStatusBarMessage('ShipBar: reset to defaults', 2000);
    } catch (err) {
      const detail = err && err.message ? err.message : String(err);
      vscode.window.showErrorMessage(`ShipBar: could not update configuration. ${detail}`);
    }
  }, undefined, subscriptions);
}

function activate(context) {
  for (const slot of SLOTS) {
    if (!ICONS[slot.icon]) {
      throw new Error(`ShipBar slot ${slot.id} references unknown icon "${slot.icon}"`);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('shipbar.configure', () => openConfigPanel(context))
  );

  for (const slot of SLOTS) {
    const icon = ICONS[slot.icon];
    context.subscriptions.push(
      vscode.commands.registerCommand(`shipbar.${slot.id}`, async () => {
        const target = getButtons()[slot.id].command.trim();
        if (!target) {
          vscode.window.showWarningMessage(
            `ShipBar: ${icon.label} has no command configured. Run "ShipBar: Configure Buttons" to set one.`
          );
          return;
        }

        try {
          await vscode.commands.executeCommand(target);
        } catch (err) {
          const detail = err && err.message ? err.message : String(err);
          vscode.window.showErrorMessage(`ShipBar (${icon.label} → ${target}) failed: ${detail}`);
        }
      })
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
