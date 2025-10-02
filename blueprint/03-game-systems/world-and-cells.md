# World & Cells System

## S2 Geometry Implementation

### Cell System Overview
- **S2 Level**: 14-16 typical (80-300m cell size)
- **Cell ID**: Unique identifier for each cell
- **Biome**: Environmental type affecting gameplay
- **Occupancy**: Base ownership and resource nodes
- **Production Timers**: Resource generation cycles
- **Conflict State**: Peace, raid, or war status

### Cell Properties
```typescript
interface Cell {
  cellId: string;           // S2 cell identifier
  level: number;            // S2 level (14-16)
  biome: BiomeType;         // Environmental type
  regionId: string;         // Geographic region
  ownerUid?: string;        // Current owner
  baseLevel: number;        // Settlement level (0-10)
  production: Map<ResourceId, number>;  // Resource generation
  storage: Map<ResourceId, number>;     // Resource storage
  conflictState: 'peace' | 'raid' | 'war';
  lastTickTs: Timestamp;    // Last server update
  adjacentCells: string[];  // Connected cells
  influenceRadius: number;  // Influence area
}
```

### Biome Types
```typescript
enum BiomeType {
  PLAINS = 'PLAINS',       // +10% food production
  FOREST = 'FOREST',       // +20% wood production
  HILLS = 'HILLS',         // +15% ore production
  MARSH = 'MARSH',         // -20% food production
  DESERT = 'DESERT',       // -10% all production
  MOUNTAINS = 'MOUNTAINS', // +25% ore, -30% food
  COASTAL = 'COASTAL',     // +15% trade, fishing
  TUNDRA = 'TUNDRA'        // -15% all production
}
```

## World Partitioning

### S2 Cell Hierarchy
```
Level 10: ~100km cells (continents)
Level 12: ~25km cells (countries)
Level 14: ~300m cells (neighborhoods) ← Primary game level
Level 16: ~80m cells (city blocks) ← High-density areas
Level 18: ~20m cells (buildings) ← Future expansion
```

### Cell Adjacency Rules
- **Edge Adjacent**: Cells sharing a border (N, S, E, W)
- **Diagonal Adjacent**: Cells sharing a corner (NE, NW, SE, SW)
- **Influence Radius**: Cells within influence range
- **Expansion Rules**: Adjacency requirements for settlement growth

### Regional Organization
```typescript
interface Region {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  cellIds: string[];
  population: number;
  activePlayers: number;
  lastTick: Timestamp;
}
```

## Server Tick System

### Tick Processing
- **Global Tick**: Every 5 minutes
- **Regional Tick**: Process regions in batches
- **Cell Tick**: Individual cell processing
- **Production**: Resource generation
- **Decay**: Resource degradation
- **Conflicts**: Battle resolution

### Tick Implementation
```typescript
class TickProcessor {
  // Process global tick
  async processGlobalTick(): Promise<void> {
    const regions = await this.getActiveRegions();
    
    for (const region of regions) {
      await this.processRegionTick(region.id);
    }
  }
  
  // Process region tick
  async processRegionTick(regionId: string): Promise<void> {
    const cells = await this.getRegionCells(regionId);
    
    for (const cell of cells) {
      await this.processCellTick(cell);
    }
  }
  
  // Process individual cell
  async processCellTick(cell: Cell): Promise<void> {
    // Update production
    await this.updateProduction(cell);
    
    // Process decay
    await this.processDecay(cell);
    
    // Resolve conflicts
    await this.resolveConflicts(cell);
    
    // Update cell
    await this.updateCell(cell);
  }
}
```

## Production System

### Resource Generation
```typescript
interface ProductionRule {
  resourceId: ResourceId;
  baseRate: number;
  biomeModifier: number;
  buildingModifier: number;
  roadBonus: number;
  totalRate: number;
}

class ProductionCalculator {
  calculateProduction(cell: Cell): Map<ResourceId, number> {
    const production = new Map<ResourceId, number>();
    
    for (const building of cell.buildings) {
      const baseRate = building.productionRate;
      const biomeMod = this.getBiomeModifier(cell.biome, building.type);
      const roadBonus = this.getRoadBonus(cell, building);
      
      const totalRate = baseRate * (1 + biomeMod + roadBonus);
      production.set(building.resourceId, totalRate);
    }
    
    return production;
  }
  
  getBiomeModifier(biome: BiomeType, buildingType: BuildingType): number {
    const modifiers = {
      [BiomeType.PLAINS]: { FARM: 0.1, MINE: -0.1 },
      [BiomeType.FOREST]: { FARM: -0.1, LUMBER: 0.2 },
      [BiomeType.HILLS]: { MINE: 0.15, FARM: -0.2 },
      [BiomeType.MARSH]: { FARM: -0.2, MINE: -0.1 },
    };
    
    return modifiers[biome]?.[buildingType] || 0;
  }
}
```

### Storage Management
```typescript
interface StorageRule {
  resourceId: ResourceId;
  currentAmount: number;
  maxCapacity: number;
  decayRate: number;
  lastUpdate: Timestamp;
}

class StorageManager {
  updateStorage(cell: Cell, production: Map<ResourceId, number>): void {
    const now = Date.now();
    const timeDelta = (now - cell.lastTickTs) / 1000; // seconds
    
    for (const [resourceId, rate] of production) {
      const currentAmount = cell.storage.get(resourceId) || 0;
      const maxCapacity = this.getMaxCapacity(cell, resourceId);
      const decayRate = this.getDecayRate(resourceId);
      
      // Calculate new amount
      const productionGain = rate * timeDelta;
      const decayLoss = currentAmount * decayRate * timeDelta;
      const newAmount = Math.min(
        currentAmount + productionGain - decayLoss,
        maxCapacity
      );
      
      cell.storage.set(resourceId, newAmount);
    }
  }
}
```

## Points of Interest (POI)

### POI Types
```typescript
enum POIType {
  LANDMARK = 'LANDMARK',     // Historical sites
  PARK = 'PARK',             // Recreational areas
  COMMERCIAL = 'COMMERCIAL', // Shopping centers
  TRANSPORT = 'TRANSPORT',   // Transit hubs
  NATURAL = 'NATURAL',       // Natural features
  CULTURAL = 'CULTURAL'      // Cultural sites
}
```

### POI Integration
```typescript
interface POI {
  id: string;
  name: string;
  type: POIType;
  location: {
    lat: number;
    lng: number;
  };
  cellId: string;
  effects: POIEffect[];
  missions: Mission[];
  isActive: boolean;
}

interface POIEffect {
  type: 'PRODUCTION_BONUS' | 'STORAGE_BONUS' | 'MORALE_BONUS';
  value: number;
  radius: number;
  description: string;
}
```

## Weather & Events

### Weather System
```typescript
interface WeatherEvent {
  id: string;
  type: 'RAIN' | 'SNOW' | 'FOG' | 'STORM' | 'DROUGHT';
  intensity: number; // 0-1
  duration: number; // minutes
  regionId: string;
  effects: WeatherEffect[];
}

interface WeatherEffect {
  resourceId: ResourceId;
  modifier: number;
  description: string;
}
```

### Event Processing
```typescript
class EventProcessor {
  // Process weather events
  async processWeatherEvents(): Promise<void> {
    const activeEvents = await this.getActiveWeatherEvents();
    
    for (const event of activeEvents) {
      await this.applyWeatherEffects(event);
    }
  }
  
  // Apply weather effects to cells
  async applyWeatherEffects(event: WeatherEvent): Promise<void> {
    const affectedCells = await this.getCellsInRegion(event.regionId);
    
    for (const cell of affectedCells) {
      for (const effect of event.effects) {
        const currentProduction = cell.production.get(effect.resourceId) || 0;
        const modifiedProduction = currentProduction * (1 + effect.modifier);
        cell.production.set(effect.resourceId, modifiedProduction);
      }
    }
  }
}
```

## Anti-Cheat & Location Integrity

### Location Validation
```typescript
interface LocationCheck {
  userId: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
  };
  velocity: number; // km/h
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  trustScore: number;
}

class LocationValidator {
  validateLocation(check: LocationCheck): ValidationResult {
    // Check velocity limits
    if (check.velocity > 100) {
      return { valid: false, reason: 'VELOCITY_TOO_HIGH' };
    }
    
    // Check accuracy requirements
    if (check.location.accuracy > 25) {
      return { valid: false, reason: 'ACCURACY_TOO_LOW' };
    }
    
    // Check for teleportation
    if (check.lastLocation) {
      const distance = this.calculateDistance(
        check.lastLocation,
        check.location
      );
      const timeDelta = check.location.timestamp - check.lastLocation.timestamp;
      
      if (distance > 2000 && timeDelta < 30000) {
        return { valid: false, reason: 'TELEPORTATION_DETECTED' };
      }
    }
    
    return { valid: true };
  }
}
```

## Cell Discovery & Exploration

### Fog of War
```typescript
interface FogState {
  userId: string;
  cellId: string;
  state: 'UNKNOWN' | 'SCOUTED' | 'SURVEYED' | 'OWNED';
  lastUpdate: Timestamp;
  revealedBy: string; // Unit or action that revealed it
}

class FogManager {
  // Update fog state
  async updateFogState(userId: string, cellId: string, newState: FogState): Promise<void> {
    const currentState = await this.getFogState(userId, cellId);
    
    if (this.canUpdateFogState(currentState, newState)) {
      await this.setFogState(userId, cellId, newState);
    }
  }
  
  // Check if fog state can be updated
  canUpdateFogState(current: FogState, newState: FogState): boolean {
    const stateHierarchy = ['UNKNOWN', 'SCOUTED', 'SURVEYED', 'OWNED'];
    const currentLevel = stateHierarchy.indexOf(current.state);
    const newLevel = stateHierarchy.indexOf(newState.state);
    
    return newLevel >= currentLevel;
  }
}
```

## Performance Optimization

### Cell Caching
```typescript
class CellCache {
  private cache = new Map<string, Cell>();
  private lastUpdate = new Map<string, number>();
  
  // Get cell with caching
  async getCell(cellId: string): Promise<Cell> {
    const cached = this.cache.get(cellId);
    const lastUpdate = this.lastUpdate.get(cellId);
    const now = Date.now();
    
    // Return cached if recent
    if (cached && lastUpdate && (now - lastUpdate) < 300000) { // 5 minutes
      return cached;
    }
    
    // Fetch from server
    const cell = await this.fetchCellFromServer(cellId);
    this.cache.set(cellId, cell);
    this.lastUpdate.set(cellId, now);
    
    return cell;
  }
}
```

### Batch Processing
```typescript
class BatchProcessor {
  // Process multiple cells in batches
  async processCellsBatch(cells: Cell[]): Promise<void> {
    const batchSize = 100;
    const batches = this.chunkArray(cells, batchSize);
    
    for (const batch of batches) {
      await Promise.all(
        batch.map(cell => this.processCell(cell))
      );
    }
  }
  
  // Chunk array into batches
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```
