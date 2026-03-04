// ─── Level Loader ────────────────────────────────────────────────────────

export const TileType = {
  Air: 0,
  Ground: 1,
  Spawn: 2,
  Goal: 3,
  Seed: 4,
  Pellet: 5,
  Goo: 6,
  Spring: 7,
  WindRight: 8,
  WindLeft: 9,
  PlatformH: 10,
  PlatformV: 11,
  Checkpoint: 12,
  Switch: 13,
  Gate: 14,
  Marble: 15,
  LowCeiling: 16,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

const CHAR_MAP: Record<string, TileType> = {
  ".": TileType.Air,
  "#": TileType.Ground,
  S: TileType.Spawn,
  G: TileType.Goal,
  o: TileType.Seed,
  E: TileType.Pellet,
  "~": TileType.Goo,
  "^": TileType.Spring,
  ">": TileType.WindRight,
  "<": TileType.WindLeft,
  "=": TileType.PlatformH,
  "|": TileType.PlatformV,
  C: TileType.Checkpoint,
  "!": TileType.Switch,
  D: TileType.Gate,
  "@": TileType.Marble,
  _: TileType.LowCeiling,
};

export interface LevelMeta {
  id: number;
  name: string;
  description: string;
  difficulty: number;
}

export interface LevelData {
  meta: LevelMeta;
  tiles: TileType[][];
}

export interface LevelJSON {
  meta: LevelMeta;
  tilemap: string[];
}

export function parseLevelJSON(json: LevelJSON): LevelData {
  const tiles: TileType[][] = json.tilemap.map((row) =>
    Array.from(row).map((ch) => CHAR_MAP[ch] ?? TileType.Air),
  );
  return { meta: json.meta, tiles };
}
