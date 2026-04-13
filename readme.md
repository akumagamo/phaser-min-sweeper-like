# Mini Phaser Mine Sweeper like Demo

## Versionnumber 0.1.0 (2026-04-10)

A samll demo of a Mine Sweeper like game, made with phaserjs.  

<table>
  <tr>
    <td align="center">
      <img src="readme/screenshot_001.png " title="Screenshot Gameplay - Game in progress" alt="Game in progress"/>
        <i>Screenshot Gameplay - Game in progress</i>
    </td>
    <td align="center">
      <img src="readme/screenshot_002.png" title="Screenshot Gameplay - Win Screen" alt="Win Screen" />
        <i>Screenshot Gameplay - Win Screen</i>
    </td>
  </tr>
</table>

### "Features"

- Basic Gameplay
    - Win/Fail State
    - Timer
    - Mark Cells: Right-Click on Covered Cells to toggle
        - Mines/Mark Count
        - Click on number-cell for "fast uncover"
    - Restart: Click "Start" Button
- configuration possible, but currently only in code.

### SourceControl Link & Information

this Document, like to repo: https://github.com/akumagamo/phaser-min-sweeper-like

#### 💣 Demo of Mine Sweeper Like

[Click here to test](https://akumagamo.github.io/phaser-min-sweeper-like/)

## Documentation

### File / Folder Structure

    +-+- (root folder)
    +-+- lib             // just for development
    | +-- ...
    +-+- readme          // assets for readme.md
    | +-- screenshot_001.png
    | +-- screenshot_002.png
    +-+- src
    | +-- app.js         // Game-Code
    +-- LICENSE          // LICENSE of code / assets created by author
    +-- index.html       // DemoPage
    +-- plain_tiles.svg  // Asset for game (made with Inkscape)
    +-- readme.md        // (this document)
