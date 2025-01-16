import 'systemjs-webpack-interop/auto-public-path';
import type { LayoutWidgetInterface } from '@akashaorg/typings/lib/ui';
import { TranslationPlugin } from './translation';

export const register = (): LayoutWidgetInterface => {
  return {
    rootComponent: () => import('./components'),
    /*loadingFn: () => import('./components'),*/
    mountsIn: 'root',
    extensionSlots: {
      applicationSlotId: 'app-slot',
      topbarSlotId: 'topbar-slot',
      sidebarSlotId: 'sidebar-slot',
      contextualWidgetSlotId: 'contextual-widget-slot',
      widgetSlotId: 'widget-slot',
      modalSlotId: 'modal-slot',
      cookieWidgetSlotId: 'cookie-widget-slot',
      snackbarNotifSlotId: 'snackbar-notif-slot',
    },
  };
};

/**
 *
 * export the translation's getPlugin function here
 */
export const registerPlugin = async () => {
  TranslationPlugin.i18n = await TranslationPlugin.initTranslation();
  return {
    translation: {
      i18n: TranslationPlugin.i18n,
    },
  };
};
