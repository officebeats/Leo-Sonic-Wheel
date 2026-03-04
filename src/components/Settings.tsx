import { loadSave, writeSave } from "../game/saveSystem";
import type { SaveData } from "../game/saveSystem";

interface Props {
  save: SaveData;
  onSave: () => void;
  onBack: () => void;
}

export function Settings({ save, onSave, onBack }: Props) {
  const toggle = (key: "soundOn" | "musicOn" | "reducedMotion") => {
    const s = loadSave();
    s[key] = !s[key];
    writeSave(s);
    onSave();
  };

  return (
    <div className="screen-overlay">
      <h1 className="screen-title">Settings</h1>
      <div className="settings-row">
        <span>🔊 Sound</span>
        <button
          className={`toggle ${save.soundOn ? "on" : "off"}`}
          onClick={() => toggle("soundOn")}
        />
      </div>
      <div className="settings-row">
        <span>🎵 Music</span>
        <button
          className={`toggle ${save.musicOn ? "on" : "off"}`}
          onClick={() => toggle("musicOn")}
        />
      </div>
      <div className="settings-row">
        <span>🚫 Reduced Motion</span>
        <button
          className={`toggle ${save.reducedMotion ? "on" : "off"}`}
          onClick={() => toggle("reducedMotion")}
        />
      </div>
      <button
        className="btn btn-secondary"
        onClick={onBack}
        style={{ marginTop: 16 }}
      >
        ← Back
      </button>
    </div>
  );
}
