import { useRef, useEffect, useState, useCallback } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../game/constants";
import { initInput, destroyInput } from "../game/input";
import { parseLevelJSON } from "../game/levelLoader";
import {
  createGame,
  startGameLoop,
  stopGameLoop,
  resumeGame,
  restartLevel,
} from "../game/gameLoop";
import type { GameInstance } from "../game/gameLoop";
import { recordLevelComplete } from "../game/saveSystem";
import { ALL_LEVELS } from "../levels/allLevels";
import { TouchControls } from "./TouchControls";

interface Props {
  levelId: number;
  onExit: () => void;
  onNextLevel: (nextId: number) => void;
}

export function GameScreen({ levelId, onExit, onNextLevel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameInstance | null>(null);

  const [hearts, setHearts] = useState(3);
  const [seeds, setSeeds] = useState(0);
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [won, setWon] = useState(false);
  const [wonSeeds, setWonSeeds] = useState(0);
  const [wonTotal, setWonTotal] = useState(0);
  const [wonFrames, setWonFrames] = useState(0);

  const levelJSON = ALL_LEVELS[levelId - 1];
  const levelName = levelJSON?.meta.name ?? `Level ${levelId}`;

  const startLevel = useCallback(() => {
    if (!canvasRef.current || !levelJSON) return;
    const ld = parseLevelJSON(JSON.parse(JSON.stringify(levelJSON)));
    const game = createGame(canvasRef.current, ld, {
      onWin: (s, t, f) => {
        setWon(true);
        setWonSeeds(s);
        setWonTotal(t);
        setWonFrames(f);
        recordLevelComplete(levelId, s, f);
      },
      onHeartsChange: setHearts,
      onSeedsChange: setSeeds,
      onFrameUpdate: setFrame,
    });
    gameRef.current = game;
    setHearts(3);
    setSeeds(0);
    setFrame(0);
    setPaused(false);
    setWon(false);
    startGameLoop(game);
  }, [levelJSON, levelId]);

  useEffect(() => {
    initInput();
    startLevel();
    return () => {
      destroyInput();
      if (gameRef.current) stopGameLoop(gameRef.current);
    };
  }, [startLevel]);

  // sync pause state
  useEffect(() => {
    const g = gameRef.current;
    if (!g) return;
    if (g.paused && !paused) setPaused(true);
  });

  const handlePause = () => {
    const g = gameRef.current;
    if (g && !g.paused) {
      g.paused = true;
      setPaused(true);
    }
  };

  const handleResume = () => {
    const g = gameRef.current;
    if (g) {
      resumeGame(g);
      setPaused(false);
    }
  };

  const handleRestart = () => {
    if (!gameRef.current || !levelJSON) return;
    stopGameLoop(gameRef.current);
    const ld = parseLevelJSON(JSON.parse(JSON.stringify(levelJSON)));
    restartLevel(gameRef.current, ld);
    setPaused(false);
    setWon(false);
    setHearts(3);
    setSeeds(0);
    setFrame(0);
  };

  const handleNext = () => {
    if (levelId < 10) {
      onNextLevel(levelId + 1);
    } else {
      onExit();
    }
  };

  const formatTime = (f: number) => {
    const secs = Math.floor(f / 60);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />

      {/* HUD */}
      <div className="hud">
        <div className="hud-hearts">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i}>{i < hearts ? "❤️" : "🖤"}</span>
          ))}
        </div>
        <div className="hud-seeds">🌻 {seeds}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="hud-timer">{formatTime(frame)}</span>
          <button className="hud-pause" onClick={handlePause}>
            ⏸
          </button>
        </div>
      </div>

      {/* Touch */}
      {!paused && !won && <TouchControls />}

      {/* Pause */}
      {paused && !won && (
        <div className="screen-overlay pause-menu">
          <h1 className="screen-title">Paused</h1>
          <p className="screen-subtitle">{levelName}</p>
          <button className="btn btn-primary" onClick={handleResume}>
            ▶ Resume
          </button>
          <button className="btn btn-secondary" onClick={handleRestart}>
            🔄 Restart
          </button>
          <button className="btn btn-secondary" onClick={onExit}>
            ← Level Select
          </button>
        </div>
      )}

      {/* Win */}
      {won && (
        <div className="screen-overlay celebrate">
          <h1 className="screen-title">
            {levelId === 10
              ? "🎉 You did it! You're a Wheel Wizard! 🎉"
              : "⭐ Level Complete! ⭐"}
          </h1>
          <div className="stats-row">
            <div style={{ textAlign: "center" }}>
              <div className="label">Seeds</div>
              <div className="value">
                🌻 {wonSeeds}/{wonTotal}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="label">Time</div>
              <div className="value">⏱ {formatTime(wonFrames)}</div>
            </div>
          </div>
          {levelId < 10 && (
            <button className="btn btn-accent" onClick={handleNext}>
              Next Level →
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleRestart}>
            🔄 Replay
          </button>
          <button className="btn btn-secondary" onClick={onExit}>
            ← Level Select
          </button>
        </div>
      )}
    </div>
  );
}
