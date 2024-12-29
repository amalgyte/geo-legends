export interface BattleLogEntry {
    timestamp: number;          // Time of the event
    description: string;        // Event description
    involvedUnits: string[];    // IDs of units involved
  }
  