import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService } from '../../../core/settings.service';

@Component({
  selector: 'app-qr-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">QR Code Generator</h1>
        <p class="text-slate-600">Generate QR codes for URLs, text, or any data.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Generator -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div class="space-y-6">
            <div>
              <label for="qr-input" class="block text-sm font-medium text-slate-700 mb-2">
                Enter text or URL
              </label>
              <textarea
                id="qr-input"
                [ngModel]="inputText()"
                (ngModelChange)="inputText.set($event)"
                rows="3"
                class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="https://example.com or any text..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="qr-size" class="block text-sm font-medium text-slate-700 mb-2">
                  QR Code Size
                </label>
                <select
                  id="qr-size"
                  [ngModel]="qrSize()"
                  (ngModelChange)="qrSize.set($event)"
                  class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="150">Small (150x150)</option>
                  <option value="200">Medium (200x200)</option>
                  <option value="300">Large (300x300)</option>
                  <option value="400">Extra Large (400x400)</option>
                </select>
              </div>

              <div>
                <label for="error-level" class="block text-sm font-medium text-slate-700 mb-2">
                  Error Correction
                </label>
                <select
                  id="error-level"
                  [ngModel]="errorLevel()"
                  (ngModelChange)="errorLevel.set($event)"
                  class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="L">Low</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High</option>
                </select>
              </div>
            </div>

            @if (inputText()) {
              <div class="flex flex-col items-center gap-4 pt-4 border-t border-slate-200">
                <div 
                  class="p-4 rounded-xl shadow-sm border border-slate-100"
                  [style.background-color]="backgroundColor()"
                >
                  <img
                    [src]="qrCodeUrl()"
                    [alt]="'QR Code for: ' + inputText()"
                    [width]="qrSize()"
                    [height]="qrSize()"
                    class="block"
                  />
                </div>
                <a
                  [href]="qrCodeUrl()"
                  download="qrcode.png"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </a>
              </div>
            } @else {
              <div class="flex items-center justify-center py-12 text-slate-400 border-t border-slate-200">
                <p>Enter text above to generate a QR code</p>
              </div>
            }
          </div>
        </div>

        <!-- Settings Link Panel -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-3">Default Settings</h3>
          <p class="text-sm text-slate-500 mb-4">
            Configure default size, colors, and error correction level for new QR codes.
          </p>
          <button
            (click)="goToSettings()"
            class="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Open QR Generator Settings
          </button>
        </div>
      </div>
    </div>
  `,
})
export class QrGeneratorComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  protected readonly inputText = signal('');
  protected readonly qrSize = signal('200');
  protected readonly errorLevel = signal<'L' | 'M' | 'Q' | 'H'>('M');
  protected readonly foregroundColor = signal('#000000');
  protected readonly backgroundColor = signal('#ffffff');

  protected readonly qrCodeUrl = computed(() => {
    const text = this.inputText();
    const size = this.qrSize();
    const fg = this.foregroundColor().replace('#', '');
    const bg = this.backgroundColor().replace('#', '');
    const ecc = this.errorLevel();
    if (!text) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fg}&bgcolor=${bg}&ecc=${ecc}`;
  });

  constructor() {
    // Load settings from service
    effect(() => {
      const settings = this.settingsService.qrGeneratorSettings();
      this.qrSize.set(settings.defaultSize);
      this.foregroundColor.set(settings.foregroundColor);
      this.backgroundColor.set(settings.backgroundColor);
      this.errorLevel.set(settings.errorCorrectionLevel);
    }, { allowSignalWrites: true });
  }

  protected goToSettings(): void {
    this.router.navigate(['/settings'], { fragment: 'qr-generator' });
  }
}
