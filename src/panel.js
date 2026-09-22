'use strict';

const crypto = require('crypto');
const vscode = require('vscode');

const { ICON_GROUPS } = require('./catalog/icons.js');
const { COMMAND_GROUPS } = require('./catalog/commands.js');
const { MAX_BUTTONS } = require('./catalog/defaults.js');
const { COMMAND_PREFIX } = require('./contributions.js');
const {
  MAIN_PAGE,
  defaultLayout,
  readLayout,
  buttonProblem
} = require('./layout.js');

let openPanel;

// Titles for command IDs, best first: the curated catalog, then whatever
// installed extensions declare, then the bare ID for everything else. Cursor's
// own chat and mode commands only exist in the workbench bundle, which is why
// the curated catalog carries them.
async function collectCommands() {
  const entries = new Map();

  for (const group of COMMAND_GROUPS) {
    for (const entry of group.commands) {
      entries.set(entry.command, { ...entry, group: group.label, source: 'catalog' });
    }
  }

  for (const extension of vscode.extensions.all) {
    const contributed = extension.packageJSON?.contributes?.commands;
    if (!Array.isArray(contributed)) {
      continue;
    }
    for (const item of contributed) {
      if (!item?.command || entries.has(item.command)) {
        continue;
      }
      const title = typeof item.title === 'string' ? item.title : '';
      if (!title || title.startsWith('%')) {
        continue;
      }
      const category = typeof item.category === 'string' ? item.category : '';
      entries.set(item.command, {
        command: item.command,
        title: category ? `${category}: ${title}` : title,
        description: extension.packageJSON.displayName || extension.id,
        group: 'Installed extensions',
        source: 'extension'
      });
    }
  }

  for (const command of await vscode.commands.getCommands(true)) {
    if (entries.has(command) || command.startsWith('_') || command.startsWith(COMMAND_PREFIX)) {
      continue;
    }
    entries.set(command, {
      command,
      title: command,
      description: '',
      group: 'All commands',
      source: 'all'
    });
  }

  return [...entries.values()];
}

function iconCatalog(webview, extensionUri) {
  const url = (iconId) =>
    webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'icons', `${iconId}.png`)).toString();

  return ICON_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    icons: group.icons.map((icon) => ({ ...icon, url: url(icon.id) }))
  }));
}

// The panel edits a copy and pushes the whole layout on save, so a half-built
// button never reaches the Touch Bar.
function buildState(layout) {
  const problems = {};
  for (const [page, row] of [[MAIN_PAGE, layout.main], ...Object.entries(layout.pages)]) {
    problems[page] = row.map((button) => buttonProblem(button, layout));
  }
  return { layout, problems, maxButtons: MAX_BUTTONS, mainPage: MAIN_PAGE };
}

function renderHtml(webview, extensionUri, commands) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const asset = (...parts) =>
    webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...parts)).toString();

  const bootstrap = JSON.stringify({
    icons: iconCatalog(webview, extensionUri),
    commands,
    maxButtons: MAX_BUTTONS,
    mainPage: MAIN_PAGE
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
<link rel="stylesheet" href="${asset('media', 'panel.css')}" />
<title>ShipBar</title>
</head>
<body>
<header>
  <h1>ShipBar</h1>
  <p class="subtitle">Pick what each Touch Bar button does and which icon it wears. Up to ${MAX_BUTTONS} buttons per row.</p>
</header>

<section class="preview" aria-label="Touch Bar preview">
  <div class="preview-bar" id="preview"></div>
  <p class="preview-note" id="previewNote"></p>
</section>

<nav class="pages" id="pages" aria-label="Rows"></nav>

<main id="buttons"></main>

<div class="row-actions">
  <button id="addButton" class="secondary">Add button</button>
  <button id="deletePage" class="danger" hidden>Delete this page</button>
</div>

<footer>
  <button id="save">Save</button>
  <button id="reset" class="secondary">Reset to defaults</button>
  <button id="export" class="secondary">Export</button>
  <button id="import" class="secondary">Import</button>
  <span id="status" class="status" role="status"></span>
</footer>

<p class="hint">A prompt button opens a new chat with your text ready to send. Cursor does not allow an extension to press Enter for you.</p>

<div class="modal" id="modal" hidden>
  <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-head">
      <h2 id="modalTitle"></h2>
      <button id="modalClose" class="ghost" aria-label="Close">&times;</button>
    </div>
    <input type="search" id="modalSearch" placeholder="Search" autocomplete="off" />
    <div class="modal-body" id="modalBody"></div>
  </div>
</div>

<script nonce="${nonce}">window.shipbar = ${bootstrap};</script>
<script nonce="${nonce}" src="${asset('media', 'panel.js')}"></script>
</body>
</html>`;
}

function openConfigPanel(context, bar, saveLayout) {
  if (openPanel) {
    openPanel.reveal(vscode.ViewColumn.Active);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'shipbarConfig',
    'ShipBar',
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [context.extensionUri]
    }
  );
  openPanel = panel;
  panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icons', 'sliders-horizontal.png');

  const listeners = [];
  context.subscriptions.push(panel);
  context.subscriptions.push(
    panel.onDidDispose(() => {
      openPanel = undefined;
      listeners.forEach((item) => item.dispose());
    })
  );

  const push = (message) => panel.webview.postMessage(message);
  const sendState = () => push({ type: 'state', ...buildState(bar.getLayout()) });

  panel.webview.onDidReceiveMessage(
    async (message) => {
      try {
        await handleMessage(message, { bar, saveLayout, sendState, push });
      } catch (err) {
        const detail = err && err.message ? err.message : String(err);
        vscode.window.showErrorMessage(`ShipBar: ${detail}`);
      }
    },
    undefined,
    listeners
  );

  // Editing a page previews it on the Touch Bar, so the row in front of you and
  // the row under your fingers always agree.
  listeners.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('shipbar.layout')) {
        sendState();
      }
    })
  );

  collectCommands().then((commands) => {
    panel.webview.html = renderHtml(panel.webview, context.extensionUri, commands);
  });
}

async function handleMessage(message, { bar, saveLayout, sendState, push }) {
  switch (message?.type) {
    case 'ready':
      sendState();
      return;

    case 'save': {
      const layout = readLayout(message.layout);
      await saveLayout(layout);
      await bar.refresh();
      push({ type: 'saved' });
      sendState();
      return;
    }

    case 'reset':
      await saveLayout(defaultLayout());
      await bar.refresh();
      push({ type: 'saved' });
      sendState();
      return;

    case 'preview':
      await bar.showPage(typeof message.page === 'string' ? message.page : MAIN_PAGE);
      return;

    case 'export': {
      const target = await vscode.window.showSaveDialog({
        title: 'Export ShipBar layout',
        filters: { JSON: ['json'] },
        defaultUri: vscode.Uri.file('shipbar-layout.json')
      });
      if (!target) {
        return;
      }
      const body = `${JSON.stringify(readLayout(message.layout), null, 2)}\n`;
      await vscode.workspace.fs.writeFile(target, Buffer.from(body, 'utf8'));
      vscode.window.showInformationMessage('ShipBar layout exported.');
      return;
    }

    case 'import': {
      const picked = await vscode.window.showOpenDialog({
        title: 'Import ShipBar layout',
        canSelectMany: false,
        filters: { JSON: ['json'] }
      });
      if (!picked?.length) {
        return;
      }
      const raw = await vscode.workspace.fs.readFile(picked[0]);
      const layout = readLayout(JSON.parse(Buffer.from(raw).toString('utf8')));
      if (!layout.main.length && !Object.keys(layout.pages).length) {
        vscode.window.showWarningMessage('ShipBar: that file has no usable buttons.');
        return;
      }
      await saveLayout(layout);
      await bar.refresh();
      sendState();
      vscode.window.showInformationMessage('ShipBar layout imported.');
      return;
    }

    default:
      return;
  }
}

module.exports = { openConfigPanel };
