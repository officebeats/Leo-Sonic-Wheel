# Leo Sonic Wheel — Game Design Document

## Executive Summary

**Leo Sonic Wheel** is a kid-friendly, mobile-first 2D platformer starring a blue hedgehog-like character sprinting inside a hamster wheel. Players run, jump, and collect sunflower seeds across 10 vibrant levels that introduce new toy-themed mechanics one at a time. Built as a Progressive Web App, it installs straight to a phone's home screen and works offline — perfect for an 8-year-old's tablet.

## Target Audience & Accessibility

| Attribute      | Spec                                                      |
| -------------- | --------------------------------------------------------- |
| Age            | 8+ (COPPA-safe, no data collection)                       |
| Color contrast | ≥ 4.5:1 on all interactive elements                       |
| Tap targets    | ≥ 48 × 48 px, 8 px spacing                                |
| Font           | `"Baloo 2"` 18 px minimum for body, 28 px headings        |
| Motion         | `prefers-reduced-motion` disables parallax + screen shake |

## Core Loop

```
Run → Jump → Collect Seeds → Avoid Hazards → Reach Goal
         ↕
   Optional Secrets (bonus seeds)
```

## Controls

| Action     | Touch                      | Keyboard             |
| ---------- | -------------------------- | -------------------- |
| Move left  | Left button (bottom-left)  | Arrow Left / A       |
| Move right | Right button (bottom-left) | Arrow Right / D      |
| Jump       | Jump button (bottom-right) | Space / Arrow Up / W |

### Feel Tuning

- **Coyote time:** 6 frames (100 ms)
- **Jump buffer:** 8 frames (133 ms)
- **Variable jump:** release early = lower arc
- **Input rebound prevention:** 2-frame lockout on direction flip

## Mechanics

### Movement & Wheel

- Max run speed: 4.5 px/frame → 270 px/s @ 60 fps
- Acceleration: 0.35 px/frame²
- Deceleration (friction): 0.55 px/frame² (ground), 0.12 (air)
- Wheel sprite rotates proportional to `velocity.x`

### Jump

- Jump impulse: −9.5 px/frame
- Gravity: 0.45 px/frame²
- Max fall speed (terminal velocity): 8 px/frame
- Variable: release within 8 frames cuts remaining velocity by 50 %

### Collectibles

| Item              | Effect                            |
| ----------------- | --------------------------------- |
| 🌻 Sunflower Seed | +1 score, sparkle SFX             |
| ⚡ Energy Pellet  | 3 s speed boost (1.5×), glow aura |

### Hazards (kid-safe)

| Hazard         | Behaviour                                   |
| -------------- | ------------------------------------------- |
| Sticky Goo     | Slows wheel to 0.4× speed while in zone     |
| Toy Blocks     | Static obstacles, bounce player back gently |
| Wind Zone      | Constant horizontal force on player         |
| Rolling Marble | Moves along rail, predictable cycle         |

### Checkpoints

- Mid-level flag; touching saves position
- Respawn at last checkpoint on death (lose 1 heart)

### Hearts

- Start each level with 3 hearts
- Lose 1 on hazard contact or falling off map
- 0 hearts → restart from last checkpoint with 3 hearts
- No "game over" concept — always retry (kid-friendly)

## Difficulty Ramp

Levels 1–3: Core mechanics (move, jump, goo)
Levels 4–6: Environmental (wind, moving platforms)
Levels 7–8: Power-ups & puzzles (energy pellets, switches)
Levels 9–10: Gauntlet combining everything

## Level Design Principles

1. **Teach** — safe space to try the new mechanic
2. **Test** — apply it under light pressure
3. **Twist** — combine with a previous mechanic

## Win / Lose

- **Win:** touch the Goal Sign at end of level
- **Lose state:** fall off map or touch hazard → −1 heart, respawn at checkpoint

## UI / UX Screens

1. **Start Screen:** Play, Level Select, Settings
2. **Level Select:** grid of 10, locked/unlocked, best seed count + best time
3. **HUD:** hearts (top-left), seeds (top-center), timer (top-right), pause (top-right corner)
4. **Pause Menu:** Resume, Restart, Settings, Exit to Level Select
5. **End-of-Level:** ⭐ Seeds / Total | ⏱ Time | Next Level
6. **Settings:** Sound toggle, Music toggle, Reduced Motion toggle

## Audio

- **SFX:** jump, land, collect seed, collect pellet, hurt, checkpoint, goal
- **Music:** single cheerful loop, toggleable
- All generated / royalty-free

## Tech Spec

- **Rendering:** HTML5 Canvas (2D context) inside a React component
- **Game loop:** `requestAnimationFrame` with fixed-step physics at 60 Hz
- **Physics:** AABB, tilemap grid collisions (no external lib)
- **Levels:** JSON tilemaps in `/src/levels/`
- **State:** game state in plain objects, React state only for menus/HUD
- **PWA:** `manifest.webmanifest`, Workbox service worker
- **Deploy:** Vite build → `gh-pages` branch, base path `/Leo-Sonic-Wheel/`

## Acceptance Criteria

- [ ] 10 playable levels reachable via touch on mobile
- [ ] No copyrighted Sonic™ art or audio
- [ ] Loads from `https://officebeats.github.io/Leo-Sonic-Wheel/`
- [ ] PWA install prompt works; offline play works after first load
- [ ] 60 fps on mid-range Android tablet
- [ ] localStorage saves progress (unlocked levels, best scores)
- [ ] All hazards are kid-safe; no violence imagery
