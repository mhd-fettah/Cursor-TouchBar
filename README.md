# Cursor Touch Bar

**Six Touch Bar buttons for Cursor, ready when you install it.**

Cursor Touch Bar puts a row of buttons above the keyboard. Each one has a name, a short description, an icon, and an action. The gear button opens the page where you change them.

Fork of [ShipBar](https://github.com/max-blackwell/ShipBar) by [Max Blackwell](https://x.com/_Max_Blackwell).

## Default buttons

| Icon | Button | What it does |
|------|--------|----------------|
| <img src="icons/panel-left.png" width="20" height="20" alt="Left" /> | **Left** | Show or hide the left sidebar |
| <img src="icons/panel-bottom.png" width="20" height="20" alt="Bottom" /> | **Bottom** | Show or hide the bottom panel |
| <img src="icons/panel-right.png" width="20" height="20" alt="Right" /> | **Right** | Show or hide the right sidebar |
| <img src="icons/message-square-plus.png" width="20" height="20" alt="New chat" /> | **New chat** | Start a new chat |
| <img src="icons/layers.png" width="20" height="20" alt="Modes" /> | **Modes** | Open Ask, Plan, and Agent |
| <img src="icons/folder.png" width="20" height="20" alt="Skills" /> | **Skills** | Open the skills you added |

The gear stays on every row.

## Modes

Modes replaces the row with Back, Ask, Plan, and Agent. Those three switch the current chat. Back returns to the main row. You can also put Ask, Plan, or Agent directly on the main row.

## Skills

A skill is a name, an icon, the text to put in a chat, and an optional group.

Tap it and a new chat opens with that text filled in. Press Enter to send. The bar shows the icon. The name stays on the settings page.

- **No skills yet.** The row shows Add, which opens settings.
- **One group.** The skills are listed in order, five per page, then Next.
- **More than one group.** The row shows the groups. Open a group to see its skills.

## Changing a button

Tap the gear, or run **Cursor Touch Bar: Configure Buttons**.

- Turn a button on or off
- **Change action.** Layout, Chat, Modes, Pages, Review, and General. Each action has a one-line description. A custom command id is at the bottom of the list.
- **Change icon.** Pick from the bundled set. The bar updates when you save.
- **Reset** one button, or reset everything

Generate, Accept all, Reject all, Duplicate chat, and Voice are still in the list.

Right panel is the right sidebar. If your chat lives in the unified sidebar, pick **Unified sidebar** instead.

You can hide the gear with `"cursorTouchBar.showConfigButton": false`.

## Settings

The same options live in settings.json (`Cmd+Shift+P` → **Preferences: Open User Settings (JSON)**). A slot you leave out keeps its default. See [`examples/settings.example.jsonc`](examples/settings.example.jsonc).

```jsonc
{
  "cursorTouchBar.buttons": {
    "slot3": {
      "enabled": true,
      "icon": "panel-right",
      "type": "command",
      "command": "workbench.action.toggleUnifiedSidebar"
    }
  },
  "cursorTouchBar.skills": [
    {
      "id": "review",
      "label": "Review",
      "prompt": "Review the current changes and list the risks.",
      "icon": "search",
      "group": "Git"
    }
  ]
}
```

## Requirements

- macOS with a physical Touch Bar
- [Cursor](https://cursor.com)

Layout actions also work in VS Code. Ask, Plan, Agent, and New chat are Cursor commands.

## Installation

### From a packaged `.vsix`

```bash
npm install -g @vscode/vsce
vsce package --no-dependencies
```

*(`--no-dependencies` is required — Cursor Touch Bar has no runtime dependencies, and `vsce`'s dependency-resolution step fails on projects without one.)*

Then in Cursor: `Extensions` → `...` menu → **Install from VSIX...** and pick the generated `cursor-touch-bar-0.2.1.vsix`.

### From source

```bash
git clone https://github.com/mhd-fettah/Cursor-TouchBar.git
cd Cursor-TouchBar
```

Open the folder in Cursor and press `F5` to launch an Extension Development Host with Cursor Touch Bar loaded.

## Regenerating icons

Icons are [Lucide](https://lucide.dev) PNGs. The list lives in [`catalog.js`](catalog.js).

```bash
brew install librsvg   # provides rsvg-convert
./icons-download.sh
node scripts/build-manifest.js
```

`build-manifest.js` writes the Touch Bar commands into `package.json`. Cursor can only show an icon that is registered there.

## Contributing

Issues and PRs welcome. If a Cursor update renames a command and a button stops working, open an issue with the Cursor version you are on.

## License

[MIT](LICENSE)
