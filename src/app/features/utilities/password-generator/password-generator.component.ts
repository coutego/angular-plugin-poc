import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from '../../../core/settings.service';

@Component({
  selector: 'app-password-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Password Generator</h1>
        <p class="text-slate-600">Generate strong, secure passwords with customizable options.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Generator -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Generated Password
              </label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    [value]="password()"
                    readonly
                    class="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-300 rounded-xl font-mono text-lg"
                  />
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  >
                    @if (showPassword()) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  </button>
                </div>
                <button
                  type="button"
                  (click)="copyToClipboard()"
                  class="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                  aria-label="Copy password"
                >
                  @if (copied()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                </button>
                <button
                  type="button"
                  (click)="generatePassword()"
                  class="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  aria-label="Generate new password"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-600">Password Strength</span>
                <span [class]="strengthTextClass()">{{ strengthLabel() }}</span>
              </div>
              <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  [class]="strengthBarClass()"
                  [style.width.%]="strengthPercent()"
                  class="h-full transition-all duration-300"
                ></div>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-6 space-y-4">
              <h3 class="font-medium text-slate-900">Quick Options</h3>

              <div>
                <label for="length" class="flex justify-between text-sm text-slate-700 mb-2">
                  <span>Password Length</span>
                  <span class="font-mono font-medium">{{ length() }}</span>
                </label>
                <input
                  id="length"
                  type="range"
                  [ngModel]="length()"
                  (ngModelChange)="length.set($event); generatePassword()"
                  min="8"
                  max="64"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div class="flex justify-between text-xs text-slate-400 mt-1">
                  <span>8</span>
                  <span>64</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [ngModel]="includeUppercase()"
                    (ngModelChange)="includeUppercase.set($event); generatePassword()"
                    class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-slate-700">Uppercase (A-Z)</span>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [ngModel]="includeLowercase()"
                    (ngModelChange)="includeLowercase.set($event); generatePassword()"
                    class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-slate-700">Lowercase (a-z)</span>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [ngModel]="includeNumbers()"
                    (ngModelChange)="includeNumbers.set($event); generatePassword()"
                    class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-slate-700">Numbers (0-9)</span>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [ngModel]="includeSymbols()"
                    (ngModelChange)="includeSymbols.set($event); generatePassword()"
                    class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-slate-700">Symbols (!&#64;#$%)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Link Panel -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-3">Default Settings</h3>
          <p class="text-sm text-slate-500 mb-4">
            Configure default length and character types for new passwords.
          </p>
          <button
            (click)="goToSettings()"
            class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Open Password Generator Settings
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PasswordGeneratorComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  protected readonly password = signal('');
  protected readonly showPassword = signal(true);
  protected readonly copied = signal(false);

  protected readonly length = signal(16);
  protected readonly includeUppercase = signal(true);
  protected readonly includeLowercase = signal(true);
  protected readonly includeNumbers = signal(true);
  protected readonly includeSymbols = signal(true);

  private settingsLoaded = false;

  protected readonly strength = computed(() => {
    const pwd = this.password();
    if (!pwd) return 0;

    let score = 0;

    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 24) score += 1;

    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    return Math.min(score, 8);
  });

  protected readonly strengthPercent = computed(() => {
    return (this.strength() / 8) * 100;
  });

  protected readonly strengthLabel = computed(() => {
    const s = this.strength();
    if (s <= 2) return 'Weak';
    if (s <= 4) return 'Fair';
    if (s <= 6) return 'Strong';
    return 'Very Strong';
  });

  protected readonly strengthTextClass = computed(() => {
    const s = this.strength();
    if (s <= 2) return 'text-red-600 font-medium';
    if (s <= 4) return 'text-yellow-600 font-medium';
    if (s <= 6) return 'text-blue-600 font-medium';
    return 'text-green-600 font-medium';
  });

  protected readonly strengthBarClass = computed(() => {
    const s = this.strength();
    if (s <= 2) return 'bg-red-500';
    if (s <= 4) return 'bg-yellow-500';
    if (s <= 6) return 'bg-blue-500';
    return 'bg-green-500';
  });

  constructor() {
    // Load settings from service
    effect(() => {
      const settings = this.settingsService.passwordGeneratorSettings();
      if (!this.settingsLoaded) {
        this.length.set(settings.defaultLength);
        this.includeUppercase.set(settings.includeUppercase);
        this.includeLowercase.set(settings.includeLowercase);
        this.includeNumbers.set(settings.includeNumbers);
        this.includeSymbols.set(settings.includeSymbols);
        this.settingsLoaded = true;
        this.generatePassword();
      }
    }, { allowSignalWrites: true });
  }

  protected goToSettings(): void {
    this.router.navigate(['/settings'], { fragment: 'password-generator' });
  }

  protected generatePassword(): void {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    const requiredChars: string[] = [];

    if (this.includeUppercase()) {
      chars += uppercase;
      requiredChars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
    }
    if (this.includeLowercase()) {
      chars += lowercase;
      requiredChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
    }
    if (this.includeNumbers()) {
      chars += numbers;
      requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }
    if (this.includeSymbols()) {
      chars += symbols;
      requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    if (!chars) {
      chars = lowercase;
      requiredChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
    }

    const len = this.length();
    let result = '';

    const remainingLength = len - requiredChars.length;
    for (let i = 0; i < remainingLength; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    result += requiredChars.join('');
    result = result
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    this.password.set(result);
    this.copied.set(false);
  }

  protected async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.password());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = this.password();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
