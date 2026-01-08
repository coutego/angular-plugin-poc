import { definePlugin } from '../../../core/plugin.factory';
import { NAV_ITEMS } from '../../../core/application.plugin';

export function provideGamesPlugin() {
  return definePlugin({
    id: 'games',
    description: 'Fun games to play',
    dependsOn: ['application', 'extras'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Games',
          route: 'games',
          parentId: 'extras.main',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`,
          iconColor: 'text-emerald-600 bg-emerald-50',
          description: 'Fun games to play in your browser',
          order: 10,
        },
      },
    ],
  });
}
