# Settlements & Building System

## Settlement Lifecycle

### Settlement Stages
1. **Discovery** - Player finds empty cell
2. **Claiming** - Player claims cell as their base
3. **Founding** - Create initial settlement (Town Center)
4. **Building** - Construct additional buildings
5. **Expansion** - Claim adjacent cells
6. **Development** - Upgrade and specialize

### Settlement Progression
```typescript
enum SettlementEra {
  VILLAGE = 'VILLAGE',     // Basic buildings, simple resources
  TOWNSHIP = 'TOWNSHIP',   // Advanced structures, complex production
  CITY = 'CITY'            // Specialized districts, major projects
}

interface Settlement {
  id: string;
  cellId: string;
  ownerUid: string;
  era: SettlementEra;
  level: number;
  buildings: Building[];
  production: Map<ResourceId, number>;
  storage: Map<ResourceId, number>;
  defenses: Defense[];
  lastUpdate: Timestamp;
  protectionWindow?: Timestamp;
}
```

## Building System

### Building Categories
```typescript
enum BuildingCategory {
  CIVIC = 'CIVIC',         // Town Center, Storage, Roads
  ECONOMIC = 'ECONOMIC',   // Farms, Mines, Workshops
  MILITARY = 'MILITARY',   // Barracks, Walls, Towers
  INFRASTRUCTURE = 'INFRA', // Roads, Bridges, Wells
  SPECIAL = 'SPECIAL'      // Unique buildings, Wonders
}
```

### Building Definition
```typescript
interface BuildingDefinition {
  id: BuildingId;
  name: string;
  category: BuildingCategory;
  era: SettlementEra;
  footprint: {
    width: number;
    height: number;
    buffer: number;
  };
  requirements: {
    tech: TechnologyId[];
    settlementLevel: number;
    buildings?: BuildingId[];
  };
  cost: Map<ResourceId, number>;
  buildTime: number; // seconds
  production: Map<ResourceId, number>;
  storage: Map<ResourceId, number>;
  effects: BuildingEffect[];
  upgrades: BuildingUpgrade[];
  biomeModifiers: Map<BiomeType, number>;
  roadAdjacencyBonus: number;
}
```

### Building Instance
```typescript
interface Building {
  id: string;
  definitionId: BuildingId;
  cellId: string;
  position: { x: number; y: number };
  level: number;
  isActive: boolean;
  buildStart?: Timestamp;
  buildEnd?: Timestamp;
  production: Map<ResourceId, number>;
  storage: Map<ResourceId, number>;
  effects: BuildingEffect[];
  lastUpdate: Timestamp;
}
```

## Placement System

### Grid System
```typescript
interface PlacementGrid {
  cellId: string;
  width: number;
  height: number;
  tiles: TileType[][];
  buildings: Map<string, Building>;
}

enum TileType {
  FREE = 'FREE',
  OCCUPIED = 'OCCUPIED',
  ROAD = 'ROAD',
  WATER = 'WATER',
  HILL = 'HILL',
  RESTRICTED = 'RESTRICTED'
}
```

### Placement Rules
```typescript
class PlacementValidator {
  // Validate building placement
  validatePlacement(
    building: BuildingDefinition,
    position: { x: number; y: number },
    grid: PlacementGrid
  ): PlacementResult {
    // Check footprint
    if (!this.checkFootprint(building, position, grid)) {
      return { valid: false, reason: 'INVALID_FOOTPRINT' };
    }
    
    // Check requirements
    if (!this.checkRequirements(building, grid.cellId)) {
      return { valid: false, reason: 'REQUIREMENTS_NOT_MET' };
    }
    
    // Check adjacency rules
    if (!this.checkAdjacency(building, position, grid)) {
      return { valid: false, reason: 'ADJACENCY_VIOLATION' };
    }
    
    return { valid: true };
  }
  
  // Check building footprint
  private checkFootprint(
    building: BuildingDefinition,
    position: { x: number; y: number },
    grid: PlacementGrid
  ): boolean {
    const { width, height, buffer } = building.footprint;
    
    for (let x = position.x; x < position.x + width; x++) {
      for (let y = position.y; y < position.y + height; y++) {
        if (grid.tiles[x][y] !== TileType.FREE) {
          return false;
        }
      }
    }
    
    // Check buffer zone
    if (buffer > 0) {
      for (let x = position.x - buffer; x < position.x + width + buffer; x++) {
        for (let y = position.y - buffer; y < position.y + height + buffer; y++) {
          if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
            continue;
          }
          if (grid.tiles[x][y] === TileType.OCCUPIED) {
            return false;
          }
        }
      }
    }
    
    return true;
  }
}
```

## Road System

### Road Types
```typescript
enum RoadType {
  DIRT = 'DIRT',           // Basic road, +5% production
  STONE = 'STONE',         // Stone road, +10% production
  PAVED = 'PAVED',         // Paved road, +15% production
  HIGHWAY = 'HIGHWAY'      // Highway, +25% production
}

interface Road {
  id: string;
  type: RoadType;
  start: { x: number; y: number };
  end: { x: number; y: number };
  connected: boolean;
  bonus: number;
}
```

### Road Network
```typescript
class RoadNetwork {
  private roads: Map<string, Road> = new Map();
  
  // Add road to network
  addRoad(road: Road): void {
    this.roads.set(road.id, road);
    this.updateConnections();
  }
  
  // Update road connections
  private updateConnections(): void {
    for (const road of this.roads.values()) {
      road.connected = this.isConnectedToTownCenter(road);
    }
  }
  
  // Check if road connects to town center
  private isConnectedToTownCenter(road: Road): boolean {
    // BFS to find path to town center
    const queue = [road.start];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (this.isTownCenter(current)) {
        return true;
      }
      
      // Add adjacent road tiles
      const adjacent = this.getAdjacentRoads(current);
      queue.push(...adjacent);
    }
    
    return false;
  }
}
```

## Adjacent Expansion

### Expansion Rules
```typescript
interface ExpansionRule {
  targetCellId: string;
  sourceCellId: string;
  adjacencyType: 'EDGE' | 'DIAGONAL';
  cost: Map<ResourceId, number>;
  timeRequired: number;
  prerequisites: {
    settlementLevel: number;
    technology: TechnologyId[];
    buildings: BuildingId[];
  };
}
```

### Expansion System
```typescript
class ExpansionManager {
  // Check if cell can be expanded to
  canExpandTo(
    fromCellId: string,
    toCellId: string,
    playerId: string
  ): ExpansionResult {
    // Check adjacency
    if (!this.isAdjacent(fromCellId, toCellId)) {
      return { canExpand: false, reason: 'NOT_ADJACENT' };
    }
    
    // Check ownership
    if (!this.isOwnedBy(fromCellId, playerId)) {
      return { canExpand: false, reason: 'NOT_OWNED' };
    }
    
    // Check if target is empty
    if (this.isOccupied(toCellId)) {
      return { canExpand: false, reason: 'ALREADY_OCCUPIED' };
    }
    
    // Check prerequisites
    if (!this.checkPrerequisites(fromCellId, toCellId)) {
      return { canExpand: false, reason: 'PREREQUISITES_NOT_MET' };
    }
    
    return { canExpand: true };
  }
  
  // Process expansion
  async processExpansion(
    fromCellId: string,
    toCellId: string,
    playerId: string
  ): Promise<void> {
    const expansion = await this.createExpansion(fromCellId, toCellId, playerId);
    
    // Schedule expansion completion
    await this.scheduleExpansionCompletion(expansion);
    
    // Apply immediate effects
    await this.applyExpansionEffects(expansion);
  }
}
```

## Upkeep System

### Upkeep Requirements
```typescript
interface UpkeepRequirement {
  resourceId: ResourceId;
  amount: number;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY';
  lastPaid: Timestamp;
  isOverdue: boolean;
}

class UpkeepManager {
  // Calculate upkeep for settlement
  calculateUpkeep(settlement: Settlement): UpkeepRequirement[] {
    const requirements: UpkeepRequirement[] = [];
    
    // Base upkeep
    requirements.push({
      resourceId: 'FOOD',
      amount: settlement.level * 10,
      frequency: 'DAILY',
      lastPaid: settlement.lastUpdate,
      isOverdue: false
    });
    
    // Building upkeep
    for (const building of settlement.buildings) {
      const buildingUpkeep = this.getBuildingUpkeep(building);
      requirements.push(...buildingUpkeep);
    }
    
    return requirements;
  }
  
  // Check if upkeep is overdue
  checkUpkeepStatus(settlement: Settlement): UpkeepStatus {
    const requirements = this.calculateUpkeep(settlement);
    const now = Date.now();
    
    for (const req of requirements) {
      const timeSinceLastPaid = now - req.lastPaid.getTime();
      const requiredInterval = this.getInterval(req.frequency);
      
      if (timeSinceLastPaid > requiredInterval) {
        return { status: 'OVERDUE', requirements: req };
      }
    }
    
    return { status: 'CURRENT' };
  }
}
```

## Protection System

### Protection Windows
```typescript
interface ProtectionWindow {
  settlementId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  type: 'NEW_SETTLEMENT' | 'AFTER_RAID' | 'ADMIN';
  duration: number; // seconds
  isActive: boolean;
}

class ProtectionManager {
  // Grant protection to new settlement
  grantNewSettlementProtection(settlementId: string): ProtectionWindow {
    const now = Date.now();
    const duration = 24 * 60 * 60 * 1000; // 24 hours
    
    return {
      settlementId,
      startTime: new Date(now),
      endTime: new Date(now + duration),
      type: 'NEW_SETTLEMENT',
      duration,
      isActive: true
    };
  }
  
  // Check if settlement is protected
  isProtected(settlementId: string): boolean {
    const protection = this.getActiveProtection(settlementId);
    if (!protection) return false;
    
    const now = Date.now();
    return now < protection.endTime.getTime();
  }
}
```

## Building Effects

### Effect Types
```typescript
enum EffectType {
  PRODUCTION_BONUS = 'PRODUCTION_BONUS',
  STORAGE_BONUS = 'STORAGE_BONUS',
  MORALE_BONUS = 'MORALE_BONUS',
  DEFENSE_BONUS = 'DEFENSE_BONUS',
  UNLOCK_BUILDING = 'UNLOCK_BUILDING',
  UNLOCK_UNIT = 'UNLOCK_UNIT',
  UNLOCK_TECH = 'UNLOCK_TECH'
}

interface BuildingEffect {
  type: EffectType;
  target: string;
  value: number;
  duration?: number;
  description: string;
}
```

### Effect Application
```typescript
class EffectManager {
  // Apply building effects
  applyBuildingEffects(
    settlement: Settlement,
    building: Building
  ): Settlement {
    const updatedSettlement = { ...settlement };
    
    for (const effect of building.effects) {
      switch (effect.type) {
        case EffectType.PRODUCTION_BONUS:
          this.applyProductionBonus(updatedSettlement, effect);
          break;
        case EffectType.STORAGE_BONUS:
          this.applyStorageBonus(updatedSettlement, effect);
          break;
        case EffectType.UNLOCK_BUILDING:
          this.unlockBuilding(updatedSettlement, effect);
          break;
      }
    }
    
    return updatedSettlement;
  }
  
  // Apply production bonus
  private applyProductionBonus(
    settlement: Settlement,
    effect: BuildingEffect
  ): void {
    const currentProduction = settlement.production.get(effect.target) || 0;
    const bonus = currentProduction * (effect.value / 100);
    settlement.production.set(effect.target, currentProduction + bonus);
  }
}
```

## Building Upgrades

### Upgrade System
```typescript
interface BuildingUpgrade {
  level: number;
  cost: Map<ResourceId, number>;
  timeRequired: number;
  effects: BuildingEffect[];
  prerequisites: {
    technology: TechnologyId[];
    buildings: BuildingId[];
  };
}

class UpgradeManager {
  // Check if building can be upgraded
  canUpgrade(
    building: Building,
    player: User
  ): UpgradeResult {
    const upgrade = this.getUpgrade(building.definitionId, building.level + 1);
    if (!upgrade) {
      return { canUpgrade: false, reason: 'MAX_LEVEL_REACHED' };
    }
    
    // Check prerequisites
    if (!this.checkPrerequisites(upgrade, player)) {
      return { canUpgrade: false, reason: 'PREREQUISITES_NOT_MET' };
    }
    
    // Check resources
    if (!this.checkResources(upgrade.cost, player.inventory)) {
      return { canUpgrade: false, reason: 'INSUFFICIENT_RESOURCES' };
    }
    
    return { canUpgrade: true, upgrade };
  }
  
  // Process upgrade
  async processUpgrade(
    buildingId: string,
    playerId: string
  ): Promise<void> {
    const building = await this.getBuilding(buildingId);
    const upgrade = this.getUpgrade(building.definitionId, building.level + 1);
    
    // Deduct resources
    await this.deductResources(upgrade.cost, playerId);
    
    // Schedule upgrade completion
    await this.scheduleUpgradeCompletion(buildingId, upgrade);
  }
}
```

## Settlement Specialization

### Specialization Types
```typescript
enum SpecializationType {
  AGRICULTURAL = 'AGRICULTURAL',   // Food production focus
  INDUSTRIAL = 'INDUSTRIAL',       // Resource production focus
  MILITARY = 'MILITARY',           // Defense and military focus
  TRADE = 'TRADE',                 // Commerce and trade focus
  RESEARCH = 'RESEARCH'            // Technology and science focus
}
```

### Specialization Benefits
```typescript
interface SpecializationBenefit {
  type: SpecializationType;
  productionBonus: Map<ResourceId, number>;
  storageBonus: Map<ResourceId, number>;
  unlockBuildings: BuildingId[];
  unlockUnits: UnitId[];
  unlockTech: TechnologyId[];
  description: string;
}

class SpecializationManager {
  // Apply specialization benefits
  applySpecialization(
    settlement: Settlement,
    specialization: SpecializationType
  ): Settlement {
    const benefits = this.getSpecializationBenefits(specialization);
    const updatedSettlement = { ...settlement };
    
    // Apply production bonuses
    for (const [resourceId, bonus] of benefits.productionBonus) {
      const current = updatedSettlement.production.get(resourceId) || 0;
      updatedSettlement.production.set(resourceId, current * (1 + bonus));
    }
    
    // Apply storage bonuses
    for (const [resourceId, bonus] of benefits.storageBonus) {
      const current = updatedSettlement.storage.get(resourceId) || 0;
      updatedSettlement.storage.set(resourceId, current * (1 + bonus));
    }
    
    return updatedSettlement;
  }
}
```
