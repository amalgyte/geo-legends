# Data Models

## Core Entity Models

### User Model
```typescript
interface User {
  uid: string;
  displayName: string;
  trustScore: number;
  clubId?: string;
  inventory: Map<ItemId, number>;
  homeCellId: string;
  lastKnownLoc: {
    lat: number;
    lng: number;
    ts: number;
  };
  goreToggle: boolean;
  createdAt: Timestamp;
  lastActive: Timestamp;
}
```

### Cell Model
```typescript
interface Cell {
  cellId: string;
  level: number;
  biome: string;
  regionId: string;
  ownerUid?: string;
  baseLevel: number;
  production: Map<ResourceId, number>;
  storage: Map<ResourceId, number>;
  conflictState: 'peace' | 'raid' | 'war';
  lastTickTs: Timestamp;
  adjacentCells: string[];
  influenceRadius: number;
}
```

### Base Model
```typescript
interface Base {
  baseId: string;
  cellId: string;
  ownerUid: string;
  level: number;
  buildings: Building[];
  production: Map<ResourceId, number>;
  storage: Map<ResourceId, number>;
  defenses: Defense[];
  lastUpdate: Timestamp;
  protectionWindow?: Timestamp;
}
```

### Building Model
```typescript
interface Building {
  id: string;
  type: BuildingType;
  level: number;
  position: { x: number; y: number };
  production: Map<ResourceId, number>;
  storage: Map<ResourceId, number>;
  effects: Effect[];
  buildTime: number;
  buildStart?: Timestamp;
  buildEnd?: Timestamp;
  isActive: boolean;
}
```

### Action Intent Model
```typescript
interface ActionIntent {
  id: string;
  uid: string;
  type: ActionType;
  targetId: string;
  createdTs: Timestamp;
  expiresTs: Timestamp;
  status: 'queued' | 'applied' | 'rejected' | 'superseded';
  loc: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  data?: any; // Additional intent-specific data
}
```

### Raid Window Model
```typescript
interface RaidWindow {
  id: string;
  attackerUid: string;
  defenderBaseId: string;
  startTs: Timestamp;
  endTs: Timestamp;
  state: 'scheduled' | 'active' | 'resolved' | 'expired';
  raidType: 'skirmish' | 'siege' | 'raid';
  participants: RaidParticipant[];
  result?: RaidResult;
}
```

## Resource Models

### Resource Definition
```typescript
interface ResourceDefinition {
  id: ResourceId;
  name: string;
  category: 'primary' | 'secondary' | 'special';
  baseValue: number;
  stackSize: number;
  decayRate?: number;
  description: string;
}
```

### Resource Production
```typescript
interface ResourceProduction {
  resourceId: ResourceId;
  baseRate: number;
  multipliers: Map<string, number>;
  totalRate: number;
  lastCollected: Timestamp;
  accumulated: number;
}
```

## Unit Models

### Unit Definition
```typescript
interface UnitDefinition {
  id: UnitId;
  name: string;
  role: 'INFANTRY' | 'CAVALRY' | 'RANGED' | 'SIEGE' | 'SUPPORT';
  tier: number;
  stats: UnitStats;
  cost: Map<ResourceId, number>;
  buildTime: number;
  upkeep: Map<ResourceId, number>;
  abilities: UnitAbility[];
  requirements: Requirement[];
}
```

### Unit Instance
```typescript
interface UnitInstance {
  id: string;
  definitionId: UnitId;
  ownerUid: string;
  baseId: string;
  level: number;
  experience: number;
  health: number;
  status: 'active' | 'wounded' | 'training' | 'deployed';
  location: {
    cellId: string;
    x: number;
    y: number;
  };
  orders?: UnitOrder[];
}
```

### Unit Stats
```typescript
interface UnitStats {
  attack: number;
  defense: number;
  health: number;
  speed: number;
  carry: number;
  vision: number;
  morale: number;
}
```

## Technology Models

### Technology Definition
```typescript
interface TechnologyDefinition {
  id: TechnologyId;
  name: string;
  tier: number;
  prerequisites: TechnologyId[];
  cost: Map<ResourceId, number>;
  researchTime: number;
  effects: TechnologyEffect[];
  description: string;
}
```

### Technology Effect
```typescript
interface TechnologyEffect {
  type: 'unlock_building' | 'unlock_unit' | 'production_bonus' | 'storage_bonus';
  target: string;
  value: number;
  duration?: number;
}
```

## Combat Models

### Battle Model
```typescript
interface Battle {
  id: string;
  attackerUid: string;
  defenderUid: string;
  attackerBaseId: string;
  defenderBaseId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  result: 'attacker_win' | 'defender_win' | 'draw';
  participants: BattleParticipant[];
  rounds: BattleRound[];
  loot: Map<ResourceId, number>;
  casualties: Map<UnitId, number>;
}
```

### Battle Participant
```typescript
interface BattleParticipant {
  uid: string;
  baseId: string;
  units: UnitInstance[];
  formations: Formation[];
  commander?: Commander;
  morale: number;
  bonuses: Map<string, number>;
}
```

### Battle Round
```typescript
interface BattleRound {
  roundNumber: number;
  attacker: {
    power: number;
    losses: Map<UnitId, number>;
  };
  defender: {
    power: number;
    losses: Map<UnitId, number>;
  };
  morale: {
    attacker: number;
    defender: number;
  };
  specialEvents: string[];
}
```

## Athletic Models

### Team Model
```typescript
interface Team {
  id: string;
  name: string;
  sportType: 'FOOTBALL' | 'ARCHERY' | 'RACING' | 'ORIENTEERING';
  ownerUid: string;
  baseId: string;
  rating: number;
  training: number;
  level: number;
  wins: number;
  losses: number;
  draws: number;
  lastMatch: Timestamp;
}
```

### Match Model
```typescript
interface Match {
  id: string;
  type: 'FRIENDLY' | 'CUP' | 'LEAGUE' | 'CHAMPIONSHIP';
  seasonId?: string;
  homeTeam: string;
  awayTeam: string;
  scheduledTime: Timestamp;
  startTime?: Timestamp;
  endTime?: Timestamp;
  result?: {
    homeScore: number;
    awayScore: number;
    winner: string;
  };
  attendance: {
    home: boolean;
    away: boolean;
  };
  prestige: {
    home: number;
    away: number;
  };
}
```

## Content Models

### Content Pack
```typescript
interface ContentPack {
  version: string;
  files: ContentFile[];
  checksum: string;
  publishedAt: Timestamp;
  isActive: boolean;
}
```

### Content File
```typescript
interface ContentFile {
  name: string;
  type: 'buildings' | 'units' | 'tech' | 'biomes' | 'events';
  sha256: string;
  size: number;
  lastModified: Timestamp;
}
```

## Event Models

### Game Event
```typescript
interface GameEvent {
  id: string;
  name: string;
  type: 'WEATHER' | 'SEASONAL' | 'COMPETITION' | 'DISASTER';
  startTime: Timestamp;
  endTime: Timestamp;
  regionId?: string;
  effects: EventEffect[];
  conditions: EventCondition[];
  isActive: boolean;
}
```

### Event Effect
```typescript
interface EventEffect {
  type: 'PRODUCTION_BONUS' | 'PRODUCTION_PENALTY' | 'MORALE_BONUS' | 'MORALE_PENALTY';
  target: string;
  value: number;
  duration: number;
}
```

## Analytics Models

### Gameplay Event
```typescript
interface GameplayEvent {
  id: string;
  uid: string;
  eventType: string;
  timestamp: Timestamp;
  data: Map<string, any>;
  sessionId: string;
  version: string;
}
```

### Performance Metric
```typescript
interface PerformanceMetric {
  id: string;
  metricName: string;
  value: number;
  timestamp: Timestamp;
  regionId?: string;
  userId?: string;
  metadata: Map<string, any>;
}
```

## Relationship Models

### Club Model
```typescript
interface Club {
  id: string;
  name: string;
  description: string;
  members: string[];
  leader: string;
  regionId: string;
  prestige: number;
  level: number;
  benefits: ClubBenefit[];
  createdAt: Timestamp;
  lastActive: Timestamp;
}
```

### Relationship Model
```typescript
interface Relationship {
  id: string;
  fromUid: string;
  toUid: string;
  type: 'ally' | 'enemy' | 'neutral' | 'trade';
  status: 'active' | 'pending' | 'expired';
  createdTs: Timestamp;
  expiresTs?: Timestamp;
  terms: RelationshipTerms;
}
```

## Validation Schemas

### Data Validation
```typescript
// Zod schemas for runtime validation
const UserSchema = z.object({
  uid: z.string().min(1),
  displayName: z.string().min(1).max(50),
  trustScore: z.number().min(0).max(100),
  clubId: z.string().optional(),
  inventory: z.record(z.string(), z.number()),
  homeCellId: z.string(),
  lastKnownLoc: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    ts: z.number(),
  }),
  goreToggle: z.boolean(),
});

const CellSchema = z.object({
  cellId: z.string(),
  level: z.number().min(1).max(20),
  biome: z.enum(['PLAINS', 'FOREST', 'HILLS', 'MARSH', 'DESERT']),
  regionId: z.string(),
  ownerUid: z.string().optional(),
  baseLevel: z.number().min(0).max(10),
  production: z.record(z.string(), z.number()),
  storage: z.record(z.string(), z.number()),
  conflictState: z.enum(['peace', 'raid', 'war']),
  lastTickTs: z.date(),
});
```

## Database Indexes

### Firestore Indexes
```typescript
// Composite indexes for efficient queries
const indexes = [
  // Users by region and activity
  {
    collection: 'users',
    fields: ['regionId', 'lastActive'],
    order: ['regionId', 'lastActive']
  },
  
  // Cells by region and level
  {
    collection: 'cells',
    fields: ['regionId', 'level'],
    order: ['regionId', 'level']
  },
  
  // Actions by user and status
  {
    collection: 'actions',
    fields: ['uid', 'status'],
    order: ['uid', 'status']
  },
  
  // Raids by time and state
  {
    collection: 'raids',
    fields: ['startTs', 'state'],
    order: ['startTs', 'state']
  }
];
```

## Data Migration

### Version Management
```typescript
interface DataMigration {
  version: string;
  description: string;
  up: (db: Firestore) => Promise<void>;
  down: (db: Firestore) => Promise<void>;
  dependencies: string[];
}

const migrations: DataMigration[] = [
  {
    version: '1.0.0',
    description: 'Initial schema',
    up: async (db) => {
      // Create initial collections
    },
    down: async (db) => {
      // Rollback initial schema
    },
    dependencies: []
  }
];
```
