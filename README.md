# Cursor Touch Bar

![Settings panel — Touch Bar preview, skills, and options](docs/settings-panel.png)

Cursor Touch Bar puts a row of buttons above the keyboard. Each one has a name, a short description, an icon, and an action. The gear button opens the page where you change them.

The default row has seven icons, grouped with spaces: layout (three panels), chat + voice, modes, then skills. You can add up to ten icons (spaces do not count), drag them into order, and put a space between them. Buttons with no space stay grouped.

The N3XTTECH logo at the end of the main row is on by default (`cursorTouchBar.showNextStackLogo`).

## Default buttons

| Icon | Button | What it does |
|------|--------|----------------|
| <img src="icons/panel-left.png" width="20" height="20" alt="Left" /> | **Left** | Show or hide the left sidebar |
| <img src="icons/panel-bottom.png" width="20" height="20" alt="Bottom" /> | **Bottom** | Show or hide the bottom panel |
| <img src="icons/panel-right.png" width="20" height="20" alt="Right" /> | **Right** | Show or hide the right sidebar |
| *(gap)* | | |
| <img src="icons/message-square-plus.png" width="20" height="20" alt="New chat" /> | **New chat** | Start a new chat |
| <img src="icons/mic.png" width="20" height="20" alt="Voice" /> | **Voice** | Toggle voice dictation |
| *(gap)* | | |
| <img src="icons/layers.png" width="20" height="20" alt="Modes" /> | **Modes** | Open Ask, Plan, and Agent |
| *(gap)* | | |
| <img src="icons/folder.png" width="20" height="20" alt="Skills" /> | **Skills** | Open skill groups and shortcuts |

The gear stays at the end of the main row.

## Modes

Modes replaces the row with Back, Ask, Plan, and Agent. Those three switch the current chat. Back returns to the main row. You can also put Ask, Plan, or Agent directly on the main row.

## Skills

A skill is a name, the text to put in a chat, and an optional group. The button shows the name.

Tap it and a new chat opens with that text filled in. Press Enter to send.

Fresh installs include presets for [Cursor built-in skills](https://cursor.com/docs/skills), grouped as **Review**, **Workflow**, **Customize**, and **Build**. Each preset uses a `/skill-name` prompt so Agent runs the matching skill.

- **No skills yet.** The row shows Add, which opens settings.
- **One group.** The names are one row. Use Next when the bar is full.
- **More than one group.** The row shows the group names. Open a group to see its skills.

## Changing a button

Tap the gear, or run **Cursor Touch Bar: Configure Buttons**.

- Click a button on the bar preview. The panel under it shows what it does, with **Icon**, **Action**, **Delete**, and move controls.
- **+** adds an icon or a space.
- **Pages** in the action list open a second row on the Touch Bar: Modes, Skills, Layout, Chat, Review, or General.

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
node scripts/build-char-icons.js   # Touch Bar label letters (macOS; committed PNGs)
node scripts/build-manifest.js
```

`build-manifest.js` writes the Touch Bar commands into `package.json`. Cursor can only show an icon that is registered there.

## Contributing

Issues and PRs welcome. If a Cursor update renames a command and a button stops working, open an issue with the Cursor version you are on.

## Credit

Fork of [ShipBar](https://github.com/max-blackwell/ShipBar) by Max Blackwell.

## License

[MIT](LICENSE)
