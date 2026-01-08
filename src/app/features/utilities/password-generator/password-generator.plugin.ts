import { definePlugin } from '../../../core/plugin.factory';
import { NAV_ITEMS, SETTINGS_SECTIONS } from '../../../core/application.plugin';
import { PasswordGeneratorComponent } from './password-generator.component';
import { PasswordGeneratorSettingsComponent } from './password-generator-settings.component';

export function providePasswordGeneratorPlugin() {
  return definePlugin({
    id: 'password-generator',
    description: 'Strong password generator utility',
    dependsOn: ['application', 'utilities'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'Password Generator',
          route: 'password',
          parentId: 'utilities.main',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>`,
          iconColor: 'text-emerald-600 bg-emerald-50',
          description: 'Generate strong, secure passwords with customizable options',
          component: PasswordGeneratorComponent,
          order: 1,
        },
      },
      {
        token: SETTINGS_SECTIONS,
        value: {
          id: 'password-generator',
          label: 'Password Generator',
          description: 'Configure default settings for password generation',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>`,
          iconColor: 'text-emerald-600 bg-emerald-50',
          component: PasswordGeneratorSettingsComponent,
          order: 20,
        },
      },
    ],
  });
}
