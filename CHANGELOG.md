# Changelog

All notable changes to ShipBar are documented here.

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