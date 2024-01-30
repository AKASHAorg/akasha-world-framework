import 'systemjs-webpack-interop/auto-public-path';
import {
  IAppConfig,
  IntegrationRegistrationOptions,
  MenuItemAreaType,
  LogoTypeSource,
} from '@akashaorg/typings/lib/ui';

import routes, { BEAMS, EDIT, FOLLOWERS, FOLLOWING, INTERESTS } from './routes';
/**
 * All plugins must export an object like this:
 */
export const register: (opts: IntegrationRegistrationOptions) => IAppConfig = opts => ({
  mountsIn: opts.layoutConfig?.pluginSlotId,
  loadingFn: () => import('./components'),
  i18nNamespace: ['app-profile', 'ui-lib-feed'],
  menuItems: [
    {
      label: 'Profile',
      area: [MenuItemAreaType.QuickAccessArea],
      // routes,
      logo: { type: LogoTypeSource.AVATAR, value: '' },
      subRoutes: Object.keys(routes).map((routeName, idx) => ({
        index: idx,
        label: routeName,
        route: routes[routeName],
      })),
    },
  ],
  extensions: [
    {
      mountsIn: 'login',
      loadingFn: () => import('./extensions/login-modal'),
    },
    {
      mountsIn: 'follow_*',
      loadingFn: () => import('./extensions/follow-profile-button'),
    },
  ],
  routes: {
    beams: routes[BEAMS],
    edit: routes[EDIT],
    followers: routes[FOLLOWERS],
    following: routes[FOLLOWING],
    interests: routes[INTERESTS],
    rootRoute: '',
  },
});
