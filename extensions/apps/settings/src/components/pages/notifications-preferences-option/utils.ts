import { UserSettingType } from '@akashaorg/typings/lib/sdk';
import { AppName } from './index';

export const findAppIndex = (appName: AppName, preferences: UserSettingType[]) =>
  preferences.findIndex(e => e.appName === appName);

export const preferencesObjectFactory = (val: boolean): UserSettingType[] => {
  // Order of items in array determines the setting category in payload (PushOrg api requirement)
  return [
    {
      index: 1,
      appName: AppName.ANTENNA,
      enabled: val,
    },
    {
      index: 2,
      appName: AppName.PROFILE,
      enabled: val,
    },
    {
      index: 3,
      appName: AppName.VIBES,
      enabled: val,
    },
  ];
};
