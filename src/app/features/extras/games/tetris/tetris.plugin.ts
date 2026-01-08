import { definePlugin } from '../../../../core/plugin.factory';
import { NAV_ITEMS, SETTINGS_SECTIONS } from '../../../../core/application.plugin';
import { SETTINGS_SCHEMAS } from '../../../../core/settings.service';
import { TetrisComponent } from './tetris.component';
import { TetrisSettingsComponent } from './tetris-settings.component';

export interface TetrisSettings {
  startingLevel: number;
  showGhostPiece: boolean;
  colorScheme: 'classic' | 'pastel' | 'neon' | 'monochrome';
}

export const TETRIS_SETTINGS_KEY = 'tetris';

export const TETRIS_DEFAULTS: TetrisSettings = {
  startingLevel: 1,
  showGhostPiece: true,
  colorScheme: 'classic',
};

export function provideTetrisPlugin() {
  return definePlugin({
    id: 'tetris',
    description: 'Classic Tetris game',
    dependsOn: ['application', 'extras', 'games'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Tetris',
          route: 'tetris',
          parentId: 'games.main',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>`,
          iconColor: 'text-red-600 bg-red-50',
          description: 'Classic block-stacking puzzle game',
          component: TetrisComponent,
          order: 20,
        },
      },
      {
        token: SETTINGS_SECTIONS,
        value: {
          id: 'tetris',
          label: 'Tetris',
          description: 'Configure gameplay and appearance settings',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>`,
          component: TetrisSettingsComponent,
          order: 50,
        },
      },
      {
        token: SETTINGS_SCHEMAS,
        value: {
          key: TETRIS_SETTINGS_KEY,
          defaults: TETRIS_DEFAULTS,
        },
      },
    ],
  });
}
