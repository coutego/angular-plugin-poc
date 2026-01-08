# Agent Guidelines

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

---

## Plugin Architecture Guidelines

This application uses a plugin-based architecture. Follow these patterns when creating or modifying plugins.

### Plugin Structure

Each plugin should be organized in its own directory under `src/app/features/` with the following structure:

```
src/app/features/my-feature/
├── my-feature.plugin.ts        # Plugin definition
├── my-feature.component.ts     # Main component
├── my-feature-settings.component.ts  # Settings component (optional)
└── sub-feature/                # Sub-features (optional)
    ├── sub-feature.plugin.ts
    └── sub-feature.component.ts
```

### Creating a Plugin

Use the `definePlugin()` function from `@app/core/plugin.factory`:

```typescript
import { definePlugin } from '../../core/plugin.factory';
import { NAV_ITEMS, SETTINGS_SECTIONS } from '../../core/application.plugin';
import { MyFeatureComponent } from './my-feature.component';

export function provideMyFeaturePlugin() {
  return definePlugin({
    id: 'my-feature',                    // Unique plugin identifier
    description: 'Description of feature', // Human-readable description
    dependsOn: ['application'],          // Required dependencies

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',                    // Will be namespaced to 'my-feature.main'
          label: 'My Feature',
          route: 'my-feature',
          icon: `<svg>...</svg>`,        // Inline SVG icon
          iconColor: 'text-blue-600 bg-blue-50',
          description: 'Feature description',
          component: MyFeatureComponent,
          order: 10,                     // Lower numbers appear first
        },
      },
    ],
  });
}
```

### Registering Plugins

Add your plugin to `src/app/plugins.ts`:

```typescript
import { provideMyFeaturePlugin } from './features/my-feature/my-feature.plugin';

export const plugins: EnvironmentProviders[] = [
  provideApplicationPlugin(),
  provideAppShellPlugin(),
  // ... other plugins
  provideMyFeaturePlugin(),  // Add your plugin here
];
```

**Important**: Plugin order matters! Plugins must be listed after their dependencies.

### Extension Points

The application provides several extension points:

#### NAV_ITEMS
Register navigation items in the sidebar:

```typescript
{
  token: NAV_ITEMS,
  value: {
    id: 'main',
    label: 'Feature Name',
    route: 'feature-route',
    icon: `<svg>...</svg>`,
    iconColor: 'text-color bg-color',
    description: 'Optional description',
    component: FeatureComponent,
    order: 10,
    parentId: 'parent-plugin.parent-id',  // For nested navigation
    hidden: false,                         // Hide from sidebar but keep route
    section: 'Section Name',               // Group items under a section header
  },
}
```

#### SETTINGS_SECTIONS
Register settings panels:

```typescript
{
  token: SETTINGS_SECTIONS,
  value: {
    id: 'my-settings',
    label: 'My Settings',
    description: 'Configure my feature',
    icon: `<svg>...</svg>`,
    component: MySettingsComponent,
    order: 10,
  },
}
```

#### HEADER_COMPONENTS
Add components to the header:

```typescript
{
  token: HEADER_COMPONENTS,
  value: MyHeaderWidgetComponent,
}
```

#### OVERLAY_COMPONENTS
Add global overlay components (modals, toasts, etc.):

```typescript
{
  token: OVERLAY_COMPONENTS,
  value: MyOverlayComponent,
}
```

### Nested Navigation

Create parent-child relationships using `parentId`:

```typescript
// Parent plugin (utilities.plugin.ts)
{
  id: 'main',
  label: 'Utilities',
  route: 'utilities',
  // No component = auto-generates children navigation page
}

// Child plugin (qr-generator.plugin.ts)
{
  id: 'main',
  label: 'QR Generator',
  route: 'qr',                        // Becomes 'utilities/qr'
  parentId: 'utilities.main',         // Reference parent with namespace
  component: QrGeneratorComponent,
}
```

### Settings Integration

To add configurable settings to your plugin:

1. Create a settings component:

```typescript
@Component({
  selector: 'app-my-feature-settings',
  template: `...`,
})
export class MyFeatureSettingsComponent {
  private readonly settingsService = inject(SettingsService);
  // Implement settings UI
}
```

2. Register it as a settings section in your plugin:

```typescript
{
  token: SETTINGS_SECTIONS,
  value: {
    id: 'my-feature',
    label: 'My Feature',
    component: MyFeatureSettingsComponent,
    order: 30,
  },
}
```

3. Link to settings from your feature:

```typescript
protected goToSettings(): void {
  this.router.navigate(['/settings'], { fragment: 'my-feature' });
}
```

### Plugin Dependencies

Declare dependencies to ensure proper initialization order:

```typescript
definePlugin({
  id: 'qr-generator',
  dependsOn: ['application', 'utilities'],  // Must be loaded after these
  // ...
});
```

The plugin system will throw an error if dependencies are not met.

### ID Namespacing

Plugin IDs are automatically namespaced:
- `id: 'main'` in plugin `my-feature` becomes `my-feature.main`
- `parentId: 'main'` in the same plugin becomes `my-feature.main`
- Cross-plugin references must use full namespace: `parentId: 'other-plugin.main'`

### Best Practices for Plugins

1. **Single Responsibility**: Each plugin should focus on one feature area
2. **Self-Contained**: Plugins should not directly import from other feature plugins
3. **Use Extension Points**: Communicate through the defined extension points
4. **Declare Dependencies**: Always list required plugins in `dependsOn`
5. **Meaningful IDs**: Use descriptive, unique plugin IDs
6. **Consistent Icons**: Use Heroicons (outline style) for consistency
7. **Order Values**: Use increments of 10 for `order` to allow insertion
8. **Settings**: Provide configurable defaults through the settings system
