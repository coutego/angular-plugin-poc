import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/settings.service';

@Component({
  selector: 'app-game-2048-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <label for="color-scheme" class="block text-sm font-medium text-slate-700 mb-2">
          Color Scheme
        </label>
        <select
          id="color-scheme"
          [ngModel]="colorScheme()"
          (ngModelChange)="updateColorScheme($event)"
          class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="classic">Classic (Orange/Yellow)</option>
          <option value="ocean">Ocean (Blue/Cyan)</option>
          <option value="forest">Forest (Green/Emerald)</option>
          <option value="sunset">Sunset (Pink/Purple)</option>
          <option value="monochrome">Monochrome (Gray)</option>
        </select>
        <p class="text-xs text-slate-500 mt-1">Choose the color palette for the game tiles.</p>
      </div>

      <div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            [ngModel]="showAnimations()"
            (ngModelChange)="updateShowAnimations($event)"
            class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span class="text-sm font-medium text-slate-700">Show Animations</span>
            <p class="text-xs text-slate-500">Enable smooth tile movement animations.</p>
          </div>
        </label>
      </div>

      <div class="pt-4 border-t border-slate-200">
        <h4 class="text-sm font-medium text-slate-700 mb-3">Preview</h4>
        <div class="bg-slate-300 rounded-xl p-3 inline-block">
          <div class="grid grid-cols-4 gap-2">
            @for (value of previewValues; track $index) {
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm"
                [class]="getPreviewCellClass(value)"
              >
                {{ value }}
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Game2048SettingsComponent {
  private readonly settingsService = inject(SettingsService);

  protected readonly colorScheme = signal<'classic' | 'ocean' | 'forest' | 'sunset' | 'monochrome'>('classic');
  protected readonly showAnimations = signal(true);

  protected readonly previewValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

  constructor() {
    effect(() => {
      const settings = this.settingsService.game2048Settings();
      this.colorScheme.set(settings.colorScheme);
      this.showAnimations.set(settings.showAnimations);
    }, { allowSignalWrites: true });
  }

  protected updateColorScheme(value: 'classic' | 'ocean' | 'forest' | 'sunset' | 'monochrome'): void {
    this.colorScheme.set(value);
    this.settingsService.updateGame2048Settings({ colorScheme: value });
  }

  protected updateShowAnimations(value: boolean): void {
    this.showAnimations.set(value);
    this.settingsService.updateGame2048Settings({ showAnimations: value });
  }

  protected getPreviewCellClass(value: number): string {
    const scheme = this.colorScheme();
    const colorMaps: Record<string, Record<number, string>> = {
      classic: {
        2: 'bg-slate-100 text-slate-700',
        4: 'bg-slate-200 text-slate-700',
        8: 'bg-orange-300 text-white',
        16: 'bg-orange-400 text-white',
        32: 'bg-orange-500 text-white',
        64: 'bg-orange-600 text-white',
        128: 'bg-yellow-400 text-white',
        256: 'bg-yellow-500 text-white',
        512: 'bg-yellow-600 text-white',
        1024: 'bg-yellow-700 text-white',
        2048: 'bg-yellow-500 text-white',
        4096: 'bg-slate-900 text-white',
      },
      ocean: {
        2: 'bg-sky-100 text-sky-700',
        4: 'bg-sky-200 text-sky-700',
        8: 'bg-sky-300 text-white',
        16: 'bg-sky-400 text-white',
        32: 'bg-sky-500 text-white',
        64: 'bg-sky-600 text-white',
        128: 'bg-cyan-400 text-white',
        256: 'bg-cyan-500 text-white',
        512: 'bg-cyan-600 text-white',
        1024: 'bg-cyan-700 text-white',
        2048: 'bg-teal-500 text-white',
        4096: 'bg-slate-900 text-white',
      },
      forest: {
        2: 'bg-green-100 text-green-700',
        4: 'bg-green-200 text-green-700',
        8: 'bg-green-300 text-white',
        16: 'bg-green-400 text-white',
        32: 'bg-green-500 text-white',
        64: 'bg-green-600 text-white',
        128: 'bg-emerald-400 text-white',
        256: 'bg-emerald-500 text-white',
        512: 'bg-emerald-600 text-white',
        1024: 'bg-emerald-700 text-white',
        2048: 'bg-teal-600 text-white',
        4096: 'bg-slate-900 text-white',
      },
      sunset: {
        2: 'bg-pink-100 text-pink-700',
        4: 'bg-pink-200 text-pink-700',
        8: 'bg-pink-300 text-white',
        16: 'bg-pink-400 text-white',
        32: 'bg-pink-500 text-white',
        64: 'bg-pink-600 text-white',
        128: 'bg-purple-400 text-white',
        256: 'bg-purple-500 text-white',
        512: 'bg-purple-600 text-white',
        1024: 'bg-purple-700 text-white',
        2048: 'bg-violet-600 text-white',
        4096: 'bg-slate-900 text-white',
      },
      monochrome: {
        2: 'bg-slate-100 text-slate-700',
        4: 'bg-slate-200 text-slate-700',
        8: 'bg-slate-300 text-slate-700',
        16: 'bg-slate-400 text-white',
        32: 'bg-slate-500 text-white',
        64: 'bg-slate-600 text-white',
        128: 'bg-slate-700 text-white',
        256: 'bg-slate-800 text-white',
        512: 'bg-slate-900 text-white',
        1024: 'bg-zinc-800 text-white',
        2048: 'bg-zinc-900 text-white',
        4096: 'bg-black text-white',
      },
    };

    return colorMaps[scheme][value] || 'bg-slate-900 text-white';
  }
}
