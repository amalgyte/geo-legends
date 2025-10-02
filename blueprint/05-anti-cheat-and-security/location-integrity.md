# Location Integrity System

## Overview

The location integrity system ensures that players are physically present at the locations they claim to be, preventing GPS spoofing and location-based cheating.

## Core Principles

### Server Authority
- **Server is always authoritative** for location-based decisions
- **Client location is never trusted** without validation
- **All location checks are server-side** with client data as input only
- **Location data is rounded** to prevent precision-based cheating

### Validation Layers
1. **Velocity Checks** - Detect impossible movement speeds
2. **Teleportation Detection** - Identify location jumps
3. **Accuracy Requirements** - Ensure GPS quality
4. **Device Integrity** - Check for tampering
5. **Behavioral Analysis** - Pattern recognition for cheating

## Velocity Validation

### Speed Limits
```typescript
interface VelocityLimits {
  // Speed thresholds (km/h)
  walking: 6,          // Maximum walking speed
  running: 15,         // Maximum running speed
  cycling: 30,         // Maximum cycling speed
  driving: 100,        // Maximum driving speed
  flying: 1000,        // Maximum flying speed (aircraft)
  
  // Action restrictions
  baseInteraction: 55,    // No base interaction above 55 km/h
  allActions: 100,         // No actions above 100 km/h
  emergency: 200          // Emergency threshold for false positives
}
```

### Velocity Calculation
```typescript
class VelocityValidator {
  // Calculate velocity between two points
  calculateVelocity(
    point1: LocationData,
    point2: LocationData
  ): number {
    const distance = this.calculateDistance(point1, point2);
    const timeDelta = (point2.timestamp - point1.timestamp) / 1000; // seconds
    
    if (timeDelta <= 0) return 0;
    
    const velocity = (distance / timeDelta) * 3.6; // km/h
    return velocity;
  }
  
  // Validate velocity
  validateVelocity(
    velocity: number,
    actionType: ActionType
  ): ValidationResult {
    const limits = this.getVelocityLimits(actionType);
    
    if (velocity > limits.maxSpeed) {
      return {
        valid: false,
        reason: 'VELOCITY_TOO_HIGH',
        details: `Velocity ${velocity} km/h exceeds limit ${limits.maxSpeed} km/h`
      };
    }
    
    return { valid: true };
  }
  
  // Get velocity limits for action type
  private getVelocityLimits(actionType: ActionType): VelocityLimits {
    switch (actionType) {
      case 'BASE_INTERACTION':
        return { maxSpeed: 55, actionType: 'BASE_INTERACTION' };
      case 'RAID_ATTACK':
        return { maxSpeed: 30, actionType: 'RAID_ATTACK' };
      case 'RESOURCE_COLLECTION':
        return { maxSpeed: 15, actionType: 'RESOURCE_COLLECTION' };
      default:
        return { maxSpeed: 100, actionType: 'GENERAL' };
    }
  }
}
```

## Teleportation Detection

### Teleportation Rules
```typescript
interface TeleportationRules {
  // Distance thresholds
  maxDistance: 2000,      // 2km maximum jump
  maxTimeDelta: 30000,    // 30 seconds maximum time between locations
  
  // Cooldown periods
  cooldownShort: 600,     // 10 minutes for short jumps
  cooldownLong: 1800,     // 30 minutes for long jumps
  cooldownExtreme: 3600,  // 1 hour for extreme jumps
  
  // False positive handling
  falsePositiveThreshold: 0.1,  // 10% false positive rate acceptable
  reviewThreshold: 5             // 5 violations trigger review
}
```

### Teleportation Detection
```typescript
class TeleportationDetector {
  // Detect teleportation
  async detectTeleportation(
    userId: string,
    newLocation: LocationData,
    lastLocation: LocationData
  ): Promise<TeleportationResult> {
    const distance = this.calculateDistance(lastLocation, newLocation);
    const timeDelta = newLocation.timestamp - lastLocation.timestamp;
    
    // Check for teleportation
    if (distance > this.rules.maxDistance && timeDelta < this.rules.maxTimeDelta) {
      const severity = this.calculateSeverity(distance, timeDelta);
      const cooldown = this.calculateCooldown(severity);
      
      return {
        isTeleportation: true,
        severity,
        cooldown,
        distance,
        timeDelta,
        reason: this.getTeleportationReason(distance, timeDelta)
      };
    }
    
    return { isTeleportation: false };
  }
  
  // Calculate teleportation severity
  private calculateSeverity(distance: number, timeDelta: number): TeleportationSeverity {
    const distanceRatio = distance / this.rules.maxDistance;
    const timeRatio = timeDelta / this.rules.maxTimeDelta;
    const severity = (distanceRatio + timeRatio) / 2;
    
    if (severity > 2.0) return 'EXTREME';
    if (severity > 1.5) return 'HIGH';
    if (severity > 1.0) return 'MEDIUM';
    return 'LOW';
  }
  
  // Calculate cooldown period
  private calculateCooldown(severity: TeleportationSeverity): number {
    switch (severity) {
      case 'LOW': return this.rules.cooldownShort;
      case 'MEDIUM': return this.rules.cooldownLong;
      case 'HIGH': return this.rules.cooldownExtreme;
      case 'EXTREME': return this.rules.cooldownExtreme * 2;
    }
  }
}
```

## Accuracy Requirements

### GPS Accuracy Standards
```typescript
interface AccuracyRequirements {
  // Accuracy thresholds (meters)
  critical: 25,        // Critical actions require < 25m accuracy
  important: 50,         // Important actions require < 50m accuracy
  general: 100,         // General actions require < 100m accuracy
  
  // Age requirements (seconds)
  maxAge: 10,           // Maximum age for critical actions
  importantAge: 30,     // Maximum age for important actions
  generalAge: 60        // Maximum age for general actions
}
```

### Accuracy Validation
```typescript
class AccuracyValidator {
  // Validate location accuracy
  validateAccuracy(
    location: LocationData,
    actionType: ActionType
  ): ValidationResult {
    const requirements = this.getAccuracyRequirements(actionType);
    const now = Date.now();
    const age = (now - location.timestamp) / 1000;
    
    // Check accuracy
    if (location.accuracy > requirements.accuracy) {
      return {
        valid: false,
        reason: 'ACCURACY_TOO_LOW',
        details: `Accuracy ${location.accuracy}m exceeds limit ${requirements.accuracy}m`
      };
    }
    
    // Check age
    if (age > requirements.maxAge) {
      return {
        valid: false,
        reason: 'LOCATION_TOO_OLD',
        details: `Location age ${age}s exceeds limit ${requirements.maxAge}s`
      };
    }
    
    return { valid: true };
  }
  
  // Get accuracy requirements for action type
  private getAccuracyRequirements(actionType: ActionType): AccuracyRequirements {
    switch (actionType) {
      case 'RAID_ATTACK':
      case 'BASE_CLAIM':
        return { accuracy: 25, maxAge: 10 };
      case 'RESOURCE_COLLECTION':
      case 'BUILDING_PLACEMENT':
        return { accuracy: 50, maxAge: 30 };
      default:
        return { accuracy: 100, maxAge: 60 };
    }
  }
}
```

## Device Integrity

### Device Fingerprinting
```typescript
interface DeviceFingerprint {
  deviceId: string;
  platform: 'iOS' | 'Android' | 'Web';
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  screenResolution: string;
  timezone: string;
  language: string;
  hardware: HardwareInfo;
  network: NetworkInfo;
}

interface HardwareInfo {
  cpu: string;
  memory: number;
  storage: number;
  sensors: string[];
  capabilities: string[];
}

interface NetworkInfo {
  connectionType: string;
  carrier: string;
  ipAddress: string;
  location: LocationData;
}
```

### Integrity Checks
```typescript
class DeviceIntegrityChecker {
  // Check device integrity
  async checkDeviceIntegrity(
    fingerprint: DeviceFingerprint,
    userId: string
  ): Promise<IntegrityResult> {
    const checks = [
      this.checkRootJailbreak(fingerprint),
      this.checkEmulator(fingerprint),
      this.checkSpoofing(fingerprint),
      this.checkTampering(fingerprint)
    ];
    
    const results = await Promise.all(checks);
    const integrity = this.calculateIntegrity(results);
    
    return {
      integrity,
      checks: results,
      recommendations: this.getRecommendations(results)
    };
  }
  
  // Check for root/jailbreak
  private async checkRootJailbreak(
    fingerprint: DeviceFingerprint
  ): Promise<IntegrityCheck> {
    const indicators = [
      fingerprint.hardware.capabilities.includes('root'),
      fingerprint.hardware.capabilities.includes('jailbreak'),
      fingerprint.osVersion.includes('root'),
      fingerprint.osVersion.includes('jailbreak')
    ];
    
    const isRooted = indicators.some(indicator => indicator);
    
    return {
      type: 'ROOT_JAILBREAK',
      passed: !isRooted,
      confidence: isRooted ? 0.9 : 0.1,
      details: isRooted ? 'Device appears to be rooted/jailbroken' : 'Device appears clean'
    };
  }
  
  // Check for emulator
  private async checkEmulator(
    fingerprint: DeviceFingerprint
  ): Promise<IntegrityCheck> {
    const indicators = [
      fingerprint.hardware.cpu.includes('emulator'),
      fingerprint.hardware.cpu.includes('simulator'),
      fingerprint.deviceModel.includes('emulator'),
      fingerprint.deviceModel.includes('simulator')
    ];
    
    const isEmulator = indicators.some(indicator => indicator);
    
    return {
      type: 'EMULATOR',
      passed: !isEmulator,
      confidence: isEmulator ? 0.8 : 0.2,
      details: isEmulator ? 'Device appears to be emulator' : 'Device appears real'
    };
  }
}
```

## Behavioral Analysis

### Behavior Patterns
```typescript
interface BehaviorPattern {
  userId: string;
  patterns: {
    movement: MovementPattern;
    timing: TimingPattern;
    actions: ActionPattern;
    location: LocationPattern;
  };
  anomalies: Anomaly[];
  riskScore: number;
}

interface MovementPattern {
  averageSpeed: number;
  maxSpeed: number;
  typicalRoutes: Route[];
  unusualMovements: number;
  stationaryTime: number;
}

interface TimingPattern {
  playSessions: Session[];
  actionFrequency: number;
  responseTime: number;
  automation: boolean;
}
```

### Anomaly Detection
```typescript
class AnomalyDetector {
  // Detect behavioral anomalies
  async detectAnomalies(
    userId: string,
    behavior: BehaviorPattern
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Check movement anomalies
    const movementAnomalies = await this.checkMovementAnomalies(behavior.movement);
    anomalies.push(...movementAnomalies);
    
    // Check timing anomalies
    const timingAnomalies = await this.checkTimingAnomalies(behavior.timing);
    anomalies.push(...timingAnomalies);
    
    // Check action anomalies
    const actionAnomalies = await this.checkActionAnomalies(behavior.actions);
    anomalies.push(...actionAnomalies);
    
    // Check location anomalies
    const locationAnomalies = await this.checkLocationAnomalies(behavior.location);
    anomalies.push(...locationAnomalies);
    
    return anomalies;
  }
  
  // Check movement anomalies
  private async checkMovementAnomalies(
    movement: MovementPattern
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Check for impossible speeds
    if (movement.maxSpeed > 200) {
      anomalies.push({
        type: 'IMPOSSIBLE_SPEED',
        severity: 'HIGH',
        details: `Maximum speed ${movement.maxSpeed} km/h is impossible`,
        confidence: 0.9
      });
    }
    
    // Check for teleportation patterns
    if (movement.unusualMovements > 5) {
      anomalies.push({
        type: 'FREQUENT_TELEPORTATION',
        severity: 'MEDIUM',
        details: `${movement.unusualMovements} unusual movements detected`,
        confidence: 0.7
      });
    }
    
    return anomalies;
  }
}
```

## Trust Score System

### Trust Score Calculation
```typescript
interface TrustScore {
  userId: string;
  score: number;        // 0-100
  factors: TrustFactor[];
  lastUpdate: Timestamp;
  history: TrustScoreHistory[];
}

interface TrustFactor {
  type: string;
  value: number;
  weight: number;
  description: string;
}

class TrustScoreCalculator {
  // Calculate trust score
  async calculateTrustScore(
    userId: string,
    recentActivity: Activity[]
  ): Promise<TrustScore> {
    const factors = await this.calculateTrustFactors(userId, recentActivity);
    const score = this.aggregateTrustScore(factors);
    
    return {
      userId,
      score,
      factors,
      lastUpdate: new Date(),
      history: await this.getTrustScoreHistory(userId)
    };
  }
  
  // Calculate trust factors
  private async calculateTrustFactors(
    userId: string,
    activity: Activity[]
  ): Promise<TrustFactor[]> {
    const factors: TrustFactor[] = [];
    
    // Location accuracy factor
    const accuracyFactor = await this.calculateAccuracyFactor(activity);
    factors.push(accuracyFactor);
    
    // Velocity compliance factor
    const velocityFactor = await this.calculateVelocityFactor(activity);
    factors.push(velocityFactor);
    
    // Device integrity factor
    const deviceFactor = await this.calculateDeviceFactor(userId);
    factors.push(deviceFactor);
    
    // Behavioral consistency factor
    const behaviorFactor = await this.calculateBehaviorFactor(activity);
    factors.push(behaviorFactor);
    
    return factors;
  }
  
  // Calculate accuracy factor
  private async calculateAccuracyFactor(
    activity: Activity[]
  ): Promise<TrustFactor> {
    const locationActions = activity.filter(a => a.type === 'LOCATION');
    const avgAccuracy = locationActions.reduce((sum, a) => sum + a.accuracy, 0) / locationActions.length;
    
    const score = Math.max(0, 100 - (avgAccuracy / 10)); // 10m = 1 point deduction
    
    return {
      type: 'LOCATION_ACCURACY',
      value: score,
      weight: 0.3,
      description: `Average location accuracy: ${avgAccuracy.toFixed(1)}m`
    };
  }
}
```

## Rate Limiting

### Rate Limit Rules
```typescript
interface RateLimitRules {
  // Action rate limits
  actions: {
    baseInteraction: 10,    // 10 per minute
    resourceCollection: 20, // 20 per minute
    buildingPlacement: 5,   // 5 per minute
    raidAttack: 1,         // 1 per 10 minutes
    resourceTransfer: 15   // 15 per minute
  },
  
  // Location rate limits
  location: {
    updates: 60,           // 60 per minute
    accuracy: 10,          // 10 high-accuracy per minute
    critical: 5            // 5 critical actions per minute
  },
  
  // Cooldown periods
  cooldowns: {
    teleportation: 1800,   // 30 minutes
    suspicious: 900,      // 15 minutes
    violation: 3600       // 1 hour
  }
}
```

### Rate Limiter
```typescript
class RateLimiter {
  private limits = new Map<string, RateLimit>();
  
  // Check rate limit
  async checkRateLimit(
    userId: string,
    actionType: string
  ): Promise<RateLimitResult> {
    const limit = this.getRateLimit(actionType);
    const userLimit = this.getUserLimit(userId, actionType);
    
    if (userLimit.count >= limit.max) {
      const resetTime = userLimit.resetTime;
      const waitTime = resetTime - Date.now();
      
      return {
        allowed: false,
        reason: 'RATE_LIMIT_EXCEEDED',
        waitTime,
        resetTime
      };
    }
    
    // Update user limit
    this.updateUserLimit(userId, actionType);
    
    return { allowed: true };
  }
  
  // Get rate limit for action type
  private getRateLimit(actionType: string): RateLimit {
    const limits = this.rules.actions;
    const max = limits[actionType] || 10;
    const window = 60000; // 1 minute
    
    return { max, window };
  }
}
```

## False Positive Handling

### False Positive Detection
```typescript
class FalsePositiveHandler {
  // Detect false positives
  async detectFalsePositives(
    violations: Violation[]
  ): Promise<FalsePositiveResult> {
    const falsePositives: Violation[] = [];
    
    for (const violation of violations) {
      if (await this.isFalsePositive(violation)) {
        falsePositives.push(violation);
      }
    }
    
    return {
      falsePositives,
      rate: falsePositives.length / violations.length,
      recommendations: this.getRecommendations(falsePositives)
    };
  }
  
  // Check if violation is false positive
  private async isFalsePositive(violation: Violation): Promise<boolean> {
    // Check for legitimate reasons
    const legitimateReasons = [
      this.checkGPSDrift(violation),
      this.checkNetworkIssues(violation),
      this.checkDeviceIssues(violation),
      this.checkEnvironmentalFactors(violation)
    ];
    
    const hasLegitimateReason = legitimateReasons.some(reason => reason);
    
    // Check historical behavior
    const historicalBehavior = await this.getHistoricalBehavior(violation.userId);
    const isConsistent = this.checkBehaviorConsistency(historicalBehavior, violation);
    
    return hasLegitimateReason || isConsistent;
  }
  
  // Check for GPS drift
  private checkGPSDrift(violation: Violation): boolean {
    if (violation.type !== 'TELEPORTATION') return false;
    
    // Check if movement is within GPS drift range
    const driftRange = 100; // 100m GPS drift
    return violation.distance < driftRange;
  }
}
```

## Monitoring and Alerts

### Monitoring System
```typescript
class LocationMonitoring {
  // Monitor location integrity
  async monitorLocationIntegrity(): Promise<void> {
    const metrics = await this.collectMetrics();
    const alerts = await this.checkAlerts(metrics);
    
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }
  
  // Collect metrics
  private async collectMetrics(): Promise<LocationMetrics> {
    return {
      totalChecks: await this.getTotalChecks(),
      violations: await this.getViolations(),
      falsePositives: await this.getFalsePositives(),
      trustScores: await this.getTrustScores(),
      rateLimits: await this.getRateLimits()
    };
  }
  
  // Check for alerts
  private async checkAlerts(metrics: LocationMetrics): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // High violation rate
    if (metrics.violations.length > 100) {
      alerts.push({
        type: 'HIGH_VIOLATION_RATE',
        severity: 'HIGH',
        message: `High violation rate: ${metrics.violations.length} violations`,
        timestamp: new Date()
      });
    }
    
    // Low trust scores
    const lowTrustScores = metrics.trustScores.filter(ts => ts.score < 30);
    if (lowTrustScores.length > 50) {
      alerts.push({
        type: 'LOW_TRUST_SCORES',
        severity: 'MEDIUM',
        message: `${lowTrustScores.length} users with low trust scores`,
        timestamp: new Date()
      });
    }
    
    return alerts;
  }
}
```
