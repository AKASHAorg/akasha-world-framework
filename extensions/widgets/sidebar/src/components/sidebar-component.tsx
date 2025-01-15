import React, { Suspense, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { EventTypes, MenuItemAreaType, IMenuItem } from '@akashaorg/typings/lib/ui';
import {
  useAccordion,
  useAkashaStore,
  useDismissedCard,
  useRootComponentProps,
} from '@akashaorg/ui-core-hooks';
import { startMobileSidebarHidingBreakpoint } from '@akashaorg/design-system-core/lib/utils/breakpoints';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import ErrorBoundary from '@akashaorg/design-system-core/lib/components/ErrorBoundary';
import {
  Discord,
  Github,
  Telegram,
  Twitter,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ListSidebarApps from './list-sidebar-apps';
import SidebarCTACard from './cta-card';
import SidebarHeader from './sidebar-header';
import FallbackHeader from './fallback-header';

const SidebarComponent: React.FC<unknown> = () => {
  const {
    logger,
    uiEvents,
    worldConfig: { defaultApps, socialLinks },
    getCorePlugins,
  } = useRootComponentProps();

  const {
    data: { authenticatedDID, isAuthenticating },
    authenticationStore,
  } = useAkashaStore();

  const { t } = useTranslation('ui-widget-sidebar');
  const [isMobile, setIsMobile] = useState(
    window.matchMedia(startMobileSidebarHidingBreakpoint).matches,
  );
  const routing = getCorePlugins().routing;
  const routeData = useSyncExternalStore(routing.subscribe, routing.getSnapshot);
  const [activeOption, setActiveOption] = useState<IMenuItem | null>(null);
  const [clickedOptions, setClickedOptions] = useState<{ name: string; route: IMenuItem }[]>([]);
  const isLoggedIn = !!authenticatedDID;

  const { activeAccordionId, setActiveAccordionId, handleAccordionClick } = useAccordion();
  const [dismissed, dismissCard] = useDismissedCard('@akashaorg/ui-widget-sidebar_cta-card');

  useEffect(() => {
    const mql = window.matchMedia(startMobileSidebarHidingBreakpoint);

    const resize = () => {
      setIsMobile(mql.matches);
    };

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  // sort according to worldConfig index
  const worldApps = useMemo(() => {
    return routeData?.byArea[MenuItemAreaType.AppArea]?.sort((a, b) => {
      if (defaultApps.indexOf(a.name) < defaultApps.indexOf(b.name)) {
        return -1;
      } else if (defaultApps.indexOf(a.name) > defaultApps.indexOf(b.name)) {
        return 1;
      }
      return 0;
    });
  }, [defaultApps, routeData]);

  const userInstalledApps = useMemo(() => {
    return routeData.byArea[MenuItemAreaType.UserAppArea];
  }, [routeData]);

  const handleNavigation = (appName: string, route: string) => {
    routing?.navigateTo({
      appName,
      getNavigationUrl: () => route,
    });
  };

  const handleProfileAvatarClick = (id: string) => {
    if (!id) {
      return;
    }
    routing?.navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: routes => `${routes.rootRoute}/${id}`,
    });

    if (isMobile) {
      handleSidebarClose();
    }
  };

  const handleClickExplore = () => {
    routing?.navigateTo({
      appName: '@akashaorg/app-extensions',
      getNavigationUrl: routes => routes.explore,
    });

    if (isMobile) {
      handleSidebarClose();
    }
  };

  const handleSidebarClose = () => {
    // emit HideSidebar event to trigger corresponding action in associated widgets
    uiEvents.next({
      event: EventTypes.HideSidebar,
    });
  };

  function handleLoginClick() {
    handleNavigation('@akashaorg/app-auth-ewa', '/');
    if (isMobile) {
      handleSidebarClose();
    }
  }

  function handleLogout() {
    authenticationStore.logout();
  }

  const handleLogoutClick = () => {
    handleLogout();
  };

  const handleAppIconClick = (menuItem: IMenuItem) => {
    if (menuItem.subRoutes && menuItem.subRoutes.length === 0) {
      setActiveOption(null);
      handleNavigation(menuItem.name, menuItem.route);
      if (isMobile) {
        handleSidebarClose();
      }
    }
  };

  const handleOptionClick = (menuItem: IMenuItem, subrouteMenuItem: IMenuItem) => {
    setClickedOptions(oldClickedOptions => [
      ...oldClickedOptions,
      { name: menuItem.name, route: subrouteMenuItem },
    ]);
    setActiveOption(subrouteMenuItem);
    handleNavigation(menuItem.name, subrouteMenuItem.route);
    if (isMobile) {
      handleSidebarClose();
    }
  };

  const handleBackNavEvent = () => {
    const matchedRoute = clickedOptions.find(option =>
      location.pathname.includes(`${option.name}${option.route?.route}`),
    );

    if (matchedRoute) setActiveOption(matchedRoute.route);
    else setActiveOption(null);
  };

  useEffect(() => {
    window.addEventListener('popstate', handleBackNavEvent);
    return () => window.removeEventListener('popstate', handleBackNavEvent);
  });

  /**
   * this assigns the corresponding icons to the social links from root components
   */
  const modSocialLinks = socialLinks.map(el => {
    if (el.icon === 'Github') return { ...el, icon: <Github /> };
    if (el.icon === 'Discord') return { ...el, icon: <Discord /> };
    if (el.icon === 'Telegram') return { ...el, icon: <Telegram /> };
    if (el.icon === 'Twitter') return { ...el, icon: <Twitter /> };
  });

  return (
    <ErrorBoundary
      errorObj={{
        type: 'script-error',
        title: t('Error in sidebar widget'),
      }}
      logger={logger}
    >
      <Card
        customStyle="w-[19.5rem] max-w-[19.5rem] max-h(screen xl:[calc(100vh-20px)]) h(full xl:fit)"
        radius="rounded-r-2xl xl:rounded-2xl"
        padding="p-0"
      >
        <Suspense
          fallback={<FallbackHeader authenticatedDID={authenticatedDID} isLoggedIn={isLoggedIn} />}
        >
          <SidebarHeader
            authenticatedDID={authenticatedDID}
            connectLabel={t('Connect')}
            cancelLabel={t('Cancel')}
            isLoggedIn={isLoggedIn}
            logoutClickHandler={handleLogoutClick}
            loginClickHandler={handleLoginClick}
            isAuthenticating={isAuthenticating}
            handleProfileAvatarClick={handleProfileAvatarClick}
          />
        </Suspense>
        {/*
          this container will grow up to a max height of 68vh, 32vh currently accounts for the height of other sections and paddings. Adjust accordingly, if necessary.
        */}
        <Stack direction="column" customStyle="overflow-auto">
          {/* container for world apps */}
          {worldApps?.length > 0 && (
            <ListSidebarApps
              list={worldApps}
              activeAccordionId={activeAccordionId}
              activeOption={activeOption}
              setActiveAccordionId={setActiveAccordionId}
              handleAccordionClick={handleAccordionClick}
              onOptionClick={handleOptionClick}
              onClickMenuItem={handleAppIconClick}
            />
          )}
          {/* container for user-installed apps */}
          {userInstalledApps?.length > 0 && (
            <ListSidebarApps
              list={userInstalledApps}
              activeAccordionId={activeAccordionId}
              activeOption={activeOption}
              setActiveAccordionId={setActiveAccordionId}
              handleAccordionClick={handleAccordionClick}
              hasBorderTop={true}
              onOptionClick={handleOptionClick}
              onClickMenuItem={handleAppIconClick}
            />
          )}
        </Stack>
        {!dismissed && (
          <SidebarCTACard onClickCTAButton={handleClickExplore} onDismissCard={dismissCard} />
        )}
        {modSocialLinks.length > 0 && (
          <Stack padding="px-8 py-4" customStyle="border-t-1 border(grey9 dark:grey3)">
            <Text variant="footnotes2">{t('Get in touch')}</Text>
            <Stack direction="row" spacing="gap-x-4" customStyle="w-fit h-fit mt-6">
              {modSocialLinks.map((socialLink, idx) => (
                <Link key={idx} to={socialLink.link} target="_blank">
                  <Button
                    icon={socialLink.icon}
                    solidIcon={idx > 0}
                    variant="primary"
                    greyBg={true}
                    iconOnly={true}
                  />
                </Link>
              ))}
            </Stack>
          </Stack>
        )}
      </Card>
    </ErrorBoundary>
  );
};
export default SidebarComponent;
