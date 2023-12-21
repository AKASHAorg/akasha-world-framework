import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EventTypes, NotificationEvents, UIEventData } from '@akashaorg/typings/lib/ui';
import { useGetLogin, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import ErrorBoundary from '@akashaorg/design-system-core/lib/components/ErrorBoundary';
import Topbar from './topbar';
import {
  startWidgetsTogglingBreakpoint,
  startMobileSidebarHidingBreakpoint,
} from '@akashaorg/design-system-core/lib/utils/breakpoints';

const TopbarComponent: React.FC<unknown> = () => {
  const { uiEvents, layoutConfig, logger, worldConfig, encodeAppName, getRoutingPlugin } =
    useRootComponentProps();
  const { data } = useGetLogin();
  const location = useLocation();
  const historyCount = React.useRef(0);
  const isNavigatingBackRef = React.useRef(false);
  const isLoggedIn = !!data?.id;

  const { t } = useTranslation('ui-widget-topbar');

  // sidebar is open by default on larger screens >=1440px
  const [sidebarVisible, setSidebarVisible] = React.useState<boolean>(
    !window.matchMedia(startMobileSidebarHidingBreakpoint).matches,
  );

  // starting hiding widgets by default on screens <=768px
  const [widgetVisible, setWidgetVisible] = React.useState<boolean>(
    !window.matchMedia(startWidgetsTogglingBreakpoint).matches,
  );

  const uiEventsRef = React.useRef(uiEvents);

  // added for detecting snooze notification event
  const [snoozeNotifications, setSnoozeNotifications] = React.useState(false);

  // check if snooze notification option has already been set
  React.useEffect(() => {
    if (window.localStorage) {
      setSnoozeNotifications(JSON.parse(localStorage.getItem('notifications-snoozed')));
    }
  }, []);

  React.useEffect(() => {
    const eventsSub = uiEventsRef.current.subscribe({
      next: (eventInfo: UIEventData) => {
        if (eventInfo.event == NotificationEvents.SnoozeNotifications) {
          setSnoozeNotifications(true);
        }
        if (eventInfo.event == NotificationEvents.UnsnoozeNotifications) {
          setSnoozeNotifications(false);
        }
      },
    });

    return () => {
      if (eventsSub) {
        eventsSub.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // show or hide sidebar and widgets
  React.useEffect(() => {
    const eventsSub = uiEventsRef.current.subscribe({
      next: (eventInfo: UIEventData) => {
        if (eventInfo.event === EventTypes.HideSidebar) {
          setSidebarVisible(false);
        }
        if (eventInfo.event === EventTypes.ShowSidebar) {
          setSidebarVisible(true);
        }
        if (eventInfo.event === EventTypes.HideWidgets) {
          setWidgetVisible(false);
        }
        if (eventInfo.event === EventTypes.ShowWidgets) {
          setWidgetVisible(true);
        }
      },
    });

    return () => {
      if (eventsSub) {
        eventsSub.unsubscribe();
      }
    };
  }, []);

  const handleSidebarToggle = () => {
    uiEvents.next({
      event: sidebarVisible ? EventTypes.HideSidebar : EventTypes.ShowSidebar,
    });
  };
  // show or hide widgets

  const handleWidgetToggle = () => {
    uiEvents.next({
      event: widgetVisible ? EventTypes.HideWidgets : EventTypes.ShowWidgets,
    });
  };

  // back navigation functionality

  React.useEffect(function navigationEventListener() {
    const controller = new AbortController();
    const signal = controller.signal;
    window.addEventListener(
      'single-spa:before-routing-event',
      (evt: CustomEvent) => {
        const url = new URL(evt.detail.newUrl as string);
        const newUrl: string = url.origin + url.pathname;

        const url2 = new URL(evt.detail.oldUrl as string);
        const oldUrl: string = url2.origin + url2.pathname;

        if (isNavigatingBackRef.current) {
          isNavigatingBackRef.current = false;
          historyCount.current = historyCount.current - 1;
        } else if (newUrl !== oldUrl) {
          historyCount.current++;
        }
      },
      { signal },
    );
    return () => {
      controller.abort();
    };
  }, []);

  const handleBackClick = () => {
    if (historyCount.current > 0) {
      isNavigatingBackRef.current = true;
      history.back();
    }
  };

  const handleBrandClick = () => {
    if (!worldConfig.homepageApp) {
      return;
    }

    getRoutingPlugin().navigateTo({
      appName: worldConfig.homepageApp,
      getNavigationUrl: appRoutes => {
        if (appRoutes.hasOwnProperty('defaultRoute')) {
          // if the current pathname is the same as the one we want to navigate to,
          // it means that we want to scroll to the top of the page
          if (
            location.pathname ===
            `/${encodeAppName(worldConfig.homepageApp)}${appRoutes.defaultRoute}`
          ) {
            scrollTo(0, 0);
          }
          return appRoutes.defaultRoute;
        }
      },
    });
  };

  const handleNotificationClick = () => {
    getRoutingPlugin().navigateTo({
      appName: '@akashaorg/app-notifications',
      getNavigationUrl: routes => {
        return routes.myProfile;
      },
    });
  };

  const handleLoginClick = () => {
    getRoutingPlugin().navigateTo({
      appName: '@akashaorg/app-auth-ewa',
      getNavigationUrl: () => '/',
    });
  };

  return (
    <ErrorBoundary
      errorObj={{
        type: t('script-error'),
        title: t('Error in topbar widget'),
      }}
      logger={logger.error}
    >
      <Topbar
        isLoggedIn={isLoggedIn}
        sidebarVisible={sidebarVisible}
        onSidebarToggle={handleSidebarToggle}
        onAppWidgetClick={handleWidgetToggle}
        onNotificationClick={handleNotificationClick}
        onBackClick={handleBackClick}
        onLoginClick={handleLoginClick}
        currentLocation={location?.pathname}
        onBrandClick={handleBrandClick}
        modalSlotId={layoutConfig.modalSlotId}
        snoozeNotifications={snoozeNotifications}
      />
    </ErrorBoundary>
  );
};

export default TopbarComponent;
