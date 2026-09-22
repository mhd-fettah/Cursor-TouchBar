'use strict';

// One place for the extension's name. Command IDs, settings keys, context keys,
// and the webview bootstrap global are all derived from NAMESPACE, so renaming
// the extension again means editing this file and running `npm run generate`.
const NAMESPACE = 'cursorTouchBar';
const DISPLAY_NAME = 'Cursor Touch Bar';

// Settings keys this extension used under its previous name, newest first.
// ensureLayout reads them so a ShipBar setup carries over on first start.
const LEGACY_NAMESPACE = 'shipbar';

module.exports = { NAMESPACE, DISPLAY_NAME, LEGACY_NAMESPACE };
