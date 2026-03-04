interface Props {
  onPlay: () => void;
  onSettings: () => void;
}

export function StartScreen({ onPlay, onSettings }: Props) {
  return (
    <div className="screen-overlay">
      <div style={{ fontSize: "64px", marginBottom: "-8px" }}>🦔</div>
      <h1 className="screen-title">Leo Sonic Wheel</h1>
      <p className="screen-subtitle">
        Help Leo the hedgehog spin through 10 levels of fun! Collect seeds,
        dodge goo, and become a Wheel&nbsp;Wizard!
      </p>
      <button className="btn btn-primary" onClick={onPlay}>
        ▶ Play
      </button>
      <button className="btn btn-secondary" onClick={onSettings}>
        ⚙ Settings
      </button>
    </div>
  );
}
