import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/settings.service';

@Component({
  selector: 'app-password-generator-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <label for="default-length" class="flex justify-between text-sm text-slate-700 mb-2">
          <span class="font-medium">Default Password Length</span>
          <span class="font-mono font-medium">{{ defaultLength() }}</span>
        </label>
        <input
          id="default-length"
          type="range"
          [ngModel]="defaultLength()"
          (ngModelChange)="updateDefaultLength($event)"
          min="8"
          max="64"
          class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div class="flex justify-between text-xs text-slate-400 mt-1">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      <div>
        <h4 class="text-sm font-medium text-slate-700 mb-3">Default Character Types</h4>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="includeUppercase()"
              (ngModelChange)="updateIncludeUppercase($event)"
              class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span class="text-sm text-slate-700">Uppercase Letters</span>
              <span class="text-xs text-slate-400 ml-2">(A-Z)</span>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="includeLowercase()"
              (ngModelChange)="updateIncludeLowercase($event)"
              class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span class="text-sm text-slate-700">Lowercase Letters</span>
              <span class="text-xs text-slate-400 ml-2">(a-z)</span>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="includeNumbers()"
              (ngModelChange)="updateIncludeNumbers($event)"
              class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span class="text-sm text-slate-700">Numbers</span>
              <span class="text-xs text-slate-400 ml-2">(0-9)</span>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [ngModel]="includeSymbols()"
              (ngModelChange)="updateIncludeSymbols($event)"
              class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span class="text-sm text-slate-700">Symbols</span>
              <span class="text-xs text-slate-400 ml-2">(!&#64;#$%^&amp;*)</span>
            </div>
          </label>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-200">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Estimated entropy:</span>
          <span class="font-mono font-medium text-slate-900">{{ estimatedEntropy() }} bits</span>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          Higher entropy means stronger passwords. 80+ bits is recommended for sensitive accounts.
        </p>
      </div>
    </div>
  `,
})
export class PasswordGeneratorSettingsComponent {
  private readonly settingsService = inject(SettingsService);

  protected readonly defaultLength = signal(16);
  protected readonly includeUppercase = signal(true);
  protected readonly includeLowercase = signal(true);
  protected readonly includeNumbers = signal(true);
  protected readonly includeSymbols = signal(true);

  protected readonly estimatedEntropy = () => {
    let charsetSize = 0;
    if (this.includeUppercase()) charsetSize += 26;
    if (this.includeLowercase()) charsetSize += 26;
    if (this.includeNumbers()) charsetSize += 10;
    if (this.includeSymbols()) charsetSize += 32;
    
    if (charsetSize === 0) charsetSize = 26; // fallback to lowercase
    
    const entropy = Math.floor(this.defaultLength() * Math.log2(charsetSize));
    return entropy;
  };

  constructor() {
    // Load initial settings
    effect(() => {
      const settings = this.settingsService.passwordGeneratorSettings();
      this.defaultLength.set(settings.defaultLength);
      this.includeUppercase.set(settings.includeUppercase);
      this.includeLowercase.set(settings.includeLowercase);
      this.includeNumbers.set(settings.includeNumbers);
      this.includeSymbols.set(settings.includeSymbols);
    }, { allowSignalWrites: true });
  }

  protected updateDefaultLength(value: number): void {
    this.defaultLength.set(value);
    this.settingsService.updatePasswordGeneratorSettings({ defaultLength: value });
  }

  protected updateIncludeUppercase(value: boolean): void {
    this.includeUppercase.set(value);
    this.settingsService.updatePasswordGeneratorSettings({ includeUppercase: value });
  }

  protected updateIncludeLowercase(value: boolean): void {
    this.includeLowercase.set(value);
    this.settingsService.updatePasswordGeneratorSettings({ includeLowercase: value });
  }

  protected updateIncludeNumbers(value: boolean): void {
    this.includeNumbers.set(value);
    this.settingsService.updatePasswordGeneratorSettings({ includeNumbers: value });
  }

  protected updateIncludeSymbols(value: boolean): void {
    this.includeSymbols.set(value);
    this.settingsService.updatePasswordGeneratorSettings({ includeSymbols: value });
  }
}
