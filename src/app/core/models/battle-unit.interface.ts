import { UnitAction } from "./unit-action.interface";

export interface BattleUnit {
    unitId: string;             // ID of the unit definition
    currentHealth: number;      // Current health
    attackPower: number;        // Attack capability
    defensePower: number;       // Defense capability
    position: { x: number; y: number }; // Position on the battlefield
    actions: UnitAction[];      // Actions taken during the battle
  }
  