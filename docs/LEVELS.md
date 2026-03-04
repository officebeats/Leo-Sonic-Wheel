# Leo Sonic Wheel — Level Design Document

## Level Design Matrix

| #   | Name                | New Mechanic     | Difficulty | Secret | Checkpoints | Est. Time |
| --- | ------------------- | ---------------- | ---------- | ------ | ----------- | --------- |
| 1   | Spin Start          | Move + Jump      | 1/10       | —      | 0           | 30 s      |
| 2   | Bouncy Backyard     | Spring Pads      | 2/10       | —      | 0           | 35 s      |
| 3   | Sticky Steps        | Sticky Goo       | 3/10       | —      | 1           | 40 s      |
| 4   | Windy Walkway       | Wind Zones       | 4/10       | ✓      | 1           | 45 s      |
| 5   | Toybox Tunnels      | Low Ceilings     | 5/10       | ✓      | 1           | 50 s      |
| 6   | See-Saw Platforms   | Moving Platforms | 6/10       | ✓      | 1           | 55 s      |
| 7   | Energy Rush         | Energy Pellets   | 7/10       | ✓      | 1           | 60 s      |
| 8   | Switch Sprint       | Floor Switches   | 7/10       | ✓      | 1           | 65 s      |
| 9   | Marble Maze         | Rolling Marbles  | 8/10       | ✓      | 2           | 75 s      |
| 10  | Wheel Wizard Finale | Combination      | 10/10      | ✓      | 2           | 90 s      |

---

## Level 1: Spin Start

**Teaching moment:** Move left/right and jump.
**Description:** "Welcome to the Wheel! Time to spin, Leo!"

- Flat terrain with very small gaps (1-tile)
- 15 sunflower seeds along the path
- No hazards — pure movement tutorial
- Goal sign clearly visible from start

## Level 2: Bouncy Backyard

**Teaching moment:** Spring pads launch you upward.
**Description:** "Boing! These springy pads are super fun!"

- Introduces spring pad tiles (vertical boost)
- 3 spring sections with safe landing zones
- 18 seeds, some only reachable via springs
- Still no lethal hazards

## Level 3: Sticky Steps

**Teaching moment:** Goo slows your wheel; use momentum.
**Description:** "Eww, sticky goo! Keep that wheel spinning!"

- Purple goo zones slow movement to 0.4×
- Requires building momentum before goo patches
- 20 seeds, checkpoint halfway
- Teaches that speed matters

## Level 4: Windy Walkway

**Teaching moment:** Wind pushes you sideways.
**Description:** "Hold on tight! The wind is blowing today!"

- Gentle wind zones (horizontal push force)
- Must lean into wind to maintain path
- 22 seeds + first secret area (3 bonus seeds above wind tunnel)
- 1 checkpoint

## Level 5: Toybox Tunnels

**Teaching moment:** Low ceilings require precise jumps.
**Description:** "Squeeze through the toybox tunnels!"

- Tight corridors where over-jumping hits ceiling
- Timed sections (moving toy blocks open/close gaps)
- 20 seeds, checkpoint at tunnel midpoint
- Secret alcove above first tunnel entrance (3 seeds)

## Level 6: See-Saw Platforms

**Teaching moment:** Moving platforms — time your jumps.
**Description:** "Hop on! These platforms won't wait forever!"

- Horizontal moving platforms over gaps
- Vertical elevators to reach higher areas
- 24 seeds spread across platform routes
- 1 checkpoint, secret under a rising platform (3 seeds)

## Level 7: Energy Rush

**Teaching moment:** Energy pellets give temporary speed boost.
**Description:** "Grab that glowing pellet and ZOOM!"

- Energy pellet before a long speed-run section
- Must use boost to clear wide gap
- Goo + boost combo (boost overcomes goo)
- 22 seeds + 2 pellets, secret behind speed-breakable wall (3 seeds)

## Level 8: Switch Sprint

**Teaching moment:** Floor switches toggle gates open/closed.
**Description:** "Step on the switch, quick! The gate won't stay open!"

- Colored switches open matching gates
- Simple puzzle: hit switch, run to gate before timer
- 24 seeds, 3 switches
- 1 checkpoint, secret behind double-switch combo (3 seeds)

## Level 9: Marble Maze

**Teaching moment:** Rolling marbles = moving hazards to dodge.
**Description:** "Watch out for the big marbles rolling by!"

- Marbles roll slowly on fixed rails (predictable)
- Requires timing to cross marble paths
- Combines goo zones + marbles
- 26 seeds, 2 checkpoints, secret above marble launcher (3 seeds)

## Level 10: Wheel Wizard Finale

**Teaching moment:** Everything combined — you're a wizard now!
**Description:** "Show them what a Wheel Wizard can do!"

- Wind + moving platforms + switches + boost + marbles
- 2 checkpoints (1/3 and 2/3)
- 30 seeds + 3 bonus seeds in secret cave
- Celebratory end screen: "🎉 You did it! You're a Wheel Wizard! 🎉"
- Longer level (~90 seconds), fair but challenging

---

## Tilemap Legend

| Char      | Tile                            |
| --------- | ------------------------------- |
| `.`       | Air                             |
| `#`       | Ground / Wall (grass-top, dirt) |
| `S`       | Player Spawn                    |
| `G`       | Goal Sign                       |
| `o`       | Sunflower Seed                  |
| `E`       | Energy Pellet                   |
| `~`       | Sticky Goo                      |
| `^`       | Spring Pad                      |
| `>` / `<` | Wind Zone (right / left)        |
| `=`       | Moving Platform (H)             |
| `\|`      | Moving Platform (V)             |
| `!`       | Floor Switch                    |
| `D`       | Gate (toggled by switch)        |
| `@`       | Rolling Marble Spawner          |
| `C`       | Checkpoint Flag                 |
| `_`       | Low Ceiling                     |
