# User Interface Design

## Design Principles

### Core UI Principles
- **Mobile-First**: Optimized for mobile devices with touch interactions
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Performance**: Smooth 60fps animations and responsive interactions
- **Consistency**: Unified design language across all screens
- **Clarity**: Clear visual hierarchy and intuitive navigation

### Design System
```typescript
interface DesignSystem {
  // Color palette
  colors: {
    primary: {
      main: '#1976D2';
      light: '#42A5F5';
      dark: '#1565C0';
    };
    secondary: {
      main: '#FF9800';
      light: '#FFB74D';
      dark: '#F57C00';
    };
    neutral: {
      white: '#FFFFFF';
      black: '#000000';
      gray50: '#FAFAFA';
      gray100: '#F5F5F5';
      gray200: '#EEEEEE';
      gray300: '#E0E0E0';
      gray400: '#BDBDBD';
      gray500: '#9E9E9E';
      gray600: '#757575';
      gray700: '#616161';
      gray800: '#424242';
      gray900: '#212121';
    };
    semantic: {
      success: '#4CAF50';
      warning: '#FF9800';
      error: '#F44336';
      info: '#2196F3';
    };
  };
  
  // Typography
  typography: {
    fontFamily: 'Roboto, sans-serif';
    fontSize: {
      xs: '12px';
      sm: '14px';
      base: '16px';
      lg: '18px';
      xl: '20px';
      '2xl': '24px';
      '3xl': '30px';
      '4xl': '36px';
    };
    fontWeight: {
      light: 300;
      normal: 400;
      medium: 500;
      bold: 700;
    };
    lineHeight: {
      tight: 1.2;
      normal: 1.5;
      relaxed: 1.75;
    };
  };
  
  // Spacing
  spacing: {
    xs: '4px';
    sm: '8px';
    md: '16px';
    lg: '24px';
    xl: '32px';
    '2xl': '48px';
    '3xl': '64px';
  };
  
  // Border radius
  borderRadius: {
    none: '0';
    sm: '4px';
    md: '8px';
    lg: '12px';
    xl: '16px';
    full: '9999px';
  };
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)';
    md: '0 4px 6px rgba(0, 0, 0, 0.1)';
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)';
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)';
  };
}
```

## Screen Layouts

### Main Game Screen
```typescript
interface MainGameScreen {
  // Layout structure
  layout: {
    header: HeaderComponent;
    map: MapComponent;
    sidebar: SidebarComponent;
    bottomBar: BottomBarComponent;
    modals: ModalComponent[];
  };
  
  // Header section
  header: {
    height: '60px';
    components: {
      logo: LogoComponent;
      resources: ResourceDisplayComponent;
      notifications: NotificationComponent;
      profile: ProfileComponent;
    };
  };
  
  // Map section
  map: {
    height: 'calc(100vh - 120px)';
    components: {
      worldMap: WorldMapComponent;
      cellGrid: CellGridComponent;
      playerLocation: PlayerLocationComponent;
      poiMarkers: POIMarkerComponent[];
    };
  };
  
  // Sidebar section
  sidebar: {
    width: '300px';
    position: 'right';
    components: {
      settlement: SettlementPanelComponent;
      resources: ResourcePanelComponent;
      buildings: BuildingPanelComponent;
      units: UnitPanelComponent;
    };
  };
  
  // Bottom bar
  bottomBar: {
    height: '60px';
    components: {
      navigation: NavigationComponent;
      quickActions: QuickActionComponent[];
    };
  };
}
```

### Settlement Management Screen
```typescript
interface SettlementScreen {
  // Layout structure
  layout: {
    header: SettlementHeaderComponent;
    grid: SettlementGridComponent;
    sidebar: SettlementSidebarComponent;
    bottomBar: SettlementBottomBarComponent;
  };
  
  // Settlement grid
  grid: {
    size: '20x20';
    cellSize: '40px';
    components: {
      cells: GridCellComponent[];
      buildings: BuildingComponent[];
      roads: RoadComponent[];
      decorations: DecorationComponent[];
    };
  };
  
  // Building placement
  buildingPlacement: {
    mode: 'PLACEMENT' | 'SELECTION' | 'UPGRADE';
    preview: BuildingPreviewComponent;
    constraints: PlacementConstraintComponent[];
    feedback: PlacementFeedbackComponent;
  };
}
```

### Combat Screen
```typescript
interface CombatScreen {
  // Layout structure
  layout: {
    header: CombatHeaderComponent;
    battlefield: BattlefieldComponent;
    units: UnitPanelComponent;
    actions: ActionPanelComponent;
    results: CombatResultComponent;
  };
  
  // Battlefield
  battlefield: {
    size: '10x10';
    cellSize: '50px';
    components: {
      grid: BattleGridComponent;
      units: BattleUnitComponent[];
      effects: BattleEffectComponent[];
      animations: BattleAnimationComponent[];
    };
  };
  
  // Unit management
  units: {
    selection: UnitSelectionComponent;
    stats: UnitStatsComponent;
    abilities: UnitAbilityComponent[];
    formation: FormationComponent;
  };
}
```

## Component Library

### Core Components
```typescript
interface CoreComponents {
  // Buttons
  buttons: {
    primary: ButtonComponent;
    secondary: ButtonComponent;
    danger: ButtonComponent;
    ghost: ButtonComponent;
    icon: IconButtonComponent;
    floating: FloatingActionButtonComponent;
  };
  
  // Inputs
  inputs: {
    text: TextInputComponent;
    number: NumberInputComponent;
    select: SelectComponent;
    multiSelect: MultiSelectComponent;
    toggle: ToggleComponent;
    slider: SliderComponent;
  };
  
  // Cards
  cards: {
    basic: CardComponent;
    elevated: ElevatedCardComponent;
    outlined: OutlinedCardComponent;
    interactive: InteractiveCardComponent;
  };
  
  // Lists
  lists: {
    basic: ListComponent;
    selectable: SelectableListComponent;
    expandable: ExpandableListComponent;
    virtual: VirtualListComponent;
  };
  
  // Modals
  modals: {
    basic: ModalComponent;
    fullscreen: FullscreenModalComponent;
    bottomSheet: BottomSheetComponent;
    dialog: DialogComponent;
  };
}
```

### Game-Specific Components
```typescript
interface GameComponents {
  // Resource components
  resources: {
    display: ResourceDisplayComponent;
    bar: ResourceBarComponent;
    icon: ResourceIconComponent;
    tooltip: ResourceTooltipComponent;
  };
  
  // Building components
  buildings: {
    card: BuildingCardComponent;
    preview: BuildingPreviewComponent;
    info: BuildingInfoComponent;
    upgrade: BuildingUpgradeComponent;
  };
  
  // Unit components
  units: {
    card: UnitCardComponent;
    stats: UnitStatsComponent;
    formation: FormationComponent;
    ability: UnitAbilityComponent;
  };
  
  // Map components
  map: {
    cell: CellComponent;
    grid: GridComponent;
    marker: MarkerComponent;
    path: PathComponent;
  };
}
```

## Navigation Design

### Navigation Structure
```typescript
interface NavigationStructure {
  // Main navigation
  mainNav: {
    home: NavigationItem;
    map: NavigationItem;
    settlement: NavigationItem;
    combat: NavigationItem;
    athletic: NavigationItem;
    profile: NavigationItem;
  };
  
  // Secondary navigation
  secondaryNav: {
    resources: NavigationItem;
    buildings: NavigationItem;
    units: NavigationItem;
    technology: NavigationItem;
    commanders: NavigationItem;
  };
  
  // Context navigation
  contextNav: {
    building: NavigationItem[];
    unit: NavigationItem[];
    combat: NavigationItem[];
    athletic: NavigationItem[];
  };
}
```

### Navigation Patterns
```typescript
interface NavigationPatterns {
  // Tab navigation
  tabNavigation: {
    type: 'bottom' | 'top' | 'side';
    tabs: TabItem[];
    behavior: 'persistent' | 'swipeable' | 'scrollable';
  };
  
  // Drawer navigation
  drawerNavigation: {
    type: 'overlay' | 'push' | 'slide';
    width: '280px';
    behavior: 'gesture' | 'button' | 'both';
  };
  
  // Breadcrumb navigation
  breadcrumbNavigation: {
    separator: '>';
    maxItems: 5;
    behavior: 'collapsible' | 'scrollable';
  };
}
```

## Responsive Design

### Breakpoints
```typescript
interface ResponsiveBreakpoints {
  // Mobile breakpoints
  mobile: {
    small: '320px';
    medium: '375px';
    large: '414px';
  };
  
  // Tablet breakpoints
  tablet: {
    small: '768px';
    medium: '834px';
    large: '1024px';
  };
  
  // Desktop breakpoints
  desktop: {
    small: '1280px';
    medium: '1440px';
    large: '1920px';
  };
}
```

### Responsive Layouts
```typescript
interface ResponsiveLayouts {
  // Mobile layout
  mobile: {
    columns: 1;
    sidebar: 'overlay';
    navigation: 'bottom';
    content: 'full-width';
  };
  
  // Tablet layout
  tablet: {
    columns: 2;
    sidebar: 'collapsible';
    navigation: 'side';
    content: 'two-column';
  };
  
  // Desktop layout
  desktop: {
    columns: 3;
    sidebar: 'persistent';
    navigation: 'side';
    content: 'three-column';
  };
}
```

## Animation Design

### Animation Principles
```typescript
interface AnimationPrinciples {
  // Timing functions
  timing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)';
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)';
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)';
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)';
  };
  
  // Duration
  duration: {
    fast: '150ms';
    normal: '300ms';
    slow: '500ms';
    slower: '750ms';
  };
  
  // Easing
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)';
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)';
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)';
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)';
  };
}
```

### Animation Types
```typescript
interface AnimationTypes {
  // Transitions
  transitions: {
    fade: FadeTransition;
    slide: SlideTransition;
    scale: ScaleTransition;
    rotate: RotateTransition;
  };
  
  // Gestures
  gestures: {
    tap: TapGesture;
    longPress: LongPressGesture;
    swipe: SwipeGesture;
    pinch: PinchGesture;
    pan: PanGesture;
  };
  
  // Loading
  loading: {
    spinner: SpinnerAnimation;
    skeleton: SkeletonAnimation;
    progress: ProgressAnimation;
    pulse: PulseAnimation;
  };
}
```

## Accessibility Design

### Accessibility Standards
```typescript
interface AccessibilityStandards {
  // WCAG compliance
  wcag: {
    level: 'AA';
    contrast: '4.5:1 minimum';
    textSize: '16px minimum';
    touchTarget: '44px minimum';
  };
  
  // Screen reader support
  screenReader: {
    labels: 'All interactive elements';
    descriptions: 'Complex UI elements';
    announcements: 'Dynamic content changes';
    navigation: 'Logical tab order';
  };
  
  // Motor accessibility
  motor: {
    touchTargets: '44px minimum size';
    spacing: '8px minimum between targets';
    gestures: 'Alternative input methods';
    timing: 'No time-based interactions';
  };
}
```

### Accessibility Features
```typescript
interface AccessibilityFeatures {
  // Visual accessibility
  visual: {
    highContrast: boolean;
    largeText: boolean;
    colorBlind: boolean;
    reducedMotion: boolean;
  };
  
  // Motor accessibility
  motor: {
    voiceControl: boolean;
    switchControl: boolean;
    assistiveTouch: boolean;
    keyboardNavigation: boolean;
  };
  
  // Cognitive accessibility
  cognitive: {
    clearLanguage: boolean;
    consistentNavigation: boolean;
    errorPrevention: boolean;
    helpText: boolean;
  };
}
```

## Performance Design

### Performance Targets
```typescript
interface PerformanceTargets {
  // Frame rate
  frameRate: {
    target: 60;
    minimum: 30;
    measurement: 'Average over 1 minute';
  };
  
  // Load times
  loadTimes: {
    initial: '3 seconds';
    navigation: '1 second';
    content: '500ms';
  };
  
  // Memory usage
  memory: {
    target: '100MB';
    maximum: '200MB';
    measurement: 'Peak usage';
  };
  
  // Battery usage
  battery: {
    target: '5% per hour';
    measurement: 'Background usage';
  };
}
```

### Performance Optimizations
```typescript
interface PerformanceOptimizations {
  // Rendering
  rendering: {
    lazyLoading: boolean;
    virtualScrolling: boolean;
    imageOptimization: boolean;
    animationOptimization: boolean;
  };
  
  // Data
  data: {
    caching: boolean;
    pagination: boolean;
    compression: boolean;
    prefetching: boolean;
  };
  
  // Network
  network: {
    requestBatching: boolean;
    compression: boolean;
    caching: boolean;
    offlineSupport: boolean;
  };
}
```
