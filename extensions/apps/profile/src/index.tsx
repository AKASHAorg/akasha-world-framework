import 'systemjs-webpack-interop/auto-public-path';
import {
  IAppConfig,
  IntegrationRegistrationOptions,
  MenuItemAreaType,
  LogoTypeSource,
  IPlugin,
} from '@akashaorg/typings/lib/ui';
import { ProfilePlugin } from './plugins/profile-plugin';
import routes, { BEAMS, EDIT, FOLLOWERS, FOLLOWING, INTERESTS } from './routes';
/**
 * All plugins must export an object like this:
 */
export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  mountsIn: opts.layoutSlots?.applicationSlotId,
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
  extensionPoints: [
    {
      mountsIn: 'login',
      loadingFn: () => import('./extensions/login-modal'),
    },
    {
      mountsIn: 'follow_*',
      loadingFn: () => import('./extensions/follow-profile-button'),
    },
    {
      mountsIn: 'profile_avatar_*',
      loadingFn: () => import('./extensions/profile-avatar'),
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

export const registerPlugin = async (): Promise<IPlugin> => {
  return {
    profile: new ProfilePlugin(),
  };
};
