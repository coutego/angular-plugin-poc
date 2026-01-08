import { definePlugin } from '../core/plugin.factory';
import { createExtensionPoint } from '../core/plugin.contract';

// App shell defines its own extension points
export const SIDEBAR_COMPONENTS = createExtensionPoint<any>('sidebar-components');

export function provideAppShellPlugin() {
  return definePlugin({
    id: 'app-shell',
    description: 'Main application shell with sidebar and header',
  });
}
