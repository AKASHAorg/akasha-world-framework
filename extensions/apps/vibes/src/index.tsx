import 'systemjs-webpack-interop/auto-public-path';
import {
  IAppConfig,
  IntegrationRegistrationOptions,
  MenuItemAreaType,
  MenuItemType,
  LogoTypeSource,
} from '@akashaorg/typings/lib/ui';
import React from 'react';
import { Vibes } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import routes, { HISTORY, HOME, MODERATORS } from './routes';

export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  rootComponent: () => import('./components'),
  mountsIn: opts.layoutSlots?.applicationSlotId,
  i18nNamespace: ['app-vibes'],
  routes: {
    ...routes,
  },
  menuItems: {
    label: 'Vibes',
    type: MenuItemType.App,
    logo: { type: LogoTypeSource.ICON, value: <Vibes /> },
    area: [MenuItemAreaType.AppArea],
    subRoutes: [
      {
        label: HOME,
        index: 0,
        route: routes[HOME],
        type: MenuItemType.Internal,
      },
      {
        label: MODERATORS,
        index: 1,
        route: routes[MODERATORS],
        type: MenuItemType.Internal,
      },
      {
        label: HISTORY,
        index: 2,
        route: routes[HISTORY],
        type: MenuItemType.Internal,
      },
    ],
  },
});
