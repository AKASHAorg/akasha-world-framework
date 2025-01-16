import '@akashaorg/design-system-core/src/twind/main.css';
import '@akashaorg/design-system-core/src/twind/globals.css';

import { WorldConfig } from '@akashaorg/typings/lib/ui';
import { AkashaApp, AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';

declare const __DEV__: boolean;
declare const __LOAD_LOCAL_SOURCES__: boolean;

(async function bootstrap(System) {
  const { default: AppLoader } = await System.import('@akashaorg/ui-app-loader');
  const { default: getSDK } = await System.import('@akashaorg/core-sdk');

  const origin = window.location.origin;
  let registryOverrides: (Partial<AkashaApp> & { source: string })[] = [
    {
      name: '@akashaorg/ui-widget-layout',
      applicationType: AkashaAppApplicationType.Widget,
      source: `${origin}/widgets/layout/index.js`,
    },
    {
      name: '@akashaorg/ui-widget-sidebar',
      applicationType: AkashaAppApplicationType.Widget,
      source: `${origin}/widgets/sidebar/index.js`,
    },
    {
      name: '@akashaorg/ui-widget-topbar',
      applicationType: AkashaAppApplicationType.Widget,
      source: `${origin}/widgets/top-bar/index.js`,
    },
    {
      name: '@akashaorg/ui-widget-mini-profile',
      applicationType: AkashaAppApplicationType.Widget,
      source: `${origin}/widgets/mini-profile/index.js`,
    },
    {
      name: '@akashaorg/ui-widget-test-mode-notifier',
      applicationType: AkashaAppApplicationType.Widget,
      source: `${origin}/widgets/test-mode-notifier/index.js`,
    },
  ];

  if (__DEV__ || __LOAD_LOCAL_SOURCES__) {
    registryOverrides = (await import('./registry-overrides')).default;
  }

  const loaderConfig: WorldConfig = {
    title: 'AKASHA World',
    worldIcon: {
      basePath: '/icons/world/',
      darkModeSuffix: '_dark',
      extension: '.png',
      small: 'small',
      medium: 'medium',
      large: 'large',
    },
    // main layout (shell)
    layout: '@akashaorg/ui-widget-layout',
    // define an app that will load at root '/' path
    homepageApp: '@akashaorg/app-antenna',
    // define the extensions app for this world
    extensionsApp: '@akashaorg/app-extensions',
    // define pre-installed apps,
    // homepageApp is always loaded by default
    defaultApps: [
      /*'@akashaorg/app-vibes',
      '@akashaorg/app-auth-ewa',
      '@akashaorg/app-search',
      '@akashaorg/app-profile',
      '@akashaorg/app-notifications',
      '@akashaorg/app-settings-ewa',
      '@akashaorg/app-legal',*/
      // '@akashaorg/app-vibes-console',
    ],
    // pre-installed widgets;
    // layout widget is always loaded by default
    defaultWidgets: [
      /*'@akashaorg/ui-widget-topbar',
      '@akashaorg/ui-widget-trending',
      '@akashaorg/ui-widget-analytics',
      '@akashaorg/ui-widget-sidebar',
      '@akashaorg/ui-widget-mini-profile',
      '@akashaorg/ui-widget-test-mode-notifier',*/
    ],
    analytics: {
      trackerUrl: process.env.MATOMO_TRACKER_URL || '',
      siteId: process.env.MATOMO_SITE_ID || '',
    },
    registryOverrides,
    socialLinks: [
      { icon: 'Github', link: 'https://github.com/AKASHAorg' },
      { icon: 'Discord', link: '' },
      { icon: 'Telegram', link: 'https://t.me/worldofethereum' },
      { icon: 'Twitter', link: 'https://twitter.com/AKASHAworld' },
    ],
  };

  const sdk = getSDK();
  const appLoader = new AppLoader(loaderConfig);
  appLoader.start();

  // tslint:disable-next-line:no-console
  console.log('initial sdk instance', sdk);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
})(globalThis.System);
