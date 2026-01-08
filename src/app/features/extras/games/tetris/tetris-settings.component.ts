import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../core/settings.service';
import {
  TetrisSettings,
  TETRIS_SETTINGS_KEY,
  TETRIS_DEFAULTS,
} from './tetris.plugin';

@Component({
  selector: 'app-tetris-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <label for="starting-level" class="flex justify-between text-sm text-slate-700 mb-2">
          <span class="font-medium">Starting Level</span>
          <span class="font-mono font-medium">{{ startingLevel() }}</span>
        </label>
        <input
          id="starting-level"
          type="range"
          min="1"
          max="10"
          step="1"
          [ngModel]="startingLevel()"
          (ngModelChange)="updateStartingLevel($event)"
          class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div class="flex justify-between text-xs text-slate-400 mt-1">
          <span>1 (Slow)</span>
          <span>10 (Fast)</span>
        </div>
        <p class="text-xs text-slate-500 mt-2">Higher levels start faster but score more points.</p>
      </div>

      <div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            [ngModel]="showGhostPiece()"
            (ngModelChange)="updateShowGhostPiece($event)"
            class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span class="text-sm font-medium text-slate-700">Show Ghost Piece</span>
            <p class="text-xs text-slate-500">Display a preview of where the piece will land.</p>
          </div>
        </label>
      </div>

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
          <option value="classic">Classic</option>
          <option value="pastel">Pastel</option>
          <option value="neon">Neon</option>
          <option value="monochrome">Monochrome</option>
        </select>
        <p class="text-xs text-slate-500 mt-1">Choose the color palette for the tetrominos.</p>
      </div>

      <div class="pt-4 border-t border-slate-200">
        <h4 class="text-sm font-medium text-slate-700 mb-3">Piece Preview</h4>
        <div class="flex flex-wrap gap-4">
          @for (piece of previewPieces; track piece.name) {
            <div class="text-center">
              <div class="bg-slate-800 p-2 rounded-lg inline-block">
                <div 
                  class="grid gap-px"
                  [style.grid-template-columns]="'repeat(' + piece.shape[0].length + ', 1fr)'"
                >
                  @for (row of piece.shape; track $index) {
                    @for (cell of row; track $index) {
                      <div
                        class="w-4 h-4 rounded-sm"
                        [class]="cell ? getPieceColor(piece.name) : 'bg-slate-900'"
                      ></div>
                    }
                  }
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-1">{{ piece.name }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class TetrisSettingsComponent {
  private readonly settingsService = inject(SettingsService);

  protected readonly startingLevel = signal(TETRIS_DEFAULTS.startingLevel);
  protected readonly showGhostPiece = signal(TETRIS_DEFAULTS.showGhostPiece);
  protected readonly colorScheme = signal<'classic' | 'pastel' | 'neon' | 'monochrome'>(TETRIS_DEFAULTS.colorScheme);

  protected readonly previewPieces = [
    { name: 'I', shape: [[1, 1, 1, 1]] },
    { name: 'O', shape: [[1, 1], [1, 1]] },
    { name: 'T', shape: [[0, 1, 0], [1, 1, 1]] },
    { name: 'J', shape: [[1, 0, 0], [1, 1, 1]] },
    { name: 'L', shape: [[0, 0, 1], [1, 1, 1]] },
    { name: 'S', shape: [[0, 1, 1], [1, 1, 0]] },
    { name: 'Z', shape: [[1, 1, 0], [0, 1, 1]] },
  ];

  constructor() {
    effect(() => {
      const settings = this.settingsService.get<TetrisSettings>(TETRIS_SETTINGS_KEY);
      this.startingLevel.set(settings.startingLevel);
      this.showGhostPiece.set(settings.showGhostPiece);
      this.colorScheme.set(settings.colorScheme);
    }, { allowSignalWrites: true });
  }

  protected updateStartingLevel(value: number): void {
    this.startingLevel.set(value);
    this.settingsService.update<TetrisSettings>(TETRIS_SETTINGS_KEY, { startingLevel: value });
  }

  protected updateShowGhostPiece(value: boolean): void {
    this.showGhostPiece.set(value);
    this.settingsService.update<TetrisSettings>(TETRIS_SETTINGS_KEY, { showGhostPiece: value });
  }

  protected updateColorScheme(value: 'classic' | 'pastel' | 'neon' | 'monochrome'): void {
    this.colorScheme.set(value);
    this.settingsService.update<TetrisSettings>(TETRIS_SETTINGS_KEY, { colorScheme: value });
  }

  protected getPieceColor(pieceName: string): string {
    const scheme = this.colorScheme();
    const colorMaps: Record<string, Record<string, string>> = {
      classic: {
        I: 'bg-cyan-500',
        O: 'bg-yellow-500',
        T: 'bg-purple-500',
        J: 'bg-blue-500',
        L: 'bg-orange-500',
        S: 'bg-green-500',
        Z: 'bg-red-500',
      },
      pastel: {
        I: 'bg-cyan-300',
        O: 'bg-yellow-300',
        T: 'bg-purple-300',
        J: 'bg-blue-300',
        L: 'bg-orange-300',
        S: 'bg-green-300',
        Z: 'bg-red-300',
      },
      neon: {
        I: 'bg-cyan-400 shadow-lg shadow-cyan-400/50',
        O: 'bg-yellow-400 shadow-lg shadow-yellow-400/50',
        T: 'bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50',
        J: 'bg-blue-400 shadow-lg shadow-blue-400/50',
        L: 'bg-orange-400 shadow-lg shadow-orange-400/50',
        S: 'bg-lime-400 shadow-lg shadow-lime-400/50',
        Z: 'bg-rose-500 shadow-lg shadow-rose-500/50',
      },
      monochrome: {
        I: 'bg-slate-300',
        O: 'bg-slate-400',
        T: 'bg-slate-500',
        J: 'bg-slate-600',
        L: 'bg-slate-500',
        S: 'bg-slate-400',
        Z: 'bg-slate-600',
      },
    };

    return colorMaps[scheme][pieceName] || 'bg-slate-500';
  }
}
