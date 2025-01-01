// import { Ages } from '../enumerators/ages.enum';
import { EffectDefinition } from './effect-definition.interface';
import { Prerequisite } from './prerequisite.interface';
import { ResourceCost } from './resource-cost.interface';
import { UnlockRequirement } from './unlock-requirement.interface';

export interface TechnologyDefinition {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Description of the technology
  age: string; // ID of the age this technology belongs to
  cost: ResourceCost[]; // Cost to research
  time: number; // upgrade time in seconds
  unlocks: UnlockRequirement[]; // What this technology unlocks
  effects: EffectDefinition[]; // Effects applied when researched
  prerequisites?: Prerequisite[]; // Conditions to unlock this technology
}
