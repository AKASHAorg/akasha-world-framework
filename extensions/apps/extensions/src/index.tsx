import 'systemjs-webpack-interop/auto-public-path';
import {
  IAppConfig,
  MenuItemAreaType,
  IntegrationRegistrationOptions,
  LogoTypeSource,
  MenuItemType,
} from '@akashaorg/typings/lib/ui';
import routes, { EXTENSIONS, HOME, INSTALLED, MY_EXTENSIONS } from './routes';
import { DEV_MODE_KEY } from './constants';
import React from 'react';
import { Akasha } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { DevMode } from './components/pages';

const generateSubRoutes = () => {
  const localValue = window.localStorage.getItem(DEV_MODE_KEY);
  const baseSubRoutes = [
    {
      label: HOME,
      index: 0,
      route: routes[HOME],
      type: MenuItemType.Internal,
    },
    {
      label: EXTENSIONS,
      index: 1,
      route: routes[EXTENSIONS],
      type: MenuItemType.Internal,
    },
    {
      label: INSTALLED,
      index: 2,
      route: routes[INSTALLED],
      type: MenuItemType.Internal,
    },
  ];

  return localValue === DevMode.ENABLED
    ? [
        ...baseSubRoutes,
        {
          label: MY_EXTENSIONS,
          index: 3,
          route: routes[MY_EXTENSIONS],
          type: MenuItemType.Internal,
        },
      ]
    : baseSubRoutes;
};

/**
 * All the plugins must export an object like this:
 */
export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  rootComponent: () => import('./components'),
  mountsIn: opts.layoutSlots?.applicationSlotId,
  i18nNamespace: ['app-extensions'],
  routes: {
    ...routes,
  },
  menuItems: {
    label: 'Extensions',
    type: MenuItemType.App,
    logo: { type: LogoTypeSource.ICON, solidIcon: true, value: <Akasha /> },
    area: [MenuItemAreaType.AppArea],
    subRoutes: generateSubRoutes(),
  },
  extensionPoints: [
    {
      mountsIn: 'remove-extension-confirmation',
      loadingFn: () => import('./extensions/remove-extension-confirmation'),
    },
  ],
});
