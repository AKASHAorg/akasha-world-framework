import 'systemjs-webpack-interop/auto-public-path';
import {
  IAppConfig,
  IntegrationRegistrationOptions,
  MenuItemAreaType,
  MenuItemType,
  LogoTypeSource,
} from '@akashaorg/typings/lib/ui';
import React from 'react';
import { Cog8ToothIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import routes from './routes';

export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  rootComponent: () => import('./components'),
  i18nNamespace: ['app-settings-ewa'],
  mountsIn: opts.layoutSlots?.applicationSlotId,
  menuItems: {
    label: 'Settings',
    type: MenuItemType.App,
    area: [MenuItemAreaType.AppArea],
    logo: { type: LogoTypeSource.ICON, value: <Cog8ToothIcon /> },
    subRoutes: [],
  },
  routes: {
    ...routes,
  },
});
