export interface BuildingInstance {
    id: string;                 // Unique instance identifier
    definitionId: string;       // ID of the building definition
    level: number;              // Current level of the building
    locationId: string; // Location on the game grid eg:cell_58650_-944
  }
  