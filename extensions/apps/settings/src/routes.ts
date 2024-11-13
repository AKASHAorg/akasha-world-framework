export const HOME = 'Home';
export const PRIVACY = 'Privacy';
export const THEME = 'Theme';
export const NSFW = 'NSFW Content';
export const GENERAL = 'General';
export const APPS = 'Apps';
export const PLUGINS = 'Plugins';
export const WIDGETS = 'Widgets';
export const NOTIFICATIONS = 'Notifications';
export const PREFERENCES = 'Preferences';
export const BROWSER_NOTIFICATIONS = 'Browser Notifications';
export const rootRoute = '/settings';

export default {
  [HOME]: `${rootRoute}`,
  [PRIVACY]: `${rootRoute}/privacy`,
  [THEME]: `${rootRoute}/theme`,
  [NSFW]: `${rootRoute}/nsfw`,
  [APPS]: `${rootRoute}/apps`,
  [NOTIFICATIONS]: `${rootRoute}/notifications`,
  [PREFERENCES]: `${rootRoute}/notifications/preferences`,
  [BROWSER_NOTIFICATIONS]: `${rootRoute}/notifications/browser-notifications`,
};
