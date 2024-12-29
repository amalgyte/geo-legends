import { Ages } from '../enumerators/ages.enum';
import { BuildingType } from '../enumerators/building-type.enum';
import { ResourceCost } from './resource-cost.interface';
import { ResourceProduction } from './resource-production.interface';
import { UnlockRequirement } from './unlock-requirement.interface';
import { UpgradeDefinition } from './upgrade-definition.interface';

export interface BuildingDefinition {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Description of the building
  age: Ages; // ID of the age this building belongs to
  baseCost: ResourceCost[]; // Cost to build or upgrade
  upgrades: UpgradeDefinition[]; // Upgrade paths
  production: ResourceProduction[]; // Resources or effects produced
  unlocks: UnlockRequirement[]; // Technologies, units, or buildings unlocked
  upgradeTo?: string; // ID of the upgraded version
  category: BuildingType; // Type of building

}
