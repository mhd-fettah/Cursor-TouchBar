'use strict';

const vscode = require('vscode');

const { MAX_BUTTONS } = require('./catalog/defaults.js');
const { positionKey } = require('./contributions.js');
const { MAIN_PAGE, rowOf, hasPage } = require('./layout.js');

const PAGE_KEY = 'shipbar.page';

// Renders a row of the layout onto the Touch Bar and dispatches presses.
//
// The Touch Bar itself is static: package.json declares one command per icon
// and one menu entry per (icon, position), each gated on a context key. Setting
// those keys is therefore the only way to change what the bar shows, and it is
// how both icon changes and page changes happen — no reload, no re-registration.
class Bar {
  constructor(getLayout) {
    this.getLayout = getLayout;
    this.page = MAIN_PAGE;
    this.shownIcons = new Map();
  }

  // Buttons of the active row that are actually on the bar, in order.
  visibleButtons() {
    return rowOf(this.getLayout(), this.page)
      .filter((button) => button.enabled)
      .slice(0, MAX_BUTTONS);
  }

  async render() {
    const buttons = this.visibleButtons();
    const next = new Map();
    buttons.forEach((button, index) => next.set(index + 1, button.icon));

    for (let position = 1; position <= MAX_BUTTONS; position++) {
      const icon = next.get(position);
      if (this.shownIcons.get(position) === icon) {
        continue;
      }
      // Undefined clears the key, so no menu entry for that position matches.
      await vscode.commands.executeCommand('setContext', positionKey(position), icon);
    }

    this.shownIcons = next;
    await vscode.commands.executeCommand('setContext', PAGE_KEY, this.page);
  }

  async showPage(page) {
    this.page = hasPage(this.getLayout(), page) ? page : MAIN_PAGE;
    await this.render();
  }

  async goBack() {
    await this.showPage(MAIN_PAGE);
  }

  // Resolves a press. The command carries the icon, not the position, so the
  // button is found by icon within the active row — which readRow keeps unique.
  buttonForIcon(icon) {
    return this.visibleButtons().find((button) => button.icon === icon);
  }

  // Keeps the bar honest when the active page disappears from settings.
  async refresh() {
    if (!hasPage(this.getLayout(), this.page)) {
      this.page = MAIN_PAGE;
    }
    await this.render();
  }
}

module.exports = { Bar, PAGE_KEY };
