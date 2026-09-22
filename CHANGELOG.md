# Changelog

All notable changes are documented here.

Cursor Touch Bar is a fork of [ShipBar](https://github.com/max-blackwell/ShipBar).
Releases up to and including 0.2.0 were made under the ShipBar name.

## [0.3.0] - 2026-09-22

### Changed
- **Renamed to Cursor Touch Bar.** New extension ID `fettah.cursor-touchbar`,
  now maintained by Fettah and published on Open VSX.
- Commands, settings, and context keys moved from the `shipbar.` prefix to
  `cursorTouchBar.`. A `shipbar.layout` or `shipbar.buttons` setting is adopted
  automatically on first start, so an existing setup carries over.
- New logo. The original ShipBar bolt belonged to its author.
- Credit for the original work is in the README and LICENSE; both copyright
  notices are retained per the MIT License.

## [0.2.0] - 2026-09-22

### Added
- **Choose any icon** — 153 bundled Lucide icons, grouped and searchable in the
  configuration panel. Icons are no longer welded to a slot position.
- **Choose any command** — the picker searches curated Cursor commands, titles
  from installed extensions, and every remaining command ID in the editor.
- **Pages** — a button can swap the row for another set of buttons, with a Back
  button added automatically. The Touch Bar supports buttons only, so this is how
  a second level works.
- **Prompt buttons** — open a new chat pre-filled with text you saved. Cursor
  exposes no way for an extension to send the message, so it stops at Enter.
- **Ten buttons per row**, up from six.
- **Live preview** of the row being edited, plus drag-to-reorder, per-button
  on/off, inline warnings for unfinished buttons, and layout export/import.
- Defaults covering the panels, new chat, and the Ask, Plan, and Agent modes,
  with a seeded skills page and a one-time welcome notice.

### Changed
- `shipbar.buttons` is replaced by `shipbar.layout`. Existing configs migrate
  automatically on first start.
- Touch Bar contributions are generated from the catalogs in `src/catalog/` by
  `npm run generate`, rather than hand-written in `package.json`.
- `icons-download.sh` reads the icon catalog and falls back to macOS `sips` when
  `rsvg-convert` is missing.

## [0.1.0] - 2026-07-24

### Added
- **Configurable buttons** — every Touch Bar slot can now be remapped to any
  Cursor or VS Code command via the `shipbar.buttons` setting, and any slot
  can be hidden independently. Changes apply live, no reload required.
- **Configuration panel** — a 7th Touch Bar button (gear icon) opens a
  single-page webview where every slot can be toggled and remapped with
  dropdowns/preset commands, no settings.json editing required. Also
  reachable via `Cmd+Shift+P` → "ShipBar: Configure Buttons". Toggle the
  button itself off with `shipbar.showConfigButton: false`.
- Example configuration file at `examples/settings.example.jsonc` covering
  every slot, including a remap and a disable example.

### Changed
- Internal command IDs renamed from action-based (`shipbar.zap`,
  `shipbar.check`, etc.) to slot-based (`shipbar.slot1`...`shipbar.slot6`)
  to support remapping. Default behavior is unchanged for anyone not using
  `shipbar.buttons`.

## [0.0.1] - 2026-07-19

### Added
- Initial release
- Touch Bar controls for Cursor: Zap (generate), Check (accept), Close (reject), Branch (duplicate chat), Mic (voice dictation), Chat (new chat)