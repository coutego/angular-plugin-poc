import { definePlugin } from '../../core/plugin.factory';
import { NAV_ITEMS } from '../../core/application.plugin';

export function provideDevToolsPlugin() {
  return definePlugin({
    id: 'dev-tools',
    description: 'Developer tools for plugin introspection and debugging',
    dependsOn: ['application'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Dev Tools',
          route: 'dev-tools',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>`,
          iconColor: 'text-orange-600 bg-orange-50',
          description: 'Plugin inspector and debugging tools',
          order: 400,
        },
      },
    ],
  });
}
