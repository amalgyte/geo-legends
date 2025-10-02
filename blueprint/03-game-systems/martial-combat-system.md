# Martial Combat System

## Combat Overview

### Combat Types
- **Skirmishes**: Small-scale tactical battles
- **Raids**: Resource-focused attacks
- **Sieges**: Fortified settlement attacks
- **Wars**: Large-scale territorial conflicts

### Combat Resolution
- **Autoresolve**: Server-calculated outcomes
- **Tactical Minigames**: Optional skill-based resolution
- **Formation Combat**: Strategic unit positioning
- **Morale System**: Unit morale affects performance

## Unit System

### Unit Roles
```typescript
enum UnitRole {
  INFANTRY = 'INFANTRY',     // Close combat, high defense
  CAVALRY = 'CAVALRY',       // Fast, flanking attacks
  RANGED = 'RANGED',         // Distance attacks, low defense
  SIEGE = 'SIEGE',           // Building destruction
  SUPPORT = 'SUPPORT'        // Healing, buffs, logistics
}
```

### Unit Definition
```typescript
interface UnitDefinition {
  id: UnitId;
  name: string;
  role: UnitRole;
  tier: number;
  stats: UnitStats;
  cost: Map<ResourceId, number>;
  buildTime: number;
  upkeep: Map<ResourceId, number>;
  abilities: UnitAbility[];
  requirements: Requirement[];
}

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

## Formation System

### Formation Types
```typescript
enum FormationType {
  LINE = 'LINE',             // Balanced attack/defense
  PHALANX = 'PHALANX',       // High defense, low mobility
  CAVALRY_CHARGE = 'CAVALRY_CHARGE', // High attack, low defense
  SIEGE_COLUMN = 'SIEGE_COLUMN',     // Siege focus
  SKIRMISH = 'SKIRMISH'      // Hit and run tactics
}
```

### Formation Definition
```typescript
interface FormationDefinition {
  id: string;
  name: string;
  type: FormationType;
  attackMultiplier: number;
  defenseMultiplier: number;
  speedMultiplier: number;
  moraleImpact: number;
  requirements: {
    technology: TechnologyId[];
    units: UnitRole[];
  };
  description: string;
}
```

### Formation Application
```typescript
class FormationManager {
  // Apply formation to units
  applyFormation(
    units: UnitInstance[],
    formation: FormationDefinition
  ): UnitInstance[] {
    return units.map(unit => ({
      ...unit,
      stats: {
        ...unit.stats,
        attack: unit.stats.attack * formation.attackMultiplier,
        defense: unit.stats.defense * formation.defenseMultiplier,
        speed: unit.stats.speed * formation.speedMultiplier,
        morale: unit.stats.morale + formation.moraleImpact
      }
    }));
  }
}
```

## Morale System

### Morale Calculation
```typescript
interface MoraleState {
  baseMorale: number;
  currentMorale: number;
  modifiers: MoraleModifier[];
  lastUpdate: Timestamp;
}

interface MoraleModifier {
  type: 'LOSSES' | 'VICTORY' | 'FORMATION' | 'TERRAIN' | 'COMMANDER';
  value: number;
  duration?: number;
  description: string;
}
```

### Morale Effects
```typescript
class MoraleManager {
  // Calculate morale for battle
  calculateBattleMorale(
    units: UnitInstance[],
    formation: FormationDefinition,
    terrain: TerrainType,
    commander?: Commander
  ): number {
    let baseMorale = 100;
    
    // Formation bonus/penalty
    baseMorale += formation.moraleImpact * 100;
    
    // Terrain bonus/penalty
    baseMorale += this.getTerrainMoraleBonus(terrain);
    
    // Commander bonus
    if (commander) {
      baseMorale += commander.leadership * 2;
    }
    
    // Unit experience bonus
    const avgExperience = units.reduce((sum, unit) => sum + unit.experience, 0) / units.length;
    baseMorale += avgExperience * 0.1;
    
    return Math.max(0, Math.min(100, baseMorale));
  }
  
  // Update morale during battle
  updateMorale(
    currentMorale: number,
    losses: number,
    victories: number
  ): number {
    let newMorale = currentMorale;
    
    // Losses reduce morale
    newMorale -= losses * 2;
    
    // Victories increase morale
    newMorale += victories * 1;
    
    return Math.max(0, Math.min(100, newMorale));
  }
}
```

## Autoresolve System

### Combat Calculation
```typescript
interface CombatResult {
  winner: 'attacker' | 'defender' | 'draw';
  casualties: {
    attacker: Map<UnitId, number>;
    defender: Map<UnitId, number>;
  };
  loot: Map<ResourceId, number>;
  morale: {
    attacker: number;
    defender: number;
  };
  duration: number;
  rounds: CombatRound[];
}

interface CombatRound {
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

### Autoresolve Implementation
```typescript
class AutoresolveEngine {
  // Resolve combat between two armies
  async resolveCombat(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    terrain: TerrainType,
    weather: WeatherType
  ): Promise<CombatResult> {
    const result: CombatResult = {
      winner: 'draw',
      casualties: new Map(),
      loot: new Map(),
      morale: {
        attacker: attacker.morale,
        defender: defender.morale
      },
      duration: 0,
      rounds: []
    };
    
    let round = 1;
    const maxRounds = 20;
    
    while (round <= maxRounds && this.canContinue(result)) {
      const roundResult = await this.simulateRound(
        attacker,
        defender,
        terrain,
        weather,
        round
      );
      
      result.rounds.push(roundResult);
      this.applyRoundResults(attacker, defender, roundResult);
      
      round++;
    }
    
    // Determine winner
    result.winner = this.determineWinner(attacker, defender);
    result.duration = round;
    
    return result;
  }
  
  // Simulate single combat round
  private async simulateRound(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    terrain: TerrainType,
    weather: WeatherType,
    round: number
  ): Promise<CombatRound> {
    // Calculate attack power
    const attackerPower = this.calculateAttackPower(attacker, terrain, weather);
    const defenderPower = this.calculateDefensePower(defender, terrain, weather);
    
    // Calculate damage
    const attackerDamage = this.calculateDamage(attackerPower, defenderPower);
    const defenderDamage = this.calculateDamage(defenderPower, attackerPower);
    
    // Apply casualties
    const attackerLosses = this.applyCasualties(attacker, attackerDamage);
    const defenderLosses = this.applyCasualties(defender, defenderDamage);
    
    // Update morale
    const attackerMorale = this.updateMorale(attacker.morale, attackerLosses, defenderLosses);
    const defenderMorale = this.updateMorale(defender.morale, defenderLosses, attackerLosses);
    
    return {
      roundNumber: round,
      attacker: {
        power: attackerPower,
        losses: attackerLosses
      },
      defender: {
        power: defenderPower,
        losses: defenderLosses
      },
      morale: {
        attacker: attackerMorale,
        defender: defenderMorale
      },
      specialEvents: this.generateSpecialEvents(attacker, defender, terrain, weather)
    };
  }
}
```

## Siege Mechanics

### Fortification Types
```typescript
enum FortificationType {
  PALISADE = 'PALISADE',     // Basic wooden walls
  STONE_WALL = 'STONE_WALL', // Stone walls
  FORTRESS = 'FORTRESS',     // Advanced fortifications
  CITADEL = 'CITADEL'        // Maximum defense
}

interface Fortification {
  id: string;
  type: FortificationType;
  level: number;
  health: number;
  maxHealth: number;
  defenseBonus: number;
  effects: FortificationEffect[];
}
```

### Siege Engines
```typescript
enum SiegeEngineType {
  BATTERING_RAM = 'BATTERING_RAM',
  CATAPULT = 'CATAPULT',
  TREBUCHET = 'TREBUCHET',
  SIEGE_TOWER = 'SIEGE_TOWER'
}

interface SiegeEngine {
  id: string;
  type: SiegeEngineType;
  attack: number;
  defense: number;
  health: number;
  speed: number;
  abilities: SiegeAbility[];
  cost: Map<ResourceId, number>;
  buildTime: number;
}
```

### Siege Combat
```typescript
class SiegeCombat {
  // Calculate siege effectiveness
  calculateSiegeEffectiveness(
    attackers: UnitInstance[],
    defenders: UnitInstance[],
    fortifications: Fortification[],
    siegeEngines: SiegeEngine[]
  ): SiegeResult {
    // Calculate fortification defense
    const fortificationDefense = this.calculateFortificationDefense(fortifications);
    
    // Calculate siege engine effectiveness
    const siegeEffectiveness = this.calculateSiegeEffectiveness(siegeEngines, fortifications);
    
    // Calculate unit effectiveness
    const attackerPower = this.calculateUnitPower(attackers);
    const defenderPower = this.calculateUnitPower(defenders);
    
    // Apply siege modifiers
    const modifiedAttackerPower = attackerPower * siegeEffectiveness;
    const modifiedDefenderPower = defenderPower * (1 + fortificationDefense);
    
    return {
      attackerPower: modifiedAttackerPower,
      defenderPower: modifiedDefenderPower,
      siegeEffectiveness,
      fortificationDefense
    };
  }
}
```

## Raid System

### Raid Types
```typescript
enum RaidType {
  SKIRMISH = 'SKIRMISH',     // Quick hit and run
  RAID = 'RAID',             // Resource-focused attack
  SIEGE = 'SIEGE',           // Fortified settlement attack
  WAR = 'WAR'                // Large-scale conflict
}
```

### Raid Window
```typescript
interface RaidWindow {
  id: string;
  attackerUid: string;
  defenderBaseId: string;
  startTs: Timestamp;
  endTs: Timestamp;
  state: 'scheduled' | 'active' | 'resolved' | 'expired';
  raidType: RaidType;
  participants: RaidParticipant[];
  result?: RaidResult;
}
```

### Raid Processing
```typescript
class RaidManager {
  // Create raid window
  async createRaidWindow(
    attackerUid: string,
    defenderBaseId: string,
    raidType: RaidType
  ): Promise<RaidWindow> {
    const now = Date.now();
    const duration = this.getRaidDuration(raidType);
    
    const raidWindow: RaidWindow = {
      id: this.generateRaidId(),
      attackerUid,
      defenderBaseId,
      startTs: new Date(now),
      endTs: new Date(now + duration),
      state: 'scheduled',
      raidType,
      participants: []
    };
    
    await this.saveRaidWindow(raidWindow);
    await this.scheduleRaidStart(raidWindow);
    
    return raidWindow;
  }
  
  // Process raid resolution
  async resolveRaid(raidWindow: RaidWindow): Promise<RaidResult> {
    const attacker = await this.getRaidParticipant(raidWindow.attackerUid);
    const defender = await this.getRaidParticipant(raidWindow.defenderBaseId);
    
    // Resolve combat
    const combatResult = await this.resolveCombat(attacker, defender);
    
    // Apply results
    await this.applyRaidResults(raidWindow, combatResult);
    
    // Update raid window
    raidWindow.state = 'resolved';
    raidWindow.result = combatResult;
    await this.updateRaidWindow(raidWindow);
    
    return combatResult;
  }
}
```

## Loot System

### Loot Calculation
```typescript
interface LootResult {
  resources: Map<ResourceId, number>;
  items: Map<ItemId, number>;
  experience: number;
  prestige: number;
  casualties: Map<UnitId, number>;
}

class LootCalculator {
  // Calculate loot from successful raid
  calculateLoot(
    attacker: BattleParticipant,
    defender: BattleParticipant,
    combatResult: CombatResult
  ): LootResult {
    const loot: LootResult = {
      resources: new Map(),
      items: new Map(),
      experience: 0,
      prestige: 0,
      casualties: new Map()
    };
    
    if (combatResult.winner === 'attacker') {
      // Calculate resource loot
      const resourceLoot = this.calculateResourceLoot(defender, combatResult);
      loot.resources = resourceLoot;
      
      // Calculate experience
      loot.experience = this.calculateExperience(attacker, defender, combatResult);
      
      // Calculate prestige
      loot.prestige = this.calculatePrestige(attacker, defender, combatResult);
    }
    
    // Calculate casualties
    loot.casualties = this.calculateCasualties(attacker, combatResult);
    
    return loot;
  }
  
  // Calculate resource loot
  private calculateResourceLoot(
    defender: BattleParticipant,
    combatResult: CombatResult
  ): Map<ResourceId, number> {
    const loot = new Map<ResourceId, number>();
    const baseLootPercentage = 0.1; // 10% of defender's resources
    
    for (const [resourceId, amount] of defender.resources) {
      const lootAmount = Math.floor(amount * baseLootPercentage);
      if (lootAmount > 0) {
        loot.set(resourceId, lootAmount);
      }
    }
    
    return loot;
  }
}
```

## Injury System

### Injury Types
```typescript
enum InjuryType {
  LIGHT = 'LIGHT',           // Minor wounds, quick recovery
  MODERATE = 'MODERATE',     // Significant wounds, longer recovery
  SEVERE = 'SEVERE',         // Major wounds, extended recovery
  CRITICAL = 'CRITICAL'      // Life-threatening, very long recovery
}

interface Injury {
  id: string;
  unitId: string;
  type: InjuryType;
  severity: number;
  recoveryTime: number;
  effects: InjuryEffect[];
  createdAt: Timestamp;
}
```

### Injury Processing
```typescript
class InjuryManager {
  // Process injuries from combat
  processInjuries(
    units: UnitInstance[],
    casualties: Map<UnitId, number>
  ): Injury[] {
    const injuries: Injury[] = [];
    
    for (const unit of units) {
      const casualtyCount = casualties.get(unit.definitionId) || 0;
      if (casualtyCount > 0) {
        const injury = this.generateInjury(unit, casualtyCount);
        injuries.push(injury);
      }
    }
    
    return injuries;
  }
  
  // Generate injury for unit
  private generateInjury(
    unit: UnitInstance,
    casualtyCount: number
  ): Injury {
    const severity = Math.min(casualtyCount / unit.health, 1);
    const injuryType = this.determineInjuryType(severity);
    const recoveryTime = this.calculateRecoveryTime(injuryType, severity);
    
    return {
      id: this.generateInjuryId(),
      unitId: unit.id,
      type: injuryType,
      severity,
      recoveryTime,
      effects: this.generateInjuryEffects(injuryType, severity),
      createdAt: new Date()
    };
  }
}
```

## Cooldown System

### Cooldown Types
```typescript
enum CooldownType {
  RAID = 'RAID',             // Raid cooldown
  ATTACK = 'ATTACK',         // Attack cooldown
  DEFEND = 'DEFEND',         // Defense cooldown
  HEAL = 'HEAL'              // Healing cooldown
}

interface Cooldown {
  id: string;
  userId: string;
  type: CooldownType;
  startTime: Timestamp;
  endTime: Timestamp;
  isActive: boolean;
}
```

### Cooldown Management
```typescript
class CooldownManager {
  // Check if user can perform action
  canPerformAction(
    userId: string,
    actionType: CooldownType
  ): boolean {
    const cooldowns = this.getActiveCooldowns(userId);
    const relevantCooldown = cooldowns.find(c => c.type === actionType);
    
    if (!relevantCooldown) return true;
    
    const now = Date.now();
    return now >= relevantCooldown.endTime.getTime();
  }
  
  // Apply cooldown
  async applyCooldown(
    userId: string,
    actionType: CooldownType,
    duration: number
  ): Promise<void> {
    const cooldown: Cooldown = {
      id: this.generateCooldownId(),
      userId,
      type: actionType,
      startTime: new Date(),
      endTime: new Date(Date.now() + duration),
      isActive: true
    };
    
    await this.saveCooldown(cooldown);
  }
}
```
