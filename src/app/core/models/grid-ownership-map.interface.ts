import { ForeignGridInfo } from "./foreign-grid-info.interface";
import { GridLocationState } from "./grid-location-state.interface";

export interface GridOwnershipMap {
    owned: { [locationId: string]: GridLocationState }; // Fully owned grid locations
    visited: string[];                                  // Location IDs of visited grids
    knownOthers: { [locationId: string]: ForeignGridInfo }; // Info about foreign-owned cells
  }
  