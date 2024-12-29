import { BattleStatus } from '../enumerators/battle-status.enum';
import { BattleLocation } from './battle-location.interface';
import { BattleLogEntry } from './battle-log-entry.interface';
import { BattleObjective } from './battle-objective.interface';
import { BattleParticipant } from './battle-participant.interface';
import { BattleResult } from './battle-result.interface';

export interface Battle {
  id: string; // Unique identifier
  location: BattleLocation; // Location of the battle
  participants: BattleParticipant[]; // Entities involved
  objectives: BattleObjective[]; // Objectives for the battle
  status: BattleStatus; // Current status
  log: BattleLogEntry[]; // Log of events during the battle
  result?: BattleResult; // Outcome of the battle
}
