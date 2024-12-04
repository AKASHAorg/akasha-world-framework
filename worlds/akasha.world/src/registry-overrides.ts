import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';

const origin = window.location.origin;
// config for integrations config overrides
const overrides = [
  {
    name: '@akashaorg/app-extensions',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/extensions/index.js`,
  },
  {
    name: '@akashaorg/app-antenna',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/antenna/index.js`,
  },
  {
    name: '@akashaorg/app-vibes',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/vibes/index.js`,
  },
  // {
  //   name: '@akashaorg/app-vibes-console',
  //   applicationType: AkashaAppApplicationType.App,
  //   source: `${origin}/apps/vibes-console/index.js`,
  // },
  {
    name: '@akashaorg/app-auth-ewa',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/auth-app/index.js`,
  },
  {
    name: '@akashaorg/app-profile',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/profile/index.js`,
  },
  {
    name: '@akashaorg/app-notifications',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/notifications/index.js`,
  },
  // {
  //   name: '@akashaorg/app-legal',
  //   applicationType: AkashaAppApplicationType.App,
  //   source: `${origin}/apps/legal/index.js`,
  //
  // },
  {
    name: '@akashaorg/app-search',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/search/index.js`,
  },
  {
    name: '@akashaorg/app-settings-ewa',
    applicationType: AkashaAppApplicationType.App,
    source: `${origin}/apps/settings/index.js`,
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
    name: '@akashaorg/ui-widget-trending',
    applicationType: AkashaAppApplicationType.Widget,
    source: `${origin}/widgets/trending/index.js`,
  },
  {
    name: '@akashaorg/ui-widget-layout',
    applicationType: AkashaAppApplicationType.Widget,
    source: `${origin}/widgets/layout/index.js`,
  },
  {
    name: '@akashaorg/ui-widget-analytics',
    applicationType: AkashaAppApplicationType.Widget,
    source: `${origin}/widgets/analytics/index.js`,
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

export default overrides;
