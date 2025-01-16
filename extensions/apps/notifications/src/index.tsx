import 'systemjs-webpack-interop/auto-public-path';
import {
  IAppConfig,
  MenuItemAreaType,
  IntegrationRegistrationOptions,
  LogoTypeSource,
  IRootComponentProps,
  IPlugin,
} from '@akashaorg/typings/lib/ui';
import { NotificationPlugin } from './plugins/notification-plugin';
import React from 'react';
import { BellIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';

export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  rootComponent: () => import('./components'),
  mountsIn: opts.layoutSlots?.applicationSlotId,
  i18nNamespace: ['app-notifications'],
  menuItems: {
    label: 'Notifications',
    area: [MenuItemAreaType.AppArea],
    logo: { type: LogoTypeSource.ICON, value: <BellIcon /> },
    subRoutes: [],
  },
  extensionPoints: [
    {
      mountsIn: 'snackbar-notif-slot',
      loadingFn: () => import('./extensions/snack-bar-notification'),
    },
    {
      mountsIn: 'topbar_notification_button',
      loadingFn: () => import('./extensions/rounded-notification-button'),
    },
  ],
});

export const registerPlugin = async (props: IRootComponentProps): Promise<IPlugin> => {
  return {
    notification: new NotificationPlugin(props),
  };
};
