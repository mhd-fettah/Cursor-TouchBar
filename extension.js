const vscode = require('vscode');

const SLOT_IDS = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6'];

const DEFAULTS = {
  slot1: { enabled: true, command: 'aipopup.action.modal.generate' },
  slot2: { enabled: true, command: 'editor.action.inlineDiffs.acceptAll' },
  slot3: { enabled: true, command: 'editor.action.inlineDiffs.rejectAll' },
  slot4: { enabled: true, command: 'composer.duplicateChat' },
  slot5: { enabled: true, command: 'composer.toggleVoiceDictation' },
  slot6: { enabled: true, command: 'aichat.newchataction' }
};

const SLOT_LABELS = {
  slot1: 'Slot 1 — Zap icon',
  slot2: 'Slot 2 — Check icon',
  slot3: 'Slot 3 — Close icon',
  slot4: 'Slot 4 — Branch icon',
  slot5: 'Slot 5 — Mic icon',
  slot6: 'Slot 6 — Chat icon'
};

// Curated presets so most users never have to type a raw command ID.
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

function getButtons(config) {
  const stored = config.get('shipbar.buttons', DEFAULTS);
  // Fill in any slot missing from the user's override with its default, so
  // partial configs never lose the other slots.
  const merged = {};
  for (const slotId of SLOT_IDS) {
    merged[slotId] = (stored && stored[slotId]) || DEFAULTS[slotId];
  }
  return merged;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderConfigHtml(buttons) {
  const rows = SLOT_IDS.map((slotId) => {
    const b = buttons[slotId];
    const isPreset = PRESETS.some((p) => p.command === b.command);
    const options = PRESETS.map(
      (p) =>
        `<option value="${escapeHtml(p.command)}" ${b.command === p.command ? 'selected' : ''}>${escapeHtml(p.label)}</option>`
    ).join('');
    return `
      <div class="row" data-slot="${slotId}">
        <label class="enabled-toggle">
          <input type="checkbox" class="enabled" ${b.enabled ? 'checked' : ''} />
        </label>
        <div class="slot-info">
          <div class="slot-label">${escapeHtml(SLOT_LABELS[slotId])}</div>
          <select class="preset">
            ${options}
            <option value="__custom__" ${!isPreset ? 'selected' : ''}>Custom command ID…</option>
          </select>
          <input type="text" class="custom" placeholder="e.g. workbench.action.files.save"
                 value="${escapeHtml(!isPreset ? b.command || '' : '')}"
                 style="display:${!isPreset ? 'block' : 'none'}" />
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
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

<script>
  const vscode = acquireVsCodeApi();

  document.querySelectorAll('.preset').forEach((sel) => {
    sel.addEventListener('change', () => {
      const row = sel.closest('.row');
      const customInput = row.querySelector('.custom');
      customInput.style.display = sel.value === '__custom__' ? 'block' : 'none';
    });
  });

  function collect() {
    const buttons = {};
    document.querySelectorAll('.row').forEach((row) => {
      const slotId = row.getAttribute('data-slot');
      const enabled = row.querySelector('.enabled').checked;
      const preset = row.querySelector('.preset').value;
      const custom = row.querySelector('.custom').value.trim();
      const command = preset === '__custom__' ? custom : preset;
      buttons[slotId] = { enabled, command };
    });
    return buttons;
  }

  document.getElementById('save').addEventListener('click', () => {
    vscode.postMessage({ type: 'save', buttons: collect() });
    const saved = document.getElementById('saved');
    saved.classList.add('show');
    setTimeout(() => saved.classList.remove('show'), 1500);
  });

  document.getElementById('reset').addEventListener('click', () => {
    vscode.postMessage({ type: 'resetAll' });
  });
</script>
</body>
</html>`;
}

function openConfigPanel(context) {
  const panel = vscode.window.createWebviewPanel(
    'shipbarConfig',
    'ShipBar Configuration',
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  const refresh = () => {
    const config = vscode.workspace.getConfiguration();
    panel.webview.html = renderConfigHtml(getButtons(config));
  };
  refresh();

  panel.webview.onDidReceiveMessage(
    async (message) => {
      const config = vscode.workspace.getConfiguration();
      if (message.type === 'save') {
        await config.update('shipbar.buttons', message.buttons, vscode.ConfigurationTarget.Global);
        vscode.window.setStatusBarMessage('ShipBar: configuration saved', 2000);
      } else if (message.type === 'resetAll') {
        await config.update('shipbar.buttons', DEFAULTS, vscode.ConfigurationTarget.Global);
        refresh();
        vscode.window.setStatusBarMessage('ShipBar: reset to defaults', 2000);
      }
    },
    undefined,
    context.subscriptions
  );
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('shipbar.configure', () => openConfigPanel(context))
  );

  // Each slot command reads its *current* target command from settings at
  // invocation time — no reload needed after saving in the config panel.
  for (const slotId of SLOT_IDS) {
    const commandId = `shipbar.${slotId}`;
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, async () => {
        const config = vscode.workspace.getConfiguration();
        const buttons = getButtons(config);
        const target = buttons[slotId] && buttons[slotId].command;

        if (!target) {
          vscode.window.showWarningMessage(
            `ShipBar: ${slotId} has no command configured. Run "ShipBar: Configure Buttons" to set one.`
          );
          return;
        }

        try {
          await vscode.commands.executeCommand(target);
        } catch (err) {
          vscode.window.showErrorMessage(`ShipBar (${slotId} → ${target}) failed: ${err.message}`);
        }
      })
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate };