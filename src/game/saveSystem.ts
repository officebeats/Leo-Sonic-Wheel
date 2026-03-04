// ─── Save System ──────────────────────────────────────────────────────────
const SAVE_KEY = "leo-sonic-wheel-save";

export interface SaveData {
  unlockedLevel: number; // highest unlocked level (1-indexed)
  bestSeeds: Record<number, number>; // levelId → best seed count
  bestTimes: Record<number, number>; // levelId → best time in frames
  soundOn: boolean;
  musicOn: boolean;
  reducedMotion: boolean;
}

function defaultSave(): SaveData {
  return {
    unlockedLevel: 1,
    bestSeeds: {},
    bestTimes: {},
    soundOn: true,
    musicOn: true,
    reducedMotion: false,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // storage full, ignore
  }
}

export function recordLevelComplete(
  levelId: number,
  seeds: number,
  frames: number,
): SaveData {
  const save = loadSave();
  // unlock next
  if (levelId >= save.unlockedLevel && levelId < 10) {
    save.unlockedLevel = levelId + 1;
  }
  // best seeds
  if (!save.bestSeeds[levelId] || seeds > save.bestSeeds[levelId]) {
    save.bestSeeds[levelId] = seeds;
  }
  // best time
  if (!save.bestTimes[levelId] || frames < save.bestTimes[levelId]) {
    save.bestTimes[levelId] = frames;
  }
  writeSave(save);
  return save;
}
