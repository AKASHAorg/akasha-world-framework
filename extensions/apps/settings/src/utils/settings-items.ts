export type SettingsOption =
  | 'Settings'
  | 'Privacy'
  | 'Theme'
  | 'General'
  | 'Apps'
  | 'Plugins'
  | 'Widgets'
  | 'NSFW Content'
  | 'Notifications'
  | 'Browser Notifications'
  | 'Preferences';

export interface ISettingsItem {
  label: SettingsOption;
  clickable: boolean;
  isSubheading?: boolean;
}

export const settingsItems: ISettingsItem[] = [
  // {
  //   label: 'World',
  //   clickable: false,
  //   isSubheading: true,
  // },
  {
    label: 'Privacy',
    clickable: true,
  },
  {
    label: 'Theme',
    clickable: true,
  },
  {
    label: 'NSFW Content',
    clickable: true,
  },
  // disable these until they are used
  // {
  //  label: 'Notifications',
  //  clickable: true,
  // },
  // {
  //   label: 'Integrations',
  //   clickable: false,
  //   isSubheading: true,
  // },
  // {
  //   label: 'General',
  //   clickable: false,
  // },
  // {
  //   label: 'Apps',
  //   clickable: true,
  // },
  // {
  //   label: 'Plugins',
  //   clickable: false,
  // },
  // {
  //   label: 'Widgets',
  //   clickable: false,
  // },
];
