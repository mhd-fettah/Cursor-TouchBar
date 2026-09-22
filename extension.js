'use strict';

const vscode = require('vscode');

const { ICON_IDS } = require('./src/catalog/icons.js');
const { BACK_COMMAND, CONFIGURE_COMMAND, runCommandId } = require('./src/contributions.js');
const { NAMESPACE, DISPLAY_NAME, LEGACY_NAMESPACE } = require('./src/identity.js');
const { Bar } = require('./src/bar.js');
const { openConfigPanel } = require('./src/panel.js');
const {
  defaultLayout,
  readLayout,
  migrateLegacyButtons,
  buttonProblem
} = require('./src/layout.js');

const LAYOUT_KEY = 'layout';
const WELCOME_KEY = `${NAMESPACE}.welcomeShown`;

function config() {
  return vscode.workspace.getConfiguration(NAMESPACE);
}

function getLayout() {
  return readLayout(config().get(LAYOUT_KEY));
}

async function saveLayout(layout) {
  await config().update(LAYOUT_KEY, layout, vscode.ConfigurationTarget.Global);
}

// Carries a setup over from ShipBar, which this extension is a fork of: either
// its 0.2.x `shipbar.layout` (same schema) or its 0.1.x `shipbar.buttons`
// (six slots with fixed icons).
function adoptLegacyLayout() {
  const legacy = vscode.workspace.getConfiguration(LEGACY_NAMESPACE);

  const sameSchema = legacy.inspect(LAYOUT_KEY)?.globalValue;
  if (sameSchema) {
    const layout = readLayout(sameSchema);
    if (layout.main.length || Object.keys(layout.pages).length) {
      return layout;
    }
  }

  return migrateLegacyButtons(legacy.inspect('buttons')?.globalValue);
}

// Gives a fresh install a working bar without anyone having to configure one.
async function ensureLayout() {
  if (config().inspect(LAYOUT_KEY)?.globalValue) {
    return { seeded: false };
  }

  const adopted = adoptLegacyLayout();
  await saveLayout(adopted || defaultLayout());

  if (adopted) {
    vscode.window.showInformationMessage(
      `${DISPLAY_NAME} brought your ShipBar buttons across. Every icon is now yours to pick.`
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
      `${DISPLAY_NAME} is ready: panels, chat, modes, and a skills page.`,
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
      `${DISPLAY_NAME}: "${button.label}" is not set up. ${problem}`,
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
          vscode.window.showErrorMessage(`${DISPLAY_NAME}: "${button.label}" failed. ${detail}`);
        }
      })
    );
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(`${NAMESPACE}.layout`)) {
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
      vscode.window.showErrorMessage(`${DISPLAY_NAME} failed to start. ${detail}`);
    });
}

function deactivate() {}

module.exports = { activate, deactivate };
