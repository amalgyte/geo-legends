# Athletic Competitions System

## Overview

The Athletic track provides **sports-style competitions** as a non-lethal PvP alternative. These are data-driven events simulating contests between settlements and players, rewarding prestige, cosmetics, and minor economy bonuses.

### Core Principles
- **Accessible to all players**; no unit loss risk
- **Events defined in JSON** (sports.json)
- **Server authoritative**; results calculated via skill ratings, training level, and minigame outcomes
- **Seasonal structure**: leagues, cups, championships

## Team System

### Team Definition
```typescript
interface Team {
  id: string;
  name: string;
  sportType: SportType;
  ownerUid: string;
  baseId: string;
  rating: number;
  training: number;
  level: number;
  wins: number;
  losses: number;
  draws: number;
  lastMatch: Timestamp;
  commander?: Commander;
  benefits: TeamBenefit[];
}

enum SportType {
  FOOTBALL = 'FOOTBALL',
  ARCHERY = 'ARCHERY',
  RACING = 'RACING',
  ORIENTEERING = 'ORIENTEERING'
}
```

### Team Training
```typescript
interface TeamTraining {
  teamId: string;
  baseTraining: number;
  commanderBonus: number;
  buildingBonus: number;
  totalTraining: number;
  lastTraining: Timestamp;
  nextTraining: Timestamp;
}

class TeamTrainingManager {
  // Calculate team training
  calculateTraining(team: Team, base: Base, commander?: Commander): number {
    let baseTraining = 1.0;
    
    // Arena building bonus
    const arena = base.buildings.find(b => b.type === 'ARENA');
    if (arena) {
      baseTraining += arena.level * 0.1;
    }
    
    // Commander bonus
    if (commander) {
      baseTraining += commander.charisma * 0.05;
    }
    
    // Technology bonuses
    const techBonuses = this.getTechnologyBonuses(team.sportType);
    baseTraining += techBonuses;
    
    return baseTraining;
  }
  
  // Update team rating
  updateTeamRating(team: Team, matchResult: MatchResult): void {
    const ratingChange = this.calculateRatingChange(team, matchResult);
    team.rating = Math.max(0, team.rating + ratingChange);
    
    // Update win/loss record
    if (matchResult.winner === team.id) {
      team.wins++;
    } else if (matchResult.winner === 'draw') {
      team.draws++;
    } else {
      team.losses++;
    }
    
    team.lastMatch = new Date();
  }
}
```

## Competition Formats

### Match Types
```typescript
enum MatchType {
  FRIENDLY = 'FRIENDLY',     // Practice matches
  CUP = 'CUP',               // Tournament matches
  LEAGUE = 'LEAGUE',         // Ladder matches
  CHAMPIONSHIP = 'CHAMPIONSHIP' // Seasonal finals
}

interface Match {
  id: string;
  type: MatchType;
  seasonId?: string;
  homeTeam: string;
  awayTeam: string;
  scheduledTime: Timestamp;
  startTime?: Timestamp;
  endTime?: Timestamp;
  result?: MatchResult;
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

### Match Result
```typescript
interface MatchResult {
  winner: string | 'draw';
  score: {
    home: number;
    away: number;
  };
  ratingChanges: {
    home: number;
    away: number;
  };
  prestige: {
    home: number;
    away: number;
  };
  rewards: {
    home: MatchReward[];
    away: MatchReward[];
  };
  minigamePlayed: boolean;
  minigameScore?: number;
}
```

## Competition System

### Local Matches
```typescript
class LocalMatchManager {
  // Create friendly match
  async createFriendlyMatch(
    homeTeam: string,
    awayTeam: string,
    scheduledTime: Timestamp
  ): Promise<Match> {
    const match: Match = {
      id: this.generateMatchId(),
      type: MatchType.FRIENDLY,
      homeTeam,
      awayTeam,
      scheduledTime,
      attendance: { home: false, away: false },
      prestige: { home: 0, away: 0 }
    };
    
    await this.saveMatch(match);
    return match;
  }
  
  // Resolve match
  async resolveMatch(matchId: string): Promise<MatchResult> {
    const match = await this.getMatch(matchId);
    const homeTeam = await this.getTeam(match.homeTeam);
    const awayTeam = await this.getTeam(match.awayTeam);
    
    // Calculate match outcome
    const result = await this.calculateMatchOutcome(homeTeam, awayTeam, match);
    
    // Update teams
    await this.updateTeamAfterMatch(homeTeam, result);
    await this.updateTeamAfterMatch(awayTeam, result);
    
    // Update match
    match.result = result;
    match.endTime = new Date();
    await this.updateMatch(match);
    
    return result;
  }
}
```

### Regional Cups
```typescript
class CupManager {
  // Create weekly cup
  async createWeeklyCup(regionId: string): Promise<Cup> {
    const cup: Cup = {
      id: this.generateCupId(),
      name: `Weekly Cup - ${regionId}`,
      regionId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      participants: [],
      bracket: [],
      status: 'REGISTRATION'
    };
    
    await this.saveCup(cup);
    return cup;
  }
  
  // Register team for cup
  async registerTeam(cupId: string, teamId: string): Promise<void> {
    const cup = await this.getCup(cupId);
    const team = await this.getTeam(teamId);
    
    // Check eligibility
    if (!this.isEligibleForCup(team, cup)) {
      throw new Error('Team not eligible for cup');
    }
    
    cup.participants.push(teamId);
    await this.updateCup(cup);
  }
  
  // Generate cup bracket
  async generateBracket(cupId: string): Promise<void> {
    const cup = await this.getCup(cupId);
    const participants = await this.getCupParticipants(cupId);
    
    // Shuffle participants
    const shuffled = this.shuffleArray(participants);
    
    // Create bracket
    const bracket = this.createBracket(shuffled);
    cup.bracket = bracket;
    cup.status = 'ACTIVE';
    
    await this.updateCup(cup);
  }
}
```

### League System
```typescript
class LeagueManager {
  // Create league
  async createLeague(regionId: string, sportType: SportType): Promise<League> {
    const league: League = {
      id: this.generateLeagueId(),
      name: `${sportType} League - ${regionId}`,
      regionId,
      sportType,
      seasonId: this.generateSeasonId(),
      teams: [],
      matches: [],
      standings: [],
      status: 'ACTIVE'
    };
    
    await this.saveLeague(league);
    return league;
  }
  
  // Add team to league
  async addTeamToLeague(leagueId: string, teamId: string): Promise<void> {
    const league = await this.getLeague(leagueId);
    const team = await this.getTeam(teamId);
    
    // Check if team meets league requirements
    if (!this.meetsLeagueRequirements(team, league)) {
      throw new Error('Team does not meet league requirements');
    }
    
    league.teams.push(teamId);
    await this.updateLeague(league);
  }
  
  // Generate league matches
  async generateLeagueMatches(leagueId: string): Promise<void> {
    const league = await this.getLeague(leagueId);
    const teams = await this.getLeagueTeams(leagueId);
    
    // Generate round-robin schedule
    const matches = this.generateRoundRobinSchedule(teams);
    
    // Schedule matches
    for (const match of matches) {
      await this.scheduleLeagueMatch(leagueId, match);
    }
  }
}
```

## Minigame System

### Minigame Types
```typescript
enum MinigameType {
  PENALTY_SHOOTOUT = 'PENALTY_SHOOTOUT',
  TIME_TRIAL = 'TIME_TRIAL',
  PRECISION_TARGET = 'PRECISION_TARGET',
  ORIENTEERING = 'ORIENTEERING'
}

interface Minigame {
  id: string;
  type: MinigameType;
  sportType: SportType;
  difficulty: number;
  duration: number;
  scoring: MinigameScoring;
  instructions: string;
}
```

### Minigame Implementation
```typescript
class MinigameManager {
  // Start minigame
  async startMinigame(
    matchId: string,
    playerId: string,
    minigameType: MinigameType
  ): Promise<MinigameSession> {
    const minigame = await this.getMinigame(minigameType);
    const session: MinigameSession = {
      id: this.generateSessionId(),
      matchId,
      playerId,
      minigameType,
      startTime: new Date(),
      score: 0,
      isComplete: false
    };
    
    await this.saveMinigameSession(session);
    return session;
  }
  
  // Complete minigame
  async completeMinigame(
    sessionId: string,
    score: number
  ): Promise<void> {
    const session = await this.getMinigameSession(sessionId);
    session.score = score;
    session.isComplete = true;
    session.endTime = new Date();
    
    await this.updateMinigameSession(session);
    
    // Apply minigame results to match
    await this.applyMinigameResults(session);
  }
}
```

## Autoresolve System

### Autoresolve Calculation
```typescript
class AutoresolveManager {
  // Calculate match outcome
  async calculateMatchOutcome(
    homeTeam: Team,
    awayTeam: Team,
    match: Match
  ): Promise<MatchResult> {
    // Base ratings
    const homeRating = homeTeam.rating;
    const awayRating = awayTeam.rating;
    
    // Attendance bonus
    const homeAttendanceBonus = match.attendance.home ? 0.05 : 0;
    const awayAttendanceBonus = match.attendance.away ? 0.05 : 0;
    
    // Random factor
    const randomFactor = (Math.random() - 0.5) * 0.1; // ±5%
    
    // Calculate win probability
    const homeWinProbability = this.calculateWinProbability(
      homeRating + homeAttendanceBonus,
      awayRating + awayAttendanceBonus,
      randomFactor
    );
    
    // Determine winner
    const winner = this.determineWinner(homeWinProbability);
    
    // Calculate score
    const score = this.calculateScore(homeTeam, awayTeam, winner);
    
    // Calculate rating changes
    const ratingChanges = this.calculateRatingChanges(
      homeTeam, awayTeam, winner, score
    );
    
    // Calculate prestige
    const prestige = this.calculatePrestige(homeTeam, awayTeam, winner, score);
    
    return {
      winner,
      score,
      ratingChanges,
      prestige,
      rewards: this.calculateRewards(homeTeam, awayTeam, winner, score),
      minigamePlayed: false
    };
  }
  
  // Calculate win probability
  private calculateWinProbability(
    homeRating: number,
    awayRating: number,
    randomFactor: number
  ): number {
    const ratingDifference = homeRating - awayRating;
    const baseProbability = 0.5 + (ratingDifference / 1000);
    return Math.max(0, Math.min(1, baseProbability + randomFactor));
  }
}
```

## Seasonal Structure

### Season Management
```typescript
interface Season {
  id: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  leagues: string[];
  cups: string[];
  championships: string[];
  rewards: SeasonReward[];
}

class SeasonManager {
  // Create new season
  async createSeason(
    name: string,
    startDate: Timestamp,
    endDate: Timestamp
  ): Promise<Season> {
    const season: Season = {
      id: this.generateSeasonId(),
      name,
      startDate,
      endDate,
      status: 'UPCOMING',
      leagues: [],
      cups: [],
      championships: [],
      rewards: []
    };
    
    await this.saveSeason(season);
    return season;
  }
  
  // Start season
  async startSeason(seasonId: string): Promise<void> {
    const season = await this.getSeason(seasonId);
    season.status = 'ACTIVE';
    
    // Start all leagues and cups
    for (const leagueId of season.leagues) {
      await this.startLeague(leagueId);
    }
    
    for (const cupId of season.cups) {
      await this.startCup(cupId);
    }
    
    await this.updateSeason(season);
  }
  
  // End season
  async endSeason(seasonId: string): Promise<void> {
    const season = await this.getSeason(seasonId);
    season.status = 'COMPLETED';
    
    // Calculate final standings
    const standings = await this.calculateSeasonStandings(seasonId);
    
    // Distribute rewards
    await this.distributeSeasonRewards(seasonId, standings);
    
    await this.updateSeason(season);
  }
}
```

## Rewards System

### Reward Types
```typescript
enum RewardType {
  PRESTIGE = 'PRESTIGE',
  COSMETIC = 'COSMETIC',
  ECONOMY_BUFF = 'ECONOMY_BUFF',
  TITLE = 'TITLE',
  TROPHY = 'TROPHY'
}

interface MatchReward {
  type: RewardType;
  value: any;
  description: string;
  duration?: number;
}

interface SeasonReward {
  position: number;
  rewards: MatchReward[];
  title: string;
  description: string;
}
```

### Reward Distribution
```typescript
class RewardManager {
  // Calculate match rewards
  calculateMatchRewards(
    team: Team,
    matchResult: MatchResult
  ): MatchReward[] {
    const rewards: MatchReward[] = [];
    
    // Prestige reward
    rewards.push({
      type: RewardType.PRESTIGE,
      value: matchResult.prestige[team.id],
      description: `Prestige gained from match`
    });
    
    // Win bonus
    if (matchResult.winner === team.id) {
      rewards.push({
        type: RewardType.COSMETIC,
        value: 'victory_badge',
        description: 'Victory badge'
      });
    }
    
    // Economy buff for wins
    if (matchResult.winner === team.id) {
      rewards.push({
        type: RewardType.ECONOMY_BUFF,
        value: { resource: 'all', multiplier: 1.05, duration: 86400 },
        description: '5% production bonus for 24 hours'
      });
    }
    
    return rewards;
  }
  
  // Distribute season rewards
  async distributeSeasonRewards(
    seasonId: string,
    standings: SeasonStanding[]
  ): Promise<void> {
    for (const standing of standings) {
      const rewards = this.getSeasonRewards(standing.position);
      
      for (const reward of rewards) {
        await this.applyReward(standing.teamId, reward);
      }
    }
  }
}
```

## Leaderboards

### Leaderboard Types
```typescript
enum LeaderboardType {
  RATING = 'RATING',
  PRESTIGE = 'PRESTIGE',
  WINS = 'WINS',
  SEASONAL = 'SEASONAL'
}

interface Leaderboard {
  id: string;
  type: LeaderboardType;
  regionId?: string;
  seasonId?: string;
  entries: LeaderboardEntry[];
  lastUpdate: Timestamp;
}

interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  value: number;
  change: number;
}
```

### Leaderboard Management
```typescript
class LeaderboardManager {
  // Update leaderboard
  async updateLeaderboard(
    leaderboardId: string,
    teamId: string,
    value: number
  ): Promise<void> {
    const leaderboard = await this.getLeaderboard(leaderboardId);
    
    // Find or create entry
    let entry = leaderboard.entries.find(e => e.teamId === teamId);
    if (!entry) {
      entry = {
        rank: 0,
        teamId,
        teamName: '',
        value: 0,
        change: 0
      };
      leaderboard.entries.push(entry);
    }
    
    // Update value
    const oldValue = entry.value;
    entry.value = value;
    entry.change = value - oldValue;
    
    // Sort and rank
    leaderboard.entries.sort((a, b) => b.value - a.value);
    leaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    leaderboard.lastUpdate = new Date();
    await this.updateLeaderboard(leaderboard);
  }
}
```
