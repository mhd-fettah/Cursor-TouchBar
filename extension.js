'use strict';

const vscode = require('vscode');

const { ICON_IDS } = require('./src/catalog/icons.js');
const { BACK_COMMAND, CONFIGURE_COMMAND, runCommandId } = require('./src/contributions.js');
const { Bar } = require('./src/bar.js');
const { openConfigPanel } = require('./src/panel.js');
const {
  defaultLayout,
  readLayout,
  migrateLegacyButtons,
  buttonProblem
} = require('./src/layout.js');

const LAYOUT_KEY = 'layout';
const LEGACY_KEY = 'buttons';
const WELCOME_KEY = 'shipbar.welcomeShown';

function shipbarConfig() {
  return vscode.workspace.getConfiguration('shipbar');
}

function getLayout() {
  return readLayout(shipbarConfig().get(LAYOUT_KEY));
}

async function saveLayout(layout) {
  await shipbarConfig().update(LAYOUT_KEY, layout, vscode.ConfigurationTarget.Global);
}

// Gives a fresh install a working bar, and carries a pre-0.2.0 `shipbar.buttons`
// config over to the new schema so nobody's setup breaks on update.
async function ensureLayout() {
  const config = shipbarConfig();
  if (config.inspect(LAYOUT_KEY)?.globalValue) {
    return { seeded: false };
  }

  const migrated = migrateLegacyButtons(config.inspect(LEGACY_KEY)?.globalValue);
  await saveLayout(migrated || defaultLayout());
  if (migrated) {
    await config.update(LEGACY_KEY, undefined, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(
      'ShipBar moved your buttons to the new layout setting. Icons are now yours to pick.'
    );
    return { seeded: false };
  }
  return { seeded: true };
}

function showWelcome(context) {
  if (context.globalState.get(WELCOME_KEY)) {
    return;
  }
  context.globalState.update(WELCOME_KEY, true);
  vscode.window
    .showInformationMessage(
      'ShipBar is on your Touch Bar: panels, chat, modes, and a skills page.',
      'Configure buttons'
    )
    .then((choice) => {
      if (choice) {
        vscode.commands.executeCommand(CONFIGURE_COMMAND);
      }
    });
}

async function runAction(button, bar) {
  const problem = buttonProblem(button, bar.getLayout());
  if (problem) {
    const choice = await vscode.window.showWarningMessage(
      `ShipBar: "${button.label}" is not set up. ${problem}`,
      'Configure buttons'
    );
    if (choice) {
      await vscode.commands.executeCommand(CONFIGURE_COMMAND);
    }
    return;
  }

  const { action } = button;
  if (action.type === 'page') {
    await bar.showPage(action.page);
    return;
  }

  // Cursor prefills the chat but does not send it, so the press ends with the
  // text waiting in a new chat for the user to review and hit Enter.
  if (action.type === 'prompt') {
    await vscode.commands.executeCommand('workbench.action.chat.open', { query: action.text });
    return;
  }

  await vscode.commands.executeCommand(action.command);
}

function activate(context) {
  const bar = new Bar(getLayout);

  context.subscriptions.push(
    vscode.commands.registerCommand(CONFIGURE_COMMAND, () => openConfigPanel(context, bar, saveLayout)),
    vscode.commands.registerCommand(BACK_COMMAND, () => bar.goBack())
  );

  for (const icon of ICON_IDS) {
    context.subscriptions.push(
      vscode.commands.registerCommand(runCommandId(icon), async () => {
        const button = bar.buttonForIcon(icon);
        if (!button) {
          return;
        }
        try {
          await runAction(button, bar);
        } catch (err) {
          const detail = err && err.message ? err.message : String(err);
          vscode.window.showErrorMessage(`ShipBar: "${button.label}" failed. ${detail}`);
        }
      })
    );
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('shipbar.layout')) {
        bar.refresh();
      }
    })
  );

  ensureLayout()
    .then(({ seeded }) => {
      if (seeded) {
        showWelcome(context);
      }
      return bar.render();
    })
    .catch((err) => {
      const detail = err && err.message ? err.message : String(err);
      vscode.window.showErrorMessage(`ShipBar failed to start. ${detail}`);
    });
}

function deactivate() {}

module.exports = { activate, deactivate };
