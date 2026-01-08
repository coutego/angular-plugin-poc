import { definePlugin } from '../../core/plugin.factory';
import { NAV_ITEMS } from '../../core/application.plugin';

export function provideExtrasPlugin() {
  return definePlugin({
    id: 'extras',
    description: 'Extra features and fun stuff',
    dependsOn: ['application'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Extras',
          route: 'extras',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>`,
          iconColor: 'text-pink-600 bg-pink-50',
          description: 'Extra features, games, and fun stuff',
          order: 300,
        },
      },
    ],
  });
}
