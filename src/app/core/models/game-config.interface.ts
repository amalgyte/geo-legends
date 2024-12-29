import { BuildingDefinition } from "./building-definition.interface";
import { EraDefinition } from "./era-definition.interface";
import { ResourceDefinition } from "./resource-definition.interface";
import { TechnologyDefinition } from "./technology-definition.interface";
import { UnitDefinition } from "./unit-definition.interface";

export interface GameConfig {
    eras: EraDefinition[];        // List of all eras
    globalResources: ResourceDefinition[]; // Definitions of all resources
    globalTechnologies: TechnologyDefinition[]; // Definitions of all technologies
    globalUnits: UnitDefinition[]; // Definitions of all units
    globalBuildings: BuildingDefinition[]; // Definitions of all buildings
  }
  