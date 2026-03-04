import {
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
} from "./constants";
import { generateSonicSpriteSheet, SPRITE_SIZE } from "./spriteGenerator";

// Cache for the generated sprite sheet
let sonicCanvas: HTMLCanvasElement | null = null;

// ─── Camera ──────────────────────────────────────────────────────────────
export interface Camera {
  x: number;
  y: number;
}

export function updateCamera(cam: Camera, gs: GameState): void {
  const targetX = gs.px + PLAYER_WIDTH / 2 - CANVAS_WIDTH / 2;
  const targetY = gs.py + PLAYER_HEIGHT / 2 - CANVAS_HEIGHT / 2;

  cam.x += (targetX - cam.x) * 0.12;
  cam.y += (targetY - cam.y) * 0.12;

  // clamp
  cam.x = Math.max(0, Math.min(cam.x, gs.mapWidth * TILE_SIZE - CANVAS_WIDTH));
  cam.y = Math.max(
    0,
    Math.min(cam.y, gs.mapHeight * TILE_SIZE - CANVAS_HEIGHT),
  );
}

// ─── Colors ──────────────────────────────────────────────────────────────
const SKY_GRADIENT_TOP = "#87CEEB";
const SKY_GRADIENT_BOT = "#E0F4FF";
const GROUND_TOP = "#5BBF45";
const GROUND_FILL = "#8B6C42";
const GOO_COLOR = "#9B59B6";
const SPRING_COLOR = "#E74C3C";
const SEED_COLOR = "#F1C40F";
const PELLET_COLOR = "#00E5FF";
const GOAL_COLOR = "#2ECC71";
const CHECKPOINT_INACTIVE = "#95A5A6";
const CHECKPOINT_ACTIVE = "#E67E22";
const SWITCH_COLOR = "#E74C3C";
const GATE_CLOSED = "#C0392B";
const GATE_OPEN = "#2ECC7140";
const MARBLE_COLOR = "#7F8C8D";
const PLATFORM_COLOR = "#8E6C4A";

const BOOST_GLOW = "#00E5FF";
const WIND_COLOR = "#AED6F177";

// ─── Renderer ────────────────────────────────────────────────────────────
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  gs: GameState,
  cam: Camera,
  _dt: number,
): void {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  // ── Sky gradient ──
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, SKY_GRADIENT_TOP);
  grad.addColorStop(1, SKY_GRADIENT_BOT);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // ── Parallax hills (simple) ──
  drawParallaxHills(ctx, cam, w, h);

  ctx.save();
  ctx.translate(-Math.round(cam.x), -Math.round(cam.y));

  // ── Tiles ──
  const startCol = Math.max(0, Math.floor(cam.x / TILE_SIZE));
  const endCol = Math.min(gs.mapWidth, Math.ceil((cam.x + w) / TILE_SIZE) + 1);
  const startRow = Math.max(0, Math.floor(cam.y / TILE_SIZE));
  const endRow = Math.min(gs.mapHeight, Math.ceil((cam.y + h) / TILE_SIZE) + 1);

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const t = gs.tiles[r]?.[c];
      if (t === undefined || t === TileType.Air) continue;
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;
      switch (t) {
        case TileType.Ground:
          // grass top
          ctx.fillStyle = GROUND_TOP;
          ctx.fillRect(x, y, TILE_SIZE, 6);
          ctx.fillStyle = GROUND_FILL;
          ctx.fillRect(x, y + 6, TILE_SIZE, TILE_SIZE - 6);
          break;
        case TileType.Goo:
          ctx.fillStyle = GOO_COLOR;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          // goo bubbles
          ctx.fillStyle = "#8E44AD";
          ctx.beginPath();
          ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2);
          ctx.arc(x + 22, y + 14, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case TileType.Spring:
          ctx.fillStyle = SPRING_COLOR;
          ctx.fillRect(x + 4, y + 16, TILE_SIZE - 8, 16);
          // spring coil
          ctx.strokeStyle = "#FFF";
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const sy = y + 18 + i * 3;
            ctx.moveTo(x + 6, sy);
            ctx.lineTo(x + TILE_SIZE - 6, sy);
          }
          ctx.stroke();
          break;
        case TileType.LowCeiling:
          ctx.fillStyle = "#6D4C41";
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = "#5D4037";
          ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
          break;
        default:
          ctx.fillStyle = GROUND_FILL;
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // ── Wind zones ──
  for (const wz of gs.windZones) {
    ctx.fillStyle = WIND_COLOR;
    ctx.fillRect(wz.x, wz.y, wz.w, wz.h);
    // wind arrows
    ctx.fillStyle = "#FFF";
    ctx.font = "14px monospace";
    ctx.fillText(wz.dir > 0 ? "→" : "←", wz.x + 10, wz.y + 22);
  }

  // ── Moving platforms ──
  for (const p of gs.platforms) {
    ctx.fillStyle = PLATFORM_COLOR;
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.fillStyle = "#A0826D";
    ctx.fillRect(p.x + 2, p.y + 2, p.width - 4, 2);
  }

  // ── Entities ──
  for (const e of gs.entities) {
    if (e.collected) continue;
    switch (e.type) {
      case "seed":
        drawSeed(ctx, e.x, e.y);
        break;
      case "pellet":
        drawPellet(ctx, e.x, e.y, gs.frameCount);
        break;
      case "goal":
        drawGoal(ctx, e.x, e.y);
        break;
      case "checkpoint":
        ctx.fillStyle = e.active ? CHECKPOINT_ACTIVE : CHECKPOINT_INACTIVE;
        ctx.fillRect(e.x + 12, e.y, 8, e.height);
        // flag
        ctx.fillStyle = e.active ? "#F39C12" : "#BDC3C7";
        ctx.beginPath();
        ctx.moveTo(e.x + 20, e.y);
        ctx.lineTo(e.x + 36, e.y + 10);
        ctx.lineTo(e.x + 20, e.y + 20);
        ctx.fill();
        break;
      case "switch":
        ctx.fillStyle = e.active ? "#27AE60" : SWITCH_COLOR;
        ctx.fillRect(e.x, e.y + 20, TILE_SIZE, 12);
        ctx.fillRect(e.x + 10, e.y + 8, 12, 14);
        break;
      case "gate":
        ctx.fillStyle = e.active ? GATE_OPEN : GATE_CLOSED;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        if (!e.active) {
          ctx.strokeStyle = "#922";
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            ctx.strokeRect(e.x + 4, e.y + 4 + i * 22, e.width - 8, 18);
          }
        }
        break;
      case "marble":
        ctx.fillStyle = MARBLE_COLOR;
        ctx.beginPath();
        ctx.arc(e.x + 12, e.y + 12, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#566573";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
    }
  }

  // ── Player ──
  drawPlayer(ctx, gs);

  ctx.restore();
}

// ─── Sub-renderers ───────────────────────────────────────────────────────
function drawParallaxHills(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  w: number,
  h: number,
) {
  const offset = cam.x * 0.15;
  ctx.fillStyle = "#B2DFDB";
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 60) {
    ctx.lineTo(x, h - 60 + Math.sin((x + offset) * 0.02) * 30);
  }
  ctx.lineTo(w, h);
  ctx.fill();

  const offset2 = cam.x * 0.25;
  ctx.fillStyle = "#81C784";
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 40) {
    ctx.lineTo(x, h - 30 + Math.sin((x + offset2) * 0.03) * 20);
  }
  ctx.lineTo(w, h);
  ctx.fill();
}

function drawSeed(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // sunflower seed
  ctx.fillStyle = SEED_COLOR;
  ctx.beginPath();
  ctx.ellipse(x + 10, y + 10, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#E67E22";
  ctx.beginPath();
  ctx.arc(x + 10, y + 10, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPellet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
) {
  const pulse = 1 + Math.sin(frame * 0.15) * 0.2;
  ctx.save();
  ctx.shadowColor = PELLET_COLOR;
  ctx.shadowBlur = 10;
  ctx.fillStyle = PELLET_COLOR;
  ctx.beginPath();
  ctx.arc(x + 10, y + 10, 7 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGoal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // flag pole
  ctx.fillStyle = "#795548";
  ctx.fillRect(x + 14, y, 4, TILE_SIZE * 2);
  // flag
  ctx.fillStyle = GOAL_COLOR;
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 2);
  ctx.lineTo(x + 42, y + 14);
  ctx.lineTo(x + 18, y + 26);
  ctx.fill();
  // star
  ctx.fillStyle = "#FFD700";
  ctx.font = "16px sans-serif";
  ctx.fillText("★", x + 20, y + 20);
}

function drawPlayer(ctx: CanvasRenderingContext2D, gs: GameState) {
  if (!sonicCanvas) {
    sonicCanvas = generateSonicSpriteSheet();
  }

  const x = gs.px;
  const y = gs.py;
  const w = PLAYER_WIDTH;
  const h = PLAYER_HEIGHT;
  const mX = Math.round(x + w / 2);
  const wheelCy = Math.round(y + h - 14 - 1);
  const speed = Math.abs(gs.vx);
  const isMoving = speed > 0.5;
  const isJumping = !gs.onGround;
  const faceDir = gs.facingRight ? 1 : -1;

  // -- HAMSTER WHEEL --
  ctx.save();
  ctx.translate(mX, wheelCy);
  ctx.rotate(gs.frameCount * gs.vx * 0.08);
  ctx.strokeStyle = "#BDC3C7"; // Metal edge
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();

  // Draw 4 spokes
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#95A5A6";
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
    ctx.stroke();
  }
  ctx.restore();

  // -- SONIC SPRITE --
  ctx.save();
  ctx.translate(mX, Math.round(y + 10));
  ctx.scale(faceDir, 1);

  let frameX = 0;
  let frameY = 0;

  if (isJumping) {
    frameY = 2;
    frameX = Math.floor(gs.frameCount * 0.4) % 4;
  } else if (isMoving) {
    frameY = 1;
    frameX = Math.floor(gs.frameCount * 0.4) % 8;
  } else {
    frameY = 0;
    // Slight idle breathing based on frameCount
    frameX = Math.floor(gs.frameCount * 0.05) % 4;
  }

  ctx.drawImage(
    sonicCanvas,
    frameX * SPRITE_SIZE,
    frameY * SPRITE_SIZE,
    SPRITE_SIZE,
    SPRITE_SIZE,
    -SPRITE_SIZE / 2,
    -SPRITE_SIZE / 2 - 8,
    SPRITE_SIZE,
    SPRITE_SIZE,
  );

  ctx.restore();
}
