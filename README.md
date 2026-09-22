# ⚡ ShipBar

[![Follow on X](https://img.shields.io/badge/Follow-@_Max__Blackwell-black?logo=x)](https://x.com/_Max_Blackwell)

**Build your own Cursor control strip on your MacBook's Touch Bar.**

## What it is

ShipBar turns the Touch Bar into a row of buttons for Cursor. Every button is
yours: pick any command, pick any of 153 bundled icons, and put prompts you use
often onto extra pages.

It works out of the box — install it and the row below is already there.

## Out of the box

| Icon | Button | What it does |
|------|--------|--------------|
| <img src="icons/panel-left.png" width="20" height="20" alt="" /> | Left panel | Show or hide the Explorer sidebar |
| <img src="icons/panel-bottom.png" width="20" height="20" alt="" /> | Bottom panel | Show or hide the terminal panel |
| <img src="icons/panel-right.png" width="20" height="20" alt="" /> | Right panel | Show or hide the secondary sidebar |
| <img src="icons/message-square-plus.png" width="20" height="20" alt="" /> | New chat | Start a fresh chat thread |
| <img src="icons/message-circle.png" width="20" height="20" alt="" /> | Ask mode | Switch the chat to Ask |
| <img src="icons/list-checks.png" width="20" height="20" alt="" /> | Plan mode | Switch the chat to Plan |
| <img src="icons/bot.png" width="20" height="20" alt="" /> | Agent mode | Switch the chat to Agent |
| <img src="icons/folder.png" width="20" height="20" alt="" /> | Skills | Open a second row of prompts |
| <img src="icons/settings.png" width="20" height="20" alt="" /> | Gear | Open the configuration panel |

Accept-all and reject-all buttons are configured but switched off, so the row
stays clear of the Control Strip. Turn them on in the panel whenever you like.

## Configuring it

Tap the gear, or press `Cmd+Shift+P` and run **ShipBar: Configure Buttons**.

The panel shows a live preview of the row you are editing. For each button you
can:

- **Change the icon** — a searchable grid of all 153 icons. Icons already used
  in that row are greyed out, because a press is matched by icon.
- **Change what it does** — search every command Cursor and VS Code expose.
  Cursor's own chat and mode commands are listed with proper names, since they
  carry no title of their own.
- **Rename it** — the name appears in the panel and in warnings, not on the bar.
- **Turn it off** — it stays configured but leaves the Touch Bar.
- **Reorder it** — drag the grip on the left.

Changes apply the moment you hit Save. No reload.

There is also **Export** and **Import** for moving a layout between machines.

## Three kinds of button

**Runs a command** — any Cursor or VS Code command ID.

**Opens a page** — swaps the row for another set of buttons, with a Back button
added automatically. This is how a Touch Bar does a submenu: it has no popovers
or scrollable lists, only buttons, so a second level is a second row.

**Opens a chat prompt** — opens a new chat with your text already filled in.
You review it and press Enter. Cursor gives no extension a way to send a chat
message, so ShipBar stops one keystroke short on purpose.

## Editing settings.json directly

The panel writes `shipbar.layout`. You can edit it by hand
(`Cmd+Shift+P` → **Preferences: Open User Settings (JSON)**):

```jsonc
{
  "shipbar.layout": {
    "main": [
      {
        "icon": "panel-left",
        "label": "Left panel",
        "enabled": true,
        "action": { "type": "command", "command": "workbench.action.toggleSidebarVisibility" }
      },
      {
        "icon": "folder",
        "label": "Skills",
        "enabled": true,
        "action": { "type": "page", "page": "skills" }
      }
    ],
    "pages": {
      "skills": [
        {
          "icon": "git-pull-request",
          "label": "Review changes",
          "enabled": true,
          "action": { "type": "prompt", "text": "Review my uncommitted changes." }
        }
      ]
    }
  }
}
```

- `icon` must be one of the bundled icon names, and unique within its row.
- Up to 10 buttons per row.
- `shipbar.showConfigButton: false` hides the gear.

See [`examples/settings.example.jsonc`](examples/settings.example.jsonc) for a
fully annotated example.

Upgrading from 0.1.x? Your old `shipbar.buttons` setting is migrated to
`shipbar.layout` automatically the first time 0.2.0 starts.

## Why use it

Driving an AI agent means the same handful of moves over and over: open a panel,
start a chat, switch to Plan, accept the diff. Each one normally costs a window
switch, a click hunt, or a trip to the command palette. ShipBar makes each one a
single tap on hardware already sitting idle above your keyboard.

## Requirements

- macOS with a physical Touch Bar
- [Cursor](https://cursor.com). The chat and mode commands are Cursor-specific
  and will not exist in vanilla VS Code; the panel and layout still work, and
  the panel's command search only lists what your editor actually has.

## Installation

### From a packaged `.vsix`

```bash
npm install -g @vscode/vsce
vsce package --no-dependencies
```

*(`--no-dependencies` is required — ShipBar has no runtime dependencies, and
`vsce`'s dependency-resolution step fails on projects without one.)*

Then in Cursor: `Extensions` → `...` menu → **Install from VSIX...** and pick
the generated `shipbar-0.2.0.vsix`.

### From source

```bash
git clone https://github.com/max-blackwell/ShipBar.git
cd ShipBar
```

Open the folder in Cursor and press `F5` for an Extension Development Host with
ShipBar loaded.

## Working on it

A Touch Bar icon is bound to a command in `package.json` and cannot be swapped
while Cursor is running. ShipBar therefore declares one command per icon and one
menu entry per icon and position, and picks between them at runtime with context
keys. Those contributions are generated, not hand-written:

```bash
npm run generate        # rewrite the generated half of package.json
npm run generate:check  # fail if package.json is stale
```

The catalogs in [`src/catalog/`](src/catalog) are the source of truth:

- `icons.js` — every icon, grouped for the picker
- `commands.js` — curated commands with names and descriptions
- `defaults.js` — the layout a fresh install gets

To add an icon, add it to `icons.js`, then:

```bash
./icons-download.sh   # render PNGs from Lucide
npm run generate      # regenerate package.json
```

Icons come from [Lucide](https://lucide.dev), rendered to white-on-transparent
96×96 PNGs with `rsvg-convert` (`brew install librsvg`) or macOS `sips`.

## Contributing

Issues and PRs welcome. ShipBar wraps internal Cursor commands, so if one
changes in a Cursor update and a button stops working, open an issue with your
Cursor version. The fix is usually one line in `src/catalog/commands.js`.

## License

[MIT](LICENSE)
