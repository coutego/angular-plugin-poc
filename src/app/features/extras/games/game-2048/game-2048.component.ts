import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '../../../../core/settings.service';

type Grid = (number | null)[][];

@Component({
  selector: 'app-game-2048',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    '(window:keydown)': 'handleKeydown($event)',
  },
  template: `
    <div class="max-w-lg mx-auto">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">2048</h1>
            <p class="text-slate-600 text-sm">Join the tiles, get to 2048!</p>
          </div>
          <div class="flex gap-3">
            <div class="bg-slate-100 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p class="text-xs text-slate-500 font-medium">SCORE</p>
              <p class="text-xl font-bold text-slate-900">{{ score() }}</p>
            </div>
            <div class="bg-slate-100 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p class="text-xs text-slate-500 font-medium">BEST</p>
              <p class="text-xl font-bold text-slate-900">{{ bestScore() }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mb-4">
          <button
            (click)="resetGame()"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            New Game
          </button>
          <button
            (click)="goToSettings()"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Settings
          </button>
        </div>

        <p class="text-sm text-slate-500 mb-4">
          Use <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Arrow Keys</kbd> or 
          <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono">WASD</kbd> to move tiles
        </p>
      </div>

      <!-- Game Board -->
      <div 
        class="bg-slate-300 rounded-xl p-3 relative select-none"
        (touchstart)="handleTouchStart($event)"
        (touchend)="handleTouchEnd($event)"
      >
        <div class="grid grid-cols-4 gap-3">
          @for (row of grid(); track $index; let rowIndex = $index) {
            @for (cell of row; track $index; let colIndex = $index) {
              <div
                class="aspect-square rounded-lg flex items-center justify-center font-bold"
                [class]="getCellClass(cell)"
              >
                @if (cell) {
                  <span [class]="getCellTextClass(cell)">{{ cell }}</span>
                }
              </div>
            }
          }
        </div>

        <!-- Game Over Overlay -->
        @if (gameOver()) {
          <div class="absolute inset-0 bg-slate-900/70 rounded-xl flex flex-col items-center justify-center">
            <p class="text-2xl font-bold text-white mb-2">
              @if (won()) {
                You Win! 🎉
              } @else {
                Game Over!
              }
            </p>
            <p class="text-slate-300 mb-4">Score: {{ score() }}</p>
            <button
              (click)="resetGame()"
              class="px-6 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-medium transition-colors"
            >
              Play Again
            </button>
          </div>
        }
      </div>

      <!-- Instructions -->
      <div class="mt-6 p-4 bg-slate-50 rounded-xl">
        <h3 class="font-semibold text-slate-900 mb-2">How to Play</h3>
        <ul class="text-sm text-slate-600 space-y-1">
          <li>• Swipe or use arrow keys to move all tiles</li>
          <li>• Tiles with the same number merge into one</li>
          <li>• Add them up to reach 2048!</li>
        </ul>
      </div>
    </div>
  `,
})
export class Game2048Component {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  protected readonly grid = signal<Grid>(this.createEmptyGrid());
  protected readonly score = signal(0);
  protected readonly bestScore = signal(this.loadBestScore());
  protected readonly gameOver = signal(false);
  protected readonly won = signal(false);
  protected readonly colorScheme = signal<'classic' | 'ocean' | 'forest' | 'sunset' | 'monochrome'>('classic');
  protected readonly showAnimations = signal(true);

  private touchStartX = 0;
  private touchStartY = 0;

  constructor() {
    // Load settings
    effect(() => {
      const settings = this.settingsService.game2048Settings();
      this.colorScheme.set(settings.colorScheme);
      this.showAnimations.set(settings.showAnimations);
    }, { allowSignalWrites: true });

    this.resetGame();
  }

  protected goToSettings(): void {
    this.router.navigate(['/settings'], { fragment: 'game-2048' });
  }

  private createEmptyGrid(): Grid {
    return Array(4).fill(null).map(() => Array(4).fill(null));
  }

  private loadBestScore(): number {
    try {
      return parseInt(localStorage.getItem('game-2048-best') || '0', 10);
    } catch {
      return 0;
    }
  }

  private saveBestScore(score: number): void {
    try {
      localStorage.setItem('game-2048-best', String(score));
    } catch {
      // Ignore storage errors
    }
  }

  protected resetGame(): void {
    const newGrid = this.createEmptyGrid();
    this.addRandomTile(newGrid);
    this.addRandomTile(newGrid);
    this.grid.set(newGrid);
    this.score.set(0);
    this.gameOver.set(false);
    this.won.set(false);
  }

  private addRandomTile(grid: Grid): void {
    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.gameOver()) return;

    let direction: 'up' | 'down' | 'left' | 'right' | null = null;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'down';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'right';
        break;
    }

    if (direction) {
      event.preventDefault();
      this.move(direction);
    }
  }

  protected handleTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  protected handleTouchEnd(event: TouchEvent): void {
    if (this.gameOver()) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        this.move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        this.move(deltaY > 0 ? 'down' : 'up');
      }
    }
  }

  private move(direction: 'up' | 'down' | 'left' | 'right'): void {
    const currentGrid = this.grid();
    const newGrid = currentGrid.map(row => [...row]);
    let moved = false;
    let scoreGain = 0;

    const slideAndMerge = (line: (number | null)[]): (number | null)[] => {
      // Remove nulls
      let filtered = line.filter(cell => cell !== null) as number[];
      
      // Merge adjacent equal tiles
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          scoreGain += filtered[i];
          if (filtered[i] === 2048) {
            this.won.set(true);
          }
          filtered.splice(i + 1, 1);
        }
      }

      // Pad with nulls
      while (filtered.length < 4) {
        filtered.push(null as unknown as number);
      }

      return filtered;
    };

    if (direction === 'left') {
      for (let row = 0; row < 4; row++) {
        const newRow = slideAndMerge(newGrid[row]);
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[row])) {
          moved = true;
        }
        newGrid[row] = newRow;
      }
    } else if (direction === 'right') {
      for (let row = 0; row < 4; row++) {
        const reversed = [...newGrid[row]].reverse();
        const newRow = slideAndMerge(reversed).reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(newGrid[row])) {
          moved = true;
        }
        newGrid[row] = newRow;
      }
    } else if (direction === 'up') {
      for (let col = 0; col < 4; col++) {
        const column = [newGrid[0][col], newGrid[1][col], newGrid[2][col], newGrid[3][col]];
        const newColumn = slideAndMerge(column);
        for (let row = 0; row < 4; row++) {
          if (newGrid[row][col] !== newColumn[row]) {
            moved = true;
          }
          newGrid[row][col] = newColumn[row];
        }
      }
    } else if (direction === 'down') {
      for (let col = 0; col < 4; col++) {
        const column = [newGrid[0][col], newGrid[1][col], newGrid[2][col], newGrid[3][col]].reverse();
        const newColumn = slideAndMerge(column).reverse();
        for (let row = 0; row < 4; row++) {
          if (newGrid[row][col] !== newColumn[row]) {
            moved = true;
          }
          newGrid[row][col] = newColumn[row];
        }
      }
    }

    if (moved) {
      this.addRandomTile(newGrid);
      this.grid.set(newGrid);
      const newScore = this.score() + scoreGain;
      this.score.set(newScore);
      
      if (newScore > this.bestScore()) {
        this.bestScore.set(newScore);
        this.saveBestScore(newScore);
      }

      if (this.isGameOver(newGrid)) {
        this.gameOver.set(true);
      }
    }
  }

  private isGameOver(grid: Grid): boolean {
    // Check for empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] === null) {
          return false;
        }
      }
    }

    // Check for possible merges
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = grid[row][col];
        if (col < 3 && current === grid[row][col + 1]) return false;
        if (row < 3 && current === grid[row + 1][col]) return false;
      }
    }

    return true;
  }

  protected getCellClass(value: number | null): string {
    const animate = this.showAnimations();
    const baseClasses = animate ? 'transition-all duration-100' : '';
    
    if (value === null) {
      return `${baseClasses} bg-slate-200`;
    }

    const scheme = this.colorScheme();
    const colorMaps: Record<string, Record<number, string>> = {
      classic: {
        2: 'bg-slate-100',
        4: 'bg-slate-200',
        8: 'bg-orange-300',
        16: 'bg-orange-400',
        32: 'bg-orange-500',
        64: 'bg-orange-600',
        128: 'bg-yellow-400',
        256: 'bg-yellow-500',
        512: 'bg-yellow-600',
        1024: 'bg-yellow-700',
        2048: 'bg-yellow-500',
      },
      ocean: {
        2: 'bg-sky-100',
        4: 'bg-sky-200',
        8: 'bg-sky-300',
        16: 'bg-sky-400',
        32: 'bg-sky-500',
        64: 'bg-sky-600',
        128: 'bg-cyan-400',
        256: 'bg-cyan-500',
        512: 'bg-cyan-600',
        1024: 'bg-cyan-700',
        2048: 'bg-teal-500',
      },
      forest: {
        2: 'bg-green-100',
        4: 'bg-green-200',
        8: 'bg-green-300',
        16: 'bg-green-400',
        32: 'bg-green-500',
        64: 'bg-green-600',
        128: 'bg-emerald-400',
        256: 'bg-emerald-500',
        512: 'bg-emerald-600',
        1024: 'bg-emerald-700',
        2048: 'bg-teal-600',
      },
      sunset: {
        2: 'bg-pink-100',
        4: 'bg-pink-200',
        8: 'bg-pink-300',
        16: 'bg-pink-400',
        32: 'bg-pink-500',
        64: 'bg-pink-600',
        128: 'bg-purple-400',
        256: 'bg-purple-500',
        512: 'bg-purple-600',
        1024: 'bg-purple-700',
        2048: 'bg-violet-600',
      },
      monochrome: {
        2: 'bg-slate-100',
        4: 'bg-slate-200',
        8: 'bg-slate-300',
        16: 'bg-slate-400',
        32: 'bg-slate-500',
        64: 'bg-slate-600',
        128: 'bg-slate-700',
        256: 'bg-slate-800',
        512: 'bg-slate-900',
        1024: 'bg-zinc-800',
        2048: 'bg-zinc-900',
      },
    };

    return `${baseClasses} ${colorMaps[scheme][value] || 'bg-slate-900'}`;
  }

  protected getCellTextClass(value: number | null): string {
    if (value === null) return '';
    
    const isLarge = value >= 100;
    const isVeryLarge = value >= 1000;
    
    const scheme = this.colorScheme();
    const isDark = scheme === 'monochrome' 
      ? value >= 16 
      : value >= 8;

    let classes = 'font-bold transition-all';
    
    if (isVeryLarge) {
      classes += ' text-xl';
    } else if (isLarge) {
      classes += ' text-2xl';
    } else {
      classes += ' text-3xl';
    }

    if (isDark) {
      classes += ' text-white';
    } else {
      classes += ' text-slate-700';
    }

    return classes;
  }
}
