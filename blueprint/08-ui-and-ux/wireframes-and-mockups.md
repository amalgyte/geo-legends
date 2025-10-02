# Wireframes and Mockups

## Wireframe Specifications

### Wireframe Principles
- **Low-Fidelity**: Simple black and white layouts focusing on structure
- **Content-First**: Prioritize content hierarchy over visual design
- **Responsive**: Design for multiple screen sizes and orientations
- **Accessible**: Ensure wireframes support accessibility requirements
- **Iterative**: Easy to modify and update during design process

### Wireframe Components
```typescript
interface WireframeComponents {
  // Basic elements
  basic: {
    text: 'Text blocks and labels';
    images: 'Image placeholders';
    buttons: 'Button shapes and labels';
    inputs: 'Input field outlines';
    icons: 'Icon placeholders';
  };
  
  // Layout elements
  layout: {
    containers: 'Container outlines';
    grids: 'Grid system guides';
    spacing: 'Spacing measurements';
    alignment: 'Alignment guides';
  };
  
  // Interactive elements
  interactive: {
    links: 'Clickable areas';
    forms: 'Form field layouts';
    navigation: 'Navigation structures';
    modals: 'Modal overlays';
  };
}
```

## Screen Wireframes

### Main Game Screen Wireframe
```typescript
interface MainGameWireframe {
  // Layout structure
  layout: {
    header: {
      height: '60px';
      components: [
        'Logo (left)',
        'Resource display (center)',
        'Notifications (right)',
        'Profile (right)'
      ];
    };
    map: {
      height: 'calc(100vh - 120px)';
      components: [
        'World map grid',
        'Player location marker',
        'POI markers',
        'Cell boundaries'
      ];
    };
    sidebar: {
      width: '300px';
      position: 'right';
      components: [
        'Settlement panel',
        'Resource panel',
        'Building panel',
        'Unit panel'
      ];
    };
    bottomBar: {
      height: '60px';
      components: [
        'Navigation tabs',
        'Quick actions'
      ];
    };
  };
}
```

### Settlement Management Wireframe
```typescript
interface SettlementWireframe {
  // Layout structure
  layout: {
    header: {
      height: '60px';
      components: [
        'Settlement name',
        'Level indicator',
        'Resources display',
        'Settings button'
      ];
    };
    grid: {
      size: '20x20 cells';
      cellSize: '40px';
      components: [
        'Grid lines',
        'Building placements',
        'Road connections',
        'Decoration items'
      ];
    };
    sidebar: {
      width: '300px';
      components: [
        'Building catalog',
        'Building info',
        'Upgrade options',
        'Demolish button'
      ];
    };
    bottomBar: {
      height: '60px';
      components: [
        'Build mode toggle',
        'Grid toggle',
        'Zoom controls',
        'Save button'
      ];
    };
  };
}
```

### Combat Screen Wireframe
```typescript
interface CombatWireframe {
  // Layout structure
  layout: {
    header: {
      height: '60px';
      components: [
        'Battle title',
        'Turn indicator',
        'Time remaining',
        'Settings button'
      ];
    };
    battlefield: {
      size: '10x10 grid';
      cellSize: '50px';
      components: [
        'Grid lines',
        'Unit positions',
        'Movement indicators',
        'Attack ranges'
      ];
    };
    unitPanel: {
      width: '250px';
      components: [
        'Unit list',
        'Unit stats',
        'Unit abilities',
        'Formation options'
      ];
    };
    actionPanel: {
      height: '120px';
      components: [
        'Action buttons',
        'Formation buttons',
        'End turn button',
        'Retreat button'
      ];
    };
  };
}
```

## Mockup Specifications

### Mockup Principles
- **High-Fidelity**: Detailed visual design with colors, typography, and imagery
- **Brand-Consistent**: Follow established brand guidelines and design system
- **Realistic**: Use actual content and realistic data
- **Interactive**: Show interactive states and behaviors
- **Responsive**: Design for multiple screen sizes

### Mockup Components
```typescript
interface MockupComponents {
  // Visual elements
  visual: {
    colors: 'Brand color palette';
    typography: 'Font families and sizes';
    images: 'High-quality images and icons';
    shadows: 'Drop shadows and elevation';
    gradients: 'Color gradients and effects';
  };
  
  // Interactive elements
  interactive: {
    buttons: 'Styled buttons with states';
    inputs: 'Styled form inputs';
    cards: 'Styled content cards';
    modals: 'Styled modal dialogs';
    navigation: 'Styled navigation elements';
  };
  
  // Content elements
  content: {
    text: 'Realistic text content';
    data: 'Realistic data and numbers';
    images: 'Appropriate imagery';
    icons: 'Consistent iconography';
  };
}
```

## Screen Mockups

### Main Game Screen Mockup
```typescript
interface MainGameMockup {
  // Visual design
  design: {
    background: 'World map with terrain textures';
    colors: {
      primary: '#1976D2';
      secondary: '#FF9800';
      accent: '#4CAF50';
      neutral: '#757575';
    };
    typography: {
      heading: 'Roboto Bold, 24px';
      body: 'Roboto Regular, 16px';
      caption: 'Roboto Light, 14px';
    };
  };
  
  // Interactive elements
  interactive: {
    buttons: {
      style: 'Material Design 3';
      colors: 'Primary and secondary';
      states: 'Hover, active, disabled';
    };
    cards: {
      style: 'Elevated cards';
      shadows: 'Subtle drop shadows';
      borders: 'Rounded corners';
    };
    navigation: {
      style: 'Bottom tab navigation';
      icons: 'Material Design icons';
      labels: 'Clear text labels';
    };
  };
}
```

### Settlement Management Mockup
```typescript
interface SettlementMockup {
  // Visual design
  design: {
    background: 'Settlement grid with terrain';
    colors: {
      grid: '#E0E0E0';
      buildings: '#1976D2';
      roads: '#9E9E9E';
      decorations: '#4CAF50';
    };
    typography: {
      heading: 'Roboto Bold, 20px';
      body: 'Roboto Regular, 14px';
      caption: 'Roboto Light, 12px';
    };
  };
  
  // Building elements
  buildings: {
    style: '3D isometric style';
    colors: 'Building-specific colors';
    shadows: 'Realistic shadows';
    animations: 'Smooth transitions';
  };
  
  // Grid system
  grid: {
    style: 'Subtle grid lines';
    colors: '#E0E0E0';
    spacing: '40px cells';
    alignment: 'Perfect alignment';
  };
}
```

### Combat Screen Mockup
```typescript
interface CombatMockup {
  // Visual design
  design: {
    background: 'Battlefield with terrain';
    colors: {
      grid: '#BDBDBD';
      friendly: '#4CAF50';
      enemy: '#F44336';
      neutral: '#9E9E9E';
    };
    typography: {
      heading: 'Roboto Bold, 18px';
      body: 'Roboto Regular, 14px';
      stats: 'Roboto Medium, 12px';
    };
  };
  
  // Unit elements
  units: {
    style: 'Detailed unit sprites';
    colors: 'Faction-specific colors';
    animations: 'Smooth movement';
    effects: 'Combat effects';
  };
  
  // Battlefield
  battlefield: {
    style: 'Tactical grid layout';
    terrain: 'Varied terrain types';
    effects: 'Battle effects and animations';
    ui: 'Overlay UI elements';
  };
}
```

## Responsive Design

### Mobile Wireframes
```typescript
interface MobileWireframes {
  // Screen sizes
  screenSizes: {
    small: '320px width';
    medium: '375px width';
    large: '414px width';
  };
  
  // Layout adaptations
  adaptations: {
    navigation: 'Bottom tab navigation';
    sidebar: 'Overlay drawer';
    content: 'Single column layout';
    interactions: 'Touch-optimized';
  };
  
  // Component adjustments
  components: {
    buttons: 'Larger touch targets';
    text: 'Readable font sizes';
    images: 'Optimized for mobile';
    spacing: 'Appropriate spacing';
  };
}
```

### Tablet Wireframes
```typescript
interface TabletWireframes {
  // Screen sizes
  screenSizes: {
    small: '768px width';
    medium: '834px width';
    large: '1024px width';
  };
  
  // Layout adaptations
  adaptations: {
    navigation: 'Side navigation';
    sidebar: 'Persistent sidebar';
    content: 'Two-column layout';
    interactions: 'Touch and mouse';
  };
  
  // Component adjustments
  components: {
    buttons: 'Medium touch targets';
    text: 'Comfortable font sizes';
    images: 'High-resolution images';
    spacing: 'Generous spacing';
  };
}
```

### Desktop Wireframes
```typescript
interface DesktopWireframes {
  // Screen sizes
  screenSizes: {
    small: '1280px width';
    medium: '1440px width';
    large: '1920px width';
  };
  
  // Layout adaptations
  adaptations: {
    navigation: 'Top navigation';
    sidebar: 'Persistent sidebar';
    content: 'Three-column layout';
    interactions: 'Mouse and keyboard';
  };
  
  // Component adjustments
  components: {
    buttons: 'Standard button sizes';
    text: 'Desktop font sizes';
    images: 'Full-resolution images';
    spacing: 'Desktop spacing';
  };
}
```

## Interactive Prototypes

### Prototype Features
```typescript
interface PrototypeFeatures {
  // Navigation
  navigation: {
    transitions: 'Smooth page transitions';
    animations: 'Page transition animations';
    gestures: 'Swipe and gesture support';
    keyboard: 'Keyboard navigation';
  };
  
  // Interactions
  interactions: {
    buttons: 'Button press animations';
    forms: 'Form validation feedback';
    modals: 'Modal open/close animations';
    lists: 'List item interactions';
  };
  
  // Data
  data: {
    realistic: 'Realistic data and content';
    dynamic: 'Dynamic content updates';
    states: 'Different UI states';
    errors: 'Error state handling';
  };
}
```

### Prototype Tools
```typescript
interface PrototypeTools {
  // Design tools
  design: {
    figma: 'Figma for design and prototyping';
    sketch: 'Sketch for design';
    adobe: 'Adobe XD for prototyping';
  };
  
  // Prototyping tools
  prototyping: {
    figma: 'Figma interactive prototypes';
    principle: 'Principle for animations';
    framer: 'Framer for complex interactions';
    invision: 'InVision for sharing';
  };
  
  // Testing tools
  testing: {
    usertesting: 'UserTesting.com for user testing';
    maze: 'Maze for prototype testing';
    hotjar: 'Hotjar for behavior analysis';
  };
}
```

## Design Handoff

### Handoff Specifications
```typescript
interface HandoffSpecifications {
  // Design specifications
  design: {
    colors: 'Color codes and usage';
    typography: 'Font specifications';
    spacing: 'Spacing measurements';
    shadows: 'Shadow specifications';
    borders: 'Border specifications';
  };
  
  // Component specifications
  components: {
    buttons: 'Button states and specifications';
    inputs: 'Input field specifications';
    cards: 'Card specifications';
    modals: 'Modal specifications';
    navigation: 'Navigation specifications';
  };
  
  // Asset specifications
  assets: {
    images: 'Image specifications and formats';
    icons: 'Icon specifications and formats';
    logos: 'Logo specifications and formats';
    illustrations: 'Illustration specifications';
  };
}
```

### Developer Handoff
```typescript
interface DeveloperHandoff {
  // Technical specifications
  technical: {
    measurements: 'Pixel-perfect measurements';
    breakpoints: 'Responsive breakpoints';
    animations: 'Animation specifications';
    interactions: 'Interaction specifications';
  };
  
  // Code specifications
  code: {
    components: 'Component specifications';
    props: 'Component props and types';
    states: 'Component state specifications';
    events: 'Event specifications';
  };
  
  // Documentation
  documentation: {
    styleGuide: 'Style guide documentation';
    componentLibrary: 'Component library documentation';
    usage: 'Usage guidelines';
    examples: 'Code examples';
  };
}
```
