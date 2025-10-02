# Content Authoring System

## Overview

All gameplay content is configured by admin JSON files with versioning and hot-reload capabilities. This allows for rapid content updates without client updates and enables data-driven game design.

## Content Storage & Versioning

### Content Structure
```
/content/
├── v0_0_1/
│   ├── manifest.json
│   ├── buildings.json
│   ├── units.json
│   ├── tech.json
│   ├── biomes.json
│   ├── events.json
│   ├── rewards.json
│   ├── commanders.json
│   ├── formations.json
│   ├── siege.json
│   └── teams.json
├── v0_0_2/
│   └── ...
└── meta/
    ├── currentVersion
    ├── prevVersions
    └── rolloutPercent
```

### Content Manifest
```typescript
interface ContentManifest {
  version: string;
  files: ContentFile[];
  checksum: string;
  publishedAt: Timestamp;
  isActive: boolean;
}

interface ContentFile {
  name: string;
  type: ContentType;
  sha256: string;
  size: number;
  lastModified: Timestamp;
}

enum ContentType {
  BUILDINGS = 'BUILDINGS',
  UNITS = 'UNITS',
  TECH = 'TECH',
  BIOMES = 'BIOMES',
  EVENTS = 'EVENTS',
  REWARDS = 'REWARDS',
  COMMANDERS = 'COMMANDERS',
  FORMATIONS = 'FORMATIONS',
  SIEGE = 'SIEGE',
  TEAMS = 'TEAMS'
}
```

## Content Loading System

### Server-Side Loading
```typescript
class ContentLoader {
  private contentCache = new Map<string, any>();
  private currentVersion: string;
  
  // Load content at startup
  async loadContent(): Promise<void> {
    const meta = await this.getContentMeta();
    this.currentVersion = meta.currentVersion;
    
    const manifest = await this.loadManifest(this.currentVersion);
    
    for (const file of manifest.files) {
      const content = await this.loadContentFile(file);
      this.contentCache.set(file.type, content);
    }
  }
  
  // Load specific content file
  async loadContentFile(file: ContentFile): Promise<any> {
    const content = await this.downloadContentFile(file);
    const validated = await this.validateContent(content, file.type);
    return validated;
  }
  
  // Validate content against schema
  async validateContent(content: any, type: ContentType): Promise<any> {
    const schema = this.getContentSchema(type);
    const result = await this.validateAgainstSchema(content, schema);
    
    if (!result.valid) {
      throw new Error(`Content validation failed: ${result.errors}`);
    }
    
    return content;
  }
}
```

### Client-Side Loading
```dart
class ContentManager {
  final Map<String, dynamic> _contentCache = {};
  String _currentVersion = '';
  
  // Load content from server
  Future<void> loadContent() async {
    final meta = await _apiClient.getContentMeta();
    _currentVersion = meta['currentVersion'];
    
    final manifest = await _apiClient.getContentManifest(_currentVersion);
    
    for (final file in manifest['files']) {
      final content = await _apiClient.getContentFile(file['name']);
      _contentCache[file['type']] = content;
    }
  }
  
  // Get content by type
  T getContent<T>(String type) {
    return _contentCache[type] as T;
  }
  
  // Check for content updates
  Future<bool> checkForUpdates() async {
    final meta = await _apiClient.getContentMeta();
    return meta['currentVersion'] != _currentVersion;
  }
}
```

## Content Schemas

### Building Schema
```json
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
}
```

### Unit Schema
```json
{
  "id": "unit_soldier",
  "name": "Soldier",
  "role": "INFANTRY",
  "tier": 1,
  "stats": {
    "attack": 10,
    "defense": 10,
    "hp": 50,
    "speedCellsPerHour": 6,
    "carry": 20
  },
  "cost": {"food": 50, "coin": 10},
  "buildTimeSec": 600,
  "upkeep": {"food": 1},
  "requires": {
    "tech": ["masonry_1"],
    "building": "barracks_basic"
  },
  "abilities": [
    {
      "type": "FLANKING_BONUS",
      "value": 1.2,
      "condition": "adjacent_to_cavalry"
    }
  ]
}
```

### Technology Schema
```json
{
  "id": "agri_1",
  "name": "Agriculture I",
  "tier": 1,
  "prereq": [],
  "cost": {"science": 80},
  "timeSec": 1200,
  "effects": [
    {"type": "UNLOCK_BUILDING", "id": "farm_basic"},
    {"type": "PROD_MULT", "resource": "food", "value": 1.1}
  ]
}
```

### Commander Schema
```json
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
  "requires": {"tech": ["governance_1"]},
  "personality": {
    "traits": ["aggressive", "loyal"],
    "dialogue": {
      "recruitment": ["I will lead your forces to victory!"],
      "victory": ["Another triumph for our cause!"]
    }
  }
}
```

## Content Validation

### Schema Validation
```typescript
class ContentValidator {
  // Validate building content
  validateBuilding(building: any): ValidationResult {
    const schema = {
      type: 'object',
      required: ['id', 'name', 'category', 'footprint', 'requires', 'build'],
      properties: {
        id: { type: 'string', pattern: '^[a-z_]+$' },
        name: { type: 'string', minLength: 1 },
        category: { type: 'string', enum: ['CIVIC', 'ECON', 'MIL', 'INFRA'] },
        footprint: {
          type: 'object',
          required: ['w', 'h'],
          properties: {
            w: { type: 'number', minimum: 1 },
            h: { type: 'number', minimum: 1 },
            buffer: { type: 'number', minimum: 0 }
          }
        }
      }
    };
    
    return this.validateAgainstSchema(building, schema);
  }
  
  // Validate unit content
  validateUnit(unit: any): ValidationResult {
    const schema = {
      type: 'object',
      required: ['id', 'name', 'role', 'tier', 'stats', 'cost'],
      properties: {
        id: { type: 'string', pattern: '^unit_[a-z_]+$' },
        name: { type: 'string', minLength: 1 },
        role: { type: 'string', enum: ['INFANTRY', 'CAVALRY', 'RANGED', 'SIEGE', 'SUPPORT'] },
        tier: { type: 'number', minimum: 1, maximum: 5 },
        stats: {
          type: 'object',
          required: ['attack', 'defense', 'hp', 'speed'],
          properties: {
            attack: { type: 'number', minimum: 0 },
            defense: { type: 'number', minimum: 0 },
            hp: { type: 'number', minimum: 1 },
            speed: { type: 'number', minimum: 0 }
          }
        }
      }
    };
    
    return this.validateAgainstSchema(unit, schema);
  }
}
```

## Content Hot-Reload

### Server-Side Hot-Reload
```typescript
class ContentHotReload {
  // Monitor content changes
  async monitorContentChanges(): Promise<void> {
    const watcher = fs.watch(this.contentPath, { recursive: true });
    
    watcher.on('change', async (eventType, filename) => {
      if (eventType === 'change' && filename.endsWith('.json')) {
        await this.reloadContentFile(filename);
      }
    });
  }
  
  // Reload specific content file
  async reloadContentFile(filename: string): Promise<void> {
    const fileType = this.getFileType(filename);
    const content = await this.loadContentFile(filename);
    const validated = await this.validateContent(content, fileType);
    
    this.contentCache.set(fileType, validated);
    
    // Notify clients of content update
    await this.notifyClientsOfContentUpdate(fileType);
  }
  
  // Notify clients of content update
  async notifyClientsOfContentUpdate(fileType: string): Promise<void> {
    const message = {
      type: 'CONTENT_UPDATE',
      fileType,
      timestamp: Date.now()
    };
    
    await this.broadcastToClients(message);
  }
}
```

### Client-Side Hot-Reload
```dart
class ContentHotReload {
  // Listen for content updates
  void listenForContentUpdates() {
    _websocketService.messageStream.listen((message) {
      if (message['type'] == 'CONTENT_UPDATE') {
        _handleContentUpdate(message);
      }
    });
  }
  
  // Handle content update
  Future<void> _handleContentUpdate(Map<String, dynamic> message) async {
    final fileType = message['fileType'];
    final timestamp = message['timestamp'];
    
    // Download updated content
    final content = await _apiClient.getContentFile(fileType);
    
    // Update local cache
    _contentCache[fileType] = content;
    
    // Notify UI of content update
    _contentUpdateController.add(fileType);
  }
}
```

## Content Rollback

### Rollback System
```typescript
class ContentRollback {
  // Rollback to previous version
  async rollbackToVersion(version: string): Promise<void> {
    const manifest = await this.loadManifest(version);
    
    // Validate rollback version
    if (!this.isValidRollbackVersion(version)) {
      throw new Error('Invalid rollback version');
    }
    
    // Load previous content
    for (const file of manifest.files) {
      const content = await this.loadContentFile(file);
      this.contentCache.set(file.type, content);
    }
    
    // Update meta
    await this.updateContentMeta({
      currentVersion: version,
      prevVersions: [...this.getPrevVersions(), this.currentVersion],
      rolloutPercent: 100
    });
    
    // Notify clients
    await this.notifyClientsOfRollback(version);
  }
  
  // Check if rollback is safe
  private isValidRollbackVersion(version: string): boolean {
    const prevVersions = this.getPrevVersions();
    return prevVersions.includes(version);
  }
}
```

## Content Analytics

### Content Usage Tracking
```typescript
class ContentAnalytics {
  // Track content usage
  async trackContentUsage(
    userId: string,
    contentType: string,
    contentId: string,
    action: string
  ): Promise<void> {
    const event = {
      userId,
      contentType,
      contentId,
      action,
      timestamp: Date.now(),
      sessionId: this.getSessionId(userId)
    };
    
    await this.logContentEvent(event);
  }
  
  // Get content usage statistics
  async getContentUsageStats(
    contentType: string,
    timeRange: TimeRange
  ): Promise<ContentUsageStats> {
    const events = await this.getContentEvents(contentType, timeRange);
    
    return {
      totalUsage: events.length,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
      popularContent: this.getPopularContent(events),
      usageTrends: this.getUsageTrends(events)
    };
  }
}
```

## Content Localization

### Localization System
```typescript
interface LocalizedContent {
  id: string;
  language: string;
  translations: Map<string, string>;
  lastUpdated: Timestamp;
}

class ContentLocalization {
  // Get localized content
  async getLocalizedContent(
    contentId: string,
    language: string
  ): Promise<any> {
    const baseContent = await this.getContent(contentId);
    const localizedContent = await this.getLocalization(contentId, language);
    
    return this.mergeContent(baseContent, localizedContent);
  }
  
  // Update localization
  async updateLocalization(
    contentId: string,
    language: string,
    translations: Map<string, string>
  ): Promise<void> {
    const localization: LocalizedContent = {
      id: contentId,
      language,
      translations,
      lastUpdated: new Date()
    };
    
    await this.saveLocalization(localization);
  }
}
```

## Content Testing

### Content Testing Framework
```typescript
class ContentTesting {
  // Test content balance
  async testContentBalance(content: any): Promise<BalanceTestResult> {
    const tests = [
      this.testResourceBalance,
      this.testPowerBalance,
      this.testProgressionBalance,
      this.testEconomicBalance
    ];
    
    const results = await Promise.all(
      tests.map(test => test(content))
    );
    
    return this.aggregateTestResults(results);
  }
  
  // Test resource balance
  private async testResourceBalance(content: any): Promise<TestResult> {
    const buildings = content.buildings || [];
    const units = content.units || [];
    
    // Check resource costs vs production
    for (const building of buildings) {
      const cost = building.build?.cost || {};
      const production = building.production?.perTick || {};
      
      // Validate cost vs production ratio
      if (this.isResourceImbalanced(cost, production)) {
        return {
          passed: false,
          message: `Building ${building.id} has imbalanced resource costs`
        };
      }
    }
    
    return { passed: true };
  }
}
```

## Content Deployment

### Deployment Pipeline
```typescript
class ContentDeployment {
  // Deploy content to staging
  async deployToStaging(version: string): Promise<void> {
    const content = await this.buildContent(version);
    await this.validateContent(content);
    await this.deployToEnvironment('staging', content);
  }
  
  // Deploy content to production
  async deployToProduction(version: string): Promise<void> {
    const content = await this.buildContent(version);
    await this.validateContent(content);
    await this.deployToEnvironment('production', content);
    
    // Update meta
    await this.updateContentMeta({
      currentVersion: version,
      prevVersions: [...this.getPrevVersions(), this.currentVersion],
      rolloutPercent: 100
    });
  }
  
  // Gradual rollout
  async gradualRollout(version: string, percent: number): Promise<void> {
    await this.updateContentMeta({
      currentVersion: version,
      rolloutPercent: percent
    });
    
    // Monitor rollout metrics
    await this.monitorRolloutMetrics(version, percent);
  }
}
```
