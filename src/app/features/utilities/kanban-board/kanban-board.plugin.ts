import { definePlugin } from '../../../core/plugin.factory';
import { NAV_ITEMS } from '../../../core/application.plugin';
import { KanbanBoardComponent } from './kanban-board.component';

export function provideKanbanBoardPlugin() {
  return definePlugin({
    id: 'kanban-board',
    description: 'Kanban board for task management with drag-and-drop',
    dependsOn: ['application', 'utilities'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Kanban Board',
          route: 'kanban',
          parentId: 'utilities.main',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>`,
          iconColor: 'text-indigo-600 bg-indigo-50',
          description: 'Manage tasks with a drag-and-drop Kanban board',
          component: KanbanBoardComponent,
          order: 20,
        },
      },
    ],
  });
}
