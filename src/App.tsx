import { useState, useCallback } from "react";
import "./index.css";
import { StartScreen } from "./components/StartScreen";
import { LevelSelect } from "./components/LevelSelect";
import { GameScreen } from "./components/GameScreen";
import { Settings } from "./components/Settings";
import { loadSave } from "./game/saveSystem";
import type { SaveData } from "./game/saveSystem";

type Screen = "start" | "levelSelect" | "game" | "settings";

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [save, setSave] = useState<SaveData>(loadSave());

  const refreshSave = useCallback(() => setSave(loadSave()), []);

  const handlePlay = useCallback(() => setScreen("levelSelect"), []);
  const handleSettings = useCallback(() => setScreen("settings"), []);
  const handleBack = useCallback(() => setScreen("start"), []);

  const handleSelectLevel = useCallback((id: number) => {
    setSelectedLevel(id);
    setScreen("game");
  }, []);

  const handleExitGame = useCallback(() => {
    refreshSave();
    setScreen("levelSelect");
  }, [refreshSave]);

  const handleNextLevel = useCallback(
    (nextId: number) => {
      refreshSave();
      setSelectedLevel(nextId);
    },
    [refreshSave],
  );

  return (
    <div className="game-container">
      {screen === "start" && (
        <StartScreen onPlay={handlePlay} onSettings={handleSettings} />
      )}
      {screen === "levelSelect" && (
        <LevelSelect
          save={save}
          onSelect={handleSelectLevel}
          onBack={handleBack}
        />
      )}
      {screen === "game" && (
        <GameScreen
          levelId={selectedLevel}
          onExit={handleExitGame}
          onNextLevel={handleNextLevel}
        />
      )}
      {screen === "settings" && (
        <Settings save={save} onSave={refreshSave} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
