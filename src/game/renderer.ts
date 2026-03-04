import type { GameState } from "./physics";
import { TileType } from "./levelLoader";
import {
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
} from "./constants";

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
  const x = gs.px;
  const y = gs.py;
  const w = PLAYER_WIDTH;
  const h = PLAYER_HEIGHT;
  const mX = x + w / 2;
  const mY = y + h / 2;
  const speed = Math.abs(gs.vx);
  const isMoving = speed > 0.5;
  const isJumping = !gs.onGround;
  const faceDir = gs.facingRight ? 1 : -1;
  const t = gs.frameCount * 0.4;

  // -- BOOST GLOW --
  if (gs.boostTimer > 0) {
    ctx.save();
    ctx.shadowColor = BOOST_GLOW;
    ctx.shadowBlur = 16;
    ctx.fillStyle = BOOST_GLOW + "33";
    ctx.beginPath();
    ctx.ellipse(mX, mY, 20, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // -- HAMSTER WHEEL --
  const wheelRadius = 14;
  const wheelCy = y + h - wheelRadius - 1;
  ctx.save();
  ctx.translate(mX, wheelCy);
  ctx.rotate(gs.frameCount * gs.vx * 0.08);
  ctx.strokeStyle = "#BDC3C7"; // Metal edge
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw 4 spokes
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#95A5A6";
  for (let i = 0; i < 4; i++) {
    const a = (Math.PI / 2) * i;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * wheelRadius, Math.sin(a) * wheelRadius);
    ctx.stroke();
  }
  ctx.restore();

  // -- SONIC DRAWING --
  ctx.save();
  ctx.translate(mX, y + 10);
  ctx.scale(faceDir, 1);

  const BLUE = "#2651d6";
  const PEACH = "#F4A460";
  const RED = "#E22A2A";
  const WHITE = "#FFFFFF";

  if (isJumping) {
    // Sonic Spin Jump Attack
    ctx.rotate(gs.frameCount * 0.4);

    // Main blue ball
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(0, 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Spiky edges
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI / 2) * i;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 2, Math.sin(ang) * 2 + 4);
      ctx.lineTo(Math.cos(ang - 0.4) * 13, Math.sin(ang - 0.4) * 13 + 4);
      ctx.lineTo(Math.cos(ang + 0.4) * 13, Math.sin(ang + 0.4) * 13 + 4);
      ctx.fill();
    }

    // Blur highlight (white stripe)
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 4, 6, 0, Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  } else {
    // -- Running or Idle --

    // Back Arm
    if (isMoving) {
      const armRot = Math.sin(t) * 1.5;
      ctx.save();
      ctx.translate(-2, 2);
      ctx.rotate(armRot);
      ctx.fillStyle = PEACH;
      ctx.beginPath();
      ctx.ellipse(-1, 3, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(-2, 7, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Head
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(1, -5, 7, 0, Math.PI * 2);
    ctx.fill();
    // Spikes
    ctx.beginPath();
    ctx.moveTo(1, -12);
    ctx.lineTo(-8, -13);
    ctx.lineTo(-4, -7);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-3, -2);
    ctx.lineTo(-9, 2);
    ctx.lineTo(2, 0);
    ctx.fill();

    // Muzzle & Belly
    ctx.fillStyle = PEACH;
    ctx.beginPath();
    ctx.ellipse(5, -2, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, 5, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(2, -6, 3, 5, Math.PI / 10, 0, Math.PI * 2);
    ctx.ellipse(6, -6, 3, 4, -Math.PI / 10, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(3, -6, 1.2, 0, Math.PI * 2);
    ctx.arc(7, -6, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.arc(9, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Body backing
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.ellipse(0, 4, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Front Arm
    if (isMoving) {
      const armRot = Math.sin(t + Math.PI) * 1.5;
      ctx.save();
      ctx.translate(2, 2);
      ctx.rotate(armRot);
      ctx.fillStyle = PEACH;
      ctx.beginPath();
      ctx.ellipse(1, 3, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(2, 7, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Idle arm
      ctx.fillStyle = PEACH;
      ctx.beginPath();
      ctx.ellipse(0, 6, 2, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(-1, 9, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs / Super Peel-Out
    if (isMoving) {
      // Peel out motion blur
      ctx.fillStyle = RED;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(-1, 13, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Figure-8 white shoe stripes
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = WHITE;
      const legT1 = gs.frameCount * 0.8;
      const legT2 = legT1 + Math.PI;

      for (const lt of [legT1, legT2]) {
        const lx = -1 + Math.sin(lt) * 7;
        const ly = 13 + Math.sin(lt) * Math.cos(lt) * 4;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 2.5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Idle legs
      ctx.fillStyle = BLUE;
      ctx.fillRect(-3, 10, 2, 4);
      ctx.fillRect(2, 10, 2, 4);

      // Idle shoes
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.ellipse(-3, 15, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(3, 15, 3.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shoe stripes
      ctx.fillStyle = WHITE;
      ctx.fillRect(-2, 13, 2, 3);
      ctx.fillRect(4, 13, 1.5, 3);
    }
  }

  ctx.restore();
}
