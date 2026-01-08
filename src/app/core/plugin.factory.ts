import { makeEnvironmentProviders, EnvironmentProviders, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';
import { SimplePlugin, PLUGIN_CONTEXT } from './plugin.contract';
import { PluginRegistryService, ContributionMetadata } from './plugin-registry.service';

const registeredPlugins = new Set<string>();

export function definePlugin(plugin: SimplePlugin): EnvironmentProviders {
  if (plugin.dependsOn) {
    const missingDeps = plugin.dependsOn.filter((dep) => !registeredPlugins.has(dep));
    if (missingDeps.length > 0) {
      throw new Error(
        `Plugin "${plugin.id}" depends on plugins that are not loaded: [${missingDeps.join(', ')}]. ` +
          `Make sure these plugins are listed before "${plugin.id}" in plugins.ts`
      );
    }
  }

  registeredPlugins.add(plugin.id);
  console.log(`[PluginSystem] Registered plugin: ${plugin.id}`);

  const providers: any[] = [];
  const contributions: ContributionMetadata[] = [];

  if (plugin.contributions) {
    plugin.contributions.forEach((contribution) => {
      const value = contribution.value;
      const namespacedValue = namespaceContribution(plugin.id, value);
      
      // Extract contribution metadata for introspection
      const tokenName = extractTokenName(contribution.token.toString());
      contributions.push({
        type: tokenName,
        id: (namespacedValue as any)?.id,
        label: (namespacedValue as any)?.label,
        details: sanitizeForIntrospection(namespacedValue),
      });

      console.log(`[PluginSystem] Plugin ${plugin.id} contributing:`, namespacedValue);

      providers.push({
        provide: contribution.token,
        useValue: namespacedValue,
        multi: true,
      });
    });
  }

  if (plugin.providers) {
    providers.push(...plugin.providers);
  }

  providers.push({
    provide: PLUGIN_CONTEXT,
    useValue: { pluginId: plugin.id },
    multi: true,
  });

  // Register with plugin registry for introspection
  providers.push({
    provide: ENVIRONMENT_INITIALIZER,
    useFactory: () => {
      const registry = inject(PluginRegistryService);
      return () => {
        registry.register({
          id: plugin.id,
          description: plugin.description,
          dependsOn: plugin.dependsOn || [],
          contributions,
        });
      };
    },
    multi: true,
  });

  return makeEnvironmentProviders(providers);
}

function namespaceContribution<T>(pluginId: string, value: T): T {
  if (value && typeof value === 'object' && 'id' in value && 'label' in value) {
    const navItem = value as Record<string, unknown>;
    const namespacedItem = { ...navItem };

    const originalId = navItem['id'] as string;
    namespacedItem['id'] = `${pluginId}.${originalId}`;

    if (navItem['parentId']) {
      const parentId = navItem['parentId'] as string;
      if (!parentId.includes('.')) {
        namespacedItem['parentId'] = `${pluginId}.${parentId}`;
      }
    }

    if (navItem['route']) {
      namespacedItem['_routeSegment'] = navItem['route'];
    }

    namespacedItem['_pluginId'] = pluginId;

    return namespacedItem as T;
  }

  return value;
}

/**
 * Extract a readable name from an InjectionToken string
 */
function extractTokenName(tokenString: string): string {
  // InjectionToken toString() returns "InjectionToken EXT_nav-items" or similar
  const match = tokenString.match(/InjectionToken\s+(.+)/);
  if (match) {
    return match[1].replace('EXT_', '');
  }
  return tokenString;
}

/**
 * Sanitize a value for introspection (remove functions, circular refs, etc.)
 */
function sanitizeForIntrospection(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return { value };
  }

  const result: Record<string, unknown> = {};
  
  for (const [key, val] of Object.entries(value)) {
    // Skip functions (like component references)
    if (typeof val === 'function') {
      result[key] = `[Function: ${val.name || 'anonymous'}]`;
    } else if (val && typeof val === 'object') {
      // Shallow copy for nested objects to avoid circular refs
      result[key] = Array.isArray(val) ? `[Array(${val.length})]` : '[Object]';
    } else {
      result[key] = val;
    }
  }

  return result;
}

export function resetPluginRegistry(): void {
  registeredPlugins.clear();
}
