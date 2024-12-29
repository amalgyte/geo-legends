import { ResourceCost } from "./resource-cost.interface";

export interface BattleResult {
    winningEntityId: string;    // ID of the winning player or faction
    remainingUnits: { [entityId: string]: number }; // Count of surviving units per participant
    loot: ResourceCost[];       // Resources gained by the winner
  }
  