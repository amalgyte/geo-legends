import { Ages } from '../enumerators/ages.enum';
import { BuildingInstance } from './building-instance.interface';
import { EffectDefinition } from './effect-definition.interface';
import { GridOwnershipMap } from './grid-ownership-map.interface';
import { UnitInstance } from './unit-instance.interface';

export interface PlayerState {
  id: string; // Unique player identifier
  name: string; // Player name
  currentAge: Ages; // Current age the player is in
  resources: { [resourceId: string]: number }; // Resource inventory
  buildings: BuildingInstance[]; // List of constructed buildings
  technologies: string[]; // Researched technologies
  units: UnitInstance[]; // Active units
  activeEffects: EffectDefinition[]; // Active bonuses or penalties
  gridOwnership: GridOwnershipMap; // Grid cells owned or visited (now required)
}
