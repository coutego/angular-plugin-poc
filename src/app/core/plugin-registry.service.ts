import { Injectable, signal, computed } from '@angular/core';

/**
 * Metadata about a contribution made by a plugin
 */
export interface ContributionMetadata {
  type: string;
  id?: string;
  label?: string;
  details: Record<string, unknown>;
}

/**
 * Metadata about a registered plugin
 */
export interface PluginMetadata {
  id: string;
  description?: string;
  dependsOn: string[];
  enabled: boolean;
  contributions: ContributionMetadata[];
  registeredAt: Date;
}

/**
 * Service for tracking and managing registered plugins.
 * Provides introspection capabilities and enable/disable functionality.
 */
@Injectable({ providedIn: 'root' })
export class PluginRegistryService {
  private readonly pluginsSignal = signal<Map<string, PluginMetadata>>(new Map());
  private readonly disabledPluginsSignal = signal<Set<string>>(this.loadDisabledPlugins());

  /** All registered plugins */
  readonly plugins = computed(() => 
    Array.from(this.pluginsSignal().values())
      .sort((a, b) => a.registeredAt.getTime() - b.registeredAt.getTime())
  );

  /** Only enabled plugins */
  readonly enabledPlugins = computed(() => 
    this.plugins().filter(p => p.enabled)
  );

  /** Only disabled plugins */
  readonly disabledPlugins = computed(() => 
    this.plugins().filter(p => !p.enabled)
  );

  /** Set of disabled plugin IDs (for filtering) */
  readonly disabledPluginIds = computed(() => 
    new Set(this.disabledPlugins().map(p => p.id))
  );

  /**
   * Register a plugin with the registry
   */
  register(metadata: Omit<PluginMetadata, 'enabled' | 'registeredAt'>): void {
    const isDisabled = this.disabledPluginsSignal().has(metadata.id);
    
    this.pluginsSignal.update(map => {
      const newMap = new Map(map);
      newMap.set(metadata.id, {
        ...metadata,
        enabled: !isDisabled,
        registeredAt: new Date(),
      });
      return newMap;
    });

    console.log(`[PluginRegistry] Registered: ${metadata.id}`, {
      enabled: !isDisabled,
      contributions: metadata.contributions.length,
      dependsOn: metadata.dependsOn,
    });
  }

  /**
   * Disable a plugin. Returns false if the plugin cannot be disabled
   * (e.g., other enabled plugins depend on it).
   */
  disable(pluginId: string): { success: boolean; reason?: string } {
    const plugin = this.pluginsSignal().get(pluginId);
    if (!plugin) {
      return { success: false, reason: `Plugin "${pluginId}" not found` };
    }

    if (!plugin.enabled) {
      return { success: true }; // Already disabled
    }

    // Check if other enabled plugins depend on this one
    const dependents = this.plugins().filter(p => 
      p.enabled && p.id !== pluginId && p.dependsOn.includes(pluginId)
    );

    if (dependents.length > 0) {
      const dependentIds = dependents.map(d => d.id).join(', ');
      return { 
        success: false, 
        reason: `Cannot disable "${pluginId}": required by [${dependentIds}]` 
      };
    }

    // Core plugins cannot be disabled
    const corePlugins = ['application', 'app-shell'];
    if (corePlugins.includes(pluginId)) {
      return { 
        success: false, 
        reason: `Cannot disable core plugin "${pluginId}"` 
      };
    }

    this.pluginsSignal.update(map => {
      const newMap = new Map(map);
      newMap.set(pluginId, { ...plugin, enabled: false });
      return newMap;
    });

    this.disabledPluginsSignal.update(set => {
      const newSet = new Set(set);
      newSet.add(pluginId);
      return newSet;
    });

    this.saveDisabledPlugins();
    console.log(`[PluginRegistry] Disabled: ${pluginId}`);

    return { success: true };
  }

  /**
   * Enable a previously disabled plugin. Returns false if dependencies
   * are not met.
   */
  enable(pluginId: string): { success: boolean; reason?: string } {
    const plugin = this.pluginsSignal().get(pluginId);
    if (!plugin) {
      return { success: false, reason: `Plugin "${pluginId}" not found` };
    }

    if (plugin.enabled) {
      return { success: true }; // Already enabled
    }

    // Check if all dependencies are enabled
    const disabledDeps = plugin.dependsOn.filter(dep => {
      const depPlugin = this.pluginsSignal().get(dep);
      return !depPlugin || !depPlugin.enabled;
    });

    if (disabledDeps.length > 0) {
      return { 
        success: false, 
        reason: `Cannot enable "${pluginId}": dependencies not enabled [${disabledDeps.join(', ')}]` 
      };
    }

    this.pluginsSignal.update(map => {
      const newMap = new Map(map);
      newMap.set(pluginId, { ...plugin, enabled: true });
      return newMap;
    });

    this.disabledPluginsSignal.update(set => {
      const newSet = new Set(set);
      newSet.delete(pluginId);
      return newSet;
    });

    this.saveDisabledPlugins();
    console.log(`[PluginRegistry] Enabled: ${pluginId}`);

    return { success: true };
  }

  /**
   * Check if a plugin is enabled.
   * Returns true if the plugin is not in the disabled list.
   * This allows checking before the plugin is formally registered.
   */
  isEnabled(pluginId: string): boolean {
    // First check the disabled plugins list (works even before registration)
    if (this.disabledPluginsSignal().has(pluginId)) {
      return false;
    }
    
    // If registered, use the registered state
    const plugin = this.pluginsSignal().get(pluginId);
    if (plugin) {
      return plugin.enabled;
    }
    
    // If not registered yet and not in disabled list, assume enabled
    return true;
  }

  /**
   * Check if a plugin is registered
   */
  isRegistered(pluginId: string): boolean {
    return this.pluginsSignal().has(pluginId);
  }

  /**
   * Get metadata for a specific plugin
   */
  getPlugin(pluginId: string): PluginMetadata | undefined {
    return this.pluginsSignal().get(pluginId);
  }

  /**
   * Get plugins that depend on the specified plugin
   */
  getDependents(pluginId: string): PluginMetadata[] {
    return this.plugins().filter(p => p.dependsOn.includes(pluginId));
  }

  /**
   * Get the dependency graph as an adjacency list
   */
  getDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    this.plugins().forEach(p => {
      graph.set(p.id, [...p.dependsOn]);
    });
    return graph;
  }

  /**
   * Get plugins in topological order (dependencies first)
   */
  getTopologicalOrder(): string[] {
    const graph = this.getDependencyGraph();
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const deps = graph.get(id) || [];
      deps.forEach(dep => visit(dep));
      
      result.push(id);
    };

    this.plugins().forEach(p => visit(p.id));
    return result;
  }

  /**
   * Get statistics about registered plugins
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    totalContributions: number;
    contributionsByType: Record<string, number>;
  } {
    const plugins = this.plugins();
    const contributionsByType: Record<string, number> = {};

    plugins.forEach(p => {
      p.contributions.forEach(c => {
        contributionsByType[c.type] = (contributionsByType[c.type] || 0) + 1;
      });
    });

    return {
      total: plugins.length,
      enabled: plugins.filter(p => p.enabled).length,
      disabled: plugins.filter(p => !p.enabled).length,
      totalContributions: plugins.reduce((sum, p) => sum + p.contributions.length, 0),
      contributionsByType,
    };
  }

  private loadDisabledPlugins(): Set<string> {
    try {
      const stored = localStorage.getItem('disabled-plugins');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('[PluginRegistry] Failed to load disabled plugins:', e);
    }
    return new Set();
  }

  private saveDisabledPlugins(): void {
    try {
      const disabled = Array.from(this.disabledPluginsSignal());
      localStorage.setItem('disabled-plugins', JSON.stringify(disabled));
    } catch (e) {
      console.error('[PluginRegistry] Failed to save disabled plugins:', e);
    }
  }
}
