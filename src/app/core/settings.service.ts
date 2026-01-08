import { Injectable, signal, computed } from '@angular/core';

export interface QrGeneratorSettings {
  defaultSize: string;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface PasswordGeneratorSettings {
  defaultLength: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface Game2048Settings {
  colorScheme: 'classic' | 'ocean' | 'forest' | 'sunset' | 'monochrome';
  showAnimations: boolean;
}

export interface TetrisSettings {
  startingLevel: number;
  showGhostPiece: boolean;
  colorScheme: 'classic' | 'pastel' | 'neon' | 'monochrome';
}

export interface AppSettings {
  qrGenerator: QrGeneratorSettings;
  passwordGenerator: PasswordGeneratorSettings;
  game2048: Game2048Settings;
  tetris: TetrisSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  qrGenerator: {
    defaultSize: '200',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    errorCorrectionLevel: 'M',
  },
  passwordGenerator: {
    defaultLength: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  },
  game2048: {
    colorScheme: 'classic',
    showAnimations: true,
  },
  tetris: {
    startingLevel: 1,
    showGhostPiece: true,
    colorScheme: 'classic',
  },
};

const STORAGE_KEY = 'app-settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly settingsSignal = signal<AppSettings>(this.loadSettings());

  readonly settings = this.settingsSignal.asReadonly();

  readonly qrGeneratorSettings = computed(() => this.settingsSignal().qrGenerator);
  readonly passwordGeneratorSettings = computed(() => this.settingsSignal().passwordGenerator);
  readonly game2048Settings = computed(() => this.settingsSignal().game2048);
  readonly tetrisSettings = computed(() => this.settingsSignal().tetris);

  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          qrGenerator: { ...DEFAULT_SETTINGS.qrGenerator, ...parsed.qrGenerator },
          passwordGenerator: { ...DEFAULT_SETTINGS.passwordGenerator, ...parsed.passwordGenerator },
          game2048: { ...DEFAULT_SETTINGS.game2048, ...parsed.game2048 },
          tetris: { ...DEFAULT_SETTINGS.tetris, ...parsed.tetris },
        };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settingsSignal()));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  updateQrGeneratorSettings(settings: Partial<QrGeneratorSettings>): void {
    this.settingsSignal.update((current) => ({
      ...current,
      qrGenerator: { ...current.qrGenerator, ...settings },
    }));
    this.saveSettings();
  }

  updatePasswordGeneratorSettings(settings: Partial<PasswordGeneratorSettings>): void {
    this.settingsSignal.update((current) => ({
      ...current,
      passwordGenerator: { ...current.passwordGenerator, ...settings },
    }));
    this.saveSettings();
  }

  updateGame2048Settings(settings: Partial<Game2048Settings>): void {
    this.settingsSignal.update((current) => ({
      ...current,
      game2048: { ...current.game2048, ...settings },
    }));
    this.saveSettings();
  }

  updateTetrisSettings(settings: Partial<TetrisSettings>): void {
    this.settingsSignal.update((current) => ({
      ...current,
      tetris: { ...current.tetris, ...settings },
    }));
    this.saveSettings();
  }

  resetToDefaults(): void {
    this.settingsSignal.set(DEFAULT_SETTINGS);
    this.saveSettings();
  }
}
