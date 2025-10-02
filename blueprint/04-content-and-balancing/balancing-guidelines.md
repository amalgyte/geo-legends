# Balancing Guidelines

## Balance Philosophy

### Core Principles
- **Fair Play**: All players have equal opportunities to succeed
- **Meaningful Choices**: Decisions have significant consequences
- **Risk vs Reward**: Higher risk activities provide better rewards
- **Progression**: Clear advancement paths without pay-to-win
- **Competition**: Balanced PvP and PvE content

### Balance Goals
- **Engagement**: Keep players interested and motivated
- **Retention**: Encourage long-term play and investment
- **Competition**: Maintain competitive integrity
- **Accessibility**: Allow new players to compete with veterans
- **Monetization**: Support fair monetization without pay-to-win

## Economic Balance

### Resource Economy
```typescript
interface ResourceBalance {
  // Production rates (per 5-minute tick)
  food: {
    baseRate: 4,        // Farm base production
    maxRate: 20,        // Maximum with all bonuses
    decayRate: 0.01,    // Daily decay rate
    storageCap: 1000    // Maximum storage
  },
  wood: {
    baseRate: 3,
    maxRate: 15,
    decayRate: 0.005,
    storageCap: 800
  },
  stone: {
    baseRate: 2,
    maxRate: 12,
    decayRate: 0.0,
    storageCap: 600
  },
  ore: {
    baseRate: 1,
    maxRate: 8,
    decayRate: 0.0,
    storageCap: 400
  }
}
```

### Production Scaling
```typescript
interface ProductionScaling {
  // Building level scaling
  buildingLevels: {
    1: { multiplier: 1.0, cost: 1.0 },
    2: { multiplier: 1.5, cost: 2.0 },
    3: { multiplier: 2.0, cost: 3.5 },
    4: { multiplier: 2.5, cost: 5.0 },
    5: { multiplier: 3.0, cost: 7.0 }
  },
  
  // Technology scaling
  techTiers: {
    1: { multiplier: 1.0, cost: 100 },
    2: { multiplier: 1.2, cost: 250 },
    3: { multiplier: 1.5, cost: 500 },
    4: { multiplier: 2.0, cost: 1000 },
    5: { multiplier: 2.5, cost: 2000 }
  }
}
```

### Storage Balance
```typescript
interface StorageBalance {
  // Storage capacity scaling
  baseStorage: {
    townCenter: 200,
    storageYard: 300,
    warehouse: 500,
    vault: 1000
  },
  
  // Storage efficiency
  efficiency: {
    basic: 1.0,      // 100% efficiency
    improved: 1.2,   // 120% efficiency
    advanced: 1.5,   // 150% efficiency
    master: 2.0      // 200% efficiency
  }
}
```

## Combat Balance

### Unit Balance
```typescript
interface UnitBalance {
  // Attack/Defense ratios
  infantry: {
    attack: 10,
    defense: 15,
    hp: 50,
    cost: 100,
    upkeep: 1
  },
  cavalry: {
    attack: 15,
    defense: 8,
    hp: 40,
    cost: 150,
    upkeep: 2
  },
  ranged: {
    attack: 12,
    defense: 6,
    hp: 30,
    cost: 120,
    upkeep: 1.5
  },
  siege: {
    attack: 25,
    defense: 5,
    hp: 60,
    cost: 300,
    upkeep: 3
  }
}
```

### Formation Balance
```typescript
interface FormationBalance {
  // Formation effectiveness
  line: {
    attackMult: 1.0,
    defenseMult: 1.0,
    speedMult: 1.0,
    moraleImpact: 0.0
  },
  phalanx: {
    attackMult: 0.9,
    defenseMult: 1.2,
    speedMult: 0.8,
    moraleImpact: -0.05
  },
  cavalryCharge: {
    attackMult: 1.3,
    defenseMult: 0.7,
    speedMult: 1.2,
    moraleImpact: 0.1
  }
}
```

### Morale System
```typescript
interface MoraleBalance {
  // Morale thresholds
  thresholds: {
    excellent: 80,    // +20% effectiveness
    good: 60,         // +10% effectiveness
    average: 40,       // Base effectiveness
    poor: 20,         // -10% effectiveness
    critical: 0        // -20% effectiveness
  },
  
  // Morale modifiers
  modifiers: {
    victory: 5,       // +5 morale per victory
    defeat: -10,       // -10 morale per defeat
    losses: -2,       // -2 morale per unit lost
    commander: 0.1,   // +10% morale per leadership point
    terrain: 0.05      // +5% morale per terrain bonus
  }
}
```

## Athletic Balance

### Team Rating System
```typescript
interface TeamRatingBalance {
  // Rating calculation
  baseRating: 1000,   // Starting rating
  maxRating: 2000,    // Maximum rating
  minRating: 0,       // Minimum rating
  
  // Rating changes
  ratingChanges: {
    win: 12,          // +12 rating per win
    loss: -8,         // -8 rating per loss
    draw: 2,           // +2 rating per draw
    streak: 2          // +2 rating per win streak
  },
  
  // Matchmaking
  matchmaking: {
    ratingRange: 200, // ±200 rating range
    maxWait: 300,     // 5 minutes max wait
    minPlayers: 2     // Minimum players for match
  }
}
```

### Training Balance
```typescript
interface TrainingBalance {
  // Training rates
  baseTraining: 1.0,  // Base training rate
  maxTraining: 3.0,   // Maximum training rate
  
  // Training bonuses
  bonuses: {
    arena: 0.1,       // +10% per arena level
    commander: 0.05,  // +5% per charisma point
    technology: 0.2,  // +20% from tech
    building: 0.15    // +15% from training facilities
  },
  
  // Training costs
  costs: {
    base: 10,         // Base cost per training
    multiplier: 1.1,  // 10% increase per level
    maxCost: 100      // Maximum cost per training
  }
}
```

## Progression Balance

### Technology Tree
```typescript
interface TechTreeBalance {
  // Research costs
  researchCosts: {
    tier1: 100,       // Tier 1 research cost
    tier2: 250,      // Tier 2 research cost
    tier3: 500,      // Tier 3 research cost
    tier4: 1000,     // Tier 4 research cost
    tier5: 2000      // Tier 5 research cost
  },
  
  // Research times
  researchTimes: {
    tier1: 1200,     // 20 minutes
    tier2: 2400,     // 40 minutes
    tier3: 4800,     // 80 minutes
    tier4: 9600,     // 160 minutes
    tier5: 19200     // 320 minutes
  },
  
  // Prerequisites
  prerequisites: {
    maxPrereqs: 3,   // Maximum prerequisites
    crossTier: 1,    // Can depend on previous tier
    sameTier: 2      // Can depend on same tier
  }
}
```

### Building Progression
```typescript
interface BuildingProgression {
  // Building costs
  costScaling: {
    level2: 2.0,     // 2x cost for level 2
    level3: 3.5,     // 3.5x cost for level 3
    level4: 5.0,     // 5x cost for level 4
    level5: 7.0      // 7x cost for level 5
  },
  
  // Building times
  timeScaling: {
    level2: 1.5,     // 1.5x time for level 2
    level3: 2.0,     // 2x time for level 3
    level4: 2.5,    // 2.5x time for level 4
    level5: 3.0      // 3x time for level 5
  },
  
  // Building benefits
  benefitScaling: {
    level2: 1.5,     // 1.5x benefits for level 2
    level3: 2.0,     // 2x benefits for level 3
    level4: 2.5,     // 2.5x benefits for level 4
    level5: 3.0      // 3x benefits for level 5
  }
}
```

## PvP Balance

### Raid Balance
```typescript
interface RaidBalance {
  // Raid cooldowns
  cooldowns: {
    attacker: 900,    // 15 minutes attacker cooldown
    defender: 600,    // 10 minutes defender cooldown
    region: 300       // 5 minutes region cooldown
  },
  
  // Raid rewards
  rewards: {
    baseLoot: 0.1,    // 10% of defender's resources
    maxLoot: 0.3,     // 30% maximum loot
    prestige: 3,      // 3 prestige per raid win
    experience: 10    // 10 experience per raid win
  },
  
  // Raid costs
  costs: {
    baseCost: 50,     // Base resource cost
    unitCost: 10,     // Cost per unit
    siegeCost: 100    // Cost per siege engine
  }
}
```

### Competition Balance
```typescript
interface CompetitionBalance {
  // Match rewards
  rewards: {
    win: 5,           // 5 prestige per win
    loss: 1,          // 1 prestige per loss
    draw: 2,          // 2 prestige per draw
    streak: 2         // 2 bonus prestige per streak
  },
  
  // Match costs
  costs: {
    entry: 10,        // 10 prestige entry cost
    training: 5,      // 5 prestige training cost
    equipment: 20     // 20 prestige equipment cost
  },
  
  // Match frequency
  frequency: {
    daily: 5,         // 5 matches per day
    weekly: 25,       // 25 matches per week
    monthly: 100      // 100 matches per month
  }
}
```

## Monetization Balance

### Premium Currency
```typescript
interface PremiumBalance {
  // Premium currency rates
  rates: {
    daily: 10,        // 10 premium currency per day
    weekly: 50,       // 50 premium currency per week
    monthly: 200      // 200 premium currency per month
  },
  
  // Premium purchases
  purchases: {
    small: 100,       // $1.00 for 100 premium
    medium: 500,      // $5.00 for 500 premium
    large: 1000,      // $10.00 for 1000 premium
    huge: 2500        // $25.00 for 2500 premium
  },
  
  // Premium usage
  usage: {
    speedUp: 10,      // 10 premium to speed up 1 hour
    skip: 50,         // 50 premium to skip 1 day
    bonus: 100        // 100 premium for 2x bonus
  }
}
```

### Season Pass
```typescript
interface SeasonPassBalance {
  // Season pass rewards
  rewards: {
    free: {
      prestige: 100,   // 100 prestige
      cosmetics: 5,   // 5 cosmetic items
      resources: 500  // 500 resources
    },
    premium: {
      prestige: 300,  // 300 prestige
      cosmetics: 15, // 15 cosmetic items
      resources: 1500, // 1500 resources
      exclusive: 3    // 3 exclusive items
    }
  },
  
  // Season pass costs
  costs: {
    premium: 1000,    // 1000 premium currency
    duration: 30      // 30 days duration
  }
}
```

## Balance Testing

### Automated Testing
```typescript
class BalanceTester {
  // Test resource balance
  async testResourceBalance(): Promise<BalanceTestResult> {
    const tests = [
      this.testProductionRates,
      this.testStorageCapacity,
      this.testResourceDecay,
      this.testResourceConversion
    ];
    
    const results = await Promise.all(tests.map(test => test()));
    return this.aggregateResults(results);
  }
  
  // Test combat balance
  async testCombatBalance(): Promise<BalanceTestResult> {
    const tests = [
      this.testUnitEffectiveness,
      this.testFormationBalance,
      this.testMoraleSystem,
      this.testSiegeBalance
    ];
    
    const results = await Promise.all(tests.map(test => test()));
    return this.aggregateResults(results);
  }
  
  // Test progression balance
  async testProgressionBalance(): Promise<BalanceTestResult> {
    const tests = [
      this.testTechnologyTree,
      this.testBuildingProgression,
      this.testUnitProgression,
      this.testCommanderProgression
    ];
    
    const results = await Promise.all(tests.map(test => test()));
    return this.aggregateResults(results);
  }
}
```

### Player Feedback
```typescript
class BalanceFeedback {
  // Collect player feedback
  async collectFeedback(
    playerId: string,
    feedback: BalanceFeedback
  ): Promise<void> {
    const feedbackData = {
      playerId,
      timestamp: Date.now(),
      category: feedback.category,
      rating: feedback.rating,
      comments: feedback.comments,
      suggestions: feedback.suggestions
    };
    
    await this.saveFeedback(feedbackData);
  }
  
  // Analyze feedback trends
  async analyzeFeedbackTrends(): Promise<FeedbackAnalysis> {
    const feedback = await this.getAllFeedback();
    
    return {
      overallRating: this.calculateOverallRating(feedback),
      categoryRatings: this.calculateCategoryRatings(feedback),
      commonIssues: this.identifyCommonIssues(feedback),
      improvementSuggestions: this.generateSuggestions(feedback)
    };
  }
}
```

## Balance Updates

### Update Process
```typescript
class BalanceUpdate {
  // Plan balance update
  async planBalanceUpdate(
    changes: BalanceChange[]
  ): Promise<BalanceUpdatePlan> {
    const plan = {
      id: this.generateUpdateId(),
      changes,
      impact: await this.analyzeImpact(changes),
      rollout: await this.planRollout(changes),
      monitoring: await this.planMonitoring(changes)
    };
    
    return plan;
  }
  
  // Execute balance update
  async executeBalanceUpdate(
    updateId: string
  ): Promise<void> {
    const plan = await this.getBalanceUpdatePlan(updateId);
    
    // Apply changes
    for (const change of plan.changes) {
      await this.applyBalanceChange(change);
    }
    
    // Monitor impact
    await this.startMonitoring(plan.monitoring);
  }
  
  // Rollback balance update
  async rollbackBalanceUpdate(
    updateId: string
  ): Promise<void> {
    const plan = await this.getBalanceUpdatePlan(updateId);
    
    // Revert changes
    for (const change of plan.changes) {
      await this.revertBalanceChange(change);
    }
    
    // Stop monitoring
    await this.stopMonitoring(plan.monitoring);
  }
}
```
