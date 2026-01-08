import { Injectable, signal, computed, inject } from '@angular/core';
import { createExtensionPoint } from './plugin.contract';

/**
 * Settings schema contributed by plugins
 */
export interface SettingsSchema<T = unknown> {
  key: string;
  defaults: T;
}

/**
 * Extension point for plugins to register their settings schemas
 */
export const SETTINGS_SCHEMAS = createExtensionPoint<SettingsSchema>('settings-schemas');

const STORAGE_KEY = 'app-settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly schemas = inject(SETTINGS_SCHEMAS);
  
  private readonly settingsSignal = signal<Record<string, unknown>>(this.loadSettings());

  readonly settings = this.settingsSignal.asReadonly();

  private loadSettings(): Record<string, unknown> {
    // Build defaults from all registered schemas
    const defaults: Record<string, unknown> = {};
    this.schemas.forEach(schema => {
      defaults[schema.key] = schema.defaults;
    });

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored values with defaults (defaults provide missing keys)
        const merged: Record<string, unknown> = { ...defaults };
        for (const key of Object.keys(parsed)) {
          if (defaults[key] !== undefined) {
            // Deep merge for objects
            merged[key] = { ...(defaults[key] as object), ...(parsed[key] as object) };
          } else {
            // Keep stored value even if no schema (backward compat)
            merged[key] = parsed[key];
          }
        }
        return merged;
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return defaults;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settingsSignal()));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  /**
   * Get settings for a specific plugin by key
   */
  get<T>(key: string): T {
    const current = this.settingsSignal();
    if (current[key] !== undefined) {
      return current[key] as T;
    }
    
    // Find defaults from schema
    const schema = this.schemas.find(s => s.key === key);
    return (schema?.defaults ?? {}) as T;
  }

  /**
   * Get a computed signal for a specific plugin's settings
   */
  select<T>(key: string): () => T {
    return computed(() => {
      const current = this.settingsSignal();
      if (current[key] !== undefined) {
        return current[key] as T;
      }
      
      // Find defaults from schema
      const schema = this.schemas.find(s => s.key === key);
      return (schema?.defaults ?? {}) as T;
    });
  }

  /**
   * Update settings for a specific plugin
   */
  update<T extends object>(key: string, settings: Partial<T>): void {
    this.settingsSignal.update((current) => ({
      ...current,
      [key]: { ...(current[key] as object ?? {}), ...settings },
    }));
    this.saveSettings();
  }

  /**
   * Reset a specific plugin's settings to defaults
   */
  reset(key: string): void {
    const schema = this.schemas.find(s => s.key === key);
    if (schema) {
      this.settingsSignal.update((current) => ({
        ...current,
        [key]: schema.defaults,
      }));
      this.saveSettings();
    }
  }

  /**
   * Reset all settings to defaults
   */
  resetAll(): void {
    const defaults: Record<string, unknown> = {};
    this.schemas.forEach(schema => {
      defaults[schema.key] = schema.defaults;
    });
    this.settingsSignal.set(defaults);
    this.saveSettings();
  }
}
