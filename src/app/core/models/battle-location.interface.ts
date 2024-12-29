import { TerrainType } from "../enumerators/terrain-type.enum";

export interface BattleLocation {
    x: number;                  // Grid x-coordinate
    y: number;                  // Grid y-coordinate
    terrain: TerrainType ; // Terrain type
  }
  