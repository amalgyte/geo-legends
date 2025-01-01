import { BuildingDefinition } from "./building-definition.interface";
import { EraDefinition } from "./era-definition.interface";
import { ResourceDefinition } from "./resource-definition.interface";
import { TechnologyDefinition } from "./technology-definition.interface";
import { UnitDefinition } from "./unit-definition.interface";

export type GameConfigMapping = {
  eras: EraDefinition;
  globalResources: ResourceDefinition;
  globalBuildings: BuildingDefinition;
  globalTechnologies: TechnologyDefinition;
  globalUnits: UnitDefinition;
};
