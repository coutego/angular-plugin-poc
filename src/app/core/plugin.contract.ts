import { EnvironmentProviders, InjectionToken } from '@angular/core';

export interface PluginContribution<T = any> {
  token: InjectionToken<T[]>;
  value: T;
}

export interface SimplePlugin {
  id: string;
  description?: string;
  dependsOn?: string[];
  contributions?: PluginContribution[];
  providers?: EnvironmentProviders[];
}

export const createExtensionPoint = <T>(name: string): InjectionToken<T[]> =>
  new InjectionToken<T[]>(`EXT_${name}`, {
    providedIn: 'root',
    factory: () => [],
  });

export const PLUGIN_CONTEXT = new InjectionToken<PluginContext>('PLUGIN_CONTEXT');

export interface PluginContext {
  pluginId: string;
}
