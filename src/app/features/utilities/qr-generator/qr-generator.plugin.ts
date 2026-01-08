import { definePlugin } from '../../../core/plugin.factory';
import { NAV_ITEMS, SETTINGS_SECTIONS } from '../../../core/application.plugin';
import { QrGeneratorComponent } from './qr-generator.component';
import { QrGeneratorSettingsComponent } from './qr-generator-settings.component';

export function provideQrGeneratorPlugin() {
  return definePlugin({
    id: 'qr-generator',
    description: 'QR Code generator utility',
    dependsOn: ['application', 'utilities'],

    contributions: [
      {
        token: NAV_ITEMS,
        value: {
          id: 'main',
          label: 'QR Code Generator',
          route: 'qr',
          parentId: 'utilities.main',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>`,
          iconColor: 'text-indigo-600 bg-indigo-50',
          description: 'Generate QR codes for URLs, text, or any data',
          component: QrGeneratorComponent,
          order: 0,
        },
      },
      {
        token: SETTINGS_SECTIONS,
        value: {
          id: 'qr-generator',
          label: 'QR Code Generator',
          description: 'Configure default settings for QR code generation',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>`,
          iconColor: 'text-indigo-600 bg-indigo-50',
          component: QrGeneratorSettingsComponent,
          order: 10,
        },
      },
    ],
  });
}
