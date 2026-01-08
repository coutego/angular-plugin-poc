import { makeEnvironmentProviders, inject, ENVIRONMENT_INITIALIZER, InjectionToken, Type } from '@angular/core';
import { Router } from '@angular/router';
import { definePlugin } from './plugin.factory';
import { createExtensionPoint } from './plugin.contract';
import { PluginRegistryService } from './plugin-registry.service';
import { ChildrenNavigationComponent } from '../shared/children-navigation.component';

export interface NavItem {
  id: string;
  label: string;
  route?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  component?: Type<unknown>;
  description?: string;
  iconColor?: string;
  section?: string;
  requiredPerm?: string;
  layout?: 'default' | 'full-screen';
  hidden?: boolean;
  // Internal fields added by plugin factory
  _routeSegment?: string;
  _pluginId?: string;
  _fullRoute?: string;
}

export interface SettingsSection {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  component: Type<unknown>;
  order?: number;
  _pluginId?: string;
}

export interface SidebarFooterAction {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  order?: number;
  _pluginId?: string;
}

// Raw nav items from plugins (before route processing)
export const NAV_ITEMS = createExtensionPoint<NavItem>('nav-items');

// Settings sections contributed by plugins
export const SETTINGS_SECTIONS = createExtensionPoint<SettingsSection>('settings-sections');

// Sidebar footer actions contributed by plugins
export const SIDEBAR_FOOTER_ACTIONS = createExtensionPoint<SidebarFooterAction>('sidebar-footer-actions');

// Processed nav items with full routes - use this for navigation
export const PROCESSED_NAV_ITEMS = new InjectionToken<NavItem[]>('PROCESSED_NAV_ITEMS', {
  providedIn: 'root',
  factory: () => [],
});

export const HEADER_COMPONENTS = createExtensionPoint<Type<unknown>>('header-components');
export const OVERLAY_COMPONENTS = createExtensionPoint<Type<unknown>>('overlay-components');
export const ROOT_COMPONENT = createExtensionPoint<Type<unknown>>('root-component');
export const SHELL_COMPONENT = createExtensionPoint<Type<unknown>>('shell-component');

// Mutable store for processed items
let processedNavItemsStore: NavItem[] = [];

export function getProcessedNavItems(): NavItem[] {
  return processedNavItemsStore;
}

function buildFullRoutes(navItems: NavItem[]): NavItem[] {
  // Create a map for quick lookup by ID
  const itemMap = new Map<string, NavItem>();
  navItems.forEach((item) => {
    if (itemMap.has(item.id)) {
      console.warn(
        `[PluginSystem] Duplicate nav item ID detected: "${item.id}". ` +
          `The second occurrence will override the first.`
      );
    }
    itemMap.set(item.id, item);
  });

  // Build full route for each item by walking up the parent chain
  const getFullRoute = (item: NavItem, visited: Set<string> = new Set()): string => {
    // Prevent circular references
    if (visited.has(item.id)) {
      console.error(`[PluginSystem] Circular parent reference detected for nav item: "${item.id}"`);
      return item._routeSegment || item.route || '';
    }
    visited.add(item.id);

    const segment = item._routeSegment || item.route || '';

    if (item.parentId) {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        const parentRoute = getFullRoute(parent, visited);
        if (parentRoute && segment) {
          return `${parentRoute}/${segment}`;
        }
        return parentRoute || segment;
      } else {
        console.warn(
          `[PluginSystem] Nav item "${item.id}" references unknown parent "${item.parentId}". ` +
            `Make sure the parent is defined in the same or an earlier plugin.`
        );
      }
    }

    return segment;
  };

  // Process all items and set their full routes
  const processedItems = navItems.map((item) => {
    const fullRoute = getFullRoute(item);
    return {
      ...item,
      route: fullRoute,
      _fullRoute: fullRoute,
    };
  });

  return processedItems;
}

function detectDuplicateRoutes(navItems: NavItem[]): void {
  const routeMap = new Map<string, NavItem[]>();

  navItems
    .filter((item) => item.route && item.component)
    .forEach((item) => {
      const route = item.route!;
      if (!routeMap.has(route)) {
        routeMap.set(route, []);
      }
      routeMap.get(route)!.push(item);
    });

  routeMap.forEach((items, route) => {
    if (items.length > 1) {
      const ids = items.map((i) => i.id).join(', ');
      console.error(
        `[PluginSystem] Duplicate route detected: "${route}" is used by nav items: [${ids}]. ` +
          `Only the last one will be accessible.`
      );
    }
  });
}

function assignDefaultComponents(navItems: NavItem[]): NavItem[] {
  // Find items that have children (are parents)
  const parentIds = new Set<string>();
  navItems.forEach((item) => {
    if (item.parentId) {
      parentIds.add(item.parentId);
    }
  });

  // Assign default component to parents without a component
  return navItems.map((item) => {
    if (parentIds.has(item.id) && !item.component && item.route) {
      return {
        ...item,
        component: ChildrenNavigationComponent,
      };
    }
    return item;
  });
}

export const providePluginRoutes = () => {
  return makeEnvironmentProviders([
    {
      provide: PROCESSED_NAV_ITEMS,
      useFactory: () => {
        const rawNavItems = inject(NAV_ITEMS);
        const registry = inject(PluginRegistryService);
        
        // Filter out nav items from disabled plugins
        const enabledNavItems = rawNavItems.filter(item => {
          const pluginId = item._pluginId;
          return !pluginId || registry.isEnabled(pluginId);
        });
        
        let processed = buildFullRoutes(enabledNavItems);
        processed = assignDefaultComponents(processed);
        processedNavItemsStore = processed;
        return processed;
      },
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {
        const router = inject(Router);
        const navItems = inject(PROCESSED_NAV_ITEMS);

        // Check for duplicate routes
        detectDuplicateRoutes(navItems);

        const routes = navItems
          .filter((item) => item.component && item.route)
          .map((item) => ({
            path: item.route!,
            component: item.component,
            data: {
              label: item.label,
              icon: item.icon,
              navItemId: item.id,
              pluginId: item._pluginId,
            },
          }));

        // Sort routes by specificity (more segments = more specific = should match first)
        routes.sort((a, b) => {
          const aSegments = a.path.split('/').length;
          const bSegments = b.path.split('/').length;
          return bSegments - aSegments;
        });

        // Find the first root-level route for default redirect (by order)
        const rootItems = navItems
          .filter(item => !item.parentId && item.route && item.component && !item.hidden)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const defaultRoute = rootItems.length > 0 ? rootItems[0].route! : '';

        const newConfig = [
          ...routes,
          { path: '', redirectTo: defaultRoute, pathMatch: 'full' as const },
        ];

        router.resetConfig(newConfig);
      },
      multi: true,
    },
  ]);
};

export function provideApplicationPlugin() {
  return definePlugin({
    id: 'application',
    description: 'Core application structure and navigation',
    providers: [providePluginRoutes()],
  });
}
