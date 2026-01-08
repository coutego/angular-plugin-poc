import { makeEnvironmentProviders, EnvironmentProviders } from '@angular/core';
import { SimplePlugin, PLUGIN_CONTEXT } from './plugin.contract';

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

  if (plugin.contributions) {
    plugin.contributions.forEach((contribution) => {
      const value = contribution.value;

      const namespacedValue = namespaceContribution(plugin.id, value);
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

export function resetPluginRegistry(): void {
  registeredPlugins.clear();
}
