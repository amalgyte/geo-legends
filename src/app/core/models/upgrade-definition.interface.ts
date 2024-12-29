import { EffectDefinition } from "./effect-definition.interface";
import { Prerequisite } from "./prerequisite.interface";
import { ResourceCost } from "./resource-cost.interface";

export interface UpgradeDefinition {
  level: number; // Level of the upgrade
  cost: ResourceCost[]; // Cost for this upgrade
  time: number; // Time required in seconds
  prerequisites?: Prerequisite[]; // Conditions to unlock this upgrade
  effects?: EffectDefinition[]; // Effects of this upgrade (e.g., increased production)
}
