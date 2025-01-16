import React, { useState, useEffect, useMemo, useSyncExternalStore, ReactElement } from 'react';
import ReactDOMClient from 'react-dom/client';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import singleSpaReact from 'single-spa-react';
import {
  withProviders,
  hasOwn,
  useRootComponentProps,
  useListenForMutationEvents,
  filterEvent,
} from '@akashaorg/ui-core-hooks';
import {
  IRootExtensionProps,
  MenuItemAreaType,
  NotificationEvents,
  type NotificationEvent,
  NotificationTypes,
  LogoTypeSource,
} from '@akashaorg/typings/lib/ui';
import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import Snackbar from '@akashaorg/design-system-core/lib/components/Snackbar';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';

const SnackBarNotification: React.FC<IRootExtensionProps> = () => {
  const { uiEvents, getCorePlugins } = useRootComponentProps();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaLabel, setCTALabel] = useState('');
  const [appTitle, setAppTitle] = useState(null);
  const [dismissable, setDismissable] = useState(true);
  const [notifType, setNotifType] = useState(NotificationTypes.Success);
  const routing = getCorePlugins().routing;
  const routeData = useSyncExternalStore(routing.subscribe, routing.getSnapshot);
  const mutationEvents = useListenForMutationEvents();

  const [currentAppId, setCurrentAppId] = useState('');

  let timeoutHandle;

  if (title) {
    timeoutHandle = setTimeout(() => {
      setTitle('');
    }, 8000);
  }

  useEffect(() => {
    if (!title) {
      setNotifType(NotificationTypes.Success);
      setDescription('');
      setCurrentAppId('');
      setAppTitle(null);
    }
  }, [title]);

  const defaultInstalledApps = useMemo(() => {
    return routeData?.byArea[MenuItemAreaType.AppArea];
  }, [routeData]);

  useEffect(() => {
    if (mutationEvents) {
      const { messageObj, appid, success, pending } = mutationEvents;

      if (currentAppId !== appid) {
        clearTimeout(timeoutHandle);
        setCurrentAppId(appid);
        setTitle('');
        setAppTitle(messageObj?.app);
      }
      if (pending && messageObj?.pending) {
        setTitle(messageObj?.pending);
        setNotifType(NotificationTypes.Info);
      }
      if (success && messageObj?.success) {
        setTitle(messageObj?.success);
        setNotifType(NotificationTypes.Success);
      }
    }
  }, [currentAppId, mutationEvents, timeoutHandle]);

  useEffect(() => {
    const eventsSub = uiEvents.pipe(filterEvent(NotificationEvents.ShowNotification)).subscribe({
      next: (eventInfo: NotificationEvent) => {
        if (eventInfo.data && hasOwn(eventInfo.data, 'title')) {
          setTitle(eventInfo.data.title);
          setNotifType(eventInfo.data.type);
        }
        if (eventInfo.data && hasOwn(eventInfo.data, 'description')) {
          setDescription(eventInfo.data.description);
        }
        if (eventInfo.data && hasOwn(eventInfo.data, 'ctaLabel')) {
          setCTALabel(eventInfo.data.ctaLabel);
        }
        if (eventInfo.data && hasOwn(eventInfo.data, 'dismissable')) {
          setDismissable(eventInfo.data.dismissable);
        }
      },
    });

    return () => {
      if (eventsSub) {
        eventsSub.unsubscribe();
      }
    };
  }, [uiEvents]);

  const dismissHandler = () => {
    setTitle('');
    setNotifType(NotificationTypes.Success);
  };

  const findAppIcon = (appName: string) => {
    return defaultInstalledApps?.find(({ name }) => name === appName);
  };
  // @TODO: icon typings are generally wrong!
  const icon = (
    <AppIcon
      size="xs"
      accentColor={true}
      placeholderIcon={
        findAppIcon(appTitle)?.logo?.type === LogoTypeSource.ICON
          ? (findAppIcon(appTitle).logo?.value as ReactElement)
          : null
      }
    />
  );

  return (
    <Stack customStyle="z-50" fullWidth>
      {title && (
        <Snackbar
          title={
            appTitle ? (
              <Stack
                direction="row"
                align="center"
                justify="center"
                spacing="gap-x-2"
                padding={'pb-4'}
              >
                {findAppIcon(appTitle) && icon} {findAppIcon(appTitle)?.label}
              </Stack>
            ) : (
              title
            )
          }
          description={appTitle ? title : description}
          type={notifType}
          dismissable={dismissable}
          ctaLabel={ctaLabel}
          handleDismiss={dismissHandler}
          handleCTAClick={() => ({})}
        />
      )}
    </Stack>
  );
};

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders(SnackBarNotification),
  errorBoundary: (error, errorInfo, props: IRootExtensionProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(error)}, ${errorInfo}`);
    }
    return (
      <ErrorLoader
        type="script-error"
        title="Error in snackbar notification extension"
        details={error.message}
      />
    );
  },
});
