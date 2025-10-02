# Client Architecture (Flutter)

## Technology Stack

### Core Framework
- **Flutter**: Cross-platform mobile development
- **Material 3**: Modern UI design system
- **Riverpod**: State management and dependency injection
- **Freezed**: Immutable data classes with JSON serialization

### Mapping & Location
- **Mapbox GL**: Vector tiles and custom styling
- **Geolocator**: GPS and location services
- **S2 Geometry**: Cell-based world partitioning
- **Geofencing**: Location-based triggers

### Data & Storage
- **Isar**: Local database with encryption
- **Firebase Auth**: User authentication
- **Cloud Firestore**: Real-time data synchronization
- **Cloud Storage**: Content and asset storage

### Networking & Communication
- **Dio**: HTTP client with retry/backoff
- **WebSocket Channel**: Real-time updates
- **Firebase Messaging**: Push notifications
- **WorkManager**: Background task processing

## Project Structure

```
lib/
├── app.dart                    # App configuration
├── main.dart                   # Entry point
├── core/
│   ├── env.dart               # Environment configuration
│   ├── logger.dart            # Logging utilities
│   └── result.dart            # Result type for error handling
├── data/
│   ├── models/                # Freezed data models
│   ├── local/                 # Isar database files
│   ├── remote/                # API client and services
│   └── repositories/           # Data access layer
├── features/
│   ├── auth/                  # Authentication
│   ├── map/                   # Map and location
│   ├── cells/                 # Cell management
│   ├── base/                  # Settlement management
│   ├── inventory/             # Resource management
│   └── actions/               # Action queuing
├── services/
│   ├── location_service.dart  # GPS and location
│   ├── geofence_service.dart  # Location triggers
│   ├── sync_service.dart      # Data synchronization
│   └── websocket_service.dart # Real-time updates
├── ui/
│   ├── theme/                 # App theming
│   └── widgets/                # Reusable components
└── util/                       # Utility functions
```

## State Management (Riverpod)

### Provider Architecture
```dart
// Global state providers
final userProvider = StateNotifierProvider<UserNotifier, User?>();
final locationProvider = StateNotifierProvider<LocationNotifier, LocationState>();
final gameStateProvider = StateNotifierProvider<GameStateNotifier, GameState>();

// Feature-specific providers
final cellProvider = StateNotifierProvider.family<CellNotifier, CellState, String>();
final baseProvider = StateNotifierProvider.family<BaseNotifier, BaseState, String>();
final inventoryProvider = StateNotifierProvider<InventoryNotifier, InventoryState>();
```

### State Classes
```dart
@freezed
class User with _$User {
  const factory User({
    required String uid,
    required String displayName,
    required double trustScore,
    String? clubId,
    required Map<String, int> inventory,
    required String homeCellId,
    required LocationData lastKnownLoc,
    required bool goreToggle,
  }) = _User;
}

@freezed
class LocationState with _$LocationState {
  const factory LocationState({
    required LocationData? currentLocation,
    required bool isTracking,
    required double accuracy,
    required DateTime lastUpdate,
  }) = _LocationState;
}
```

## Data Models

### Core Models
```dart
@freezed
class Cell with _$Cell {
  const factory Cell({
    required String cellId,
    required int level,
    required String biome,
    required String regionId,
    String? ownerUid,
    required int baseLevel,
    required Map<String, double> production,
    required Map<String, int> storage,
    required String conflictState,
    required DateTime lastTickTs,
  }) = _Cell;
}

@freezed
class ActionIntent with _$ActionIntent {
  const factory ActionIntent({
    required String id,
    required String uid,
    required String type,
    required String targetId,
    required DateTime createdTs,
    required DateTime expiresTs,
    required String status,
    required LocationData loc,
  }) = _ActionIntent;
}
```

## Local Storage (Isar)

### Database Schema
```dart
@collection
class UserData {
  Id id = Isar.autoIncrement;
  late String uid;
  late String displayName;
  late double trustScore;
  String? clubId;
  late Map<String, int> inventory;
  late String homeCellId;
  late LocationData lastKnownLoc;
  late bool goreToggle;
}

@collection
class CellData {
  Id id = Isar.autoIncrement;
  late String cellId;
  late int level;
  late String biome;
  late String regionId;
  String? ownerUid;
  late int baseLevel;
  late Map<String, double> production;
  late Map<String, int> storage;
  late String conflictState;
  late DateTime lastTickTs;
}

@collection
class ActionIntentData {
  Id id = Isar.autoIncrement;
  late String intentId;
  late String uid;
  late String type;
  late String targetId;
  late DateTime createdTs;
  late DateTime expiresTs;
  late String status;
  late LocationData loc;
}
```

## Networking Layer

### API Client
```dart
class ApiClient {
  final Dio _dio;
  final FirebaseAuth _auth;
  
  ApiClient(this._dio, this._auth) {
    _dio.interceptors.add(AuthInterceptor(_auth));
    _dio.interceptors.add(RetryInterceptor());
  }
  
  Future<List<Cell>> getCells({
    required double lat,
    required double lng,
    required double radius,
    int? level,
  }) async {
    final response = await _dio.get('/cells', queryParameters: {
      'around': '$lat,$lng',
      'radius': radius,
      'level': level,
    });
    return (response.data as List)
        .map((json) => Cell.fromJson(json))
        .toList();
  }
  
  Future<void> submitIntent(ActionIntent intent) async {
    await _dio.post('/intents', data: intent.toJson());
  }
}
```

### WebSocket Service
```dart
class WebSocketService {
  WebSocketChannel? _channel;
  final StreamController<Map<String, dynamic>> _messageController = 
      StreamController.broadcast();
  
  Stream<Map<String, dynamic>> get messageStream => _messageController.stream;
  
  Future<void> connect(List<String> cellIds) async {
    final token = await FirebaseAuth.instance.currentUser?.getIdToken();
    final uri = Uri.parse('$wsUrl/stream?cells=${cellIds.join(',')}&token=$token');
    
    _channel = WebSocketChannel.connect(uri);
    _channel!.stream.listen(_messageController.add);
  }
  
  void subscribeToCells(List<String> cellIds) {
    _channel?.sink.add(jsonEncode({
      'type': 'subscribe',
      'cells': cellIds,
    }));
  }
}
```

## Location Services

### Location Service
```dart
class LocationService {
  final Geolocator _geolocator = Geolocator();
  final StreamController<LocationData> _locationController = 
      StreamController.broadcast();
  
  Stream<LocationData> get locationStream => _locationController.stream;
  
  Future<void> startTracking() async {
    await _geolocator.requestPermission();
    
    await for (final location in _geolocator.getPositionStream()) {
      _locationController.add(LocationData(
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: DateTime.now(),
      ));
    }
  }
  
  Future<String> getCurrentCellId() async {
    final location = await _geolocator.getCurrentPosition();
    return S2Geometry.cellIdFromLatLng(
      location.latitude,
      location.longitude,
      level: 14,
    );
  }
}
```

### Geofencing Service
```dart
class GeofenceService {
  final List<Geofence> _geofences = [];
  
  Future<void> addGeofence({
    required String id,
    required double lat,
    required double lng,
    required double radius,
    required VoidCallback onEnter,
    required VoidCallback onExit,
  }) async {
    final geofence = Geofence(
      id: id,
      latitude: lat,
      longitude: lng,
      radius: radius,
      onEnter: onEnter,
      onExit: onExit,
    );
    
    _geofences.add(geofence);
    await _geolocator.addGeofence(geofence);
  }
}
```

## Background Processing

### WorkManager Integration
```dart
class BackgroundService {
  static Future<void> initialize() async {
    await Workmanager().initialize(callbackDispatcher);
  }
  
  static Future<void> scheduleSync() async {
    await Workmanager().registerPeriodicTask(
      'sync-task',
      'syncData',
      frequency: Duration(minutes: 15),
    );
  }
}

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case 'sync-data':
        await _syncData();
        break;
    }
    return Future.value(true);
  });
}
```

## Error Handling

### Result Type
```dart
@freezed
class Result<T> with _$Result<T> {
  const factory Result.success(T data) = Success<T>;
  const factory Result.failure(String error) = Failure<T>;
}

class ApiRepository {
  Future<Result<List<Cell>>> getCells() async {
    try {
      final cells = await _apiClient.getCells();
      return Result.success(cells);
    } catch (e) {
      return Result.failure(e.toString());
    }
  }
}
```

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Load content on demand
- **Caching**: Cache frequently accessed data
- **Debouncing**: Limit rapid API calls
- **Background Sync**: Sync data in background
- **Memory Management**: Dispose unused resources

### Battery Optimization
- **Adaptive Location**: Reduce GPS usage when possible
- **Background Limits**: Respect OS background restrictions
- **Efficient Sync**: Minimize network usage
- **Smart Notifications**: Reduce unnecessary notifications
