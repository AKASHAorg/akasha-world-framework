import 'systemjs-webpack-interop/auto-public-path';
import routes, { BEAM, GLOBAL_ANTENNA, MY_ANTENNA, REFLECT, REFLECTION, TAGS } from './routes';
import {
  IAppConfig,
  IntegrationRegistrationOptions,
  LogoTypeSource,
  MenuItemAreaType,
  MenuItemType,
} from '@akashaorg/typings/lib/ui';
import React from 'react';
import { Antenna, TextIcon } from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import { PhotoIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';

/**
 * Initialization of the integration is optional.
 * It is called before all `register` calls but after all `getPlugin`;
 * @example Initialization an integration and triggering of a notification
 * ```
 * export const initialize: (opts: IntegrationInitOptions) => void = opts => {
 *  const notificationPlugin: any = opts.plugins["@akashaorg/app-notifications"].notification;
 *  if (notificationPlugin) {
 *   notificationPlugin.listenLogin(
 *     (userData: { ethAddress: string; filAddress: string; pubKey: string }) => {
 *       // user is now logged in,
 *       // we can fetch some notification data for eth address (or pubKey)
 *       // then trigger a notification
 *       notificationPlugin.notify('test_notif_domain', { message: 'This is a notification' });
 *     },
 *   );
 *  }
 * };
 * ```
 */

export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  rootComponent: () => import('./components'),
  mountsIn: opts.layoutSlots?.applicationSlotId,

  /**
   * routes that are defined here can be used by
   * other apps to navigate
   */
  routes: {
    defaultRoute: routes[GLOBAL_ANTENNA],
    [MY_ANTENNA]: routes[MY_ANTENNA],
    [BEAM]: routes[BEAM],
    [TAGS]: routes[TAGS],
    [REFLECT]: routes[REFLECT],
    [REFLECTION]: routes[REFLECTION],
  },
  i18nNamespace: ['app-antenna', 'ui-lib-feed'],
  menuItems: {
    label: 'Antenna',
    type: MenuItemType.App,
    logo: { type: LogoTypeSource.ICON, value: <Antenna />, solidIcon: true },
    area: [MenuItemAreaType.AppArea],
    subRoutes: [
      {
        label: GLOBAL_ANTENNA,
        index: 0,
        route: routes[GLOBAL_ANTENNA],
        type: MenuItemType.Internal,
      },
      {
        label: MY_ANTENNA,
        index: 1,
        route: routes[MY_ANTENNA],
        type: MenuItemType.Internal,
      },
    ],
  },
  contentBlocks: [
    {
      propertyType: 'slate-block',
      icon: <TextIcon />,
      displayName: 'Slate text block',
      loadingFn: () => {
        return () => import('./extensions/slate-block');
      },
    },
    {
      propertyType: 'image-block',
      icon: <PhotoIcon />,
      displayName: 'Image block',
      loadingFn: () => {
        return () => import('./extensions/image-block');
      },
    },
  ],
  extensionPoints: [
    {
      mountsIn: 'beam-editor_*',
      loadingFn: () => import('./extensions/beam-editor'),
    },
    {
      mountsIn: 'remove-beam-confirmation',
      loadingFn: () => import('./extensions/remove-beam-confirmation'),
    },
  ],
});
