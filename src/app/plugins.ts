import { EnvironmentProviders } from '@angular/core';
import { provideApplicationPlugin } from './core/application.plugin';
import { provideAppShellPlugin } from './shell/app-shell.plugin';
import { provideHomePlugin } from './features/home/home.plugin';
import { provideSettingsPlugin } from './features/settings/settings.plugin';
import { provideUtilitiesPlugin } from './features/utilities/utilities.plugin';
import { provideQrGeneratorPlugin } from './features/utilities/qr-generator/qr-generator.plugin';
import { providePasswordGeneratorPlugin } from './features/utilities/password-generator/password-generator.plugin';
import { provideKanbanBoardPlugin } from './features/utilities/kanban-board/kanban-board.plugin';
import { provideExtrasPlugin } from './features/extras/extras.plugin';
import { provideGamesPlugin } from './features/extras/games/games.plugin';
import { provideGame2048Plugin } from './features/extras/games/game-2048/game-2048.plugin';
import { provideTetrisPlugin } from './features/extras/games/tetris/tetris.plugin';
import { provideDevToolsPlugin } from './features/dev-tools/dev-tools.plugin';
import { providePluginInspectorPlugin } from './features/dev-tools/plugin-inspector/plugin-inspector.plugin';

export const plugins: EnvironmentProviders[] = [
  provideApplicationPlugin(),
  provideAppShellPlugin(),
  provideHomePlugin(),
  provideSettingsPlugin(),
  provideUtilitiesPlugin(),
  provideQrGeneratorPlugin(),
  providePasswordGeneratorPlugin(),
  provideKanbanBoardPlugin(),
  provideExtrasPlugin(),
  provideGamesPlugin(),
  provideGame2048Plugin(),
  provideTetrisPlugin(),
  provideDevToolsPlugin(),
  providePluginInspectorPlugin(),
];
