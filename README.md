# Angular Plugin Architecture Showcase

A demonstration of a scalable, modular plugin architecture for Angular applications. This project showcases how to build extensible applications where features can be added, removed, or modified without changing the core application code.

## 🎯 Overview

This application implements a plugin-based architecture that allows:

- **Modular Features**: Each feature is a self-contained plugin
- **Dynamic Navigation**: Plugins register their own routes and navigation items
- **Extension Points**: Core application exposes hooks for plugins to extend functionality
- **Dependency Management**: Plugins can declare dependencies on other plugins
- **Settings System**: Plugins can contribute configuration panels to a central settings page
- **Runtime Introspection**: View and manage plugins through the Plugin Inspector

## 🏗️ Architecture

### Core Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Shell                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Header    │  │   Sidebar   │  │    Main Content     │  │
│  │             │  │             │  │                     │  │
│  │ [Extension] │  │ [Nav Items] │  │  [Router Outlet]    │  │
│  │             │  │ [Footer]    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ Extension Points
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
   │ Plugin A │          │ Plugin B │          │ Plugin C │
   │  (Home)  │          │(Utilities)│         │(Settings)│
   └─────────┘          └────┬────┘          └─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────┴─────┐       ┌─────┴─────┐
              │ Plugin B1 │       │ Plugin B2 │
              │(QR Gen)   │       │(Password) │
              └───────────┘       └───────────┘
```

### Extension Points

The application defines several extension points that plugins can contribute to:

| Extension Point | Purpose |
|----------------|---------|
| `NAV_ITEMS` | Navigation items for the sidebar |
| `SETTINGS_SECTIONS` | Configuration panels in settings |
| `SETTINGS_SCHEMAS` | Settings defaults for SettingsService |
| `SIDEBAR_FOOTER_ACTIONS` | Actions in the sidebar footer |
| `HEADER_COMPONENTS` | Components rendered in the header |
| `OVERLAY_COMPONENTS` | Global overlay components (modals, toasts) |
| `SHELL_COMPONENT` | Override the application shell |
| `ROOT_COMPONENT` | Override the root application component |

## 📁 Project Structure

```
src/app/
├── core/                          # Core plugin infrastructure
│   ├── plugin.contract.ts         # Plugin interfaces and types
│   ├── plugin.factory.ts          # Plugin creation utilities
│   ├── plugin-registry.service.ts # Runtime plugin management
│   ├── application.plugin.ts      # Core application plugin & extension points
│   └── settings.service.ts        # Global settings management
│
├── shell/                         # Application shell components
│   ├── app-shell.component.ts     # Main layout component
│   ├── app-shell.plugin.ts        # Shell plugin definition
│   ├── header.component.ts        # Header component
│   ├── sidebar.component.ts       # Sidebar navigation
│   └── breadcrumb.component.ts    # Breadcrumb navigation
│
├── shared/                        # Shared components
│   └── children-navigation.component.ts  # Auto-generated nav pages
│
├── features/                      # Feature plugins
│   ├── home/                      # Home plugin
│   ├── settings/                  # Settings plugin
│   ├── utilities/                 # Utilities plugin group
│   │   ├── qr-generator/          # QR Generator plugin
│   │   ├── password-generator/    # Password Generator plugin
│   │   └── kanban-board/          # Kanban Board plugin
│   ├── extras/                    # Extras plugin group
│   │   └── games/                 # Games plugin group
│   │       ├── game-2048/         # 2048 game plugin
│   │       └── tetris/            # Tetris game plugin
│   └── dev-tools/                 # Developer tools
│       └── plugin-inspector/      # Plugin Inspector plugin
│
├── plugins.ts                     # Plugin registration
└── app.component.ts               # Root component
```

## 🔌 Creating a Plugin

### Basic Plugin

```typescript
// src/app/features/my-feature/my-feature.plugin.ts
import { definePlugin } from '../../core/plugin.factory';
import { NAV_ITEMS } from '../../core/application.plugin';
import { MyFeatureComponent } from './my-feature.component';

export function provideMyFeaturePlugin() {
  return definePlugin({
    id: 'my-feature',
    description: 'My awesome feature',
    dependsOn: ['application'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'My Feature',
          route: 'my-feature',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>`,
          iconColor: 'text-yellow-600 bg-yellow-50',
          component: MyFeatureComponent,
          order: 50,
        },
      },
    ],
  });
}
```

### Plugin with Nested Routes

```typescript
// Parent plugin
export function provideToolsPlugin() {
  return definePlugin({
    id: 'tools',
    dependsOn: ['application'],
    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Tools',
          route: 'tools',
          icon: `<svg>...</svg>`,
          description: 'Developer tools',
          order: 30,
          // No component = auto-generates a children navigation page
        },
      },
    ],
  });
}

// Child plugin
export function provideJsonFormatterPlugin() {
  return definePlugin({
    id: 'json-formatter',
    dependsOn: ['application', 'tools'],
    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'JSON Formatter',
          route: 'json',                    // Full route: /tools/json
          parentId: 'tools.main',           // Links to parent
          icon: `<svg>...</svg>`,
          component: JsonFormatterComponent,
          order: 0,
        },
      },
    ],
  });
}
```

### Plugin with Settings

```typescript
import { SETTINGS_SCHEMAS } from '../../core/settings.service';

export interface MyFeatureSettings {
  enabled: boolean;
  theme: 'light' | 'dark';
}

export const MY_FEATURE_SETTINGS_KEY = 'my-feature';

export const MY_FEATURE_DEFAULTS: MyFeatureSettings = {
  enabled: true,
  theme: 'light',
};

export function provideMyFeaturePlugin() {
  return definePlugin({
    id: 'my-feature',
    dependsOn: ['application'],
    contributions: [
      // Navigation item
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'My Feature',
          route: 'my-feature',
          component: MyFeatureComponent,
        },
      },
      // Settings section (UI)
      {
        token: SETTINGS_SECTIONS,
        value: {
          id: 'my-feature',
          label: 'My Feature Settings',
          description: 'Configure my feature behavior',
          icon: `<svg>...</svg>`,
          component: MyFeatureSettingsComponent,
          order: 50,
        },
      },
      // Settings schema (defaults)
      {
        token: SETTINGS_SCHEMAS,
        value: {
          key: MY_FEATURE_SETTINGS_KEY,
          defaults: MY_FEATURE_DEFAULTS,
        },
      },
    ],
  });
}
```

### Plugin with Sidebar Footer Action

```typescript
import { SIDEBAR_FOOTER_ACTIONS } from '../../core/application.plugin';

export function provideMyFeaturePlugin() {
  return definePlugin({
    id: 'my-feature',
    dependsOn: ['application'],
    contributions: [
      {
        token: SIDEBAR_FOOTER_ACTIONS,
        value: {
          id: 'quick-action',
          label: 'Quick Action',
          icon: `<svg>...</svg>`,
          route: '/my-feature/quick',
          order: 50,
        },
      },
    ],
  });
}
```

## 🚀 Registering Plugins

Add plugins to `src/app/plugins.ts`:

```typescript
import { EnvironmentProviders } from '@angular/core';
import { provideApplicationPlugin } from './core/application.plugin';
import { provideAppShellPlugin } from './shell/app-shell.plugin';
import { provideHomePlugin } from './features/home/home.plugin';
import { provideMyFeaturePlugin } from './features/my-feature/my-feature.plugin';

export const plugins: EnvironmentProviders[] = [
  // Core plugins (required)
  provideApplicationPlugin(),
  provideAppShellPlugin(),
  
  // Feature plugins
  provideHomePlugin(),
  provideMyFeaturePlugin(),  // Add your plugin here
];
```

**⚠️ Important**: Plugins must be listed after their dependencies!

## 🔧 How It Works

### 1. Plugin Definition

The `definePlugin()` function processes plugin configurations:

```typescript
export function definePlugin(plugin: SimplePlugin): EnvironmentProviders {
  // Validate dependencies
  if (plugin.dependsOn) {
    const missingDeps = plugin.dependsOn.filter(dep => !registeredPlugins.has(dep));
    if (missingDeps.length > 0) {
      throw new Error(`Plugin "${plugin.id}" depends on: [${missingDeps.join(', ')}]`);
    }
  }

  // Register plugin
  registeredPlugins.add(plugin.id);

  // Process contributions with automatic namespacing
  // 'main' becomes 'my-plugin.main'
  const providers = plugin.contributions.map(contribution => ({
    provide: contribution.token,
    useValue: namespaceContribution(plugin.id, contribution.value),
    multi: true,
  }));

  return makeEnvironmentProviders(providers);
}
```

### 2. Extension Points

Extension points are created using Angular's dependency injection:

```typescript
export const NAV_ITEMS = createExtensionPoint<NavItem>('nav-items');

// Creates an InjectionToken with multi: true behavior
```

Plugins contribute to extension points using `multi: true` providers, which collects all contributions into an array.

### 3. Route Generation

The application plugin processes navigation items and generates routes:

```typescript
const routes = navItems
  .filter(item => item.component && item.route)
  .map(item => ({
    path: item.route,
    component: item.component,
    data: { label: item.label, icon: item.icon },
  }));

router.resetConfig(routes);
```

### 4. Automatic Parent-Child Routes

When a nav item has children but no component, the system automatically assigns a `ChildrenNavigationComponent` that displays the children as clickable cards:

```typescript
function assignDefaultComponents(navItems: NavItem[]): NavItem[] {
  const parentIds = new Set(navItems.map(item => item.parentId).filter(Boolean));
  
  return navItems.map(item => {
    if (parentIds.has(item.id) && !item.component && item.route) {
      return { ...item, component: ChildrenNavigationComponent };
    }
    return item;
  });
}
```

### 5. Plugin Registry

The `PluginRegistryService` tracks all registered plugins and provides:

- Runtime introspection of plugin metadata
- Enable/disable functionality (persisted to localStorage)
- Dependency graph analysis
- Contribution tracking

## 🛠️ Dev Tools

### Plugin Inspector

The Plugin Inspector (available under Dev Tools) provides:

- Overview of all registered plugins
- Enable/disable plugins at runtime
- View plugin dependencies and dependents
- Inspect contributions made by each plugin
- Dependency graph visualization

Access it at `/dev-tools/plugins` or through the sidebar navigation.

## 🎨 UI Components

### Navigation Structure

The sidebar supports:
- **Flat navigation**: Simple list of items
- **Nested navigation**: Drill-down into sub-menus
- **Sections**: Group items under headers
- **Active state**: Highlights current route
- **Footer actions**: Plugin-contributed footer items

### Settings Page

The settings page:
- Collects all `SETTINGS_SECTIONS` contributions
- Displays them in a tabbed interface
- Supports deep-linking via URL fragments (`/settings#my-feature`)
- Responsive design with horizontal tabs on mobile

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Fixed sidebar with full navigation
- **Mobile**: Collapsible sidebar, horizontal tab navigation in settings

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build

# Build single HTML file
npm run build:single
```

### Creating a New Plugin

1. Create a new directory under `src/app/features/`
2. Create the plugin file (`my-feature.plugin.ts`)
3. Create the component(s)
4. Register in `src/app/plugins.ts`

## 📚 Key Files

| File | Purpose |
|------|---------|
| `core/plugin.contract.ts` | TypeScript interfaces for plugins |
| `core/plugin.factory.ts` | `definePlugin()` function |
| `core/plugin-registry.service.ts` | Runtime plugin management |
| `core/application.plugin.ts` | Extension points and route generation |
| `core/settings.service.ts` | Settings management with schema support |
| `plugins.ts` | Plugin registration |
| `shell/app-shell.component.ts` | Main application layout |

## 🎮 Included Plugins

| Plugin | Description |
|--------|-------------|
| `home` | Landing page with quick links |
| `settings` | Central settings management |
| `utilities` | Parent for utility plugins |
| `qr-generator` | QR code generation |
| `password-generator` | Secure password generation |
| `kanban-board` | Task management board |
| `extras` | Parent for extra features |
| `games` | Parent for game plugins |
| `game-2048` | 2048 puzzle game |
| `tetris` | Classic Tetris game |
| `dev-tools` | Parent for developer tools |
| `plugin-inspector` | Plugin introspection UI |

## 🤝 Contributing

When adding new features:

1. Create a self-contained plugin
2. Use extension points for integration
3. Declare dependencies explicitly
4. Follow the established patterns
5. Add settings if the feature is configurable

## 📄 License

MIT
