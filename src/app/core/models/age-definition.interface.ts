// import { Ages } from '../enumerators/ages.enum';
import { UnlockRequirement } from './unlock-requirement.interface';

export interface AgeDefinition {
  id?: string; // Unique identifier
  name: string; // Display name
  description: string; // Description of the age
  previousAgeId?: string; // null means no era or age preceeds this one.
  nextAgeId?: string; // null means next era.
  unlockRequirements: UnlockRequirement[]; // Requirements to enter this age
  technologies: string[]; // IDs of available technologies in this age
  buildings: string[]; // IDs of buildings available in this age
  units: string[]; // IDs of units available in this age
  sequence: number;           // Order of the age in the era
}
