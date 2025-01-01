import { Injectable } from "@angular/core";
import {
  EraDefinition,
  ResourceDefinition,
  BuildingDefinition,
  TechnologyDefinition,
  UnitDefinition,
  GameConfigMapping,
} from "../models/interfaces";
import { DatabaseService } from "./database.service";

@Injectable({
  providedIn: "root",
})
export class StaticDataService {
  private gameConfig: Record<keyof GameConfigMapping, any[]> = {
    eras: [],
    globalResources: [],
    globalBuildings: [],
    globalTechnologies: [],
    globalUnits: [],
  };

  private collectionMapping: { [K in keyof GameConfigMapping]: string } = {
    eras: "erasCollection",
    globalResources: "resourcesCollection",
    globalBuildings: "buildingsCollection",
    globalTechnologies: "technologiesCollection",
    globalUnits: "unitsCollection",
  };

  constructor(private databaseService: DatabaseService) {}

  async loadStaticData(): Promise<void> {
    try {
      const keys = Object.keys(this.collectionMapping) as Array<
        keyof GameConfigMapping
      >;
      for (const key of keys) {
        const collection = this.collectionMapping[key];
        const data = await this.databaseService.readCollection(collection);
        this.gameConfig[key] = data as GameConfigMapping[typeof key][];
      }
      console.log("Static data loaded successfully");
    } catch (error) {
      console.error("Error loading static data:", error);
    }
  }

  get<K extends keyof GameConfigMapping>(type: K): GameConfigMapping[K][] {
    return this.gameConfig[type] as GameConfigMapping[K][];
  }

  async add<K extends keyof GameConfigMapping>(
    type: K,
    item: Omit<GameConfigMapping[K], "id">
  ): Promise<void> {
    try {
      const collection = this.collectionMapping[type];
      const id = await this.databaseService.create(collection, item);
      this.gameConfig[type].push({ ...item, id } as GameConfigMapping[K]);
      console.log(`${type} added successfully`);
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
    }
  }

  async update<K extends keyof GameConfigMapping>(
    type: K,
    item: GameConfigMapping[K] & { id: string }
  ): Promise<void> {
    try {
      const collection = this.collectionMapping[type];
      const index = this.gameConfig[type].findIndex(
        (i: any) => i.id === item.id
      );
      if (index !== -1) {
        await this.databaseService.update(collection, item.id, item);
        this.gameConfig[type][index] = item;
        console.log(`${type} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  }

  async delete<K extends keyof GameConfigMapping>(
    type: K,
    id: string
  ): Promise<void> {
    try {
      const collection = this.collectionMapping[type];
      await this.databaseService.delete(collection, id);
      this.gameConfig[type] = this.gameConfig[type].filter(
        (i: any) => i.id !== id
      );
      console.log(`${type} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  }

  // Utility methods for specific use cases
  getEraById(eraId: string): EraDefinition | null {
    return (
      this.gameConfig.eras.find((e: EraDefinition) => e.id === eraId) || null
    );
  }

  getResourceById(resourceId: string): ResourceDefinition | null {
    return (
      this.gameConfig.globalResources.find(
        (r: ResourceDefinition) => r.id === resourceId
      ) || null
    );
  }

  getBuildingById(buildingId: string): BuildingDefinition | null {
    return (
      this.gameConfig.globalBuildings.find(
        (b: BuildingDefinition) => b.id === buildingId
      ) || null
    );
  }

  getUnitById(unitId: string): UnitDefinition | null {
    return (
      this.gameConfig.globalUnits.find(
        (u: UnitDefinition) => u.id === unitId
      ) || null
    );
  }

  getTechnologyById(technologyId: string): TechnologyDefinition | null {
    return (
      this.gameConfig.globalTechnologies.find(
        (t: TechnologyDefinition) => t.id === technologyId
      ) || null
    );
  }
}
