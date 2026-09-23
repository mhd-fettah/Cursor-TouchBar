# Changelog

## [0.2.1] - 2026-09-23

### Added
- **Close tab** — Chat action `composer.closeComposerTab` closes the current composer tab. Put it next to **New chat** on the bar: start a new chat, close the old tab, and you have a clean thread without hunting through the UI.

### Changed
- Marketplace description and keywords update.
- **New chat** — uses `composer.createNew` instead of `aichat.newchataction`, so the button actually starts a new chat even when one is already open.

## [0.2.0] - 2026-09-22

Fork of ShipBar, rebuilt as **Cursor Touch Bar** (`fettah.cursor-touch-bar`). The bar is fully configurable—not a fixed six buttons. Up to ten slots on the main row, add or remove buttons and spaces, drag to reorder, and split the row into groups. Settings use the `cursorTouchBar` prefix.

### Added
- **Groups** — up to ten main-row buttons; spaces define groups; reorder in the config panel.
- **Actions** — built-in actions or any Cursor/VS Code command per slot, each with its own icon.
- **Layers** — a button can open a sub-row (Modes, Skills, Layout, Chat, Review, General) instead of running a command; Back returns to the main row.
- **Skills** — named prompt shortcuts in optional folders; tap opens a new chat with the text filled in.
- **Library** — searchable Lucide icons and common commands when editing a button.
- **Presets** — a ready-to-use bar on first install, plus Cursor built-in skills as `/skill-name` shortcuts in Review, Workflow, Customize, and Build.
- **Config panel** — Touch Bar preview; click a slot to change icon, action, or layer; **+** adds a button or a space.

### Changed
- Legacy ShipBar slot commands still work until you save; icons fall back to new defaults until then.

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
