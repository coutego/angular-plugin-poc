import { Component, ChangeDetectionStrategy, signal, computed, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SettingsService } from '../../../../core/settings.service';
import {
  TetrisSettings,
  TETRIS_SETTINGS_KEY,
  TETRIS_DEFAULTS,
} from './tetris.plugin';

type Piece = {
  shape: number[][];
  color: string;
  name: string;
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

@Component({
  selector: 'app-tetris',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    '(window:keydown)': 'handleKeydown($event)',
  },
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Tetris</h1>
            <p class="text-slate-600 text-sm">Classic block-stacking game</p>
          </div>
          <div class="flex gap-3">
            <div class="bg-slate-100 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p class="text-xs text-slate-500 font-medium">SCORE</p>
              <p class="text-xl font-bold text-slate-900">{{ score() }}</p>
            </div>
            <div class="bg-slate-100 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p class="text-xs text-slate-500 font-medium">LINES</p>
              <p class="text-xl font-bold text-slate-900">{{ lines() }}</p>
            </div>
            <div class="bg-slate-100 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <p class="text-xs text-slate-500 font-medium">LEVEL</p>
              <p class="text-xl font-bold text-slate-900">{{ level() }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mb-4">
          <button
            (click)="toggleGame()"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            {{ isPlaying() ? 'Pause' : (gameOver() ? 'New Game' : 'Start') }}
          </button>
          @if (!isPlaying() && !gameOver()) {
            <button
              (click)="resetGame()"
              class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          }
          <button
            (click)="goToSettings()"
            class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Settings
          </button>
        </div>

        <p class="text-sm text-slate-500">
          <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono">←→</kbd> Move
          <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono ml-2">↑</kbd> Rotate
          <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono ml-2">↓</kbd> Soft Drop
          <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono ml-2">Space</kbd> Hard Drop
        </p>
      </div>

      <div class="flex gap-6 justify-center">
        <!-- Game Board -->
        <div class="bg-slate-800 p-1 rounded-lg relative">
          <div 
            class="grid gap-px bg-slate-700"
            [style.grid-template-columns]="'repeat(' + boardWidth + ', 1fr)'"
          >
            @for (row of displayBoard(); track $index; let rowIndex = $index) {
              @for (cell of row; track $index; let colIndex = $index) {
                <div
                  class="w-5 h-5 sm:w-6 sm:h-6 rounded-sm transition-colors"
                  [class]="cell || 'bg-slate-900'"
                ></div>
              }
            }
          </div>

          <!-- Game Over Overlay -->
          @if (gameOver()) {
            <div class="absolute inset-0 bg-slate-900/80 rounded-lg flex flex-col items-center justify-center">
              <p class="text-2xl font-bold text-white mb-2">Game Over!</p>
              <p class="text-slate-300 mb-1">Score: {{ score() }}</p>
              <p class="text-slate-400 text-sm mb-4">Lines: {{ lines() }}</p>
              <button
                (click)="resetGame()"
                class="px-6 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-medium transition-colors"
              >
                Play Again
              </button>
            </div>
          }

          <!-- Paused Overlay -->
          @if (!isPlaying() && !gameOver() && hasStarted()) {
            <div class="absolute inset-0 bg-slate-900/60 rounded-lg flex items-center justify-center">
              <p class="text-xl font-bold text-white">Paused</p>
            </div>
          }
        </div>

        <!-- Next Piece Preview -->
        <div class="flex flex-col gap-4">
          <div class="bg-slate-100 rounded-xl p-4">
            <p class="text-xs text-slate-500 font-medium mb-2 text-center">NEXT</p>
            <div class="w-20 h-20 flex items-center justify-center">
              @if (nextPiece()) {
                <div class="grid gap-px" [style.grid-template-columns]="'repeat(' + nextPiece()!.shape[0].length + ', 1fr)'">
                  @for (row of nextPiece()!.shape; track $index) {
                    @for (cell of row; track $index) {
                      <div
                        class="w-4 h-4 rounded-sm"
                        [class]="cell ? nextPiece()!.color : 'bg-transparent'"
                      ></div>
                    }
                  }
                </div>
              }
            </div>
          </div>

          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-xs text-slate-500 font-medium mb-2">BEST</p>
            <p class="text-lg font-bold text-slate-900">{{ bestScore() }}</p>
          </div>
        </div>
      </div>

      <!-- Mobile Controls -->
      <div class="mt-6 grid grid-cols-3 gap-2 max-w-xs mx-auto sm:hidden">
        <button
          (click)="moveLeft()"
          class="p-4 bg-slate-200 hover:bg-slate-300 rounded-xl active:bg-slate-400 transition-colors"
          aria-label="Move left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          (click)="rotate()"
          class="p-4 bg-slate-200 hover:bg-slate-300 rounded-xl active:bg-slate-400 transition-colors"
          aria-label="Rotate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          (click)="moveRight()"
          class="p-4 bg-slate-200 hover:bg-slate-300 rounded-xl active:bg-slate-400 transition-colors"
          aria-label="Move right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          (click)="softDrop()"
          class="p-4 bg-slate-200 hover:bg-slate-300 rounded-xl active:bg-slate-400 transition-colors col-span-2"
          aria-label="Soft drop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        <button
          (click)="hardDrop()"
          class="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl active:bg-blue-700 transition-colors"
          aria-label="Hard drop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class TetrisComponent implements OnDestroy {
  private readonly settingsService = inject(SettingsService);
  private readonly router = inject(Router);

  protected readonly boardWidth = BOARD_WIDTH;
  protected readonly boardHeight = BOARD_HEIGHT;

  protected readonly board = signal<(string | null)[][]>(this.createEmptyBoard());
  protected readonly currentPiece = signal<Piece | null>(null);
  protected readonly currentPosition = signal({ x: 0, y: 0 });
  protected readonly nextPiece = signal<Piece | null>(null);
  protected readonly score = signal(0);
  protected readonly lines = signal(0);
  protected readonly level = computed(() => Math.floor(this.lines() / 10) + this.startingLevel());
  protected readonly bestScore = signal(this.loadBestScore());
  protected readonly isPlaying = signal(false);
  protected readonly gameOver = signal(false);
  protected readonly hasStarted = signal(false);

  // Settings
  protected readonly startingLevel = signal(TETRIS_DEFAULTS.startingLevel);
  protected readonly showGhostPiece = signal(TETRIS_DEFAULTS.showGhostPiece);
  protected readonly colorScheme = signal<'classic' | 'pastel' | 'neon' | 'monochrome'>(TETRIS_DEFAULTS.colorScheme);

  private gameInterval: ReturnType<typeof setInterval> | null = null;
  private settingsLoaded = false;

  protected readonly displayBoard = computed(() => {
    const boardCopy = this.board().map(row => [...row]);
    const piece = this.currentPiece();
    const pos = this.currentPosition();

    if (piece) {
      // Draw ghost piece if enabled
      if (this.showGhostPiece()) {
        const ghostY = this.getGhostPosition();
        for (let row = 0; row < piece.shape.length; row++) {
          for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
              const boardRow = ghostY + row;
              const boardCol = pos.x + col;
              if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
                if (!boardCopy[boardRow][boardCol]) {
                  boardCopy[boardRow][boardCol] = 'bg-slate-700 opacity-50';
                }
              }
            }
          }
        }
      }

      // Draw current piece
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const boardRow = pos.y + row;
            const boardCol = pos.x + col;
            if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
              boardCopy[boardRow][boardCol] = piece.color;
            }
          }
        }
      }
    }

    return boardCopy;
  });

  constructor() {
    // Load settings
    effect(() => {
      const settings = this.settingsService.get<TetrisSettings>(TETRIS_SETTINGS_KEY);
      if (!this.settingsLoaded) {
        this.startingLevel.set(settings.startingLevel);
        this.showGhostPiece.set(settings.showGhostPiece);
        this.colorScheme.set(settings.colorScheme);
        this.settingsLoaded = true;
      }
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.stopGame();
  }

  protected goToSettings(): void {
    this.router.navigate(['/settings'], { fragment: 'tetris' });
  }

  private getGhostPosition(): number {
    const piece = this.currentPiece();
    const pos = this.currentPosition();
    if (!piece) return pos.y;

    let ghostY = pos.y;
    while (this.isValidPosition(piece.shape, pos.x, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  }

  private getPieces(): Piece[] {
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
        I: 'bg-cyan-400',
        O: 'bg-yellow-400',
        T: 'bg-fuchsia-500',
        J: 'bg-blue-400',
        L: 'bg-orange-400',
        S: 'bg-lime-400',
        Z: 'bg-rose-500',
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

    const colors = colorMaps[scheme];

    return [
      { shape: [[1, 1, 1, 1]], color: colors['I'], name: 'I' },
      { shape: [[1, 1], [1, 1]], color: colors['O'], name: 'O' },
      { shape: [[0, 1, 0], [1, 1, 1]], color: colors['T'], name: 'T' },
      { shape: [[1, 0, 0], [1, 1, 1]], color: colors['J'], name: 'J' },
      { shape: [[0, 0, 1], [1, 1, 1]], color: colors['L'], name: 'L' },
      { shape: [[0, 1, 1], [1, 1, 0]], color: colors['S'], name: 'S' },
      { shape: [[1, 1, 0], [0, 1, 1]], color: colors['Z'], name: 'Z' },
    ];
  }

  private createEmptyBoard(): (string | null)[][] {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
  }

  private loadBestScore(): number {
    try {
      return parseInt(localStorage.getItem('tetris-best') || '0', 10);
    } catch {
      return 0;
    }
  }

  private saveBestScore(score: number): void {
    try {
      localStorage.setItem('tetris-best', String(score));
    } catch {
      // Ignore storage errors
    }
  }

  protected resetGame(): void {
    this.stopGame();
    this.board.set(this.createEmptyBoard());
    this.score.set(0);
    this.lines.set(0);
    this.gameOver.set(false);
    this.hasStarted.set(false);
    this.currentPiece.set(null);
    this.nextPiece.set(null);
  }

  protected toggleGame(): void {
    if (this.gameOver()) {
      this.resetGame();
      this.startGame();
    } else if (this.isPlaying()) {
      this.pauseGame();
    } else {
      this.startGame();
    }
  }

  private startGame(): void {
    if (!this.hasStarted()) {
      this.spawnPiece();
      this.hasStarted.set(true);
    }
    this.isPlaying.set(true);
    this.startGameLoop();
  }

  private pauseGame(): void {
    this.isPlaying.set(false);
    this.stopGame();
  }

  private stopGame(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  private startGameLoop(): void {
    this.stopGame();
    const speed = Math.max(100, 1000 - (this.level() - 1) * 100);
    this.gameInterval = setInterval(() => {
      if (this.isPlaying()) {
        this.tick();
      }
    }, speed);
  }

  private tick(): void {
    if (!this.moveDown()) {
      this.lockPiece();
      this.clearLines();
      this.spawnPiece();
    }
  }

  private spawnPiece(): void {
    const piece = this.nextPiece() || this.getRandomPiece();
    this.nextPiece.set(this.getRandomPiece());
    
    const startX = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2);
    const startY = 0;

    if (!this.isValidPosition(piece.shape, startX, startY)) {
      this.gameOver.set(true);
      this.isPlaying.set(false);
      this.stopGame();
      
      if (this.score() > this.bestScore()) {
        this.bestScore.set(this.score());
        this.saveBestScore(this.score());
      }
      return;
    }

    this.currentPiece.set(piece);
    this.currentPosition.set({ x: startX, y: startY });
  }

  private getRandomPiece(): Piece {
    const pieces = this.getPieces();
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return { ...piece, shape: piece.shape.map(row => [...row]) };
  }

  private isValidPosition(shape: number[][], x: number, y: number): boolean {
    const board = this.board();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardX = x + col;
          const boardY = y + row;
          
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (boardY >= 0 && board[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private moveDown(): boolean {
    const piece = this.currentPiece();
    const pos = this.currentPosition();
    if (!piece) return false;

    if (this.isValidPosition(piece.shape, pos.x, pos.y + 1)) {
      this.currentPosition.set({ ...pos, y: pos.y + 1 });
      return true;
    }
    return false;
  }

  protected moveLeft(): void {
    if (!this.isPlaying()) return;
    const piece = this.currentPiece();
    const pos = this.currentPosition();
    if (!piece) return;

    if (this.isValidPosition(piece.shape, pos.x - 1, pos.y)) {
      this.currentPosition.set({ ...pos, x: pos.x - 1 });
    }
  }

  protected moveRight(): void {
    if (!this.isPlaying()) return;
    const piece = this.currentPiece();
    const pos = this.currentPosition();
    if (!piece) return;

    if (this.isValidPosition(piece.shape, pos.x + 1, pos.y)) {
      this.currentPosition.set({ ...pos, x: pos.x + 1 });
    }
  }

  protected rotate(): void {
    if (!this.isPlaying()) return;
    const piece = this.currentPiece();
    const pos = this.currentPosition();
    if (!piece) return;

    const rotated = this.rotateMatrix(piece.shape);
    
    if (this.isValidPosition(rotated, pos.x, pos.y)) {
      this.currentPiece.set({ ...piece, shape: rotated });
    } else if (this.isValidPosition(rotated, pos.x - 1, pos.y)) {
      this.currentPiece.set({ ...piece, shape: rotated });
      this.currentPosition.set({ ...pos, x: pos.x - 1 });
    } else if (this.isValidPosition(rotated, pos.x + 1, pos.y)) {
      this.currentPiece.set({ ...piece, shape: rotated });
      this.currentPosition.set({ ...pos, x: pos.x + 1 });
    }
  }

  private rotateMatrix(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated: number[][] = [];
    
    for (let col = 0; col < cols; col++) {
      const newRow: number[] = [];
      for (let row = rows - 1; row >= 0; row--) {
        newRow.push(matrix[row][col]);
      }
      rotated.push(newRow);
    }
    
    return rotated;
  }

  protected softDrop(): void {
    if (!this.isPlaying()) return;
    if (!this.moveDown()) {
      this.lockPiece();
      this.clearLines();
      this.spawnPiece();
    }
  }

  protected hardDrop(): void {
    if (!this.isPlaying()) return;
    while (this.moveDown()) {
      // Keep dropping
    }
    this.lockPiece();
    this.clearLines();
    this.spawnPiece();
  }

  private lockPiece(): void {
    const piece = this.currentPiece();
    const pos = this.currentPosition();
    if (!piece) return;

    const newBoard = this.board().map(row => [...row]);
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const boardRow = pos.y + row;
          const boardCol = pos.x + col;
          if (boardRow >= 0 && boardRow < BOARD_HEIGHT) {
            newBoard[boardRow][boardCol] = piece.color;
          }
        }
      }
    }

    this.board.set(newBoard);
    this.currentPiece.set(null);
  }

  private clearLines(): void {
    const board = this.board();
    const newBoard: (string | null)[][] = [];
    let clearedLines = 0;

    for (let row = 0; row < BOARD_HEIGHT; row++) {
      if (board[row].every(cell => cell !== null)) {
        clearedLines++;
      } else {
        newBoard.push([...board[row]]);
      }
    }

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (clearedLines > 0) {
      this.board.set(newBoard);
      this.lines.update(l => l + clearedLines);
      
      const points = [0, 100, 300, 500, 800][clearedLines] * this.level();
      this.score.update(s => s + points);

      // Update game speed when level changes
      this.startGameLoop();
    }
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (!this.isPlaying()) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.toggleGame();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        event.preventDefault();
        this.moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        event.preventDefault();
        this.moveRight();
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        event.preventDefault();
        this.rotate();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        event.preventDefault();
        this.softDrop();
        break;
      case ' ':
        event.preventDefault();
        this.hardDrop();
        break;
      case 'p':
      case 'P':
      case 'Escape':
        event.preventDefault();
        this.pauseGame();
        break;
    }
  }
}
