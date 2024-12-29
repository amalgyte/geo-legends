import { ResourceStockpile } from "./resource.stockpile.interface";

export interface GridLocationState {
    id: string;                     // Location ID (e.g., "cell_58650_-944")
    type: string;                   // Type of building (e.g., "town_center")
    resources: ResourceStockpile;   // Resources stored in this location
    units: string[];                // Units currently stationed in this location
    upgrades: string[];             // Upgrades applied to the building
  }
  