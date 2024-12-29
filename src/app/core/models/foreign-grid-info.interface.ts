export interface ForeignGridInfo {
    ownerId: string;                // ID of the other player
    type: string;                   // Type of building (e.g., "stone_mine")
    lastKnownState: number;         // Timestamp of the last time this state was observed
  }
  