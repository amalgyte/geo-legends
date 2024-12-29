import { AgeDefinition } from './age-definition.interface';
import { BuildingDefinition } from './building-definition.interface';
import { TechnologyDefinition } from './technology-definition.interface';
import { UnitDefinition } from './unit-definition.interface';
import { UnlockRequirement } from './unlock-requirement.interface';

export interface EraDefinition {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Description of the era
  previousEraId: string | undefined; // null indicates first era.
  nextEraId?: string | undefined; // null indicates last era.
  ages: AgeDefinition[]; // Ages within this era
  unlockRequirements: UnlockRequirement[]; //Era is only unlockable when these requirements are met.
  technologies: TechnologyDefinition[];
  buildings: BuildingDefinition[];
  units: UnitDefinition[];
}
