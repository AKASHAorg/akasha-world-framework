import React from 'react';
import { tw } from '@twind/core';

import { IMenuItem } from '@akashaorg/typings/ui';
import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { ButtonProps } from '@akashaorg/design-system-core/lib/components/Button/types';
import Text from '@akashaorg/design-system-core/lib/components/Text';

import ListSidebarApps from './list-sidebar-apps';
import { Profile } from '@akashaorg/typings/sdk/graphql-types-new';

export interface ISidebarProps {
  worldAppsTitleLabel: string;
  poweredByLabel: string;
  userInstalledAppsTitleLabel: string;
  userInstalledApps: IMenuItem[];
  exploreButtonLabel: string;
  worldApps: IMenuItem[];
  allMenuItems: IMenuItem[];
  activeApps?: string[];
  currentRoute?: string;
  loggedProfileData?: Omit<Profile, 'followers' | 'did'> & { did: { id: string } };
  isLoggedIn: boolean;
  hasNewNotifs?: boolean;
  loadingUserInstalledApps: boolean;
  versionURL?: string;
  versionLabel?: string;
  // handlers
  onBrandClick?: () => void;
  onSidebarClose: () => void;
  onClickMenuItem: (appName: string, route: string) => void;
  onClickExplore: () => void;
  menuItem: React.ReactElement;

  title: string;
  subtitle: string;
  ctaText: string;
  ctaButtonLabel: string;
  footerLabel: string;
  footerIcons: { name: ButtonProps['icon']; link: string }[];
  onLoginClick?: () => void;
}

const Sidebar: React.FC<ISidebarProps> = props => {
  const {
    userInstalledApps,
    worldApps,
    allMenuItems,
    currentRoute,
    loggedProfileData,
    activeApps,

    title,
    subtitle,
    ctaText,
    ctaButtonLabel,
    footerLabel,
    footerIcons,

    onSidebarClose,
    onClickMenuItem,
    onLoginClick,
  } = props;

  const [currentAppData, setCurrentAppData] = React.useState<IMenuItem | null>(null);
  const [activeOption, setActiveOption] = React.useState<IMenuItem | null>(null);

  React.useEffect(() => {
    if (allMenuItems && currentRoute) {
      const [, , , ...path] = currentRoute.split('/');

      const activeApp = allMenuItems.find(menuItem => activeApps?.includes?.(menuItem.name));
      if (activeApp && activeApp.index !== currentAppData?.index) {
        setCurrentAppData(activeApp);
      }
      // set the subroute
      if (path.length && currentRoute !== activeOption?.route) {
        const currentOption = activeApp?.subRoutes?.find(
          menuItem => menuItem.route === `/${path.join('/')}`,
        );
        if (currentOption && currentOption.index !== activeOption?.index) {
          setActiveOption(currentOption);
        }
      }
    }
  }, [currentRoute, allMenuItems, currentAppData, activeOption, activeApps]);

  const handleAppIconClick = (menuItem: IMenuItem, isMobile?: boolean) => {
    if (menuItem.subRoutes && menuItem.subRoutes.length === 0) {
      // if the current app has no subroutes, set as active and redirect to its route
      setCurrentAppData(menuItem);
      setActiveOption(null);
      onClickMenuItem(menuItem.name, menuItem.route);
      if (isMobile) {
        onSidebarClose();
      }
    }
  };

  const handleOptionClick = (
    menuItem: IMenuItem,
    subrouteMenuItem: IMenuItem,
    isMobile?: boolean,
  ) => {
    setCurrentAppData(menuItem);
    setActiveOption(subrouteMenuItem);
    onClickMenuItem(menuItem.name, subrouteMenuItem.route);
    if (isMobile) {
      onSidebarClose();
    }
  };

  return (
    <div
      className={tw(
        'max-w-[19.5rem] w-[19.5rem] h-[100vh] xl:max-h-[calc(100vh - 20px)] bg-white dark:bg-grey2 border-1 border-grey8 dark:border-none rounded-r-2xl xl:rounded-2xl',
      )}
    >
      <div className={tw('flex flex-row p-4 border-b-1 border-grey8')}>
        <div className={tw('w-fit h-fit mr-2')}>
          <Avatar ethAddress={loggedProfileData.name} src={loggedProfileData?.avatar.default.src} />
        </div>
        <div className={tw('w-fit')}>
          <Text customStyle="font-bold">{title}</Text>
          <Text variant="footnotes2" customStyle="text-grey5">
            {subtitle}
          </Text>
        </div>
        <div className={tw('w-fit h-fit ml-6 self-end')}>
          <Button icon="BoltIcon" variant="primary" iconOnly={true} onClick={onLoginClick} />
        </div>
      </div>

      {/*
          this container will grow up to a max height of 100vh-345px.
          [345px] currently accounts for the height of other sections and paddings. Adjust accordingly, if necessary.
        */}
      <div className={tw('flex flex-col max-h-[calc(100vh - 345px)] overflow-auto')}>
        {/* container for world apps */}
        {worldApps?.length > 0 && (
          <ListSidebarApps
            list={worldApps}
            activeOption={activeOption}
            onOptionClick={handleOptionClick}
            onClickMenuItem={handleAppIconClick}
          />
        )}

        {/* container for user-installed apps */}
        {userInstalledApps?.length > 0 && (
          <ListSidebarApps
            list={userInstalledApps}
            activeOption={activeOption}
            hasBorderTop={true}
            onOptionClick={handleOptionClick}
            onClickMenuItem={handleAppIconClick}
          />
        )}
      </div>

      <div className={tw('flex flex-col px-8 py-4 bg-grey9 dark:bg-grey3')}>
        <Text variant="footnotes2" customStyle="text-grey5">
          {ctaText}
        </Text>
        <div className={tw('w-fit h-fit mt-6')}>
          <Button label={ctaButtonLabel} variant="primary" />
        </div>
      </div>

      <div className={tw('flex flex-col px-8 py-4')}>
        <Text variant="footnotes2" customStyle="text-grey5">
          {footerLabel}
        </Text>
        <div className={tw('flex w-fit h-fit mt-6')}>
          {footerIcons.map((icon, idx) => (
            <div key={icon.name + idx} className={tw('mr-4')}>
              <a href={icon.link} target="_blank" rel="noreferrer noopener">
                <Button icon={icon.name} variant="primary" greyBg={true} iconOnly={true} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
