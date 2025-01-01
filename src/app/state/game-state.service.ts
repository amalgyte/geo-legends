// state/game-state.service.ts
import { Injectable } from "@angular/core";
import {
  PlayerState,
  Battle,
  DiplomaticEntity,
  ResourceCost,
  ForeignGridInfo,
  GridLocationState,
} from "../core/models/interfaces";
import { StaticDataService } from "../core/services/static-data.service";
import { never } from "rxjs";
// import { Ages } from "../core/enumerators/ages.enum";
import { BattleStatus } from "../core/enumerators/battle-status.enum";
import { EffectDefinitionType } from "../core/enumerators/effect-definition-type.enum";

@Injectable({
  providedIn: "root",
})
export class GameStateService {
  private playerState: PlayerState;
  private battles: Battle[] = [];
  private diplomacyEntities: DiplomaticEntity[] = [];

  constructor(private staticDataService: StaticDataService) {
    this.playerState = this.initializePlayerState();
  }

  private initializePlayerState(): PlayerState {
    const playerState: PlayerState = {
      id: "",
      name: "",
      currentAge: "",
      resources: {},
      buildings: [],
      technologies: [],
      units: [],
      activeEffects: [],
      gridOwnership: undefined
    };
    return playerState;
  }

  getPlayerState(): PlayerState {
    return this.playerState;
  }

  getBattles(): Battle[] {
    return this.battles;
  }

  getDiplomaticEntities(): DiplomaticEntity[] {
    return this.diplomacyEntities;
  }

  // Methods to update state
  addBuilding(buildingId: string, locationId: string): void {
    this.playerState.buildings.push({
      id: `${buildingId}_${Date.now()}`, // Unique instance ID
      definitionId: buildingId,
      level: 1,
      locationId: locationId,
    });
  }

  updateResources(resourceId: string, amount: number): void {
    if (!this.playerState.resources[resourceId]) {
      this.playerState.resources[resourceId] = 0;
    }
    this.playerState.resources[resourceId] += amount;
  }

  addBattle(battle: Battle): void {
    this.battles.push(battle);
  }

  resolveBattle(battleId: string, result: Battle["result"]): void {
    const battle = this.battles.find((b) => b.id === battleId);
    if (battle) {
      battle.status = BattleStatus.COMPLETED;
      battle.result = result;
    }
  }

  buildStructure(buildingId: string, locationId: string): void {
    const buildingCost = this.staticDataService
      .get('globalBuildings')
      .find((b) => b.id === buildingId)?.baseCost;

    if (buildingCost && this.canAfford(buildingCost)) {
      this.addBuilding(buildingId, locationId);
      this.updateResourcesAfterCost(buildingCost);
    }
  }

  private canAfford(cost: ResourceCost[]): boolean {
    return cost.every(
      (c) => this.playerState.resources[c.resourceId] >= c.amount
    );
  }

  private updateResourcesAfterCost(cost: ResourceCost[]): void {
    cost.forEach((c) => {
      this.updateResources(c.resourceId, -c.amount);
    });
  }

  saveGameState(): void {
    const state = JSON.stringify(this.playerState);
    localStorage.setItem("gameState", state);
  }

  loadGameState(): void {
    const state = localStorage.getItem("gameState");
    if (state) {
      this.playerState = JSON.parse(state);
    }
  }

  addOwnedGridLocation(location: GridLocationState): void {
    if (!this.playerState.gridOwnership) {
      throw new Error("PlayerState.gridOwnership is not initialized");
    }
    this.playerState.gridOwnership.owned[location.id] = location;
  }

  markLocationVisited(locationId: string): void {
    if (!this.playerState.gridOwnership!.visited.includes(locationId)) {
      this.playerState.gridOwnership!.visited.push(locationId);
    }
  }

  updateKnownForeignGrid(locationId: string, info: ForeignGridInfo): void {
    this.playerState.gridOwnership!.knownOthers[locationId] = info;
  }

  getLocationInfo(
    locationId: string
  ): GridLocationState | ForeignGridInfo | string | null {
    if (this.playerState.gridOwnership!.owned[locationId]) {
      return this.playerState.gridOwnership!.owned[locationId];
    }

    if (this.playerState.gridOwnership!.visited.includes(locationId)) {
      return "visited";
    }

    if (this.playerState.gridOwnership!.knownOthers[locationId]) {
      return this.playerState.gridOwnership!.knownOthers[locationId];
    }

    return null;
  }
}
