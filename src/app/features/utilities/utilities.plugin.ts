import { definePlugin } from '../../core/plugin.factory';
import { NAV_ITEMS } from '../../core/application.plugin';

export function provideUtilitiesPlugin() {
  return definePlugin({
    id: 'utilities',
    description: 'Utilities hub with various tools',
    dependsOn: ['application'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Utilities',
          route: 'utilities',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>`,
          iconColor: 'text-purple-600 bg-purple-50',
          description: 'A collection of helpful tools and utilities',
          order: 200,
        },
      },
    ],
  });
}
