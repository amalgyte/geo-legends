# Backend Architecture (Firebase)

## Technology Stack

### Core Services
- **Firebase Auth**: User authentication and authorization
- **Cloud Firestore**: NoSQL database for game state
- **Cloud Functions**: Serverless compute for game logic
- **Cloud Run**: Containerized services for heavy processing
- **Cloud Tasks**: Delayed job processing
- **Cloud Scheduler**: Cron-like job scheduling
- **Cloud Storage**: Content and asset storage
- **Firebase Messaging**: Push notifications

### Additional Services
- **Cloud Pub/Sub**: Event-driven architecture
- **Cloud Logging**: Centralized logging
- **Cloud Monitoring**: Performance monitoring
- **Cloud Security**: Security scanning and compliance

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   Web Client    │    │   Admin Panel   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  API Gateway    │
                    │  (Cloud Run)    │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Game Services  │    │  Auth Services  │    │  Admin Services │
│  (Cloud Run)    │    │  (Cloud Run)    │    │  (Cloud Run)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Firestore     │
                    │   Database      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloud Tasks   │    │  Cloud Scheduler   │    │  Cloud Storage   │
│  (Background)    │    │  (Cron Jobs)   │    │  (Content)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Firestore Database Schema

### Collections Structure
```
/users/{uid}
├── uid: string
├── displayName: string
├── trustScore: number
├── clubId?: string
├── inventory: map<string, number>
├── homeCellId: string
├── lastKnownLoc: {lat, lng, ts}
└── goreToggle: boolean

/cells/{cellId}
├── cellId: string
├── level: number
├── biome: string
├── regionId: string
├── ownerUid?: string
├── baseLevel: number
├── production: map<string, number>
├── storage: map<string, number>
├── conflictState: string
└── lastTickTs: timestamp

/bases/{baseId}
├── baseId: string (keyed by cellId)
├── ownerUid: string
├── level: number
├── buildings: array<Building>
├── production: map<string, number>
├── storage: map<string, number>
├── defenses: array<Defense>
└── lastUpdate: timestamp

/actions/{yyyyMMdd}/{actionId}
├── id: string
├── uid: string
├── type: string
├── targetId: string
├── createdTs: timestamp
├── expiresTs: timestamp
├── status: string
└── loc: {lat, lng, accuracy}

/raids/{yyyyMMdd}/{raidId}
├── id: string
├── attackerUid: string
├── defenderBaseId: string
├── startTs: timestamp
├── endTs: timestamp
└── state: string

/items/{itemId}
├── id: string
├── name: string
├── category: string
├── cost: map<string, number>
├── effects: array<Effect>
└── requirements: array<Requirement>

/clubs/{clubId}
├── id: string
├── name: string
├── members: array<string>
├── regionId: string
├── prestige: number
└── createdTs: timestamp
```

### Security Rules
```javascript
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
      allow write: if isAuth() && request.resource.data.uid == request.auth.uid;
    }
    
    match /raids/{date}/{raidId} {
      allow read: if isAuth();
      allow write: if false; // server only
    }
  }
}
```

## API Endpoints (Cloud Run)

### REST API Structure
```typescript
// GET /cells
interface GetCellsRequest {
  around: string; // "lat,lng"
  radius: number;
  level?: number;
}

interface GetCellsResponse {
  cells: Cell[];
  serverTime: string;
}

// POST /intents
interface SubmitIntentRequest {
  type: string;
  targetId: string;
  clientTs: string;
  loc: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

interface SubmitIntentResponse {
  status: 'queued' | 'applied' | 'rejected';
  reason?: string;
}

// GET /me
interface GetProfileResponse {
  user: User;
  inventory: Map<string, number>;
  notifications: Notification[];
}

// POST /collect
interface CollectRequest {
  baseId: string;
  resourceType: string;
}

interface CollectResponse {
  collected: Map<string, number>;
  newStorage: Map<string, number>;
}

// POST /raid/open
interface OpenRaidRequest {
  targetCellId: string;
  raidType: string;
}

interface OpenRaidResponse {
  raidId: string;
  startTime: string;
  endTime: string;
}
```

### WebSocket API
```typescript
// WS /stream
interface WebSocketMessage {
  type: 'cell_update' | 'user_update' | 'raid_update';
  data: any;
  timestamp: string;
}

// Subscribe to cells
interface SubscribeMessage {
  type: 'subscribe';
  cells: string[];
}

// Unsubscribe from cells
interface UnsubscribeMessage {
  type: 'unsubscribe';
  cells: string[];
}
```

## Cloud Functions

### Game Logic Functions
```typescript
// Production tick processing
export const processProductionTick = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    const regions = await getActiveRegions();
    
    for (const region of regions) {
      await processRegionTick(region.id);
    }
  });

// Raid resolution
export const resolveRaid = functions.firestore
  .document('raids/{date}/{raidId}')
  .onUpdate(async (change, context) => {
    const raid = change.after.data();
    
    if (raid.state === 'active' && raid.endTs <= Date.now()) {
      await resolveRaidOutcome(raid);
    }
  });

// Action intent processing
export const processActionIntent = functions.firestore
  .document('actions/{date}/{actionId}')
  .onCreate(async (snap, context) => {
    const intent = snap.data();
    
    if (intent.type === 'upgrade') {
      await scheduleUpgrade(intent);
    } else if (intent.type === 'raid') {
      await scheduleRaid(intent);
    }
  });
```

### Authentication Functions
```typescript
// User creation
export const createUser = functions.auth.user().onCreate(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    trustScore: 100,
    inventory: {},
    homeCellId: '',
    lastKnownLoc: null,
    goreToggle: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// User deletion
export const deleteUser = functions.auth.user().onDelete(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).delete();
  // Clean up user data
  await cleanupUserData(user.uid);
});
```

## Cloud Tasks Integration

### Delayed Job Processing
```typescript
// Schedule upgrade completion
export async function scheduleUpgrade(intent: ActionIntent) {
  const upgradeTime = intent.createdTs + (intent.duration * 1000);
  
  await admin.tasks().createTask({
    name: `upgrade-${intent.id}`,
    scheduleTime: new Date(upgradeTime),
    httpRequest: {
      url: `${process.env.API_URL}/complete-upgrade`,
      method: 'POST',
      body: Buffer.from(JSON.stringify({ intentId: intent.id })),
      headers: { 'Content-Type': 'application/json' },
    },
  });
}

// Schedule raid window
export async function scheduleRaid(intent: ActionIntent) {
  const raidStart = intent.createdTs + (intent.delay * 1000);
  const raidEnd = raidStart + (intent.duration * 1000);
  
  await admin.tasks().createTask({
    name: `raid-${intent.id}`,
    scheduleTime: new Date(raidStart),
    httpRequest: {
      url: `${process.env.API_URL}/open-raid`,
      method: 'POST',
      body: Buffer.from(JSON.stringify({ intentId: intent.id })),
    },
  });
}
```

## Cloud Scheduler Jobs

### Periodic Tasks
```typescript
// Global tick processing
export const globalTick = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('UTC')
  .onRun(async (context) => {
    await processGlobalTick();
  });

// Daily cleanup
export const dailyCleanup = functions.pubsub
  .schedule('0 2 * * *') // 2 AM UTC daily
  .timeZone('UTC')
  .onRun(async (context) => {
    await cleanupExpiredIntents();
    await cleanupOldLogs();
  });

// Weekly events
export const weeklyEvents = functions.pubsub
  .schedule('0 0 * * 1') // Monday at midnight UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    await startWeeklyCompetitions();
  });
```

## Monitoring & Logging

### Cloud Logging
```typescript
import { Logging } from '@google-cloud/logging';

const logging = new Logging();
const log = logging.log('geo-legends');

// Structured logging
export function logGameEvent(event: string, data: any) {
  log.write({
    severity: 'INFO',
    jsonPayload: {
      event,
      data,
      timestamp: new Date().toISOString(),
    },
  });
}

// Error logging
export function logError(error: Error, context: any) {
  log.write({
    severity: 'ERROR',
    jsonPayload: {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    },
  });
}
```

### Performance Monitoring
```typescript
import { Monitoring } from '@google-cloud/monitoring';

const monitoring = new Monitoring();

// Custom metrics
export async function recordMetric(metricName: string, value: number) {
  await monitoring.createTimeSeries({
    name: `projects/${process.env.PROJECT_ID}`,
    timeSeries: [{
      metric: {
        type: `custom.googleapis.com/${metricName}`,
      },
      points: [{
        interval: {
          endTime: { seconds: Date.now() / 1000 },
        },
        value: { doubleValue: value },
      }],
    }],
  });
}
```

## Security Considerations

### Authentication & Authorization
- **Firebase Auth**: Centralized user management
- **JWT Tokens**: Secure API authentication
- **Role-based Access**: Admin, user, and guest roles
- **Rate Limiting**: Prevent abuse and DoS attacks

### Data Protection
- **Encryption**: All data encrypted in transit and at rest
- **Privacy Controls**: User data minimization
- **GDPR Compliance**: Data export and deletion
- **Audit Logging**: Track all data access and modifications

### Anti-Cheat Measures
- **Location Validation**: Server-side GPS verification
- **Rate Limiting**: Prevent rapid-fire actions
- **Trust Scoring**: Track suspicious behavior
- **Server Authority**: All game logic server-side
