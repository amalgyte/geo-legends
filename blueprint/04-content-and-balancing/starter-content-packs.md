# Starter Content Packs

## Content Pack Overview

Starter content packs provide the initial game content for MVP testing and launch. All content is defined in JSON files with versioning and hot-reload capabilities.

## Content Pack Structure

### Version 0.0.1 Content Pack
```
/content/v0_0_1/
├── manifest.json
├── buildings.json
├── units.json
├── tech.json
├── biomes.json
├── events.json
├── rewards.json
├── commanders.json
├── formations.json
├── siege.json
└── teams.json
```

### Manifest File
```json
{
  "version": "v0_0_1",
  "files": [
    {"name": "buildings.json", "sha256": "TODO", "type": "BUILDINGS"},
    {"name": "units.json", "sha256": "TODO", "type": "UNITS"},
    {"name": "tech.json", "sha256": "TODO", "type": "TECH"},
    {"name": "biomes.json", "sha256": "TODO", "type": "BIOMES"},
    {"name": "events.json", "sha256": "TODO", "type": "EVENTS"},
    {"name": "rewards.json", "sha256": "TODO", "type": "REWARDS"},
    {"name": "commanders.json", "sha256": "TODO", "type": "COMMANDERS"},
    {"name": "formations.json", "sha256": "TODO", "type": "FORMATIONS"},
    {"name": "siege.json", "sha256": "TODO", "type": "SIEGE"},
    {"name": "teams.json", "sha256": "TODO", "type": "TEAMS"}
  ],
  "publishedAt": "2025-01-01T00:00:00Z",
  "isActive": true
}
```

## Buildings Content

### Core Buildings (6 entries)
```json
[
  {
    "id": "town_center",
    "name": "Town Center",
    "category": "CIVIC",
    "footprint": {"w": 3, "h": 3, "buffer": 1},
    "requires": {"tech": [], "settlementLevel": 1},
    "build": {"timeSec": 0, "cost": {}},
    "effects": [
      {"type": "UNLOCK", "item": "build.queue.slot", "value": 1},
      {"type": "STORAGE_CAP", "resource": "all", "value": 200}
    ],
    "upgrade": [
      {
        "level": 2,
        "timeSec": 3600,
        "cost": {"wood": 200, "stone": 150},
        "effects": [
          {"type": "UNLOCK", "item": "build.queue.slot", "value": 1},
          {"type": "STORAGE_CAP", "resource": "all", "value": 400}
        ]
      }
    ]
  },
  {
    "id": "farm_basic",
    "name": "Farm",
    "category": "ECON",
    "footprint": {"w": 2, "h": 2, "buffer": 0},
    "requires": {"tech": ["agri_1"], "settlementLevel": 1},
    "build": {"timeSec": 600, "cost": {"wood": 50, "stone": 10}},
    "production": {
      "perTick": {"food": 4},
      "biomeMods": [
        {"biome": "PLAINS", "mult": 1.1},
        {"biome": "MARSH", "mult": 0.8}
      ]
    },
    "roadAdjacencyBonus": 0.1,
    "upgrade": [
      {
        "level": 2,
        "timeSec": 1200,
        "cost": {"wood": 80, "stone": 20},
        "effects": [{"type": "PROD_MULT", "resource": "food", "value": 1.25}]
      }
    ]
  },
  {
    "id": "mine_basic",
    "name": "Mine",
    "category": "ECON",
    "footprint": {"w": 2, "h": 2, "buffer": 1},
    "requires": {"tech": ["mining_1"], "settlementLevel": 1},
    "build": {"timeSec": 900, "cost": {"wood": 40, "stone": 60}},
    "production": {
      "perTick": {"ore": 2},
      "biomeMods": [
        {"biome": "HILL", "mult": 1.2},
        {"biome": "PLAINS", "mult": 0.9}
      ]
    },
    "roadAdjacencyBonus": 0.05,
    "upgrade": [
      {
        "level": 2,
        "timeSec": 1500,
        "cost": {"wood": 70, "stone": 100},
        "effects": [{"type": "PROD_MULT", "resource": "ore", "value": 1.3}]
      }
    ]
  },
  {
    "id": "barracks_basic",
    "name": "Barracks",
    "category": "MIL",
    "footprint": {"w": 2, "h": 2, "buffer": 0},
    "requires": {"tech": ["masonry_1"], "settlementLevel": 1},
    "build": {"timeSec": 1200, "cost": {"wood": 120, "stone": 120}},
    "training": {"queue": 1, "rate": 1.0},
    "effects": [{"type": "UNLOCK_UNIT", "unitId": "unit_soldier"}]
  },
  {
    "id": "storage_yard",
    "name": "Storage Yard",
    "category": "CIVIC",
    "footprint": {"w": 2, "h": 2, "buffer": 0},
    "requires": {"tech": ["logistics_1"], "settlementLevel": 1},
    "build": {"timeSec": 900, "cost": {"wood": 80, "stone": 40}},
    "effects": [
      {"type": "STORAGE_CAP", "resource": "all", "value": 300}
    ]
  },
  {
    "id": "road_stone",
    "name": "Stone Road",
    "category": "INFRA",
    "footprint": {"w": 1, "h": 1, "buffer": 0},
    "requires": {"tech": ["masonry_1"], "settlementLevel": 1},
    "build": {"timeSec": 30, "cost": {"stone": 2}},
    "effects": [{"type": "ROAD_PATH", "value": 1}]
  }
]
```

## Units Content

### Core Units (3 entries)
```json
[
  {
    "id": "unit_pioneer",
    "name": "Pioneer",
    "role": "PIONEER",
    "speedCellsPerHour": 6,
    "carry": {"kits": 1},
    "actions": [
      {
        "id": "SURVEY",
        "timeSec": 300,
        "effects": [{"type": "REVEAL_CELL", "details": ["biome", "yields", "hazards"]}]
      },
      {
        "id": "FOUND_OUTPOST",
        "timeSec": 900,
        "requires": {"item": "outpost_kit"},
        "effects": [{"type": "CREATE_BASE", "level": 1}]
      }
    ],
    "upgrades": [
      {"level": 2, "effects": [{"type": "SPEED_MULT", "value": 1.15}]}
    ]
  },
  {
    "id": "unit_scout",
    "name": "Scout",
    "role": "SCOUT",
    "speedCellsPerHour": 10,
    "vision": 2,
    "actions": [
      {
        "id": "RECON",
        "timeSec": 240,
        "effects": [{"type": "REVEAL_ENEMY_SUMMARY", "ttlSec": 3600}]
      }
    ],
    "upgrades": [
      {"level": 2, "effects": [{"type": "VISION_RADIUS", "value": 1}]}
    ]
  },
  {
    "id": "unit_worker",
    "name": "Worker",
    "role": "WORKER",
    "speedCellsPerHour": 4,
    "actions": [
      {
        "id": "BOOST_BUILD",
        "timeSec": 600,
        "effects": [{"type": "BUILD_SPEED_MULT", "value": 1.2, "durationSec": 3600}]
      },
      {
        "id": "REPAIR",
        "timeSec": 600,
        "effects": [{"type": "REPAIR_BUILDING", "value": 100}]
      }
    ]
  }
]
```

## Technology Content

### Core Technologies (5 entries)
```json
[
  {
    "id": "agri_1",
    "name": "Agriculture I",
    "tier": 1,
    "prereq": [],
    "cost": {"science": 80},
    "timeSec": 1200,
    "effects": [{"type": "UNLOCK_BUILDING", "id": "farm_basic"}]
  },
  {
    "id": "mining_1",
    "name": "Mining I",
    "tier": 1,
    "prereq": [],
    "cost": {"science": 80},
    "timeSec": 1200,
    "effects": [{"type": "UNLOCK_BUILDING", "id": "mine_basic"}]
  },
  {
    "id": "masonry_1",
    "name": "Masonry I",
    "tier": 1,
    "prereq": [],
    "cost": {"science": 100},
    "timeSec": 1800,
    "effects": [
      {"type": "UNLOCK_BUILDING", "id": "barracks_basic"},
      {"type": "UNLOCK_BUILDING", "id": "road_stone"}
    ]
  },
  {
    "id": "logistics_1",
    "name": "Logistics I",
    "tier": 1,
    "prereq": ["masonry_1"],
    "cost": {"science": 120},
    "timeSec": 2400,
    "effects": [
      {"type": "UNLOCK_BUILDING", "id": "storage_yard"},
      {"type": "CARRY_MULT", "unitRole": "COURIER", "value": 1.25}
    ]
  },
  {
    "id": "cartography_1",
    "name": "Cartography",
    "tier": 1,
    "prereq": [],
    "cost": {"science": 100},
    "timeSec": 1800,
    "effects": [
      {"type": "FOG_RADIUS", "value": 1},
      {"type": "ADJACENCY_RULE", "value": "ALLOW_DIAGONAL"}
    ]
  }
]
```

## Biomes Content

### Core Biomes (3 entries)
```json
[
  {
    "id": "PLAINS",
    "name": "Plains",
    "tileTags": ["FREE", "ROAD"],
    "mods": [{"resource": "food", "mult": 1.1}],
    "description": "Open grasslands ideal for farming"
  },
  {
    "id": "FOREST",
    "name": "Forest",
    "tileTags": ["FREE", "HILL"],
    "mods": [{"resource": "wood", "mult": 1.2}],
    "description": "Dense woodlands rich in timber"
  },
  {
    "id": "MARSH",
    "name": "Marsh",
    "tileTags": ["FREE", "WATER"],
    "mods": [{"resource": "food", "mult": 0.8}],
    "description": "Wetlands with limited agricultural potential"
  }
]
```

## Events Content

### Core Events (2 entries)
```json
[
  {
    "id": "rain_showers",
    "name": "Rain Showers",
    "durationSec": 1800,
    "effects": [{"type": "PROD_MULT", "resource": "food", "value": 1.05}],
    "conditions": [{"type": "WEATHER", "value": "RAIN"}],
    "description": "Gentle rain improves crop growth"
  },
  {
    "id": "market_day",
    "name": "Market Day",
    "durationSec": 7200,
    "effects": [{"type": "COLLECT_BONUS", "resource": "all", "value": 1.1}],
    "conditions": [{"type": "WEEKDAY", "value": "SAT"}],
    "description": "Weekly market day increases resource collection"
  }
]
```

## Rewards Content

### Core Rewards
```json
{
  "prestige": {
    "raid_win": 3,
    "cup_win": 10,
    "cup_runner_up": 5
  },
  "lootTables": {
    "scout_recon": [
      {"item": "intel_fragment", "p": 0.6},
      {"item": "coin", "min": 5, "max": 15, "p": 0.4}
    ],
    "raid_victory": [
      {"resource": "coin", "min": 20, "max": 60, "p": 1.0}
    ]
  },
  "cosmetics": {
    "banners": ["oak_green", "iron_gray"],
    "road_vfx": ["dust_trail_light"]
  }
}
```

## Commanders Content

### Core Commanders (3 entries)
```json
[
  {
    "id": "commander_cassia",
    "name": "Cassia the Bold",
    "rarity": "RARE",
    "attributes": {
      "leadership": 10,
      "tactics": 5,
      "charisma": 0,
      "logistics": 2
    },
    "effects": [
      {"type": "MORALE_BUFF", "value": 0.1},
      {"type": "FORMATION_BONUS", "formationId": "phalanx", "value": 0.05}
    ],
    "requires": {"tech": ["governance_1"]}
  },
  {
    "id": "commander_marcus",
    "name": "Marcus the Builder",
    "rarity": "COMMON",
    "attributes": {
      "leadership": 5,
      "tactics": 3,
      "charisma": 8,
      "logistics": 12
    },
    "effects": [
      {"type": "BUILD_SPEED_MULT", "value": 1.2},
      {"type": "UPKEEP_REDUCTION", "value": 0.1}
    ],
    "requires": {"tech": ["masonry_1"]}
  },
  {
    "id": "commander_elena",
    "name": "Elena the Swift",
    "rarity": "UNCOMMON",
    "attributes": {
      "leadership": 7,
      "tactics": 8,
      "charisma": 6,
      "logistics": 4
    },
    "effects": [
      {"type": "SPEED_BONUS", "value": 1.15},
      {"type": "TRAINING_BONUS", "value": 1.1}
    ],
    "requires": {"tech": ["logistics_1"]}
  }
]
```

## Formations Content

### Core Formations (4 entries)
```json
[
  {
    "id": "line",
    "name": "Line Formation",
    "type": "LINE",
    "attackMult": 1.0,
    "defenseMult": 1.0,
    "speedMult": 1.0,
    "moraleImpact": 0.0,
    "requires": {"tech": []},
    "description": "Balanced formation for general combat"
  },
  {
    "id": "phalanx",
    "name": "Phalanx Formation",
    "type": "PHALANX",
    "attackMult": 0.9,
    "defenseMult": 1.2,
    "speedMult": 0.8,
    "moraleImpact": -0.05,
    "requires": {"tech": ["military_drill"]},
    "description": "Defensive formation with high protection"
  },
  {
    "id": "cavalry_charge",
    "name": "Cavalry Charge",
    "type": "CAVALRY_CHARGE",
    "attackMult": 1.3,
    "defenseMult": 0.7,
    "speedMult": 1.2,
    "moraleImpact": 0.1,
    "requires": {"tech": ["cavalry_training"]},
    "description": "Aggressive formation for mounted units"
  },
  {
    "id": "skirmish",
    "name": "Skirmish Formation",
    "type": "SKIRMISH",
    "attackMult": 1.1,
    "defenseMult": 0.8,
    "speedMult": 1.3,
    "moraleImpact": 0.05,
    "requires": {"tech": ["ranged_warfare"]},
    "description": "Mobile formation for hit-and-run tactics"
  }
]
```

## Siege Content

### Core Siege Engines (3 entries)
```json
[
  {
    "id": "battering_ram",
    "name": "Battering Ram",
    "role": "SIEGE",
    "stats": {
      "attack": 40,
      "defense": 20,
      "hp": 300,
      "speedCellsPerHour": 2
    },
    "abilities": [{"type": "BONUS_VS_GATE", "value": 2.0}],
    "cost": {"wood": 200, "ore": 100},
    "buildTimeSec": 3600,
    "requires": {"tech": ["engineering_1"], "building": "siege_workshop"}
  },
  {
    "id": "catapult",
    "name": "Catapult",
    "role": "SIEGE",
    "stats": {
      "attack": 60,
      "defense": 10,
      "hp": 200,
      "speedCellsPerHour": 1
    },
    "abilities": [{"type": "RANGED_ATTACK", "value": 3}],
    "cost": {"wood": 150, "ore": 200},
    "buildTimeSec": 4800,
    "requires": {"tech": ["engineering_2"], "building": "siege_workshop"}
  },
  {
    "id": "trebuchet",
    "name": "Trebuchet",
    "role": "SIEGE",
    "stats": {
      "attack": 100,
      "defense": 5,
      "hp": 150,
      "speedCellsPerHour": 0.5
    },
    "abilities": [{"type": "RANGED_ATTACK", "value": 5}],
    "cost": {"wood": 300, "ore": 400},
    "buildTimeSec": 7200,
    "requires": {"tech": ["engineering_3"], "building": "siege_workshop"}
  }
]
```

## Teams Content

### Core Sports Teams (3 entries)
```json
[
  {
    "id": "team_football_basic",
    "name": "Village FC",
    "sportType": "FOOTBALL",
    "trainingRate": 1.0,
    "prestigePerWin": 5,
    "requires": {"building": "arena_small", "tech": ["sports_infrastructure_1"]},
    "upgrades": [
      {"level": 2, "effects": [{"type": "TRAINING_MULT", "value": 1.2}]}
    ]
  },
  {
    "id": "team_archery_basic",
    "name": "Archers' Guild",
    "sportType": "ARCHERY",
    "trainingRate": 1.0,
    "prestigePerWin": 4,
    "requires": {"building": "archery_range", "tech": ["archery_training"]},
    "upgrades": [
      {"level": 2, "effects": [{"type": "TRAINING_MULT", "value": 1.15}]}
    ]
  },
  {
    "id": "team_racing_basic",
    "name": "Speed Demons",
    "sportType": "RACING",
    "trainingRate": 1.0,
    "prestigePerWin": 6,
    "requires": {"building": "race_track", "tech": ["racing_infrastructure"]},
    "upgrades": [
      {"level": 2, "effects": [{"type": "TRAINING_MULT", "value": 1.25}]}
    ]
  }
]
```

## Content Balancing Notes

### Production Balance
- **Tick = 5 minutes**; Farm yields 4 food/tick (≈48/hr) before bonuses
- **Town Center L1 cap 200** → encourages building Storage Yard early
- **Early research path**: `agri_1` → `masonry_1` → `logistics_1` (storage/carry) with `cartography_1` for diagonal expansion
- **Barracks present** but soldiers not required for MVP playtest

### Resource Economy
- **Food**: Primary resource, needed for population and unit upkeep
- **Wood**: Basic construction material, renewable resource
- **Stone**: Advanced construction, limited by biome
- **Ore**: Military and advanced construction, requires mining
- **Coin**: Trade currency, earned through competitions and raids
- **Science**: Research currency, generated by libraries and universities

### Progression Curve
- **Village Era**: Basic buildings, simple resources, 1-2 weeks
- **Township Era**: Advanced structures, complex production, 2-4 weeks
- **City Era**: Specialized districts, major projects, 4+ weeks

### Content Expansion
- **Seasonal Content**: New buildings, units, and technologies
- **Regional Content**: Location-specific buildings and events
- **Event Content**: Time-limited content and rewards
- **Community Content**: Player-created content and mods
