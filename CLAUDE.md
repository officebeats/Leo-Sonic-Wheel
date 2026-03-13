# CLAUDE.md — Leo Sonic Wheel

This file provides context and conventions for AI assistants working on this codebase.

## Project Overview

**Leo Sonic Wheel** is a Canabalt-style endless runner with a Donkey Kong Country mine cart mechanic. The player controls a rolling wheel (Leo) paired with a Shadow character, jumping over buildings and collecting rings in a procedurally generated parallax city.

- **Live game**: https://officebeats.github.io/Leo-Sonic-Wheel/
- **Status**: Alpha, actively developed
- **Version**: v2.0.4

## Tech Stack

- Pure HTML5 Canvas (2D rendering)
- Web Audio API (procedural sound — no audio files)
- Vanilla JavaScript (ES6+, no transpilation)
- `localStorage` for persistent high score (`ls_best` key)
- Google Fonts (Outfit, Press Start 2P via CDN)
- **Zero external dependencies, zero build tools**

## Repository Structure

```
Leo-Sonic-Wheel/
├── index.html              # Entire game: HTML + CSS + JS (556 lines)
├── sprite_viewer.html      # Debug utility for sprite sheet frame inspection
├── shadow_sheet.png        # Primary Shadow character sprite sheet
├── shadow_spritesheet.png  # Alternative/development sprite sheet
└── README.md               # High-level project description
```

The entire game lives in **one file**: `index.html`. There is no build step, no bundler, and no framework.

## Running the Game

Open `index.html` in any modern browser. No server required for local development, though a local HTTP server helps avoid CORS issues when loading images:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`.

## Code Architecture

### `index.html` Structure

| Section | Lines | Purpose |
|---|---|---|
| HTML `<head>` | 1–30 | Viewport meta, embedded CSS, font imports |
| HTML `<body>` | 31–53 | Canvas element, HUD, overlays, touch zone |
| JS: Constants & State | 54–100 | Canvas context, game constants, global state |
| JS: Sprite Loading | 97–146 | Sprite sheet image load, `xF()` frame detection |
| JS: Audio | 105–147 | Procedural Web Audio API sound generation |
| JS: Game Init | 148–193 | `init()`, `mkBg()`, `jump()`, `playRing()`, `burst()` |
| JS: Update Loop | 194–370 | Physics, collision, ring collection, particle updates |
| JS: Death | 372–378 | `die()` and tumble state transitions |
| JS: Render | 380–551 | Canvas draw calls (bg → buildings → wheel → shadow → UI) |
| JS: Main Loop | 552–556 | `loop()`, `init()`, `requestAnimationFrame` |

### Game State Machine

```
state = 0  →  start screen (tap/press to begin)
state = 1  →  playing
state = 2  →  dead (tumble animation, shows score)
```

### Physics Model

- Simple Euler integration: `wVY += G; wY += wVY`
- Separate physics for wheel (`wY`, `wVY`) and Shadow (`sY`, `sVY`)
- Gravity constant: `G = 0.39`
- Speed starts at `4.3`, increments `+0.0012` per frame, capped at `15`
- Collision: bounding-box check against building left edges; pixel-perfect via `getImageData` + `xF()`

### Rendering Order (Z-order)

1. Background gradient
2. Far city parallax layers
3. Near buildings (foreground)
4. Wheel (procedurally drawn circles/gradients)
5. Shadow character (sprite sheet)
6. Particles (dust, speed lines, burst)
7. HUD (score, high score)
8. UI overlays (start/death screens)

## Naming Conventions

Variable names are intentionally terse (single/double letters) throughout the codebase:

| Name | Meaning |
|---|---|
| `cv` | canvas element |
| `cx` | 2D canvas context |
| `W`, `H` | canvas width, height |
| `G` | gravity constant |
| `st` | game state (0/1/2) |
| `fc` | frame counter |
| `spd` | scroll speed |
| `scX` | scroll position X |
| `wY`, `wVY` | wheel Y position, Y velocity |
| `wA` | wheel rotation angle |
| `sY`, `sVY` | shadow Y position, Y velocity |
| `dt` | death tumble state object |
| `shk` | screen shake amount |
| `bg` | background elements array |
| `WR` | wheel radius (58px) |

This style is intentional — do not "improve" variable names to verbose equivalents.

## Key Functions

| Function | Purpose |
|---|---|
| `init()` | Reset all game state, spawn initial buildings and background |
| `mkBg()` | Procedurally generate background city layers |
| `jump()` | Apply upward velocity to wheel and shadow |
| `die()` | Transition to death state, trigger tumble/explosion |
| `burst()` | Spawn explosion particles at a given position |
| `playRing()` | Play ring-collection sound via Web Audio API |
| `xF(img, threshold)` | Scan sprite sheet to auto-detect frame boundaries |
| `update()` | Main game loop tick: physics, spawning, collision, scoring |
| `render()` | Main draw pass: clear and redraw all layers each frame |
| `loop()` | `requestAnimationFrame` callback calling `update()` + `render()` |

## Input Handling

- **Desktop**: Space, Up Arrow, W key
- **Mobile**: Touch anywhere (tap to jump)
- **Action**: all inputs call `jump()` (or `init()` if on start/death screen)
- Touch events initialized lazily to avoid iOS audio context restrictions

## Audio System

All sounds are procedurally generated using `OscillatorNode` + `GainNode`. No audio files exist. Sound types: jump, land, ring collect, death. The `AudioContext` is created on first user interaction to comply with browser autoplay policies.

## Sprite Sheet

- **File**: `shadow_sheet.png`
- The `xF()` function dynamically scans the sprite sheet at load time to detect frame boundaries by looking for transparent column gaps — frame coordinates are **not** hardcoded.
- `sprite_viewer.html` overlays a green grid on the sprite sheet for manual frame inspection during development.

## `var` vs `const`/`let`

Global game state uses `var` throughout — **this is intentional**. Early `resize` event handlers can fire before `const`/`let` declarations are initialized, causing Temporal Dead Zone (TDZ) `ReferenceError`s on mobile. Do not convert global state to `const`/`let`.

## Making Changes

### Adding a New Feature

1. Identify which section of `index.html` to modify (use the structure table above).
2. Keep variables terse and consistent with existing naming.
3. All new state should be initialized in `init()` and reset on death/restart.
4. Render new elements in `render()` in the correct Z-order position.
5. If adding sound, use the existing Web Audio API pattern (oscillator envelope).

### Modifying Physics

Physics constants are at the top of the script block:
- `G` — gravity
- `WR` — wheel radius
- `spd` / speed cap — scroll speed
- Jump velocity is set inline inside `jump()`

### Adding Sprites/Animations

Sprite frames are detected automatically by `xF()`. If adding new sprite sheets:
1. Embed the image or add a file reference.
2. Load via `new Image()` with an `onload` callback.
3. Use `xF()` to detect frame boundaries.

## Commit Message Convention

Follow the convention established in recent commits:

```
fix(scope): short description          # Bug fixes
feat: short description                # New features
docs: short description                # Documentation only
refactor: short description            # Code changes without behavior change
```

- Use lowercase imperative mood.
- Reference PR numbers when applicable: `fix: mobile touch (#3)`.
- Version bumps can be noted: `feat: add new mechanic (v2.1.0)`.

## Deployment

The game is deployed via GitHub Pages from the `main` branch. No build step — the repo files are served directly. To deploy, push changes to `main`.

## What Not to Do

- Do not introduce npm, a bundler, or any build toolchain — this is a deliberate zero-dependency project.
- Do not split the game into multiple files unless there is a compelling reason; the single-file design is intentional.
- Do not rename terse variables to verbose names — this would break style consistency.
- Do not convert `var` globals to `const`/`let` — see the TDZ warning above.
- Do not add external game libraries (Phaser, Three.js, etc.) without explicit discussion.
- Do not add unit tests that require a test runner — the game is validated by playing it.
