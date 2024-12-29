export interface UnitInstance {
    id: string;                 // Unique instance identifier
    definitionId: string;       // ID of the unit definition
    currentLocation: { x: number; y: number }; // Current location on the map
    currentHealth: number;      // Current health
  }
  