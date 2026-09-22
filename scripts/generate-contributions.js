#!/usr/bin/env node
'use strict';

// Writes the generated half of package.json from the catalogs in src/catalog.
// Run after changing the icon catalog or MAX_BUTTONS:
//
//   npm run generate
//   npm run generate:check   (verifies package.json is up to date, for CI)

const fs = require('fs');
const path = require('path');

const {
  buildCommands,
  buildTouchBarMenu,
  buildCommandPalette,
  buildConfiguration
} = require('../src/contributions.js');

const packagePath = path.join(__dirname, '..', 'package.json');

function generate(manifest) {
  const next = { ...manifest };
  next.contributes = {
    ...manifest.contributes,
    commands: buildCommands(),
    menus: {
      ...manifest.contributes?.menus,
      touchBar: buildTouchBarMenu(),
      commandPalette: buildCommandPalette()
    },
    configuration: buildConfiguration()
  };
  return `${JSON.stringify(next, null, 2)}\n`;
}

function main() {
  const check = process.argv.includes('--check');
  const current = fs.readFileSync(packagePath, 'utf8');
  const next = generate(JSON.parse(current));

  if (current === next) {
    console.log('package.json contributions are up to date.');
    return;
  }

  if (check) {
    console.error('package.json contributions are stale. Run "npm run generate".');
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(packagePath, next);
  const written = JSON.parse(next);
  console.log(
    `Wrote ${written.contributes.commands.length} commands and ` +
    `${written.contributes.menus.touchBar.length} Touch Bar entries.`
  );
}

main();
