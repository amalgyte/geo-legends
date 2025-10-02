# NPCs & Commanders System

## Commander Overview

Commanders are special NPCs that provide **passive buffs** to both Martial and Athletic activities. They add personality, long-term progression, and strategic choices to the game.

### Core Principles
- **Non-combatant entities** that attach to settlements or teams
- **Earned via research, quests, or rare recruitment events**
- **Data-driven definitions** in `commanders.json`
- **Limit per settlement** (1-2 active commanders)
- **Cannot be active in both tracks simultaneously**

## Commander Definition

### Commander Attributes
```typescript
interface Commander {
  id: string;
  name: string;
  rarity: CommanderRarity;
  attributes: CommanderAttributes;
  effects: CommanderEffect[];
  requirements: CommanderRequirement[];
  progression: CommanderProgression;
  deployment: CommanderDeployment;
}

enum CommanderRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

interface CommanderAttributes {
  leadership: number;    // Morale buff, reduces rout chance
  tactics: number;       // Formation bonus multiplier
  charisma: number;      // Prestige gain bonus in athletics
  logistics: number;     // Reduced upkeep, faster training
  strategy: number;      // Planning and coordination bonuses
  inspiration: number;   // Team motivation and performance
}
```

### Commander Effects
```typescript
interface CommanderEffect {
  type: EffectType;
  target: string;
  value: number;
  duration?: number;
  condition?: string;
  description: string;
}

enum EffectType {
  MORALE_BUFF = 'MORALE_BUFF',
  FORMATION_BONUS = 'FORMATION_BONUS',
  TRAINING_BONUS = 'TRAINING_BONUS',
  PRODUCTION_BONUS = 'PRODUCTION_BONUS',
  PRESTIGE_BONUS = 'PRESTIGE_BONUS',
  UPKEEP_REDUCTION = 'UPKEEP_REDUCTION',
  SPEED_BONUS = 'SPEED_BONUS',
  DEFENSE_BONUS = 'DEFENSE_BONUS'
}
```

## Commander Progression

### Experience System
```typescript
interface CommanderProgression {
  level: number;
  experience: number;
  experienceToNext: number;
  attributePoints: number;
  availablePoints: number;
  maxLevel: number;
  skills: CommanderSkill[];
}

interface CommanderSkill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  effects: CommanderEffect[];
  prerequisites: string[];
  cost: number;
}
```

### Experience Gain
```typescript
class CommanderProgressionManager {
  // Gain experience from battle
  async gainBattleExperience(
    commanderId: string,
    battleResult: BattleResult
  ): Promise<void> {
    const commander = await this.getCommander(commanderId);
    const baseExp = this.calculateBaseExperience(battleResult);
    const bonusExp = this.calculateBonusExperience(commander, battleResult);
    const totalExp = baseExp + bonusExp;
    
    await this.addExperience(commander, totalExp);
  }
  
  // Gain experience from match
  async gainMatchExperience(
    commanderId: string,
    matchResult: MatchResult
  ): Promise<void> {
    const commander = await this.getCommander(commanderId);
    const baseExp = this.calculateMatchExperience(matchResult);
    const bonusExp = this.calculateMatchBonus(commander, matchResult);
    const totalExp = baseExp + bonusExp;
    
    await this.addExperience(commander, totalExp);
  }
  
  // Add experience and check for level up
  private async addExperience(
    commander: Commander,
    experience: number
  ): Promise<void> {
    commander.progression.experience += experience;
    
    // Check for level up
    while (commander.progression.experience >= commander.progression.experienceToNext) {
      await this.levelUpCommander(commander);
    }
    
    await this.updateCommander(commander);
  }
  
  // Level up commander
  private async levelUpCommander(commander: Commander): Promise<void> {
    commander.progression.level++;
    commander.progression.experience -= commander.progression.experienceToNext;
    commander.progression.experienceToNext = this.calculateExperienceToNext(commander.progression.level);
    commander.progression.attributePoints += 2;
    commander.progression.availablePoints += 2;
    
    // Unlock new skills if applicable
    await this.checkSkillUnlocks(commander);
  }
}
```

## Commander Deployment

### Deployment Rules
```typescript
interface CommanderDeployment {
  isDeployed: boolean;
  deploymentType: 'MARTIAL' | 'ATHLETIC' | 'NONE';
  targetId: string; // Base ID or Team ID
  startTime: Timestamp;
  endTime?: Timestamp;
  cooldownEnd?: Timestamp;
}

class DeploymentManager {
  // Deploy commander to martial activities
  async deployToMartial(
    commanderId: string,
    baseId: string
  ): Promise<void> {
    const commander = await this.getCommander(commanderId);
    
    // Check if already deployed
    if (commander.deployment.isDeployed) {
      throw new Error('Commander already deployed');
    }
    
    // Check cooldown
    if (commander.deployment.cooldownEnd && 
        new Date() < commander.deployment.cooldownEnd) {
      throw new Error('Commander on cooldown');
    }
    
    // Deploy commander
    commander.deployment = {
      isDeployed: true,
      deploymentType: 'MARTIAL',
      targetId: baseId,
      startTime: new Date()
    };
    
    await this.updateCommander(commander);
    await this.applyMartialEffects(commander, baseId);
  }
  
  // Deploy commander to athletic activities
  async deployToAthletic(
    commanderId: string,
    teamId: string
  ): Promise<void> {
    const commander = await this.getCommander(commanderId);
    
    // Check if already deployed
    if (commander.deployment.isDeployed) {
      throw new Error('Commander already deployed');
    }
    
    // Check cooldown
    if (commander.deployment.cooldownEnd && 
        new Date() < commander.deployment.cooldownEnd) {
      throw new Error('Commander on cooldown');
    }
    
    // Deploy commander
    commander.deployment = {
      isDeployed: true,
      deploymentType: 'ATHLETIC',
      targetId: teamId,
      startTime: new Date()
    };
    
    await this.updateCommander(commander);
    await this.applyAthleticEffects(commander, teamId);
  }
  
  // Recall commander
  async recallCommander(commanderId: string): Promise<void> {
    const commander = await this.getCommander(commanderId);
    
    if (!commander.deployment.isDeployed) {
      throw new Error('Commander not deployed');
    }
    
    // Remove effects
    if (commander.deployment.deploymentType === 'MARTIAL') {
      await this.removeMartialEffects(commander, commander.deployment.targetId);
    } else if (commander.deployment.deploymentType === 'ATHLETIC') {
      await this.removeAthleticEffects(commander, commander.deployment.targetId);
    }
    
    // Set cooldown
    const cooldownDuration = this.calculateCooldownDuration(commander);
    commander.deployment = {
      isDeployed: false,
      deploymentType: 'NONE',
      targetId: '',
      startTime: new Date(),
      cooldownEnd: new Date(Date.now() + cooldownDuration)
    };
    
    await this.updateCommander(commander);
  }
}
```

## Commander Effects Application

### Martial Effects
```typescript
class MartialEffectManager {
  // Apply martial effects to base
  async applyMartialEffects(
    commander: Commander,
    baseId: string
  ): Promise<void> {
    const base = await this.getBase(baseId);
    
    for (const effect of commander.effects) {
      switch (effect.type) {
        case EffectType.MORALE_BUFF:
          await this.applyMoraleBuff(base, effect);
          break;
        case EffectType.FORMATION_BONUS:
          await this.applyFormationBonus(base, effect);
          break;
        case EffectType.DEFENSE_BONUS:
          await this.applyDefenseBonus(base, effect);
          break;
        case EffectType.UPKEEP_REDUCTION:
          await this.applyUpkeepReduction(base, effect);
          break;
      }
    }
  }
  
  // Apply morale buff
  private async applyMoraleBuff(
    base: Base,
    effect: CommanderEffect
  ): Promise<void> {
    base.defenses.forEach(defense => {
      defense.moraleBonus = (defense.moraleBonus || 0) + effect.value;
    });
    
    await this.updateBase(base);
  }
  
  // Apply formation bonus
  private async applyFormationBonus(
    base: Base,
    effect: CommanderEffect
  ): Promise<void> {
    base.units.forEach(unit => {
      unit.formationBonus = (unit.formationBonus || 0) + effect.value;
    });
    
    await this.updateBase(base);
  }
}
```

### Athletic Effects
```typescript
class AthleticEffectManager {
  // Apply athletic effects to team
  async applyAthleticEffects(
    commander: Commander,
    teamId: string
  ): Promise<void> {
    const team = await this.getTeam(teamId);
    
    for (const effect of commander.effects) {
      switch (effect.type) {
        case EffectType.TRAINING_BONUS:
          await this.applyTrainingBonus(team, effect);
          break;
        case EffectType.PRESTIGE_BONUS:
          await this.applyPrestigeBonus(team, effect);
          break;
        case EffectType.SPEED_BONUS:
          await this.applySpeedBonus(team, effect);
          break;
      }
    }
  }
  
  // Apply training bonus
  private async applyTrainingBonus(
    team: Team,
    effect: CommanderEffect
  ): Promise<void> {
    team.trainingBonus = (team.trainingBonus || 0) + effect.value;
    await this.updateTeam(team);
  }
  
  // Apply prestige bonus
  private async applyPrestigeBonus(
    team: Team,
    effect: CommanderEffect
  ): Promise<void> {
    team.prestigeBonus = (team.prestigeBonus || 0) + effect.value;
    await this.updateTeam(team);
  }
}
```

## Commander Recruitment

### Recruitment Sources
```typescript
enum RecruitmentSource {
  RESEARCH = 'RESEARCH',
  QUEST = 'QUEST',
  EVENT = 'EVENT',
  PURCHASE = 'PURCHASE',
  BATTLE = 'BATTLE',
  TOURNAMENT = 'TOURNAMENT'
}

interface RecruitmentEvent {
  id: string;
  source: RecruitmentSource;
  commanderId: string;
  requirements: RecruitmentRequirement[];
  cost: Map<ResourceId, number>;
  duration: number;
  isActive: boolean;
}
```

### Recruitment System
```typescript
class RecruitmentManager {
  // Check recruitment eligibility
  async checkRecruitmentEligibility(
    playerId: string,
    commanderId: string
  ): Promise<RecruitmentResult> {
    const player = await this.getPlayer(playerId);
    const commander = await this.getCommander(commanderId);
    
    // Check if already owned
    if (player.commanders.includes(commanderId)) {
      return { eligible: false, reason: 'ALREADY_OWNED' };
    }
    
    // Check requirements
    for (const requirement of commander.requirements) {
      if (!this.checkRequirement(player, requirement)) {
        return { eligible: false, reason: 'REQUIREMENTS_NOT_MET' };
      }
    }
    
    // Check cost
    if (!this.checkCost(player, commander.cost)) {
      return { eligible: false, reason: 'INSUFFICIENT_RESOURCES' };
    }
    
    return { eligible: true };
  }
  
  // Recruit commander
  async recruitCommander(
    playerId: string,
    commanderId: string
  ): Promise<void> {
    const player = await this.getPlayer(playerId);
    const commander = await this.getCommander(commanderId);
    
    // Deduct cost
    await this.deductRecruitmentCost(player, commander.cost);
    
    // Add commander to player
    player.commanders.push(commanderId);
    await this.updatePlayer(player);
    
    // Create commander instance
    const commanderInstance = await this.createCommanderInstance(
      commanderId,
      playerId
    );
    
    await this.saveCommanderInstance(commanderInstance);
  }
}
```

## Commander Skills

### Skill System
```typescript
interface CommanderSkill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: number;
  maxLevel: number;
  effects: CommanderEffect[];
  prerequisites: string[];
  cost: number;
  isUnlocked: boolean;
}

enum SkillCategory {
  LEADERSHIP = 'LEADERSHIP',
  TACTICS = 'TACTICS',
  LOGISTICS = 'LOGISTICS',
  INSPIRATION = 'INSPIRATION',
  STRATEGY = 'STRATEGY'
}
```

### Skill Progression
```typescript
class SkillManager {
  // Unlock skill
  async unlockSkill(
    commanderId: string,
    skillId: string
  ): Promise<void> {
    const commander = await this.getCommander(commanderId);
    const skill = commander.progression.skills.find(s => s.id === skillId);
    
    if (!skill) {
      throw new Error('Skill not found');
    }
    
    if (skill.isUnlocked) {
      throw new Error('Skill already unlocked');
    }
    
    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      const prereqSkill = commander.progression.skills.find(s => s.id === prereq);
      if (!prereqSkill || !prereqSkill.isUnlocked) {
        throw new Error('Prerequisites not met');
      }
    }
    
    // Check cost
    if (commander.progression.availablePoints < skill.cost) {
      throw new Error('Insufficient skill points');
    }
    
    // Unlock skill
    skill.isUnlocked = true;
    commander.progression.availablePoints -= skill.cost;
    
    await this.updateCommander(commander);
  }
  
  // Upgrade skill
  async upgradeSkill(
    commanderId: string,
    skillId: string
  ): Promise<void> {
    const commander = await this.getCommander(commanderId);
    const skill = commander.progression.skills.find(s => s.id === skillId);
    
    if (!skill || !skill.isUnlocked) {
      throw new Error('Skill not unlocked');
    }
    
    if (skill.level >= skill.maxLevel) {
      throw new Error('Skill at maximum level');
    }
    
    // Check cost
    const upgradeCost = this.calculateUpgradeCost(skill);
    if (commander.progression.availablePoints < upgradeCost) {
      throw new Error('Insufficient skill points');
    }
    
    // Upgrade skill
    skill.level++;
    commander.progression.availablePoints -= upgradeCost;
    
    await this.updateCommander(commander);
  }
}
```

## Commander Personalities

### Personality System
```typescript
interface CommanderPersonality {
  id: string;
  name: string;
  traits: PersonalityTrait[];
  dialogue: CommanderDialogue;
  preferences: CommanderPreference[];
  backstory: string;
}

interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  effects: CommanderEffect[];
  conflicts: string[];
}

interface CommanderDialogue {
  recruitment: string[];
  deployment: string[];
  victory: string[];
  defeat: string[];
  levelUp: string[];
  recall: string[];
}
```

### Personality Effects
```typescript
class PersonalityManager {
  // Apply personality effects
  applyPersonalityEffects(
    commander: Commander,
    personality: CommanderPersonality
  ): CommanderEffect[] {
    const effects: CommanderEffect[] = [];
    
    for (const trait of personality.traits) {
      effects.push(...trait.effects);
    }
    
    return effects;
  }
  
  // Get personality dialogue
  getPersonalityDialogue(
    personality: CommanderPersonality,
    situation: string
  ): string {
    const dialogue = personality.dialogue[situation];
    if (!dialogue || dialogue.length === 0) {
      return '...';
    }
    
    return dialogue[Math.floor(Math.random() * dialogue.length)];
  }
}
```

## Commander Quests

### Quest System
```typescript
interface CommanderQuest {
  id: string;
  commanderId: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  requirements: QuestRequirement[];
  isActive: boolean;
  isCompleted: boolean;
}

interface QuestObjective {
  id: string;
  description: string;
  type: 'KILL_UNITS' | 'WIN_BATTLES' | 'WIN_MATCHES' | 'GATHER_RESOURCES';
  target: number;
  current: number;
  isCompleted: boolean;
}
```

### Quest Management
```typescript
class QuestManager {
  // Generate commander quest
  async generateCommanderQuest(
    commanderId: string,
    playerId: string
  ): Promise<CommanderQuest> {
    const commander = await this.getCommander(commanderId);
    const player = await this.getPlayer(playerId);
    
    const quest: CommanderQuest = {
      id: this.generateQuestId(),
      commanderId,
      name: `${commander.name}'s Challenge`,
      description: `Complete ${commander.name}'s personal challenge`,
      objectives: this.generateQuestObjectives(commander, player),
      rewards: this.generateQuestRewards(commander),
      requirements: this.generateQuestRequirements(commander),
      isActive: true,
      isCompleted: false
    };
    
    await this.saveQuest(quest);
    return quest;
  }
  
  // Update quest progress
  async updateQuestProgress(
    questId: string,
    objectiveId: string,
    progress: number
  ): Promise<void> {
    const quest = await this.getQuest(questId);
    const objective = quest.objectives.find(o => o.id === objectiveId);
    
    if (!objective) {
      throw new Error('Objective not found');
    }
    
    objective.current = Math.min(objective.current + progress, objective.target);
    objective.isCompleted = objective.current >= objective.target;
    
    // Check if quest is completed
    quest.isCompleted = quest.objectives.every(o => o.isCompleted);
    
    if (quest.isCompleted) {
      await this.completeQuest(quest);
    }
    
    await this.updateQuest(quest);
  }
}
```
