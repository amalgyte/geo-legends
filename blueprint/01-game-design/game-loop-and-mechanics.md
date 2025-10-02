# Game Loop & Mechanics

## North Star Vision

A real-world, location-aware, **MMO-lite** where players collect resources, build/upgrade local bases, and compete/cooperate over **world cells** mapped to Earth. The world advances even when a player is offline. Moment-to-moment play should work in short sessions (1–5 minutes), with periodic deeper sessions. **Fair, anti-spoofing aware**, and **battery-friendly**.

## Design Pillars & Constraints

- **Play anywhere**: global map, country-agnostic, low bandwidth.
- **Short-session viable**: everything meaningful in < 2 minutes.
- **Asynchronous persistence**: server tick processes world changes without client.
- **Honest-but-verified** client: client is never authoritative; server validates.
- **Accessible first**: 2D UI, optional stylized map; AR optional later.
- **Privacy-first**: minimal location retention; granular consent.

**Hard constraints to honor**

- Requires internet for sync, but **graceful offline** for local actions queued.
- Background activity limited by iOS/Android—design offline ops around OS limits.

## Game Loop Options (Chosen: Territory & Bases)

**Primary: Territory & Bases (Strategy/Builder)**
- Capture/upgrade a **Cell Base** in your local S2 cell. Produce resources over time. Strengthen defenses. Ally with nearby players.
- Secondary: **Missions** (walk-by interactions, POI tasks).

**Secondary: Collection & Crafting (Explorer/Economy)**
- Harvest resource nodes IRL, craft items/boosts, trade via marketplace.
- Secondary: **World Events** (weather/time-based spawns).

**Tertiary: Competitive Control (Sports & Skirmish — PvE→PvP)**
- Instead of violent combat, settlements challenge each other in **asynchronous sports competitions** (football penalty shootouts, time-trial runs, skill minigames) or **non-lethal skirmish scenarios**. Results contribute to regional control, prestige, and loot.
- Secondary: **Raids → Tournaments** at scheduled windows.

## Chosen MVP Loop & Theme

- **Tone:** Realistic (map-first, grounded UI, clean visuals).
- **Audience:** Casual walkers + strategy gamers + collectors.
- **Content rating:** **Mature**. **Bloody battles are permitted.** The design will **encourage** players to favor competitive **sports-style systems** as they progress (better rewards, faster progression), but **combat skirmishes** remain a viable, riskier path.

## Core Gameplay Flow

1. **Discovery** - Player opens app, sees their local area with S2 cells
2. **Claim** - Find an empty cell, claim it as their base
3. **Build** - Construct buildings, produce resources
4. **Expand** - Claim adjacent cells, build more structures
5. **Compete** - Choose Athletic (sports) or Martial (combat) progression
6. **Advance** - Unlock new technologies, buildings, and capabilities

## Session Types

### Quick Sessions (1-2 minutes)
- Check production timers
- Collect resources
- Queue upgrades
- View nearby activity

### Medium Sessions (5-10 minutes)
- Plan base expansion
- Participate in competitions
- Manage resources and trade
- Explore nearby areas

### Deep Sessions (15+ minutes)
- Strategic planning
- Multi-step raids or competitions
- Complex resource management
- Social interactions and alliances

## Progression Systems

### Settlement Progression
- **Village Era** - Basic buildings, simple resources
- **Township Era** - Advanced structures, complex production
- **City Era** - Specialized districts, major projects

### Dual-Track Progression
- **Athletic Track** - Sports competitions, prestige, safer progression
- **Martial Track** - Combat raids, higher risk/reward, territorial control

### Technology Trees
- **Agriculture** - Food production and farming
- **Mining** - Resource extraction and processing
- **Military** - Combat units and defenses
- **Infrastructure** - Roads, storage, and logistics
- **Research** - Advanced technologies and capabilities

## Key Mechanics

### Resource Management
- **Primary Resources**: Food, Wood, Stone, Ore, Coin
- **Secondary Resources**: Science, Prestige, Specialized materials
- **Storage Limits**: Encourage expansion and strategic planning
- **Production Chains**: Complex interdependencies

### Territorial Control
- **Cell Ownership**: Control specific geographic areas
- **Adjacency Rules**: Expand to connected cells
- **Influence Radius**: Benefits from nearby controlled areas
- **Upkeep Costs**: Maintenance requirements for expansion

### Competition Systems
- **Athletic Competitions**: Skill-based, non-destructive
- **Martial Raids**: Resource-based, territorial conflicts
- **Seasonal Events**: Special competitions and rewards
- **Leaderboards**: Regional and global rankings

## Player Retention Hooks

### Daily Engagement
- **Production Timers**: Regular collection cycles
- **Daily Missions**: Simple tasks for rewards
- **Event Notifications**: Nearby competitions and opportunities

### Weekly Progression
- **Technology Research**: Long-term advancement goals
- **Competition Cycles**: Regular tournaments and events
- **Resource Accumulation**: Building toward major upgrades

### Long-term Goals
- **Era Advancement**: Major progression milestones
- **Regional Dominance**: Territorial control objectives
- **Prestige Systems**: Social recognition and status
