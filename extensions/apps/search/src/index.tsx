import 'systemjs-webpack-interop/auto-public-path';
import routes, { ONBOARDING, RESULTS } from './routes';
import {
  IAppConfig,
  IntegrationRegistrationOptions,
  MenuItemAreaType,
  MenuItemType,
  LogoTypeSource,
} from '@akashaorg/typings/lib/ui';
import React from 'react';
import { MagnifyingGlassIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';

/**
 * All the plugins must export an object like this:
 */
export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  rootComponent: () => import('./components'),
  i18nNamespace: ['app-search'],
  mountsIn: opts.layoutSlots?.applicationSlotId,
  menuItems: {
    label: 'Search',
    area: [MenuItemAreaType.SearchArea, MenuItemAreaType.AppArea],
    type: MenuItemType.App,
    logo: { type: LogoTypeSource.ICON, value: <MagnifyingGlassIcon /> },
    subRoutes: [],
  },
  routes: {
    defaultRoute: routes[RESULTS],
    [RESULTS]: routes[RESULTS],
    [ONBOARDING]: routes[ONBOARDING],
  },
});
