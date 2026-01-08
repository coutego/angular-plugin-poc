import { definePlugin } from '../../../../core/plugin.factory';
import { NAV_ITEMS, SETTINGS_SECTIONS } from '../../../../core/application.plugin';
import { Game2048Component } from './game-2048.component';
import { Game2048SettingsComponent } from './game-2048-settings.component';

export function provideGame2048Plugin() {
  return definePlugin({
    id: 'game-2048',
    description: '2048 puzzle game',
    dependsOn: ['application', 'extras', 'games'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: '2048',
          route: '2048',
          parentId: 'games.main',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>`,
          iconColor: 'text-amber-600 bg-amber-50',
          description: 'Slide tiles to combine and reach 2048',
          component: Game2048Component,
          order: 10,
        },
      },
      {
        token: SETTINGS_SECTIONS,
        value: {
          id: 'game-2048',
          label: '2048 Game',
          description: 'Customize colors and animations for 2048',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>`,
          component: Game2048SettingsComponent,
          order: 40,
        },
      },
    ],
  });
}
