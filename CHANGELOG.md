# Changelog

All notable changes to Cursor Touch Bar are documented here.

This extension is a fork of ShipBar by Max Blackwell. Entries before 0.2.1 describe that project.

## [0.2.1] - 2026-09-22

### Changed
- **Name** — the extension is Cursor Touch Bar, published as `fettah.cursor-touch-bar`.
- Settings and commands use the `cursorTouchBar` prefix.

## [0.2.0] - 2026-09-22

### Added
- **Default bar** — Left, Bottom, Right, New chat, Modes, and Skills are ready on install.
- **Icons** — each slot can use any bundled icon. The choice shows up on the bar immediately.
- **Modes row** — Ask, Plan, and Agent, with Back to return.
- **Skills** — a name, an icon, and text that opens in a new chat. Optional groups. Five per page.
- **Config panel** — each button shows its name and what it does. Search actions, pick an icon, add skills.

### Changed
- Generate, Accept, Reject, Duplicate chat, and Voice stay in the action list.
- A slot saved before this version keeps its command. Its icon falls back to the new default until you save once.

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