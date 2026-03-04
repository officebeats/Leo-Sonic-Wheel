import { createGameState, updateGameState } from "./physics";
import type { GameState } from "./physics";
import { updateCamera, renderFrame } from "./renderer";
import type { Camera } from "./renderer";
import { getInput, preFrameInput, postFrameInput } from "./input";
import type { LevelData } from "./levelLoader";

// ─── Game Loop ───────────────────────────────────────────────────────────
const TIMESTEP = 1000 / 60; // 16.67ms

export interface GameInstance {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState;
  camera: Camera;
  running: boolean;
  paused: boolean;
  rafId: number;
  onWin: (seeds: number, totalSeeds: number, frames: number) => void;
  onHeartsChange: (hearts: number) => void;
  onSeedsChange: (seeds: number) => void;
  onFrameUpdate: (frame: number) => void;
}

export function createGame(
  canvas: HTMLCanvasElement,
  level: LevelData,
  callbacks: {
    onWin: (seeds: number, totalSeeds: number, frames: number) => void;
    onHeartsChange: (hearts: number) => void;
    onSeedsChange: (seeds: number) => void;
    onFrameUpdate: (frame: number) => void;
  },
): GameInstance {
  const ctx = canvas.getContext("2d")!;
  const state = createGameState(level);
  const camera: Camera = { x: state.px - 240, y: state.py - 160 };

  return {
    canvas,
    ctx,
    state,
    camera,
    running: true,
    paused: false,
    rafId: 0,
    ...callbacks,
  };
}

export function startGameLoop(game: GameInstance): void {
  let accumulator = 0;
  let lastTime = performance.now();
  let prevHearts = game.state.hearts;
  let prevSeeds = game.state.seeds;

  function loop(now: number) {
    if (!game.running) return;
    const delta = Math.min(now - lastTime, 100); // cap
    lastTime = now;

    if (!game.paused) {
      accumulator += delta;

      while (accumulator >= TIMESTEP) {
        preFrameInput();
        const input = getInput();

        if (input.pause) {
          game.paused = true;
          postFrameInput();
          break;
        }

        updateGameState(game.state, input);
        updateCamera(game.camera, game.state);
        postFrameInput();
        accumulator -= TIMESTEP;

        // callbacks
        if (game.state.hearts !== prevHearts) {
          prevHearts = game.state.hearts;
          game.onHeartsChange(prevHearts);
        }
        if (game.state.seeds !== prevSeeds) {
          prevSeeds = game.state.seeds;
          game.onSeedsChange(prevSeeds);
        }
        game.onFrameUpdate(game.state.frameCount);

        if (game.state.won) {
          game.onWin(
            game.state.seeds,
            game.state.totalSeeds,
            game.state.frameCount,
          );
          game.running = false;
          break;
        }
      }
    }

    renderFrame(game.ctx, game.state, game.camera, delta);
    game.rafId = requestAnimationFrame(loop);
  }

  game.rafId = requestAnimationFrame(loop);
}

export function stopGameLoop(game: GameInstance): void {
  game.running = false;
  cancelAnimationFrame(game.rafId);
}

export function resumeGame(game: GameInstance): void {
  game.paused = false;
}

export function restartLevel(game: GameInstance, level: LevelData): void {
  Object.assign(game.state, createGameState(level));
  game.camera.x = game.state.px - 240;
  game.camera.y = game.state.py - 160;
  game.paused = false;
  game.running = true;
  startGameLoop(game);
}
