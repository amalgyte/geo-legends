# GPS MMO-lite Flutter Game — Developer Blueprint (v0.1)

> Working title: **Geo Legends Mobile** (placeholder). A GPS‑aware, always‑on, global game built with Flutter. This document is a living spec + decision guide to take you from blank page → shipping MVP → scaling.

---

## 0) North Star in One Paragraph

A real‑world, location‑aware, **MMO‑lite** where players collect resources, build/upgrade local bases, and compete/cooperate over **world cells** mapped to Earth. The world advances even when a player is offline. Moment‑to‑moment play should work in short sessions (1–5 minutes), with periodic deeper sessions. **Fair, anti‑spoofing aware**, and **battery‑friendly**.

---

## 1) Design Pillars & Constraints

- **Play anywhere**: global map, country‑agnostic, low bandwidth.
- **Short‑session viable**: everything meaningful in < 2 minutes.
- **Asynchronous persistence**: server tick processes world changes without client.
- **Honest-but-verified** client: client is never authoritative; server validates.
- **Accessible first**: 2D UI, optional stylized map; AR optional later.
- **Privacy-first**: minimal location retention; granular consent.

**Hard constraints to honor**

- Requires internet for sync, but **graceful offline** for local actions queued.
- Background activity limited by iOS/Android—design offline ops around OS limits.

---

## 2) Game Loop Options (pick 1 primary, 1 secondary)

**A. Territory & Bases (Strategy/Builder)**

- Capture/upgrade a **Cell Base** in your local S2 cell. Produce resources over time. Strengthen defenses. Ally with nearby players.
- Secondary: **Missions** (walk-by interactions, POI tasks).

**B. Collection & Crafting (Explorer/Economy)**

- Harvest resource nodes IRL, craft items/boosts, trade via marketplace.
- Secondary: **World Events** (weather/time‑based spawns).

**C. Competitive Control (Sports & Skirmish — PvE→PvP)**

- Instead of violent combat, settlements challenge each other in **asynchronous sports competitions** (football penalty shootouts, time‑trial runs, skill minigames) or **non‑lethal skirmish scenarios**. Results contribute to regional control, prestige, and loot.
- Secondary: **Raids → Tournaments** at scheduled windows.

> **Decision (Locked for MVP):** Primary = **A. Territory & Bases** with **C. Competitive Control (Sports‑first)** as the signature PvP layer. **B. Collection & Crafting** supports both as the economy.

### 2.1 Chosen MVP Loop & Theme (Locked)

- **Tone:** Realistic (map‑first, grounded UI, clean visuals).
- **Audience:** Casual walkers + strategy gamers + collectors.
- **Content rating:** **Mature**. **Bloody battles are permitted.** The design will **encourage** players to favor competitive **sports-style systems** as they progress (better rewards, faster progression), but **combat skirmishes** remain a viable, riskier path.

### 2.2 Competitive & Combat Systems (v1 design)

- **Dual Progression Paths:**

  - **Athletic Track (Encouraged):** settlement arenas, cups, leagues → superior cosmetics, prestige multipliers, faster civic growth, lower risk.
  - **Martial Track (Allowed):** tactical skirmishes and raids (with blood effects) for territory disruption, loot risk, and temporary debuffs.

- **Settlement Arenas (Athletic):** asynchronous challenges (time‑trial routes, precision drills) feeding leagues and seasons. *(Implementation deferred until after core loop; see Section 27)*

- **Skirmish Raids (Martial):** timed windows where attacker/defender resolve outcomes via tactical minigame(s) or auto‑resolve based on stats and consumables. Server authoritative; location checks enforced.

- **Risk/Reward Balance:** Martial yields short‑term gains with injury/cooldown risks; Athletic yields long‑term prestige, discounts, and safer growth.

- **Fairness:** Anti‑spoof checks for any location‑dependent modes; couch‑safe minigames allowed only when tied to your base/arena presence.

- **Settlement Arenas:** Each base can unlock an Arena. Nearby players queue into **asynchronous challenges** (e.g., timed route within N cells, tap‑accuracy drill, penalty‑kick timing mini‑game).

- **Match Types:** Solo vs Solo (ladder), Squad vs Squad (aggregate score), Club vs Club (weekly league table).

- **Scoring:** ELO‑like rating per match type; region control gains from cumulative club points.

- **Events:** Weekend Cups (48h), City Leagues (monthly), Seasonal Championships (quarterly).

- **Rewards:** Cosmetics, titles, base skins, prestige currency (no power creep). Resource jackpots only for **B. economy**, capped to avoid pay‑to‑win.

- **Fairness:** Anti‑spoof checks required for location‑dependent challenges; pure reflex minigames can be couch‑play so long as entry is tied to being physically near your Arena.

---

## 3) World Model & Geo Indexing

- **Cell system**: Use **S2 Geometry** (level 14–16 typical) to partition Earth into cells (\~80–300m). Each cell has:
  - `cell_id`, biome, occupancy (base? resource nodes?), production timers, conflict state.
- **Points of Interest (POI)**: (optional) derived from OSM/Google Places for missions.
- **Server tick**: every N minutes (e.g., 5) resolve production, decay, conflicts.
- **Time**: Server time = source of truth; clients display local time.

**Anti‑Cheat / Location Integrity**

- **Velocity & teleport checks**;
- **Device signals**: GPS vs network;
- **Trust score** per device;
- **Cooldown** after long jumps;
- Optional: **root/jailbreak heuristics**.

---

## 4) Online/Offline Behaviour

- **Online**: full features. Actions sent to server immediately.
- **Offline**:
  - Read‑only cache of last known cells + bases;
  - Allow **local intents** (craft queue, upgrade queue, route planning);
  - Queue intents in local DB with **expiry**;
  - Sync on reconnect with conflict resolution (server authoritative).
- **Background**: OS‑safe **BackgroundFetch** to send heartbeats and consume server grants (<15 min cadence, platform dependent). Push notifications for finished timers/events.

---

## 5) High‑Level Architecture (Locked)

**Client (Flutter)**

- UI: Flutter (Material 3), **Flutter UI first** (Flame later for select minigames).
- State: **Riverpod**; models via Freezed/JSON Serializable.
- Map: **Mapbox GL** (vector tiles, custom style, optional offline packs for regions).
- Local store: **Isar** (encrypted box for PII, migrations versioned).
- Networking: **Dio** (REST) + **web\_socket\_channel** (events); retry/backoff.
- Background: **workmanager** + **firebase\_messaging** + **local\_notifications**.

**Backend (Authoritative) — Firebase‑first**

- **Firestore**: world state (cells, bases, users, clubs), sharded collections.
- **Cloud Run/Functions**: REST endpoints + WebSocket gateway + **tick workers**.
- **Cloud Tasks**: delayed jobs (upgrade complete at T+X, raid window open/close).
- **Cloud Scheduler + Pub/Sub**: cadence for global/region ticks.
- **Firebase Auth**: anon → provider upgrade.
- **Firebase Cloud Messaging**: event completion, raid windows, tournament updates.

**Why**: aligns with your stack, low‑ops, global infra, rich Flutter SDKs.

---

## 6) Data Model (MVP Draft — Updated)

```mermaid
classDiagram
class User {
  uid
  displayName
  trustScore
  clubId(optional)
  inventory: Map<ItemId,int>
  homeCellId
  lastKnownLoc{lat,lng,ts}
  goreToggle: bool
}
class Cell {
  cellId
  level
  biome
  regionId
  ownerUid(optional)
  baseLevel(0..N)
  production{resource:ratePerTick}
  storage{resource:amount}
  conflictState
  lastTickTs
}
class ActionIntent {
  id
  uid
  type(Upgrade|Collect|Craft|Move|RaidOpen|RaidResolve)
  targetId(cellId|itemId|baseId)
  createdTs
  expiresTs
  status(Queued|Applied|Rejected|Superseded)
  loc{lat,lng,accuracy}
}
class RaidWindow {
  id
  attackerUid
  defenderBaseId
  startTs
  endTs
  state(Scheduled|Active|Resolved|Expired)
}
User "1" -- "*" ActionIntent
Cell "1" -- "*" ActionIntent
```

**Firestore Collections (proposed)**

- `/users/{uid}`
- `/cells/{cellId}`
- `/bases/{baseId}` (keyed by cellId)
- `/actions/{yyyyMMdd}/{actionId}` (daily shards)
- `/raids/{yyyyMMdd}/{raidId}` (daily shards)
- `/items/{itemId}` (static)
- `/clubs/{clubId}` (later)

---

## 7) Networking & Authority

- Client creates **signed intents**; server validates location/time and updates.
- **WebSocket channel** for cell updates nearby (`subscribe: [cellIds]`).
- **Rate limits** on actions per minute; per‑device token bucket.
- **Replay protection**: nonce per intent, server stores last N nonces per user.

---

## 8) Location & Maps

- Permissions: foreground location; background optional with rationale.
- **Geolocator** for GPS; **geocoding** optional.
- **Geofencing** for POIs and home cell entry/exit.
- Tile layer: Mapbox GL (styling + offline packs) or Google Maps (ubiquitous).

---

## 9) Client Packages (initial, Locked)

```yaml
# pubspec.yaml (excerpt)
dependencies:
  flutter: any
  flutter_riverpod: ^2.5.1
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0
  dio: ^5.7.0
  web_socket_channel: ^3.0.0
  geolocator: ^11.1.0
  permission_handler: ^11.3.1
  isar: ^3.1.0+1
  isar_flutter_libs: ^3.1.0+1
  mapbox_gl: ^0.16.0
  firebase_core: ^3.6.0
  firebase_auth: ^5.3.1
  cloud_firestore: ^5.4.4
  firebase_messaging: ^15.1.2
  workmanager: ^0.5.2
  flutter_local_notifications: ^17.2.3
  intl: ^0.19.0
  uuid: ^4.5.1
  package_info_plus: ^8.0.2
  device_info_plus: ^10.1.0
  s2_geometry: ^0.2.0

dev_dependencies:
  build_runner: any
  freezed: any
  json_serializable: any
  flutter_lints: any
```

---

## 10) Project Structure

```
lib/
  app.dart
  main.dart
  core/
    env.dart
    logger.dart
    result.dart
  data/
    models/ (freezed)
    local/isar_*.dart
    remote/api_client.dart
    repositories/
  features/
    auth/
    map/
    cells/
    base/
    inventory/
    actions/
  services/
    location_service.dart
    geofence_service.dart
    sync_service.dart
    websocket_service.dart
  ui/
    theme/
    widgets/
  util/
```

---

## 11) MVP Feature Checklist

-

---

## 12) Backend MVP Endpoints (Cloud Run/Functions — Locked)

**Auth**: Firebase ID token on all requests. Server verifies on ingress.

### REST

- `GET /cells?around={lat,lng}&radius={m}&level={n}` → `Cell[]` snapshot (server filters & rounds coords; returns server time).
- `POST /intents` → Submit an action intent `{type, targetId, clientTs, loc}`. Validates anti‑cheat; enqueues **Cloud Task** if delayed.
- `GET /me` → Profile + inventory + unread notifications.
- `POST /collect` → Collect finished production for a base or cell storage.
- `POST /raid/open` → Request raid window for target cell/base (rate‑limited, scheduler‑gated).

### WebSocket

- `WS /stream?cells=...` → subscribe to cellIds; messages `{cellId, changed}`.
- Channels: `region:{regionId}`, `user:{uid}` for personal updates.

### Tick

- `POST /tick/region/{regionId}` (internal) → progress production/decay/conflicts for dirty cells. Triggered by Scheduler.

**Errors**: standardized problem+json with codes: `ANTI_SPOOF`, `COOLDOWN`, `RATE_LIMIT`, `VALIDATION`, `NOT_AUTHORIZED`.

---

## 13) Offline & Conflict Resolution

- Client stores `ActionIntent` with `expiresTs`.
- On reconnect, send all `Queued` intents in FIFO.
- Server responses:
  - `Applied`: client updates cache.
  - `Rejected`: reason → UI toast; remove from queue.
  - `Superseded`: a newer server state invalidated the intent (e.g., base attacked).

---

## 14) Anti‑Cheat (MVP → v1)

- **Speed gates**: > 55 km/h blocks base interactions; > 100 km/h blocks all.
- **Teleport detection**: > 2 km in < 30s → flag + **10 min cooldown** (raid/open blocked).
- **Accuracy requirement**: critical actions require `accuracy < 25m` and fresh fix (< 10s).
- **Integrity**: root/jailbreak heuristics reduce `trustScore` and rate limits.
- **Server rounding**: server uses rounded cell centers for authority checks.
- **v1+**: Play Integrity / DeviceCheck, ML trust; anomaly‑based bans.

---

## 15) Privacy, Security, Compliance

- **Data minimization**: store **cellId** & rounded coordinates; raw traces avoided.
- **Gore toggle**: client setting written to `/users/{uid}.goreToggle`; server may down‑rank gore assets for some regions.
- **Retention**: only lastKnownLoc and event logs; export/delete endpoints.
- **Security Rules** (Firestore sketch):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }

    match /users/{uid} {
      allow read: if isOwner(uid);
      allow write: if isOwner(uid);
    }
    match /cells/{cellId} {
      allow read: if isAuth();
      allow write: if false; // server only
    }
    match /bases/{baseId} {
      allow read: if isAuth();
      allow write: if false; // server only
    }
    match /actions/{date}/{actionId} {
      allow read: if isOwner(resource.data.uid);
      allow write: if isAuth() && request.resource.data.uid == request.auth.uid; // additional server validation still required
    }
    match /raids/{date}/{raidId} {
      allow read: if isAuth();
      allow write: if false; // server only creates
    }
  }
}
```

---

## 16) Monetization (Fair)

- **Cosmetics**: base skins, arena themes, club kits, emblems, **martial VFX toggles** (blood intensity slider; default on, can be turned off in Settings for comfort).
- **Season Pass**: both athletic and martial tracks have cosmetic progression (no stat boosts). Martial track rewards avoid pay‑to‑win—cosmetic only.
- **QoL**: rename tokens, extra loadouts, planner slots.
- **No pay‑to‑win**: combat outcomes rely on skill/timing + in‑game earned gear; purchasables remain cosmetic.

---

## 17) Live‑Ops & Events (Dual‑Track)

- **Weekly Regional Cups (Athletic)**: bracketed tournaments between settlements within metros.
- **Rotating Athletic Modes**: penalty shootout, sprint time‑trial, precision taps, orienteering routes.
- **Skirmish Windows (Martial)**: scheduled raid windows with citywide alerts; victory shifts regional control and resource modifiers.
- **Biome/Weather Buffs**: tie certain modes to conditions (e.g., rain reduces sprint visibility; night favors stealth raids).
- **Season Structure**: 10–12 weeks; leaderboards for both tracks; soft reset; legacy cosmetics persist.

---

## 18) Telemetry & Tuning

- **Firebase Analytics** or Rudderstack → BigQuery.
- KPIs: D1/D7 retention, ARPDAU, sessions/day, km walked, intents success rate, spoof flag rate.

---

## 19) Tooling, CI/CD, Environments

- **Flavors**: dev / staging / prod (separate Firebase projects).
- **CI**: Codemagic or GitHub Actions → fastlane for signing.
- Static analysis: `flutter analyze`, `dart test`, golden tests.

---

## 20) MVP Milestones & Timeline (example)

1. **Week 1–2**: Skeleton app, Auth, Location, Map, Isar cache.
2. **Week 3–4**: Cells overlay, claim base, server skeleton, intents.
3. **Week 5–6**: Tick system, production & upgrades, push notifications.
4. **Week 7**: Offline queue & conflict handling polished.
5. **Week 8**: Anti‑cheat MVP, telemetry, TestFlight/Internal testing.

---

## 21) Open Questions (Please Answer to Tailor the Spec)

**Vision & Theme**

1. Tone: realistic, stylized, whimsical? **→ Answer: Realistic (Locked).**
2. Audience: casual walkers, strategy gamers, collectors? **→ Answer: All (Locked).**
3. Violence policy? **→ Answer: Mature content allowed; bloody battles permitted. Athletic (sports) is incentivized for progression. (Locked).**

**Map & Movement** 4. Is **walking** required or is couch play allowed? Any step goals? *(TBD)* 5. Do you want **POI‑based gameplay** (parks, landmarks) or **cell‑only**? *(TBD)*

**Core Mechanics** 6. Confirm dual progression (Athletic encouraged, Martial allowed). Any must‑have skirmish mechanics (e.g., stealth, morale, injuries)? *(TBD)* 7. Time gates: how long should upgrades/production cycles be (minutes vs hours)? *(TBD)*

**Social** 8. Clubs/Guilds in MVP? *(Recommend MVP lite: join/leave, emblem; chat later)* 9. PvP cadence: always‑on ladders vs scheduled cups/raid windows? *(Propose both)*

**Monetization** 10. Season Pass at launch? *(Recommend yes; free + premium tracks)* 11. Ads allowed? *(Recommend opt‑in only)*

**Tech choices** 12. Map provider preference: Google vs Mapbox vs OSM tiles? *(Recommend Mapbox)* 13. Backend preference: Firebase vs Supabase vs Nakama? *(Recommend Firebase first)* 14. Visuals: Flutter UI first; Flame minigames later? *(Recommended; defer sports minigame scaffolding)*

**Compliance & Ratings** 15. Target ratings: **PEGI 16 / ESRB M** acceptable? Regional switches for gore toggle? *(TBD)* 16. Data residency constraints (UK/EU only)? *(TBD)*

**Ops** 17. Target devices: Android + iOS both at MVP? *(Recommend both)* 18. Minimum OS versions? *(Recommend iOS 15+, Android 8+)*

---

## 22) Developer Task Board (Initial Backlog — Updated)

- **EPIC**: Foundations

  - Story: App scaffold (flavors, env, theming)
  - Story: Firebase projects (dev/stage/prod)
  - Story: Auth (anon→provider)
  - Story: Location/permissions screens & copy
  - Story: Map screen with puck + cell overlay (Mapbox)
  - Story: Isar cache with migrations

- **EPIC**: World & Actions (Core Loop)

  - Story: S2 cell library & overlay renderer
  - Story: Create/claim base in cell
  - Story: Production timers & storage (server tick)
  - Story: Upgrade action (time gate, Cloud Tasks)
  - Story: Offline intent queue & sync

- **EPIC**: Skirmish (Martial MVP)

  - Story: Raid window request → scheduler → active → resolve (autoresolve v0)
  - Story: Autoresolve formula v0 (see Section 24)
  - Story: Notifications (raid open/resolve)

- **EPIC**: Server

  - Story: OpenAPI for REST
  - Story: WebSocket pub/sub (region + user channels)
  - Story: Tick worker (Cloud Tasks)
  - Story: Security rules & rate limits
  - Story: Anti‑cheat checks

- **EPIC**: Live‑Ops

  - Story: Feature flags/remote config
  - Story: Analytics events

---

## 23) Example Screens (Wireframe Descriptions)

1. **Map Home**: top AppBar (energy, resources), map with your cell outlined, FAB: "Claim/Upgrade"; bottom sheet shows cell details.
2. **Base Screen**: upgrade tree, production timers, storage, collect button.
3. **Inventory**: items, craft button, craft queue.
4. **Events**: list of nearby/active events; timer to next tick.
5. **Settings**: privacy, data export/delete, background location toggle.

---

## 24) Skirmish MVP — Autoresolve v0 (Design)

**Goal**: enable raids without minigames initially; resolve via stats + timing.

**Inputs**

- Attacker: `powerA = baseLevelA * (1 + moraleA + buffsA) * troopsA`
- Defender: `powerD = baseLevelD * (1 + moraleD + buffsD) * troopsD * (defenseBonus)`
- Random factor: `rand ∈ [0.95, 1.05]`
- Injury/cooldown: proportional to damage share.

**Outcome**

- Probability Attacker wins: `P(win) = powerA^k / (powerA^k + powerD^k)` where `k=1.15` (tuneable).
- If win: transfer X% storage from defender to attacker; apply **debuff** on defender production for Y minutes; attacker cooldown Z minutes.
- If loss: attacker loses consumables/units; defender gets small prestige.

**Server Flow**

1. `POST /raid/open` → create `RaidWindow{Scheduled}` (rate‑limited by region).
2. At `startTs`, move to `Active` and notify both.
3. Autoresolve job (Cloud Task) runs at `endTs` or on defender/attacker commit.
4. Write result atomically (transaction): update bases, storages, cooldowns.

**Anti‑abuse**: one concurrent raid per attacker; cooldowns written server‑side; location/velocity check on open/commit.

---

## 25) Claude Sonnet Task Cards (Cursor‑Ready)

> Use these verbatim as Cursor tasks. Each card is self‑contained with acceptance criteria.

### Card A1 — Flutter Project Scaffold

**Do:** Create Flutter project with flavors (dev/stage/prod), Material 3 theme, Riverpod, Isar (encrypted), env loader. **AC:**

- `--dart-define` flags select Firebase project + Mapbox key.
- App boots, shows version/build from `package_info_plus`.
- Unit test for env loader passes.

### Card A2 — Auth (Anon → Provider)

**Do:** Integrate Firebase Auth with anonymous sign‑in and upgrade to Google/Apple/Email. **AC:**

- New users created anon; upgrade keeps UID.
- `/users/{uid}` doc initialized with defaults.

### Card A3 — Location Permissions & Puck

**Do:** Request foreground location; render user puck on Mapbox map. **AC:**

- Denied flow handled; copy explains why.
- Accuracy + age displayed for debug (dev builds only).

### Card A4 — S2 Cells Overlay

**Do:** Render S2 grid (level configurable) around user with claimable highlight. **AC:**

- Grid overlays efficiently with throttled re‑builds.

### Card A5 — Claim/Upgrade Base (Intent + Sync)

**Do:** Implement client intent queue, `POST /intents` for `ClaimBase`, `UpgradeBase`. **AC:**

- Offline enqueue → sync on reconnect → server updates local cache.

### Card S1 — Tick Worker & Production

**Do:** Cloud Run/Functions worker + Cloud Tasks for per‑base production. **AC:**

- Production accrues over time; collection endpoint returns delta + resets timers.

### Card M1 — Raid Window + Autoresolve v0

**Do:** Endpoints and jobs for raid open/resolve with autoresolve formula. **AC:**

- Rate limits + cooldowns enforced; notifications fired; Firestore updates transactional.

---

## 26) Definition of Done (MVP) — Updated

- Core loop playable (claim → produce → upgrade → collect) with offline queue.
- Raid window + autoresolve functional with cooldowns and notifications.
- Anti‑cheat MVP active; analytics events shipped.
- Privacy policy + gore toggle implemented.
- Internal test on Android + iOS; P50 action latency < 500ms.

---

## 25) Risk Register (MVP)

- **GPS spoofing** undermines fairness → mitigate with checks & server authority.
- **Battery drain** from high‑accuracy GPS → adaptive sampling & geofences.
- **Cost creep** on Firestore with hot shards → shard by region/day; backfill jobs.
- **Map licensing** surprises → pick provider early; cache usage.
- **Platform background limits** break expectations → design with notifications.

---

## 26) Definition of Done (MVP)

- Functional test route across town exercises: claim base → produce → upgrade.
- 95% of intents applied within 500ms P50 / 2s P95 online.
- Offline queue survives app kill/OS reboot.
- Privacy policy & consent flows reviewed.
- Playtest with 10+ external testers on both platforms.

---

## 27) Next Steps

1. Confirm dual‑track progression specifics (what skirmish mechanics exist in MVP?).
2. Lock backend (Firebase) and map provider (Mapbox) unless you prefer otherwise.
3. Build core loop first: Map + Cells overlay + Claim/Upgrade + Production + Offline queue.
4. Define **Skirmish MVP** (non‑sports) minigame/autoresolve and server model.
5. Defer sports minigames until after core loop; keep Arena scaffolding out of MVP.
6. Prepare this document for **Cursor IDE + Claude Sonnet**: create concise task cards with acceptance criteria per story.

> This document will be adapted to a "Cursor Rules + Claude Tasks" format next.

---

## 28) Settlements & Cells — Core Mechanics (Data‑Driven)

**Goals**: City‑builder depth inside each GPS cell; scalable to adjacent cells; all content defined by admin JSON (no code changes).

### 28.1 Cell Anatomy

- **Cell capacity** (`cap.tiles`): number of buildable tiles inside a cell (derived from S2 level + biome modifiers).
- **Placement grid**: logical NxN grid (e.g., 8×8) mapped to the cell polygon; stores occupancy.
- **Biome**: modifies production (+10% farms in Plains, −20% mines in Marsh, etc.).
- **Hazards**: optional per‑cell flags (e.g., flood‑prone) that apply conditional debuffs.

### 28.2 Settlement Lifecycle

1. **Found**: Player claims empty cell → creates `/bases/{baseId}` with `level=1` and default buildings (e.g., Town Center).
2. **Build/Place**: Player spends resources + build time → server checks capacity, adjacency rules, cooldowns.
3. **Produce**: Buildings generate resources per tick; storage caps apply.
4. **Upgrade**: Improves rates, unlocks slots/tiles, enables new buildings/units.
5. **Expand**: Settle **adjacent cells** (4‑ or 8‑connected) once prerequisites met.

### 28.3 Adjacent Expansion Rules

- **Adjacency**: target cell must share an edge (N,S,E,W) by default; diagonals optional via tech.
- **Influence radius**: owning more neighboring cells reduces settle time/cost (snowball limiter caps bonus).
- **Upkeep**: each owned cell adds upkeep drain (food/coin). If upkeep unpaid, border cells enter **decay** (reduced output, risk of revolt events).
- **Protection window**: new outposts gain a 24h raid‑reduction modifier (configurable).

### 28.4 Placement Within Cell

- **Tile types**: `FREE`, `OCCUPIED`, `ROAD`, `WATER`, `HILL` (biome affects availability).
- **Footprint**: each building has width×height tiles + optional buffer tiles.
- **Road adjacency bonus**: +10% output if connected to Town Center by road path.
- **Collision**: server validates placement against occupancy bitmap and terrain tags.

---

## 29) NPC System — Pioneers, Scouts, Workers (Data‑Driven)

**Unit roles** (examples; all defined via content JSON):

- **Pioneer**: explores fog, reveals cell stats, can found an outpost (consumes unit & kit).
- **Military Scout**: reveals enemy settlement info, raid windows, and troop estimates.
- **Worker**: improves build speed on an assigned site; can repair during/after raids.
- **Courier**: moves resources between adjacent cells with travel time & risk.

### 29.1 Unit Travel & Fog of War

- **Fog state** per player: `Unknown` → `Scouted` (static preview) → `Surveyed` (exact yields after Pioneer).
- **Movement**: BFS/greedy on S2 neighbors with per‑edge travel time (biome + weather modifiers).
- **Waypoints**: units carry a lightweight path (`[cellId...]`) that the server advances each tick.
- **Discovery**: entering a cell triggers **survey roll** to reveal hidden bonuses/hazards.

### 29.2 Orders & Queues

- Client issues **orders** (move, survey, found, return) as `ActionIntent`.
- Server creates **UnitJob** doc with `startTs`, `etaTs`, `path`, and `onArrival` effect.
- If offline, jobs continue; completion writes a notification and updates fog state/inventory.

---

## 30) Content Authoring — Data‑Driven Everything

All gameplay content is configured by admin JSON files with versioning and hot‑reload.

### 30.1 Content Storage & Versioning

- **Cloud Storage**: `/content/{version}/` directory containing JSON packs.
- **Manifest** (signed): lists files + checksum; referenced by `/config/live/contentVersion`.
- **Server** loads content at boot or on **Remote Config** bump; clients fetch read‑only caches.

### 30.2 Firestore Pointers

- `/content/meta` → `{ currentVersion, prevVersions[], rolloutPercent }`
- `/content/changelogs/{version}` → human‑readable patch notes.

### 30.3 JSON Packs (examples)

- `buildings.json`
- `units.json`
- `tech.json`
- `biomes.json`
- `events.json`
- `rewards.json`

---

## 31) Example Content Schemas (JSON)

### 31.1 Building Definition

```json
{
  "id": "farm_basic",
  "name": "Farm",
  "category": "ECON",
  "footprint": {"w": 2, "h": 2, "buffer": 0},
  "requires": {"tech": ["agri_1"], "settlementLevel": 1},
  "build": {"timeSec": 600, "cost": {"wood": 50, "stone": 10}},
  "upgrade": [{
    "level": 2,
    "timeSec": 1200,
    "cost": {"wood": 80, "stone": 20},
    "effects": [{"type": "PROD_MULT", "resource": "food", "value": 1.25}]
  }],
  "production": {
    "perTick": {"food": 5},
    "biomeMods": [{"biome": "PLAINS", "mult": 1.1}, {"biome": "MARSH", "mult": 0.8}]
  },
  "roadAdjacencyBonus": 0.1
}
```

### 31.2 Unit Definition (Pioneer)

```json
{
  "id": "unit_pioneer",
  "name": "Pioneer",
  "role": "PIONEER",
  "speedCellsPerHour": 6,
  "carry": {"kits": 1},
  "actions": [
    {"id": "SURVEY", "timeSec": 300, "effects": [{"type": "REVEAL_CELL", "details": ["biome","yields","hazards"]}]},
    {"id": "FOUND_OUTPOST", "timeSec": 900, "requires": {"item": "outpost_kit"}, "effects": [{"type": "CREATE_BASE", "level": 1}]}
  ],
  "upgrades": [{"level": 2, "effects": [{"type": "SPEED_MULT", "value": 1.15}]}]
}
```

### 31.3 Technology Definition

```json
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
```

### 31.4 Sports Team (Deferred Implementation, Data‑Defined Now)

```json
{
  "id": "team_football_basic",
  "name": "Village FC",
  "requires": {"building": "arena_small"},
  "trainingRate": 1.0,
  "effects": [{"type": "PRESTIGE_PER_WIN", "value": 5}],
  "upgrades": [{"level": 2, "effects": [{"type": "TRAINING_MULT", "value": 1.2}]}]
}
```

---

## 32) Server Tick & Job Processing (Expanded)

- **Tick cadence**: region shard tick every 5 min; per‑job tasks scheduled exactly.
- **Production**: iterate dirty buildings; apply biome/road bonuses; cap at storage.
- **Unit jobs**: advance one edge per sub‑tick; if `etaTs <= now` → apply arrival effects.
- **Research**: if lab active, decrement timers; on completion apply tech effects (e.g., unlock diagonal expansion).
- **Decay/Upkeep**: evaluate upkeep shortfalls; mark cells with `DECAY` and reduce outputs.

**Transactions**: use Firestore batched writes or transactions to update `bases`, `cells`, `users.inventory`, and append to a write‑ahead `events` collection for analytics/audits.

---

## 33) Admin & Live Balancing

- **Remote Config keys** for global multipliers (e.g., `prodMult.global`, `raid.cooldown.min`), overridable per‑region.
- **Feature flags**: `features.sports.enabled=false` at launch; enable later without client update.
- **Content hot‑reload**: bump `/content/meta.currentVersion`; backend reloads manifests; clients poll on app start/foreground.
- **Validation pipeline**: JSON schema validation in CI; checksum signing; rollback to `prevVersions` on failure.

---

## 34) Acceptance Criteria — Settlements/NPC (Cursor Cards)

### Card B1 — Placement Grid & Capacity

**Do:** Implement server‑validated placement grid per cell with occupancy checks and road bonus calculation. **AC:**

- Buildings occupy correct footprints; collisions prevented.
- Road adjacency bonus applied in production.

### Card B2 — Adjacent Expansion

**Do:** Enforce edge‑adjacent expansion (configurable); apply upkeep and protection window. **AC:**

- Expansion blocked if no adjacency; upkeep debuff triggers when unpaid.

### Card U1 — Pioneers (Explore & Found)

**Do:** Pioneer unit orders (move/survey/found) with fog updates and outpost creation. **AC:**

- Survey reveals cell yields; found creates level‑1 base and consumes kit.

### Card U2 — Scouts (Recon)

**Do:** Scout unit orders to reveal enemy summary (owner, level, raid windows estimate). **AC:**

- Recon results cached with TTL; anti‑spoof checks on order origin.

---

---

## 35) Starter Content Packs (v0.0.1)

> Drop these JSON files into Cloud Storage at `/content/v0_0_1/` and set `/content/meta.currentVersion = "v0_0_1"`. All ids kebab\_case; numbers are conservative for MVP testing.

### 35.1 `manifest.json`

```json
{
  "version": "v0_0_1",
  "files": [
    {"name": "buildings.json", "sha256": "TODO"},
    {"name": "units.json", "sha256": "TODO"},
    {"name": "tech.json", "sha256": "TODO"},
    {"name": "biomes.json", "sha256": "TODO"},
    {"name": "events.json", "sha256": "TODO"},
    {"name": "rewards.json", "sha256": "TODO"}
  ]
}
```

### 35.2 `buildings.json` (6 entries)

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
      {"level": 2, "timeSec": 3600, "cost": {"wood": 200, "stone": 150},
       "effects": [
         {"type": "UNLOCK", "item": "build.queue.slot", "value": 1},
         {"type": "STORAGE_CAP", "resource": "all", "value": 400}
       ]}
    ]
  },
  {
    "id": "farm_basic",
    "name": "Farm",
    "category": "ECON",
    "footprint": {"w": 2, "h": 2, "buffer": 0},
    "requires": {"tech": ["agri_1"], "settlementLevel": 1},
    "build": {"timeSec": 600, "cost": {"wood": 50, "stone": 10}},
    "production": {"perTick": {"food": 4}, "biomeMods": [{"biome":"PLAINS","mult":1.1},{"biome":"MARSH","mult":0.8}]},
    "roadAdjacencyBonus": 0.1,
    "upgrade": [
      {"level": 2, "timeSec": 1200, "cost": {"wood": 80, "stone": 20},
       "effects": [{"type": "PROD_MULT", "resource": "food", "value": 1.25}]}
    ]
  },
  {
    "id": "mine_basic",
    "name": "Mine",
    "category": "ECON",
    "footprint": {"w": 2, "h": 2, "buffer": 1},
    "requires": {"tech": ["mining_1"], "settlementLevel": 1},
    "build": {"timeSec": 900, "cost": {"wood": 40, "stone": 60}},
    "production": {"perTick": {"ore": 2}, "biomeMods": [{"biome":"HILL","mult":1.2},{"biome":"PLAINS","mult":0.9}]},
    "roadAdjacencyBonus": 0.05,
    "upgrade": [
      {"level": 2, "timeSec": 1500, "cost": {"wood": 70, "stone": 100},
       "effects": [{"type": "PROD_MULT", "resource": "ore", "value": 1.3}]}
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

### 35.3 `units.json` (3 entries)

```json
[
  {
    "id": "unit_pioneer",
    "name": "Pioneer",
    "role": "PIONEER",
    "speedCellsPerHour": 6,
    "carry": {"kits": 1},
    "actions": [
      {"id": "SURVEY", "timeSec": 300, "effects": [{"type": "REVEAL_CELL", "details": ["biome","yields","hazards"]}]},
      {"id": "FOUND_OUTPOST", "timeSec": 900, "requires": {"item": "outpost_kit"}, "effects": [{"type": "CREATE_BASE", "level": 1}]}
    ],
    "upgrades": [{"level": 2, "effects": [{"type": "SPEED_MULT", "value": 1.15}]}]
  },
  {
    "id": "unit_scout",
    "name": "Scout",
    "role": "SCOUT",
    "speedCellsPerHour": 10,
    "vision": 2,
    "actions": [
      {"id": "RECON", "timeSec": 240, "effects": [{"type": "REVEAL_ENEMY_SUMMARY", "ttlSec": 3600}]}
    ],
    "upgrades": [{"level": 2, "effects": [{"type": "VISION_RADIUS", "value": 1}]}]
  },
  {
    "id": "unit_worker",
    "name": "Worker",
    "role": "WORKER",
    "speedCellsPerHour": 4,
    "actions": [
      {"id": "BOOST_BUILD", "timeSec": 600, "effects": [{"type": "BUILD_SPEED_MULT", "value": 1.2, "durationSec": 3600}]},
      {"id": "REPAIR", "timeSec": 600, "effects": [{"type": "REPAIR_BUILDING", "value": 100}]}
    ]
  }
]
```

### 35.4 `tech.json` (5 entries)

```json
[
  {"id": "agri_1", "name": "Agriculture I", "tier": 1, "prereq": [], "cost": {"science": 80}, "timeSec": 1200,
   "effects": [{"type": "UNLOCK_BUILDING", "id": "farm_basic"}]},
  {"id": "mining_1", "name": "Mining I", "tier": 1, "prereq": [], "cost": {"science": 80}, "timeSec": 1200,
   "effects": [{"type": "UNLOCK_BUILDING", "id": "mine_basic"}]},
  {"id": "masonry_1", "name": "Masonry I", "tier": 1, "prereq": [], "cost": {"science": 100}, "timeSec": 1800,
   "effects": [{"type": "UNLOCK_BUILDING", "id": "barracks_basic"}, {"type": "UNLOCK_BUILDING", "id": "road_stone"}]},
  {"id": "logistics_1", "name": "Logistics I", "tier": 1, "prereq": ["masonry_1"], "cost": {"science": 120}, "timeSec": 2400,
   "effects": [{"type": "UNLOCK_BUILDING", "id": "storage_yard"}, {"type": "CARRY_MULT", "unitRole": "COURIER", "value": 1.25}]},
  {"id": "cartography_1", "name": "Cartography", "tier": 1, "prereq": [], "cost": {"science": 100}, "timeSec": 1800,
   "effects": [{"type": "FOG_RADIUS", "value": 1}, {"type": "ADJACENCY_RULE", "value": "ALLOW_DIAGONAL"}]}
]
```

### 35.5 `biomes.json` (3 entries)

```json
[
  {"id": "PLAINS", "name": "Plains", "tileTags": ["FREE","ROAD"], "mods": [{"resource":"food","mult":1.1}]},
  {"id": "FOREST", "name": "Forest", "tileTags": ["FREE","HILL"], "mods": [{"resource":"wood","mult":1.2}]},
  {"id": "MARSH", "name": "Marsh", "tileTags": ["FREE","WATER"], "mods": [{"resource":"food","mult":0.8}]}
]
```

### 35.6 `events.json` (lightweight starters)

```json
[
  {"id": "rain_showers", "name": "Rain Showers", "durationSec": 1800,
   "effects": [{"type": "PROD_MULT", "resource": "food", "value": 1.05}],
   "conditions": [{"type": "WEATHER", "value": "RAIN"}]},
  {"id": "market_day", "name": "Market Day", "durationSec": 7200,
   "effects": [{"type": "COLLECT_BONUS", "resource": "all", "value": 1.1}],
   "conditions": [{"type": "WEEKDAY", "value": "SAT"}]}
]
```

### 35.7 `rewards.json` (prestige & cosmetics)

```json
{
  "prestige": {
    "raid_win": 3,
    "cup_win": 10,
    "cup_runner_up": 5
  },
  "lootTables": {
    "scout_recon": [{"item":"intel_fragment","p":0.6},{"item":"coin","min":5,"max":15,"p":0.4}],
    "raid_victory": [{"resource":"coin","min":20,"max":60,"p":1.0}]
  },
  "cosmetics": {
    "banners": ["oak_green","iron_gray"],
    "road_vfx": ["dust_trail_light"]
  }
}
```

### 35.8 Remote Config (examples)

```
prodMult.global=1.0
raid.cooldown.min=900
settle.protection.window.sec=86400
content.currentVersion=v0_0_1
features.sports.enabled=false
```

---

## 36) Seed Balancing Notes

- Tick = 5 min; Farm yields 4 food/tick (≈48/hr) before bonuses.
- Town Center L1 cap 200 → encourages building **Storage Yard** early.
- Early research path: `agri_1` → `masonry_1` → `logistics_1` (storage/carry) with `cartography_1` for diagonal expansion.
- Barracks present but soldiers not required for MVP playtest (can keep unit locked if desired).

---

## 37) Next Actions (Content)

1. Upload `/content/v0_0_1/*.json` to Cloud Storage and set Remote Config values.
2. Implement backend content loader with checksum verification and warm cache.
3. Seed a few regions with biome distributions (70% Plains, 20% Forest, 10% Marsh for testing).
4. Run a smoke test: claim → place farm/mine → tick production → research agri\_1 → expand.

