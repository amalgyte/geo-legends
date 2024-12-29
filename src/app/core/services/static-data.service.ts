// core/services/static-data.service.ts
import { Injectable, ResourceStatus } from "@angular/core";
import {
  GameConfig,
  EraDefinition,
  ResourceDefinition,
  BuildingDefinition,
  TechnologyDefinition,
  UnitDefinition,
  AgeDefinition,
} from "../models/interfaces";
import { EffectDefinitionType } from "../enumerators/effect-definition-type.enum";
import { ResourceCategory } from "../enumerators/resource-category.enum";
import { Ages } from "../enumerators/ages.enum";
import { BuildingType } from "../enumerators/building-type.enum";
import { UnitType } from "../enumerators/unit-type.enum";
import { ConditionType } from "../enumerators/condition-type.enum";
import { BuildingId } from "../enumerators/building-id.enum";
import { ResourceId } from "../enumerators/resource-id.enum";
import { TechnologyId } from "../enumerators/technology-id.enum";
import { UnitId } from "../enumerators/unit-id.enum";

@Injectable({
  providedIn: "root",
})
export class StaticDataService {
  private gameConfig: GameConfig;

  constructor() {
    this.gameConfig = this.loadStaticData();
  }

  private loadStaticData(): GameConfig {
    return {
      eras: [
        {
          id: "early_civilization",
          name: "Early Civilization",
          description:
            "The formation of basic societies and survival techniques.",
          unlockRequirements: [],
          ages: [
            {
              id: Ages.TRIBAL,
              name: "Tribal Age",
              description:
                "The dawn of civilization, focusing on survival and basic tools.",
              unlockRequirements: [],
              technologies: [TechnologyId.FIRE_MAKING, TechnologyId.FORESTRY],
              buildings: [BuildingId.WOOD_CUTTER],
              units: [UnitId.TRIBAL_WARRIOR],
              sequence: 1,
            },
            {
              id: Ages.STONE,
              name: "Stone Age",
              description: "The age of stone tools and basic settlements.",
              unlockRequirements: [
                {
                  type: ConditionType.RESOURCE,
                  id: ResourceId.FOOD,
                  amount: 200,
                },
              ],
              technologies: [
                TechnologyId.STONE_TOOLS,
                TechnologyId.BASIC_FARMING,
              ],
              buildings: [BuildingId.HUNTER_HUT, BuildingId.STONE_QUARRY],
              units: [UnitId.VILLAGER, UnitId.STONE_THROWER],
              sequence: 2,
            },
          ],
          technologies: [
            {
              id: TechnologyId.FIRE_MAKING,
              name: "Fire Making",
              description:
                "Allows your people to use fire for cooking and warmth.",
              cost: [{ resourceId: ResourceId.WOOD, amount: 50 }],
              time: 100,
              age: Ages.TRIBAL,
              unlocks: [],
              effects: [],
            },
          ],
          buildings: [
            {
              id: "wood_cutter",
              name: "Wood Cutter",
              description: "Harvests wood from nearby forests.",
              age: Ages.TRIBAL,
              baseCost: [
                { resourceId: ResourceId.WOOD, amount: 50 },
                { resourceId: ResourceId.STONE, amount: 20 },
              ],
              production: [
                { resourceId: ResourceId.WOOD, amountPerMinute: 10 },
              ],
              upgrades: [
                {
                  level: 2,
                  cost: [
                    { resourceId: ResourceId.WOOD, amount: 150 },
                    { resourceId: ResourceId.STONE, amount: 100 },
                  ],
                  time: 180,
                  effects: [
                    {
                      type: EffectDefinitionType.PRODUCTIONBOOST,
                      targetId: ResourceId.WOOD,
                      multiplier: 1.5,
                    },
                  ],
                },
              ],
              category: BuildingType.ECONOMIC,
              unlocks: [],
            },
          ],
          units: [
            {
              id: "tribal_warrior",
              name: "Tribal Warrior",
              description: "A basic combat unit for defending your settlement.",
              age: Ages.TRIBAL,
              cost: [
                { resourceId: ResourceId.FOOD, amount: 50 },
                { resourceId: ResourceId.WOOD, amount: 20 },
              ],
              stats: {
                attack: 5,
                defense: 2,
                health: 20,
                speed: 3,
              },
              category: UnitType.MILITARY,
              upgrades: [],
            },
          ],
          previousEraId: undefined,
        },
        {
          id: "metal_age",
          name: "Metal Age",
          description:
            "The discovery and utilization of metals revolutionized tools and weapons.",
          unlockRequirements: [
            {
              type: ConditionType.TECHNOLOGY,
              id: TechnologyId.BRONZE_SMELTING,
              amount: 1,
            },
          ],
          ages: [
            {
              id: Ages.BRONZE,
              name: "Bronze Age",
              description: "Advances in bronze tools and early trade networks.",
              unlockRequirements: [],
              technologies: [TechnologyId.BRONZE_SMELTING],
              buildings: [BuildingId.BRONZE_FOUNDRY],
              units: [UnitId.BRONZE_SPEARMAN],
              sequence: 1,
            },
            {
              id: Ages.IRON,
              name: "Iron Age",
              description: "Advances in metallurgy and structured societies.",
              unlockRequirements: [
                {
                  type: ConditionType.BUILDING,
                  id: BuildingId.BLACKSMITH,
                  amount: 1,
                },
              ],
              technologies: ["iron_working"],
              buildings: ["blacksmith"],
              units: ["iron_swordsman"],
              sequence: 2,
            },
          ],
          technologies: [
            {
              id: "bronze_smelting",
              name: "Bronze Smelting",
              description: "Unlocks advanced metalworking techniques.",
              cost: [
                { resourceId: ResourceId.STONE, amount: 100 },
                { resourceId: ResourceId.WOOD, amount: 200 },
              ],
              time: 300,
              age: Ages.BRONZE,
              unlocks: [
                {
                  type: ConditionType.BUILDING,
                  id: BuildingId.BRONZE_FOUNDRY,
                  amount: 1,
                },
              ],
              effects: [],
            },
            {
              id: "iron_working",
              name: "Iron Working",
              description: "Unlocks advanced iron tools and weapons.",
              cost: [
                { resourceId: ResourceId.IRON, amount: 200 },
                { resourceId: ResourceId.STONE, amount: 100 },
              ],
              time: 400,
              prerequisites: [{ type: "technology", id: "bronze_smelting" }],
              age: Ages.IRON,
              unlocks: [
                {
                  type: ConditionType.BUILDING,
                  id: BuildingId.BLACKSMITH,
                  amount: 1,
                },
              ],
              effects: [
                {
                  type: EffectDefinitionType.PRODUCTIONBOOST,
                  targetId: "iron",
                  multiplier: 1.5,
                },
              ],
            },
          ],
          buildings: [
            {
              id: "blacksmith",
              name: "Blacksmith",
              description: "Produces tools and upgrades using iron.",
              age: Ages.IRON,
              baseCost: [
                { resourceId: ResourceId.WOOD, amount: 100 },
                { resourceId: ResourceId.STONE, amount: 200 },
              ],
              production: [
                {
                  resourceId: "iron_tools",
                  amountPerMinute: 5,
                },
              ],
              upgrades: [],
              category: BuildingType.MILITARY,
              unlocks: [],
            },
          ],
          units: [
            {
              id: "iron_swordsman",
              name: "Iron Swordsman",
              description: "A heavily armed soldier of the Iron Age.",
              age: Ages.IRON,
              cost: [
                { resourceId: ResourceId.IRON, amount: 100 },
                { resourceId: ResourceId.FOOD, amount: 50 },
              ],
              stats: {
                attack: 15,
                defense: 10,
                health: 50,
                speed: 2,
              },
              category: UnitType.MILITARY,
              upgrades: [],
            },
          ],
          previousEraId: undefined,
        },
      ],
      globalResources: [
        {
          id: ResourceId.WOOD,
          name: "Wood",
          description:
            "A basic building material, essential for construction and tools.",
          baseValue: 1,
          category: ResourceCategory.BASIC,
        },
        {
          id: ResourceId.STONE,
          name: "Stone",
          description: "Used for construction and crafting.",
          baseValue: 2,
          category: ResourceCategory.BASIC,
        },
        {
          id: ResourceId.IRON,
          name: "Iron",
          description: "A strategic resource for advanced tools and weapons.",
          baseValue: 5,
          category: ResourceCategory.STRATEGIC,
        },
      ],
      globalTechnologies: [
        {
          id: TechnologyId.FIRE_MAKING,
          name: "Fire Making",
          cost: [{ resourceId: ResourceId.WOOD, amount: 50 }],
          time: 100,
          prerequisites: [],
          description: "Allows your people to use fire for cooking and warmth.",
          age: Ages.TRIBAL,
          unlocks: [],
          effects: [],
        },
        {
          id: TechnologyId.IRON_WORKING,
          name: "Iron Working",
          cost: [
            { resourceId: ResourceId.IRON, amount: 200 },
            { resourceId: ResourceId.STONE, amount: 100 },
          ],
          time: 400,
          prerequisites: [{ type: "technology", id: "bronze_smelting" }],
          description: "Unlocks advanced iron tools and weapons.",
          age: Ages.IRON,
          unlocks: [
            {
              type: ConditionType.BUILDING,
              id: BuildingId.BLACKSMITH,
              amount: 1,
            },
          ],
          effects: [
            {
              type: EffectDefinitionType.PRODUCTIONBOOST,
              targetId: ResourceId.IRON,
              multiplier: 1.5,
            },
          ],
        },
      ],
      globalUnits: [
        {
          id: UnitId.TRIBAL_WARRIOR,
          name: "Tribal Warrior",
          description: "A basic combat unit for defending your settlement.",
          age: Ages.TRIBAL,
          cost: [
            { resourceId: ResourceId.FOOD, amount: 50 },
            { resourceId: ResourceId.WOOD, amount: 20 },
          ],
          stats: {
            attack: 5,
            defense: 2,
            health: 20,
            speed: 3,
          },
          category: UnitType.MILITARY,
          upgrades: [],
        },
        {
          id: UnitId.IRON_SWORDSMAN,
          name: "Iron Swordsman",
          description: "A heavily armed soldier of the Iron Age.",
          age: Ages.IRON,
          cost: [
            { resourceId: ResourceId.IRON, amount: 100 },
            { resourceId: ResourceId.FOOD, amount: 50 },
          ],
          stats: {
            attack: 15,
            defense: 10,
            health: 50,
            speed: 2,
          },
          category: UnitType.MILITARY,
          upgrades: [],
        },
      ],
      globalBuildings: [
        {
          id: BuildingId.WOOD_CUTTER,
          name: "Wood Cutter",
          description: "Harvests wood from nearby forests.",
          age: Ages.TRIBAL,
          baseCost: [
            { resourceId: ResourceId.WOOD, amount: 50 },
            { resourceId: ResourceId.STONE, amount: 20 },
          ],
          upgrades: [
            {
              level: 1,
              cost: [
                { resourceId: ResourceId.WOOD, amount: 100 },
                { resourceId: ResourceId.STONE, amount: 50 },
              ],
              time: 120,
              effects: [
                {
                  type: EffectDefinitionType.PRODUCTIONBOOST,
                  targetId: ResourceId.WOOD,
                  multiplier: 1.1,
                },
              ],
            },
            {
              level: 2,
              cost: [
                { resourceId: ResourceId.WOOD, amount: 150 },
                { resourceId: ResourceId.STONE, amount: 100 },
              ],
              time: 180,
              prerequisites: [{ type: "technology", id: "forestry" }],
              effects: [
                {
                  type: EffectDefinitionType.PRODUCTIONBOOST,
                  targetId: ResourceId.WOOD,
                  multiplier: 1.5,
                },
              ],
            },
          ],
          production: [
            {
              resourceId: ResourceId.WOOD,
              amountPerMinute: 10,
            },
          ],
          unlocks: [],
          category: BuildingType.ECONOMIC,
        },
        {
          id: BuildingId.BLACKSMITH,
          name: "Blacksmith",
          description: "Produces tools and upgrades using iron.",
          age: Ages.IRON,
          baseCost: [
            { resourceId: ResourceId.WOOD, amount: 100 },
            { resourceId: ResourceId.STONE, amount: 200 },
          ],
          upgrades: [],
          production: [
            {
              resourceId: "iron_tools",
              amountPerMinute: 5,
            },
          ],
          unlocks: [{ type: ConditionType.UNIT, id: UnitId.IRON_SWORDSMAN }],
          category: BuildingType.MILITARY,
        },
      ],
    };
  }

  public getConfig(): GameConfig {
    return this.gameConfig;
  }

  public getAges(eraId: string): AgeDefinition[] {
    const era = this.getEraById(eraId);
    return era ? era.ages.sort((a, b) => a.sequence - b.sequence) : [];
  }

  public getEras(): EraDefinition[] {
    console.log("getEras", this.gameConfig);
    return this.gameConfig.eras;
  }

  public getResources(): ResourceDefinition[] {
    return this.gameConfig.globalResources;
  }

  public getBuildings(): BuildingDefinition[] {
    return this.gameConfig.globalBuildings;
  }

  public getTechnologies(): TechnologyDefinition[] {
    return this.gameConfig.globalTechnologies;
  }

  public getUnits(): UnitDefinition[] {
    return this.gameConfig.globalUnits;
  }

  public addEra(newEra: EraDefinition): void {
    this.gameConfig.eras.push(newEra);
  }

  public updateEra(updatedEra: EraDefinition): void {
    const index = this.gameConfig.eras.findIndex((e) => e.id === updatedEra.id);
    if (index !== -1) {
      this.gameConfig.eras[index] = updatedEra;
    }
  }

  public getEraById(eraId: string): EraDefinition | null {
    return this.gameConfig.eras.find((e) => e.id === eraId) || null;
  }

  public deleteEra(eraId: string): void {
    this.gameConfig.eras = this.gameConfig.eras.filter((e) => e.id !== eraId);
  }

  public addResource(newResource: ResourceDefinition): void {
    this.gameConfig.globalResources.push(newResource);
  }

  public updateResource(updatedResource: ResourceDefinition): void {
    const index = this.gameConfig.globalResources.findIndex(
      (e) => e.id === updatedResource.id
    );
    if (index !== -1) {
      this.gameConfig.globalResources[index] = updatedResource;
    }
  }

  public getResourceById(resourceId: string): ResourceDefinition | null {
    return (
      this.gameConfig.globalResources.find((r) => r.id === resourceId) || null
    );
  }

  public deleteResource(resourceId: string): void {
    this.gameConfig.globalResources = this.gameConfig.globalResources.filter(
      (r) => r.id !== resourceId
    );
  }

  public addTechnology(newTechnology: TechnologyDefinition): void {
    this.gameConfig.globalTechnologies.push(newTechnology);
  }

  public updateTechnology(updatedTechnology: TechnologyDefinition): void {
    const index = this.gameConfig.globalTechnologies.findIndex(
      (e) => e.id === updatedTechnology.id
    );
    if (index !== -1) {
      this.gameConfig.globalTechnologies[index] = updatedTechnology;
    }
  }

  public getTechnologyById(technologyId: string): TechnologyDefinition | null {
    return (
      this.gameConfig.globalTechnologies.find((t) => t.id === technologyId) ||
      null
    );
  }

  public deleteTechnology(technologyId: string): void {
    this.gameConfig.globalTechnologies =
      this.gameConfig.globalTechnologies.filter((t) => t.id !== technologyId);
  }

  public addBuilding(newBuilding: BuildingDefinition): void {
    this.gameConfig.globalBuildings.push(newBuilding);
  }

  public updateBuilding(updatedBuilding: BuildingDefinition): void {
    const index = this.gameConfig.globalBuildings.findIndex(
      (b) => b.id === updatedBuilding.id
    );
    if (index !== -1) {
      this.gameConfig.globalBuildings[index] = updatedBuilding;
    }
  }

  public getBuildingById(buildingId: string): BuildingDefinition | null {
    return (
      this.gameConfig.globalBuildings.find((b) => b.id === buildingId) || null
    );
  }

  public deleteBuilding(buildingId: string): void {
    this.gameConfig.globalBuildings = this.gameConfig.globalBuildings.filter(
      (t) => t.id !== buildingId
    );
  }

  public addUnit(newUnit: UnitDefinition): void {
    this.gameConfig.globalUnits.push(newUnit);
  }

  public updateUnit(updatedUnit: UnitDefinition): void {
    const index = this.gameConfig.globalUnits.findIndex(
      (b) => b.id === updatedUnit.id
    );
    if (index !== -1) {
      this.gameConfig.globalUnits[index] = updatedUnit;
    }
  }

  public getUnitById(UnitId: string): UnitDefinition | null {
    return this.gameConfig.globalUnits.find((b) => b.id === UnitId) || null;
  }

  public deleteUnit(UnitId: string): void {
    this.gameConfig.globalUnits = this.gameConfig.globalUnits.filter(
      (t) => t.id !== UnitId
    );
  }
}
