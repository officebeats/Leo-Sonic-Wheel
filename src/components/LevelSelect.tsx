import type { SaveData } from "../game/saveSystem";

interface Props {
  save: SaveData;
  onSelect: (id: number) => void;
  onBack: () => void;
}

export function LevelSelect({ save, onSelect, onBack }: Props) {
  return (
    <div className="screen-overlay">
      <h1 className="screen-title">Select Level</h1>
      <div className="level-grid">
        {Array.from({ length: 10 }, (_, i) => {
          const id = i + 1;
          const unlocked = id <= save.unlockedLevel;
          const best = save.bestSeeds[id];
          return (
            <button
              key={id}
              className={`level-card ${unlocked ? "unlocked" : "locked"}`}
              onClick={() => unlocked && onSelect(id)}
              disabled={!unlocked}
            >
              {unlocked ? id : "🔒"}
              {best !== undefined && <span className="star">🌻 {best}</span>}
            </button>
          );
        })}
      </div>
      <button className="btn btn-secondary" onClick={onBack}>
        ← Back
      </button>
    </div>
  );
}
