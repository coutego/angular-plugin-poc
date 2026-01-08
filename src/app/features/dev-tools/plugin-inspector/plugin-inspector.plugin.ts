import { definePlugin } from '../../../core/plugin.factory';
import { NAV_ITEMS } from '../../../core/application.plugin';
import { PluginInspectorComponent } from './plugin-inspector.component';

export function providePluginInspectorPlugin() {
  return definePlugin({
    id: 'plugin-inspector',
    description: 'Inspect and manage loaded plugins',
    dependsOn: ['application', 'dev-tools'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Plugin Inspector',
          route: 'plugins',
          parentId: 'dev-tools.main',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>`,
          iconColor: 'text-violet-600 bg-violet-50',
          description: 'View and manage all loaded plugins',
          component: PluginInspectorComponent,
          order: 10,
        },
      },
    ],
  });
}
