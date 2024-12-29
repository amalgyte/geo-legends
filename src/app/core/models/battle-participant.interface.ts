import { BattleParticipantStrategy } from "../enumerators/battle-participant-strategy.enum";
import { BattleUnit } from "./battle-unit.interface";

export interface BattleParticipant {
    entityId: string;           // ID of the player or faction
    units: BattleUnit[];        // Units deployed by the participant
    strategy: BattleParticipantStrategy; // Chosen strategy
  }
  