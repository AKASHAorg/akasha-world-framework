import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EventTypes, MenuItemAreaType } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps, useSaveSettings, useGetSettings } from '@akashaorg/ui-awf-hooks';

import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Checkbox from '@akashaorg/design-system-core/lib/components/Checkbox';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Toggle from '@akashaorg/design-system-core/lib/components/Toggle';

import routes, {
  CUSTOMIZE_NOTIFICATION_WELCOME_PAGE,
  CUSTOMIZE_NOTIFICATION_CONFIRMATION_PAGE,
  SHOW_NOTIFICATIONS_PAGE,
} from '../../routes';

export type CustomizeNotificationPageProps = {
  initial?: boolean;
  isLoggedIn: boolean;
};
export const NOTIF_REF = 'notification-preference-set';
const Appname = '@akashaorg/app-notifications';
const SnoozeOption = 'snoozed';

const CustomizeNotificationPage: React.FC<CustomizeNotificationPageProps> = ({
  initial = true,
  isLoggedIn,
}) => {
  const { t } = useTranslation('app-notifications');
  const { uiEvents, getRoutingPlugin } = useRootComponentProps();

  const fetchSettingsQuery = useGetSettings(Appname);
  const existingSettings = fetchSettingsQuery.data;

  const saveSettingsMutation = useSaveSettings();
  const saveSettingsRes = saveSettingsMutation.data;

  const [routeData, setRouteData] = useState(null);

  const routing = getRoutingPlugin();

  const [appNames, setAppNames] = useState<string[]>([]);

  const allowedApps = [
    '@akashaorg/app-akasha-integration',
    '@akashaorg/app-moderation-ewa',
    '@akashaorg/app-akasha-verse',
  ];

  useEffect(() => {
    let sub;
    if (routing) {
      sub = routing.routeObserver.subscribe({
        next: routeData => {
          setRouteData({ ...routeData.byArea });
        },
      });
    }
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [routing]);

  const defaultInstalledApps = useMemo(() => {
    return routeData?.[MenuItemAreaType.AppArea];
  }, [routeData]);

  // const appNames = useMemo(() => {
  //   if (defaultInstalledApps) {
  //     defaultInstalledApps.map(app => {
  //       if (allowedApps.includes(app.name)) return prev => [...prev, app.label];
  //     });
  //   }
  //   return [];
  // }, [defaultInstalledApps]);

  React.useEffect(() => {
    if (defaultInstalledApps) {
      defaultInstalledApps.map(app => {
        if (allowedApps.includes(app.name)) setAppNames(prev => [...prev, app.label]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultInstalledApps]);

  const [selected, setSelected] = useState(true);
  const [allStates, setAllStates] = useState<{ [k: string]: string | number | boolean }>({});
  const [formatedSettings, setFormatedSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const setDefaultValues = () => {
    setAllStates(Object.fromEntries(appNames.map(app => [[app], true])));
  };

  React.useEffect(() => {
    if (appNames) {
      if (existingSettings) {
        const appStates = Object.fromEntries(
          Object.entries(existingSettings).filter(app => appNames.includes(app[0])),
        );

        Object.keys(appStates).length !== 0 && appStates.constructor === Object
          ? setAllStates(appStates)
          : setDefaultValues();

        const snoozePref = Object.entries(existingSettings).find(key => key.includes(SnoozeOption));

        if (snoozePref && typeof snoozePref[1] === 'boolean') {
          setSnoozed(snoozePref[1]);
        }
      } else {
        setDefaultValues();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appNames, existingSettings]);

  React.useEffect(() => {
    if (formatedSettings) {
      setLoading(true);
      saveSettingsMutation.mutate(
        { app: Appname, options: formatedSettings },
        {
          onSettled() {
            setLoading(false);
          },
        },
      );
    }
    if (saveSettingsRes) {
      setFormatedSettings(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveSettingsRes, formatedSettings]);

  const [snoozed, setSnoozed] = React.useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const snoozeChangeHandler = () => {
    setSnoozed(!snoozed);
    setIsChanged(true);
  };

  const navigateTo = getRoutingPlugin().navigateTo;

  // added for emitting snooze notification event
  const _uiEvents = useRef(uiEvents);

  const changeHandler = (appName): void => {
    const newStates = Object.entries(allStates).map(state => {
      if (state[0] === appName) {
        state[1] = !state[1];
      }
      return state;
    });

    setAllStates(Object.fromEntries(newStates));
    setIsChanged(true);
  };

  // auto-selects all when I want to receive all notification is checked
  useEffect(() => {
    if (selected && isChanged) {
      setAllStates(Object.fromEntries(appNames.map(app => [[app], true])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  React.useEffect(() => {
    if (allStates) {
      if (Object.entries(allStates).filter(app => app[1] === false).length > 0) {
        setSelected(false);
      }
    }
  }, [allStates]);

  const goToNextStep = () => {
    // navigate to final step or go back to notifications page depending whether it's the first time accessing the app or not
    return navigateTo?.({
      appName: '@akashaorg/app-notifications',
      getNavigationUrl: () =>
        initial
          ? routes[CUSTOMIZE_NOTIFICATION_CONFIRMATION_PAGE]
          : `${routes[SHOW_NOTIFICATIONS_PAGE]}`,
    });
  };

  const skipHandler = () => {
    setAllStates(Object.fromEntries(appNames.map(app => [[app], true])));

    // navigate to final step
    goToNextStep();
  };

  const confirmHandler = () => {
    try {
      const allPrefs = allStates;

      //add snooze pref
      allPrefs[SnoozeOption] = snoozed;

      setFormatedSettings(allPrefs);

      if (snoozed) {
        // emit snooze notification event so the topbar's notification icon can be updated
        _uiEvents.current.next({
          event: EventTypes.SnoozeNotifications,
        });

        _uiEvents.current.next({
          event: EventTypes.ShowNotification,
          data: {
            name: 'success',
            message: 'You have snoozed your notifications successfully',
          },
        });
      }

      if (!snoozed) {
        // emit unsnooze notification event so the topbar's notification icon can be updated
        _uiEvents.current.next({
          event: EventTypes.UnsnoozeNotifications,
        });

        _uiEvents.current.next({
          event: EventTypes.ShowNotification,
          data: {
            name: 'success',
            message: 'You have unsnoozed your notifications successfully',
          },
        });
      }

      _uiEvents.current.next({
        event: EventTypes.ShowNotification,
        data: {
          name: 'success',
          message: 'Notification settings updated successfully',
        },
      });

      setIsChanged(false);

      // navigate to final step
      initial && goToNextStep();
    } catch (error) {
      _uiEvents.current.next({
        event: EventTypes.ShowNotification,
        data: {
          name: 'error',
          message: 'Something went wrong. Retry',
        },
      });
    }
  };

  if (!isLoggedIn) {
    return navigateTo?.({
      appName: '@akashaorg/app-notifications',
      getNavigationUrl: () => routes[CUSTOMIZE_NOTIFICATION_WELCOME_PAGE],
    });
  }

  return (
    <>
      <Card
        elevation={'1'}
        radius={16}
        padding={'py-2,px-0'}
        customStyle="h-full md:h-min space-y-4"
      >
        <Text variant="h5" align="center" customStyle="pb-2">
          {initial ? t('Customize Your Notifications') : t('Notifications Settings')}
        </Text>
        <Divider customStyle="!mt-0" />
        {!initial && (
          <>
            <Stack direction="column" customStyle="px-6 !my-0 py-2">
              <>
                <Stack justify="between" direction="row">
                  <Text variant="footnotes2">
                    <>{t('Snooze Notifications')}</>
                  </Text>
                  <Toggle
                    iconChecked="BellSnoozeIcon"
                    iconUnchecked="BellAlertIcon"
                    checked={snoozed}
                    onChange={snoozeChangeHandler}
                  />
                </Stack>
              </>
            </Stack>
            <Divider customStyle="!mt-0" />
          </>
        )}
        <Stack direction="column" customStyle="mx-4">
          {initial ? (
            <Text variant="footnotes2" weight="normal" color={{ dark: 'grey6', light: 'grey4' }}>
              <>
                {t(
                  'Choose the notifications that you would like to receive from other applications. Remember, you can change this anytime from the notifications settings.',
                )}
              </>
            </Text>
          ) : (
            <Text variant="h6">
              <>{t('Receiving Notifications')}</>
            </Text>
          )}
          <Checkbox
            id="receive-all-notifications-checkbox"
            label={t('I want to receive all types of notifications')}
            value="I want to receive all types of notifications"
            name="check-all"
            isSelected={selected}
            handleChange={() => {
              setSelected(!selected);
              !initial && setIsChanged(true);
            }}
            customStyle="ml-2 my-4"
          />
        </Stack>
        <Divider customStyle="!mt-0" />
        <Stack direction="column" customStyle="min-h-[80%] !mt-0 gap-y-2 pt-2">
          {Object.keys(allStates).length > 0 &&
            !Object.keys(allStates).find(key => key === SnoozeOption) &&
            Object.entries(allStates).map(appState => (
              <Stack
                direction="column"
                key={appState[0].concat(String(Math.round(Math.random() * 100)))}
              >
                <Stack direction="row" justify="between" align="center" customStyle="px-6">
                  <Text variant="h6">{appState[0]}</Text>
                  <Checkbox
                    value={appState[0]}
                    id={appState[0].concat(String(Math.round(Math.random() * 100)))}
                    isSelected={Boolean(appState[1])}
                    handleChange={() => changeHandler(appState[0])}
                    name={appState[0]}
                    customStyle="mb-4"
                  />
                </Stack>
                <Divider customStyle="!mt-0" />
              </Stack>
            ))}
        </Stack>
        {!loading && (
          <Stack fullWidth direction="row" justify="end" customStyle="space-x-4 pr-2 pb-2 pt-32">
            {initial ? (
              <>
                <Button
                  variant="text"
                  label={t('Do it later')}
                  color="secondaryLight dark:secondaryDark"
                  onClick={skipHandler}
                />
                <Button variant="primary" label={t('Confirm')} onClick={confirmHandler} />
              </>
            ) : (
              <>
                <Button
                  variant="text"
                  label={t('Cancel')}
                  color="secondaryLight dark:secondaryDark"
                  onClick={skipHandler}
                />
                <Button
                  variant="primary"
                  label={t('Update')}
                  onClick={confirmHandler}
                  disabled={!isChanged}
                />
              </>
            )}
          </Stack>
        )}
      </Card>
    </>
  );
};
export default CustomizeNotificationPage;
