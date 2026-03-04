import {
  TILE_SIZE,
  GRAVITY,
  MAX_FALL_SPEED,
  PLAYER_ACCEL,
  PLAYER_FRICTION_GROUND,
  PLAYER_FRICTION_AIR,
  PLAYER_MAX_SPEED,
  PLAYER_JUMP_IMPULSE,
  COYOTE_FRAMES,
  JUMP_BUFFER_FRAMES,
  VARIABLE_JUMP_CUTOFF,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  BOOST_MULTIPLIER,
  BOOST_DURATION,
  GOO_MULTIPLIER,
  SPRING_IMPULSE,
  WIND_FORCE,
  MAX_HEARTS,
} from "./constants";
import type { InputState } from "./input";
import { TileType } from "./levelLoader";
import type { LevelData } from "./levelLoader";

// ─── Entity types ────────────────────────────────────────────────────────
export interface Entity {
  type:
    | "seed"
    | "pellet"
    | "checkpoint"
    | "goal"
    | "spring"
    | "switch"
    | "gate"
    | "marble";
  x: number;
  y: number;
  width: number;
  height: number;
  collected?: boolean;
  active?: boolean; // for switches/gates
  color?: string; // switch/gate pairing
  dir?: number; // marble direction
  originX?: number;
  originY?: number;
  rangeX?: number;
  rangeY?: number;
  // moving platform fields
  vx?: number;
  vy?: number;
}

export interface MovingPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
  rangeX: number;
  rangeY: number;
  speed: number;
  t: number; // 0–1 oscillation
  dir: number; // 1 or -1
}

export interface GameState {
  // player
  px: number;
  py: number;
  vx: number;
  vy: number;
  onGround: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  facingRight: boolean;
  hearts: number;
  seeds: number;
  totalSeeds: number;
  boostTimer: number;
  dead: boolean;
  won: boolean;
  // checkpoint
  checkpointX: number;
  checkpointY: number;
  // level
  tiles: TileType[][];
  entities: Entity[];
  platforms: MovingPlatform[];
  windZones: { x: number; y: number; w: number; h: number; dir: number }[];
  gooZones: { x: number; y: number; w: number; h: number }[];
  mapWidth: number;
  mapHeight: number;
  // time
  frameCount: number;
  // switches
  switchState: Record<string, boolean>;
}

// ─── Init ────────────────────────────────────────────────────────────────
export function createGameState(level: LevelData): GameState {
  const tiles = level.tiles;
  const mapHeight = tiles.length;
  const mapWidth = tiles[0]?.length ?? 0;

  // find spawn
  let spawnX = 2 * TILE_SIZE;
  let spawnY = 2 * TILE_SIZE;
  const entities: Entity[] = [];
  const platforms: MovingPlatform[] = [];
  const windZones: GameState["windZones"] = [];
  const gooZones: GameState["gooZones"] = [];
  let totalSeeds = 0;

  for (let r = 0; r < mapHeight; r++) {
    for (let c = 0; c < mapWidth; c++) {
      const t = tiles[r][c];
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;
      switch (t) {
        case TileType.Spawn:
          spawnX = x;
          spawnY = y;
          tiles[r][c] = TileType.Air;
          break;
        case TileType.Seed:
          entities.push({ type: "seed", x, y, width: 20, height: 20 });
          totalSeeds++;
          tiles[r][c] = TileType.Air;
          break;
        case TileType.Pellet:
          entities.push({ type: "pellet", x, y, width: 20, height: 20 });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.Goal:
          entities.push({
            type: "goal",
            x,
            y,
            width: TILE_SIZE,
            height: TILE_SIZE * 2,
          });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.Spring:
          entities.push({
            type: "spring",
            x,
            y: y,
            width: TILE_SIZE,
            height: TILE_SIZE,
          });
          break;
        case TileType.Checkpoint:
          entities.push({
            type: "checkpoint",
            x,
            y,
            width: TILE_SIZE,
            height: TILE_SIZE * 2,
            active: false,
          });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.WindRight:
          windZones.push({ x, y, w: TILE_SIZE, h: TILE_SIZE, dir: 1 });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.WindLeft:
          windZones.push({ x, y, w: TILE_SIZE, h: TILE_SIZE, dir: -1 });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.Goo:
          gooZones.push({ x, y, w: TILE_SIZE, h: TILE_SIZE });
          break;
        case TileType.PlatformH:
          platforms.push({
            x,
            y,
            width: TILE_SIZE * 3,
            height: TILE_SIZE / 2,
            originX: x,
            originY: y,
            rangeX: TILE_SIZE * 4,
            rangeY: 0,
            speed: 0.008,
            t: 0,
            dir: 1,
          });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.PlatformV:
          platforms.push({
            x,
            y,
            width: TILE_SIZE * 2,
            height: TILE_SIZE / 2,
            originX: x,
            originY: y,
            rangeX: 0,
            rangeY: TILE_SIZE * 3,
            speed: 0.008,
            t: 0,
            dir: 1,
          });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.Switch:
          entities.push({
            type: "switch",
            x,
            y,
            width: TILE_SIZE,
            height: TILE_SIZE,
            active: false,
            color: "red",
          });
          tiles[r][c] = TileType.Air;
          break;
        case TileType.Gate:
          entities.push({
            type: "gate",
            x,
            y,
            width: TILE_SIZE,
            height: TILE_SIZE * 2,
            active: false,
            color: "red",
          });
          break;
        case TileType.Marble:
          entities.push({
            type: "marble",
            x,
            y: y,
            width: 24,
            height: 24,
            dir: 1,
            originX: x,
            rangeX: TILE_SIZE * 6,
            originY: y,
            rangeY: 0,
          });
          tiles[r][c] = TileType.Air;
          break;
      }
    }
  }

  return {
    px: spawnX,
    py: spawnY,
    vx: 0,
    vy: 0,
    onGround: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    facingRight: true,
    hearts: MAX_HEARTS,
    seeds: 0,
    totalSeeds,
    boostTimer: 0,
    dead: false,
    won: false,
    checkpointX: spawnX,
    checkpointY: spawnY,
    tiles,
    entities,
    platforms,
    windZones,
    gooZones,
    mapWidth,
    mapHeight,
    frameCount: 0,
    switchState: {},
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function isSolid(
  tiles: TileType[][],
  col: number,
  row: number,
  mapW: number,
  mapH: number,
): boolean {
  if (col < 0 || col >= mapW || row < 0 || row >= mapH) return row >= mapH; // bottom = solid
  const t = tiles[row][col];
  return t === TileType.Ground || t === TileType.Goo || t === TileType.Spring;
}

function aabb(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── Update ──────────────────────────────────────────────────────────────
export function updateGameState(gs: GameState, input: InputState): void {
  if (gs.won || gs.dead) return;
  gs.frameCount++;

  const boosted = gs.boostTimer > 0;
  if (boosted) gs.boostTimer--;

  // ── Check if in goo ──
  let inGoo = false;
  for (const gz of gs.gooZones) {
    if (
      aabb(gs.px, gs.py, PLAYER_WIDTH, PLAYER_HEIGHT, gz.x, gz.y, gz.w, gz.h)
    ) {
      inGoo = true;
      break;
    }
  }

  const speedMul = boosted ? BOOST_MULTIPLIER : inGoo ? GOO_MULTIPLIER : 1;
  const maxSpeed = PLAYER_MAX_SPEED * speedMul;

  // ── Horizontal movement ──
  if (input.left) {
    gs.vx -= PLAYER_ACCEL;
    gs.facingRight = false;
  } else if (input.right) {
    gs.vx += PLAYER_ACCEL;
    gs.facingRight = true;
  } else {
    // friction
    const fric = gs.onGround ? PLAYER_FRICTION_GROUND : PLAYER_FRICTION_AIR;
    if (gs.vx > 0) {
      gs.vx = Math.max(0, gs.vx - fric);
    } else if (gs.vx < 0) {
      gs.vx = Math.min(0, gs.vx + fric);
    }
  }
  gs.vx = Math.max(-maxSpeed, Math.min(maxSpeed, gs.vx));

  // ── Wind zones ──
  for (const wz of gs.windZones) {
    if (
      aabb(gs.px, gs.py, PLAYER_WIDTH, PLAYER_HEIGHT, wz.x, wz.y, wz.w, wz.h)
    ) {
      gs.vx += WIND_FORCE * wz.dir;
    }
  }

  // ── Jump buffering + coyote time ──
  if (gs.onGround) gs.coyoteTimer = COYOTE_FRAMES;
  else gs.coyoteTimer = Math.max(0, gs.coyoteTimer - 1);

  if (input.jumpPressed) gs.jumpBufferTimer = JUMP_BUFFER_FRAMES;
  else gs.jumpBufferTimer = Math.max(0, gs.jumpBufferTimer - 1);

  if (gs.jumpBufferTimer > 0 && gs.coyoteTimer > 0) {
    gs.vy = PLAYER_JUMP_IMPULSE;
    gs.jumpBufferTimer = 0;
    gs.coyoteTimer = 0;
  }

  // variable jump
  if (!input.jump && gs.vy < 0) {
    gs.vy *= VARIABLE_JUMP_CUTOFF;
  }

  // ── Gravity ──
  gs.vy += GRAVITY;
  if (gs.vy > MAX_FALL_SPEED) gs.vy = MAX_FALL_SPEED;

  // ── Move + collide X ──
  gs.px += gs.vx;
  resolveCollisionsX(gs);

  // ── Move + collide Y ──
  gs.py += gs.vy;
  gs.onGround = false;
  resolveCollisionsY(gs);

  // ── Platform collisions ──
  for (const p of gs.platforms) {
    updatePlatform(p);
    // check standing on top
    if (
      gs.vy >= 0 &&
      gs.px + PLAYER_WIDTH > p.x &&
      gs.px < p.x + p.width &&
      gs.py + PLAYER_HEIGHT >= p.y &&
      gs.py + PLAYER_HEIGHT <= p.y + p.height + 4
    ) {
      gs.py = p.y - PLAYER_HEIGHT;
      gs.vy = 0;
      gs.onGround = true;
    }
  }

  // ── Spring check ──
  for (const e of gs.entities) {
    if (e.type === "spring" && !e.collected) {
      if (
        gs.vy >= 0 &&
        aabb(
          gs.px,
          gs.py,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          e.x,
          e.y,
          e.width,
          e.height,
        )
      ) {
        gs.vy = SPRING_IMPULSE;
        gs.onGround = false;
      }
    }
  }

  // ── Entity interactions ──
  for (const e of gs.entities) {
    if (e.collected) continue;
    if (
      !aabb(
        gs.px,
        gs.py,
        PLAYER_WIDTH,
        PLAYER_HEIGHT,
        e.x,
        e.y,
        e.width,
        e.height,
      )
    )
      continue;

    switch (e.type) {
      case "seed":
        e.collected = true;
        gs.seeds++;
        break;
      case "pellet":
        e.collected = true;
        gs.boostTimer = BOOST_DURATION;
        break;
      case "checkpoint":
        if (!e.active) {
          e.active = true;
          gs.checkpointX = e.x;
          gs.checkpointY = e.y;
        }
        break;
      case "goal":
        gs.won = true;
        break;
      case "switch":
        if (!e.active) {
          e.active = true;
          gs.switchState[e.color || "red"] = true;
          // open matching gates
          for (const g of gs.entities) {
            if (g.type === "gate" && g.color === e.color) g.active = true;
          }
        }
        break;
      case "marble":
        hurtPlayer(gs);
        break;
    }
  }

  // ── Gate collisions (solid when not active) ──
  for (const e of gs.entities) {
    if (e.type === "gate" && !e.active) {
      if (
        aabb(
          gs.px,
          gs.py,
          PLAYER_WIDTH,
          PLAYER_HEIGHT,
          e.x,
          e.y,
          e.width,
          e.height,
        )
      ) {
        // push player out
        const overlapLeft = gs.px + PLAYER_WIDTH - e.x;
        const overlapRight = e.x + e.width - gs.px;
        if (overlapLeft < overlapRight) {
          gs.px = e.x - PLAYER_WIDTH;
          gs.vx = 0;
        } else {
          gs.px = e.x + e.width;
          gs.vx = 0;
        }
      }
    }
  }

  // ── Marble movement ──
  for (const e of gs.entities) {
    if (e.type !== "marble" || e.collected) continue;
    e.x += (e.dir || 1) * 1.5;
    if (e.originX !== undefined && e.rangeX) {
      if (e.x > e.originX + e.rangeX || e.x < e.originX) {
        e.dir = -(e.dir || 1);
      }
    }
  }

  // ── Fall off map ──
  if (gs.py > gs.mapHeight * TILE_SIZE + 64) {
    hurtPlayer(gs);
  }

  // clamp left
  if (gs.px < 0) {
    gs.px = 0;
    gs.vx = 0;
  }
}

function hurtPlayer(gs: GameState) {
  gs.hearts--;
  if (gs.hearts <= 0) {
    gs.hearts = MAX_HEARTS;
  }
  // respawn at checkpoint
  gs.px = gs.checkpointX;
  gs.py = gs.checkpointY;
  gs.vx = 0;
  gs.vy = 0;
}

function updatePlatform(p: MovingPlatform) {
  p.t += p.speed * p.dir;
  if (p.t >= 1) {
    p.t = 1;
    p.dir = -1;
  }
  if (p.t <= 0) {
    p.t = 0;
    p.dir = 1;
  }
  p.x = p.originX + p.rangeX * p.t;
  p.y = p.originY + p.rangeY * p.t;
}

function resolveCollisionsX(gs: GameState) {
  const left = Math.floor(gs.px / TILE_SIZE);
  const right = Math.floor((gs.px + PLAYER_WIDTH - 1) / TILE_SIZE);
  const top = Math.floor(gs.py / TILE_SIZE);
  const bottom = Math.floor((gs.py + PLAYER_HEIGHT - 1) / TILE_SIZE);

  for (let r = top; r <= bottom; r++) {
    for (let c = left; c <= right; c++) {
      if (!isSolid(gs.tiles, c, r, gs.mapWidth, gs.mapHeight)) continue;
      const tileX = c * TILE_SIZE;
      if (gs.vx > 0) {
        gs.px = tileX - PLAYER_WIDTH;
        gs.vx = 0;
      } else if (gs.vx < 0) {
        gs.px = tileX + TILE_SIZE;
        gs.vx = 0;
      }
    }
  }
}

function resolveCollisionsY(gs: GameState) {
  const left = Math.floor(gs.px / TILE_SIZE);
  const right = Math.floor((gs.px + PLAYER_WIDTH - 1) / TILE_SIZE);
  const top = Math.floor(gs.py / TILE_SIZE);
  const bottom = Math.floor((gs.py + PLAYER_HEIGHT - 1) / TILE_SIZE);

  for (let r = top; r <= bottom; r++) {
    for (let c = left; c <= right; c++) {
      if (!isSolid(gs.tiles, c, r, gs.mapWidth, gs.mapHeight)) continue;
      const tileY = r * TILE_SIZE;
      if (gs.vy > 0) {
        gs.py = tileY - PLAYER_HEIGHT;
        gs.vy = 0;
        gs.onGround = true;
      } else if (gs.vy < 0) {
        gs.py = tileY + TILE_SIZE;
        gs.vy = 0;
      }
    }
  }
}
