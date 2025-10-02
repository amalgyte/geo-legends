# Networking & Sync

## Online/Offline Behavior

### Online Mode
- **Full Features**: All game functionality available
- **Real-time Updates**: Immediate server synchronization
- **Live Notifications**: Push notifications for events
- **WebSocket Connection**: Real-time data streaming
- **Immediate Actions**: Actions processed instantly

### Offline Mode
- **Read-only Cache**: Last known game state
- **Local Intents**: Queue actions for later sync
- **Offline Queue**: Store actions with expiry
- **Background Sync**: Periodic synchronization attempts
- **Graceful Degradation**: Reduced functionality but playable

## Sync Architecture

### Client-Side Sync
```dart
class SyncService {
  final ApiClient _apiClient;
  final LocalDatabase _localDb;
  final WebSocketService _wsService;
  
  // Sync local changes to server
  Future<void> syncToServer() async {
    final pendingIntents = await _localDb.getPendingIntents();
    
    for (final intent in pendingIntents) {
      try {
        await _apiClient.submitIntent(intent);
        await _localDb.markIntentAsSynced(intent.id);
      } catch (e) {
        if (intent.expiresTs.isBefore(DateTime.now())) {
          await _localDb.removeExpiredIntent(intent.id);
        }
      }
    }
  }
  
  // Sync server changes to local
  Future<void> syncFromServer() async {
    final lastSync = await _localDb.getLastSyncTime();
    final updates = await _apiClient.getUpdatesSince(lastSync);
    
    for (final update in updates) {
      await _localDb.applyUpdate(update);
    }
    
    await _localDb.setLastSyncTime(DateTime.now());
  }
}
```

### Server-Side Sync
```typescript
// WebSocket connection management
class WebSocketManager {
  private connections = new Map<string, WebSocket>();
  
  // Subscribe user to cell updates
  subscribeToCells(userId: string, cellIds: string[]) {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.send(JSON.stringify({
        type: 'subscribe',
        cells: cellIds
      }));
    }
  }
  
  // Broadcast cell updates
  broadcastCellUpdate(cellId: string, update: any) {
    const subscribers = this.getCellSubscribers(cellId);
    subscribers.forEach(userId => {
      const connection = this.connections.get(userId);
      if (connection) {
        connection.send(JSON.stringify({
          type: 'cell_update',
          cellId,
          data: update
        }));
      }
    });
  }
}
```

## Conflict Resolution

### Action Intent Conflicts
```typescript
interface ConflictResolution {
  // Server receives conflicting intents
  async resolveConflicts(intent: ActionIntent): Promise<Resolution> {
    const existing = await this.getExistingIntents(intent.targetId);
    
    // Check for conflicts
    for (const existingIntent of existing) {
      if (this.isConflict(intent, existingIntent)) {
        return this.resolveConflict(intent, existingIntent);
      }
    }
    
    return { status: 'applied', intent };
  }
  
  // Conflict resolution strategies
  private resolveConflict(newIntent: ActionIntent, existingIntent: ActionIntent): Resolution {
    // Server authority - newer intent wins
    if (newIntent.createdTs > existingIntent.createdTs) {
      return {
        status: 'applied',
        intent: newIntent,
        superseded: existingIntent.id
      };
    }
    
    // Existing intent takes precedence
    return {
      status: 'rejected',
      intent: newIntent,
      reason: 'superseded_by_existing'
    };
  }
}
```

### Data Synchronization
```dart
class ConflictResolver {
  // Resolve conflicts between local and server data
  Future<ConflictResolution> resolveDataConflict(
    String entityId,
    Map<String, dynamic> localData,
    Map<String, dynamic> serverData,
  ) async {
    // Check for conflicts
    final conflicts = _findConflicts(localData, serverData);
    
    if (conflicts.isEmpty) {
      return ConflictResolution.noConflict();
    }
    
    // Apply conflict resolution strategy
    return ConflictResolution.serverWins(serverData);
  }
  
  // Find specific conflicts
  List<Conflict> _findConflicts(
    Map<String, dynamic> local,
    Map<String, dynamic> server,
  ) {
    final conflicts = <Conflict>[];
    
    for (final key in local.keys) {
      if (server.containsKey(key) && local[key] != server[key]) {
        conflicts.add(Conflict(
          field: key,
          localValue: local[key],
          serverValue: server[key],
        ));
      }
    }
    
    return conflicts;
  }
}
```

## Real-time Updates

### WebSocket Implementation
```dart
class WebSocketService {
  WebSocketChannel? _channel;
  final StreamController<Map<String, dynamic>> _messageController = 
      StreamController.broadcast();
  
  // Connect to WebSocket
  Future<void> connect() async {
    final token = await FirebaseAuth.instance.currentUser?.getIdToken();
    final uri = Uri.parse('$wsUrl/stream?token=$token');
    
    _channel = WebSocketChannel.connect(uri);
    _channel!.stream.listen(_handleMessage);
  }
  
  // Handle incoming messages
  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message);
      _messageController.add(data);
    } catch (e) {
      print('Error parsing WebSocket message: $e');
    }
  }
  
  // Subscribe to specific cells
  void subscribeToCells(List<String> cellIds) {
    _channel?.sink.add(jsonEncode({
      'type': 'subscribe',
      'cells': cellIds,
    }));
  }
  
  // Unsubscribe from cells
  void unsubscribeFromCells(List<String> cellIds) {
    _channel?.sink.add(jsonEncode({
      'type': 'unsubscribe',
      'cells': cellIds,
    }));
  }
}
```

### Server-Side WebSocket
```typescript
// WebSocket server implementation
class WebSocketServer {
  private connections = new Map<string, WebSocket>();
  private subscriptions = new Map<string, Set<string>>();
  
  // Handle new connection
  handleConnection(ws: WebSocket, userId: string) {
    this.connections.set(userId, ws);
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(userId, message);
    });
    
    ws.on('close', () => {
      this.connections.delete(userId);
      this.subscriptions.delete(userId);
    });
  }
  
  // Handle incoming messages
  handleMessage(userId: string, message: any) {
    switch (message.type) {
      case 'subscribe':
        this.subscribeToCells(userId, message.cells);
        break;
      case 'unsubscribe':
        this.unsubscribeFromCells(userId, message.cells);
        break;
    }
  }
  
  // Subscribe to cell updates
  subscribeToCells(userId: string, cellIds: string[]) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    
    const userSubscriptions = this.subscriptions.get(userId)!;
    cellIds.forEach(cellId => userSubscriptions.add(cellId));
  }
  
  // Broadcast updates to subscribers
  broadcastCellUpdate(cellId: string, update: any) {
    this.subscriptions.forEach((cellIds, userId) => {
      if (cellIds.has(cellId)) {
        const connection = this.connections.get(userId);
        if (connection) {
          connection.send(JSON.stringify({
            type: 'cell_update',
            cellId,
            data: update
          }));
        }
      }
    });
  }
}
```

## Background Sync

### WorkManager Integration
```dart
class BackgroundSyncService {
  static Future<void> initialize() async {
    await Workmanager().initialize(callbackDispatcher);
  }
  
  // Schedule periodic sync
  static Future<void> scheduleSync() async {
    await Workmanager().registerPeriodicTask(
      'sync-task',
      'syncData',
      frequency: Duration(minutes: 15),
      constraints: WorkConstraints(
        networkType: NetworkType.connected,
        requiresBatteryNotLow: false,
      ),
    );
  }
  
  // Schedule immediate sync
  static Future<void> scheduleImmediateSync() async {
    await Workmanager().registerOneOffTask(
      'immediate-sync',
      'syncData',
      inputData: {'immediate': true},
    );
  }
}

// Background task handler
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case 'sync-data':
        await _performSync(inputData?['immediate'] ?? false);
        break;
    }
    return Future.value(true);
  });
}

// Perform actual sync
Future<void> _performSync(bool immediate) async {
  try {
    final syncService = SyncService();
    await syncService.syncToServer();
    await syncService.syncFromServer();
  } catch (e) {
    print('Background sync failed: $e');
  }
}
```

## Rate Limiting

### Client-Side Rate Limiting
```dart
class RateLimiter {
  final Map<String, List<DateTime>> _requests = {};
  final Map<String, int> _limits = {};
  
  // Check if request is allowed
  bool canMakeRequest(String endpoint, {int limit = 10, Duration window = const Duration(minutes: 1)}) {
    final now = DateTime.now();
    final requests = _requests[endpoint] ?? [];
    
    // Remove old requests outside window
    requests.removeWhere((time) => now.difference(time) > window);
    
    // Check if under limit
    if (requests.length >= limit) {
      return false;
    }
    
    // Add current request
    requests.add(now);
    _requests[endpoint] = requests;
    
    return true;
  }
  
  // Wait for rate limit reset
  Future<void> waitForReset(String endpoint) async {
    final requests = _requests[endpoint] ?? [];
    if (requests.isNotEmpty) {
      final oldestRequest = requests.first;
      final resetTime = oldestRequest.add(Duration(minutes: 1));
      final waitTime = resetTime.difference(DateTime.now());
      
      if (waitTime.isPositive) {
        await Future.delayed(waitTime);
      }
    }
  }
}
```

### Server-Side Rate Limiting
```typescript
// Rate limiting middleware
class RateLimiter {
  private requests = new Map<string, number[]>();
  
  // Check rate limit
  checkRateLimit(userId: string, endpoint: string): boolean {
    const key = `${userId}:${endpoint}`;
    const now = Date.now();
    const window = 60000; // 1 minute
    const limit = 10; // 10 requests per minute
    
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests
    const recentRequests = userRequests.filter(
      time => now - time < window
    );
    
    // Check if under limit
    if (recentRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
  
  // Get rate limit info
  getRateLimitInfo(userId: string, endpoint: string): RateLimitInfo {
    const key = `${userId}:${endpoint}`;
    const userRequests = this.requests.get(key) || [];
    const now = Date.now();
    const window = 60000;
    
    const recentRequests = userRequests.filter(
      time => now - time < window
    );
    
    return {
      remaining: Math.max(0, 10 - recentRequests.length),
      resetTime: recentRequests.length > 0 
        ? recentRequests[0] + window 
        : now,
    };
  }
}
```

## Error Handling & Retry

### Retry Logic
```dart
class RetryHandler {
  static Future<T> withRetry<T>(
    Future<T> Function() operation, {
    int maxRetries = 3,
    Duration initialDelay = const Duration(seconds: 1),
    double backoffMultiplier = 2.0,
  }) async {
    int retries = 0;
    Duration delay = initialDelay;
    
    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (e) {
        retries++;
        
        if (retries >= maxRetries) {
          rethrow;
        }
        
        await Future.delayed(delay);
        delay = Duration(
          milliseconds: (delay.inMilliseconds * backoffMultiplier).round(),
        );
      }
    }
    
    throw Exception('Max retries exceeded');
  }
}
```

### Error Recovery
```dart
class ErrorRecoveryService {
  // Handle network errors
  Future<void> handleNetworkError(NetworkException error) async {
    switch (error.type) {
      case NetworkExceptionType.connectionTimeout:
        await _handleConnectionTimeout();
        break;
      case NetworkExceptionType.serverError:
        await _handleServerError(error);
        break;
      case NetworkExceptionType.rateLimited:
        await _handleRateLimit(error);
        break;
    }
  }
  
  // Handle connection timeout
  Future<void> _handleConnectionTimeout() async {
    // Queue actions for later sync
    await _queueActionsForLater();
    
    // Show offline mode indicator
    await _showOfflineIndicator();
  }
  
  // Handle server errors
  Future<void> _handleServerError(NetworkException error) async {
    // Log error for debugging
    await _logError(error);
    
    // Retry with exponential backoff
    await _scheduleRetry();
  }
  
  // Handle rate limiting
  Future<void> _handleRateLimit(NetworkException error) async {
    // Extract retry time from error
    final retryAfter = error.retryAfter;
    
    // Schedule retry
    await _scheduleRetry(after: retryAfter);
  }
}
```

## Data Consistency

### Optimistic Updates
```dart
class OptimisticUpdateService {
  // Apply optimistic update
  Future<void> applyOptimisticUpdate<T>(
    String entityId,
    T Function(T) update,
    Future<T> Function() serverUpdate,
  ) async {
    // Apply update locally first
    final localResult = await _applyLocalUpdate(entityId, update);
    
    try {
      // Send to server
      final serverResult = await serverUpdate();
      
      // Server update successful, keep local changes
      await _confirmLocalUpdate(entityId, serverResult);
    } catch (e) {
      // Server update failed, revert local changes
      await _revertLocalUpdate(entityId);
      rethrow;
    }
  }
}
```

### Conflict Detection
```dart
class ConflictDetector {
  // Detect conflicts between local and server data
  Future<List<Conflict>> detectConflicts(
    String entityId,
    Map<String, dynamic> localData,
    Map<String, dynamic> serverData,
  ) async {
    final conflicts = <Conflict>[];
    
    for (final key in localData.keys) {
      if (serverData.containsKey(key)) {
        final localValue = localData[key];
        final serverValue = serverData[key];
        
        if (localValue != serverValue) {
          conflicts.add(Conflict(
            field: key,
            localValue: localValue,
            serverValue: serverValue,
            timestamp: DateTime.now(),
          ));
        }
      }
    }
    
    return conflicts;
  }
}
```
