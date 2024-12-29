import { UnitActionType } from "../enumerators/unit-action-type.enum";

export interface UnitAction {
    type: UnitActionType; // Action type
    targetUnitId?: string;     // Target unit (if applicable)
    newPosition?: { x: number; y: number }; // New position (if move)
    damageDealt?: number;      // Damage inflicted (if attack)
  }
  