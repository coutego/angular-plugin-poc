import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/settings.service';
import {
  QrGeneratorSettings,
  QR_GENERATOR_SETTINGS_KEY,
  QR_GENERATOR_DEFAULTS,
} from './qr-generator.plugin';

@Component({
  selector: 'app-qr-generator-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <label for="default-size" class="block text-sm font-medium text-slate-700 mb-2">
          Default QR Code Size
        </label>
        <select
          id="default-size"
          [ngModel]="defaultSize()"
          (ngModelChange)="updateDefaultSize($event)"
          class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="150">Small (150x150)</option>
          <option value="200">Medium (200x200)</option>
          <option value="300">Large (300x300)</option>
          <option value="400">Extra Large (400x400)</option>
        </select>
      </div>

      <div>
        <label for="error-correction" class="block text-sm font-medium text-slate-700 mb-2">
          Error Correction Level
        </label>
        <select
          id="error-correction"
          [ngModel]="errorCorrectionLevel()"
          (ngModelChange)="updateErrorCorrection($event)"
          class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="L">Low (7% recovery)</option>
          <option value="M">Medium (15% recovery)</option>
          <option value="Q">Quartile (25% recovery)</option>
          <option value="H">High (30% recovery)</option>
        </select>
        <p class="text-xs text-slate-500 mt-1">Higher levels allow more damage recovery but create denser codes.</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="fg-color" class="block text-sm font-medium text-slate-700 mb-2">
            Foreground Color
          </label>
          <div class="flex items-center gap-3">
            <input
              id="fg-color"
              type="color"
              [ngModel]="foregroundColor()"
              (ngModelChange)="updateForegroundColor($event)"
              class="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              [ngModel]="foregroundColor()"
              (ngModelChange)="updateForegroundColor($event)"
              class="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label for="bg-color" class="block text-sm font-medium text-slate-700 mb-2">
            Background Color
          </label>
          <div class="flex items-center gap-3">
            <input
              id="bg-color"
              type="color"
              [ngModel]="backgroundColor()"
              (ngModelChange)="updateBackgroundColor($event)"
              class="w-12 h-12 rounded-lg border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              [ngModel]="backgroundColor()"
              (ngModelChange)="updateBackgroundColor($event)"
              class="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-200">
        <h4 class="text-sm font-medium text-slate-700 mb-3">Preview</h4>
        <div class="flex items-center justify-center p-4 bg-slate-50 rounded-xl">
          <div 
            class="p-4 rounded-lg"
            [style.background-color]="backgroundColor()"
          >
            <img
              [src]="previewUrl()"
              alt="QR Code Preview"
              width="150"
              height="150"
              class="block"
            />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class QrGeneratorSettingsComponent {
  private readonly settingsService = inject(SettingsService);

  protected readonly defaultSize = signal(QR_GENERATOR_DEFAULTS.defaultSize);
  protected readonly foregroundColor = signal(QR_GENERATOR_DEFAULTS.foregroundColor);
  protected readonly backgroundColor = signal(QR_GENERATOR_DEFAULTS.backgroundColor);
  protected readonly errorCorrectionLevel = signal<'L' | 'M' | 'Q' | 'H'>(QR_GENERATOR_DEFAULTS.errorCorrectionLevel);

  protected readonly previewUrl = () => {
    const size = this.defaultSize();
    const fg = this.foregroundColor().replace('#', '');
    const bg = this.backgroundColor().replace('#', '');
    const ecc = this.errorCorrectionLevel();
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=Preview&color=${fg}&bgcolor=${bg}&ecc=${ecc}`;
  };

  constructor() {
    // Load initial settings
    effect(() => {
      const settings = this.settingsService.get<QrGeneratorSettings>(QR_GENERATOR_SETTINGS_KEY);
      this.defaultSize.set(settings.defaultSize);
      this.foregroundColor.set(settings.foregroundColor);
      this.backgroundColor.set(settings.backgroundColor);
      this.errorCorrectionLevel.set(settings.errorCorrectionLevel);
    }, { allowSignalWrites: true });
  }

  protected updateDefaultSize(value: string): void {
    this.defaultSize.set(value);
    this.settingsService.update<QrGeneratorSettings>(QR_GENERATOR_SETTINGS_KEY, { defaultSize: value });
  }

  protected updateForegroundColor(value: string): void {
    this.foregroundColor.set(value);
    this.settingsService.update<QrGeneratorSettings>(QR_GENERATOR_SETTINGS_KEY, { foregroundColor: value });
  }

  protected updateBackgroundColor(value: string): void {
    this.backgroundColor.set(value);
    this.settingsService.update<QrGeneratorSettings>(QR_GENERATOR_SETTINGS_KEY, { backgroundColor: value });
  }

  protected updateErrorCorrection(value: 'L' | 'M' | 'Q' | 'H'): void {
    this.errorCorrectionLevel.set(value);
    this.settingsService.update<QrGeneratorSettings>(QR_GENERATOR_SETTINGS_KEY, { errorCorrectionLevel: value });
  }
}
