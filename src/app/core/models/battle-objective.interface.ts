import { BattleObjectiveType } from "../enumerators/battle-objective-type.enum";

export interface BattleObjective {
    id: string;                 // Unique identifier
    type: BattleObjectiveType; // Objective type
    description: string;        // Objective description
    targetId?: string;          // ID of the target (if applicable)
  }
  