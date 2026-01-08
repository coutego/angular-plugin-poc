import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginRegistryService, PluginMetadata } from '../../../core/plugin-registry.service';

@Component({
  selector: 'app-plugin-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Plugin Inspector</h1>
        <p class="text-slate-600">View and manage all loaded plugins in the application.</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-500 font-medium mb-1">TOTAL PLUGINS</p>
          <p class="text-2xl font-bold text-slate-900">{{ stats().total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-500 font-medium mb-1">ENABLED</p>
          <p class="text-2xl font-bold text-green-600">{{ stats().enabled }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-500 font-medium mb-1">DISABLED</p>
          <p class="text-2xl font-bold text-slate-400">{{ stats().disabled }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-500 font-medium mb-1">CONTRIBUTIONS</p>
          <p class="text-2xl font-bold text-blue-600">{{ stats().totalContributions }}</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          (click)="filter.set('all')"
          [class]="getFilterClass('all')"
        >
          All ({{ stats().total }})
        </button>
        <button
          (click)="filter.set('enabled')"
          [class]="getFilterClass('enabled')"
        >
          Enabled ({{ stats().enabled }})
        </button>
        <button
          (click)="filter.set('disabled')"
          [class]="getFilterClass('disabled')"
        >
          Disabled ({{ stats().disabled }})
        </button>
      </div>

      <!-- Plugin List -->
      <div class="space-y-4 mb-8">
        @for (plugin of filteredPlugins(); track plugin.id) {
          <div 
            class="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
            [class.opacity-60]="!plugin.enabled"
          >
            <!-- Plugin Header -->
            <div class="p-4 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div 
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  [class]="plugin.enabled ? 'bg-green-500' : 'bg-slate-300'"
                ></div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-slate-900">{{ plugin.id }}</h3>
                    @if (isCorePlugin(plugin.id)) {
                      <span class="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                        Core
                      </span>
                    }
                  </div>
                  @if (plugin.description) {
                    <p class="text-sm text-slate-500">{{ plugin.description }}</p>
                  }
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <button
                  (click)="toggleExpanded(plugin.id)"
                  class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  [attr.aria-label]="isExpanded(plugin.id) ? 'Collapse details' : 'Expand details'"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 transition-transform"
                    [class.rotate-180]="isExpanded(plugin.id)"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                @if (!isCorePlugin(plugin.id)) {
                  <button
                    (click)="togglePlugin(plugin)"
                    class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                    [class]="plugin.enabled 
                      ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'"
                  >
                    {{ plugin.enabled ? 'Disable' : 'Enable' }}
                  </button>
                }
              </div>
            </div>

            <!-- Expanded Details -->
            @if (isExpanded(plugin.id)) {
              <div class="border-t border-slate-100 p-4 bg-slate-50">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Dependencies -->
                  <div>
                    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Dependencies
                    </h4>
                    @if (plugin.dependsOn.length > 0) {
                      <div class="flex flex-wrap gap-2">
                        @for (dep of plugin.dependsOn; track dep) {
                          <span 
                            class="px-2 py-1 text-xs font-medium rounded-lg"
                            [class]="isPluginEnabled(dep) 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'"
                          >
                            {{ dep }}
                          </span>
                        }
                      </div>
                    } @else {
                      <p class="text-sm text-slate-400 italic">No dependencies</p>
                    }
                  </div>

                  <!-- Dependents -->
                  <div>
                    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Required By
                    </h4>
                    @if (getDependents(plugin.id).length > 0) {
                      <div class="flex flex-wrap gap-2">
                        @for (dep of getDependents(plugin.id); track dep.id) {
                          <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg">
                            {{ dep.id }}
                          </span>
                        }
                      </div>
                    } @else {
                      <p class="text-sm text-slate-400 italic">No dependents</p>
                    }
                  </div>
                </div>

                <!-- Contributions -->
                <div class="mt-6">
                  <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Contributions ({{ plugin.contributions.length }})
                  </h4>
                  @if (plugin.contributions.length > 0) {
                    <div class="space-y-2">
                      @for (contribution of plugin.contributions; track $index) {
                        <div class="bg-white rounded-lg border border-slate-200 p-3">
                          <div class="flex items-center gap-2 mb-2">
                            <span class="px-2 py-0.5 text-xs font-mono bg-slate-100 text-slate-600 rounded">
                              {{ contribution.type }}
                            </span>
                            @if (contribution.id) {
                              <span class="text-xs text-slate-500">{{ contribution.id }}</span>
                            }
                          </div>
                          @if (contribution.label) {
                            <p class="text-sm text-slate-700">{{ contribution.label }}</p>
                          }
                          <details class="mt-2">
                            <summary class="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                              View details
                            </summary>
                            <pre class="mt-2 p-2 bg-slate-50 rounded text-xs overflow-auto max-h-40">{{ contribution.details | json }}</pre>
                          </details>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-sm text-slate-400 italic">No contributions</p>
                  }
                </div>

                <!-- Metadata -->
                <div class="mt-6 pt-4 border-t border-slate-200">
                  <p class="text-xs text-slate-400">
                    Registered at: {{ plugin.registeredAt | date:'medium' }}
                  </p>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Dependency Graph -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Dependency Graph</h2>
        <div class="bg-slate-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          @for (plugin of topologicalOrder(); track plugin) {
            <div class="flex items-center gap-2 py-1">
              <span 
                class="w-2 h-2 rounded-full flex-shrink-0"
                [class]="isPluginEnabled(plugin) ? 'bg-green-500' : 'bg-slate-300'"
              ></span>
              <span [class]="isPluginEnabled(plugin) ? 'text-slate-700' : 'text-slate-400'">
                {{ plugin }}
              </span>
              @if (getDependencyList(plugin).length > 0) {
                <span class="text-slate-400">←</span>
                <span class="text-slate-400">{{ getDependencyList(plugin).join(', ') }}</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Contribution Types Summary -->
      <div class="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Contributions by Type</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (entry of contributionTypeEntries(); track entry.type) {
            <div class="bg-slate-50 rounded-lg p-3">
              <p class="text-xs font-mono text-slate-500 mb-1">{{ entry.type }}</p>
              <p class="text-xl font-bold text-slate-900">{{ entry.count }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Reload Notice -->
      @if (hasChanges()) {
        <div class="fixed bottom-6 right-6 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg max-w-sm">
          <div class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-amber-800">Reload Required</p>
              <p class="text-xs text-amber-600 mt-1">
                Plugin changes will take full effect after reloading the page.
              </p>
              <button
                (click)="reloadPage()"
                class="mt-2 px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Reload Now
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PluginInspectorComponent {
  private readonly registry = inject(PluginRegistryService);

  protected readonly filter = signal<'all' | 'enabled' | 'disabled'>('all');
  protected readonly expandedPlugins = signal<Set<string>>(new Set());
  protected readonly hasChanges = signal(false);

  protected readonly plugins = this.registry.plugins;
  protected readonly stats = computed(() => this.registry.getStats());

  protected readonly filteredPlugins = computed(() => {
    const f = this.filter();
    const plugins = this.plugins();
    
    switch (f) {
      case 'enabled':
        return plugins.filter(p => p.enabled);
      case 'disabled':
        return plugins.filter(p => !p.enabled);
      default:
        return plugins;
    }
  });

  protected readonly topologicalOrder = computed(() => 
    this.registry.getTopologicalOrder()
  );

  protected readonly contributionTypeEntries = computed(() => {
    const stats = this.stats();
    return Object.entries(stats.contributionsByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  });

  protected isCorePlugin(pluginId: string): boolean {
    return ['application', 'app-shell'].includes(pluginId);
  }

  protected isPluginEnabled(pluginId: string): boolean {
    return this.registry.isEnabled(pluginId);
  }

  protected getDependents(pluginId: string): PluginMetadata[] {
    return this.registry.getDependents(pluginId);
  }

  protected getDependencyList(pluginId: string): string[] {
    const plugin = this.registry.getPlugin(pluginId);
    return plugin?.dependsOn || [];
  }

  protected toggleExpanded(pluginId: string): void {
    this.expandedPlugins.update(set => {
      const newSet = new Set(set);
      if (newSet.has(pluginId)) {
        newSet.delete(pluginId);
      } else {
        newSet.add(pluginId);
      }
      return newSet;
    });
  }

  protected isExpanded(pluginId: string): boolean {
    return this.expandedPlugins().has(pluginId);
  }

  protected togglePlugin(plugin: PluginMetadata): void {
    let result: { success: boolean; reason?: string };
    
    if (plugin.enabled) {
      result = this.registry.disable(plugin.id);
    } else {
      result = this.registry.enable(plugin.id);
    }

    if (!result.success && result.reason) {
      alert(result.reason);
    } else if (result.success) {
      this.hasChanges.set(true);
    }
  }

  protected getFilterClass(filterValue: 'all' | 'enabled' | 'disabled'): string {
    const base = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors';
    if (this.filter() === filterValue) {
      return `${base} bg-slate-900 text-white`;
    }
    return `${base} bg-slate-100 text-slate-600 hover:bg-slate-200`;
  }

  protected reloadPage(): void {
    window.location.reload();
  }
}
