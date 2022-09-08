import * as React from 'react';
import { IMenuItem } from '@akashaorg/typings/ui';

import MenuItemLabel from './menu-item-label';
import MenuSubItems from './menu-sub-items';

import { DesktopAccordionPanel, MobileAccordionPanel } from './styled-sidebar';

export interface SidebarMenuItemProps {
  currentRoute?: string;
  size: string;
  index: number;
  menuItem: IMenuItem;
  onMenuItemClick: (menuItem: IMenuItem, shouldCloseSidebar: boolean) => void;
  onSubMenuItemClick: (
    menuItem: IMenuItem,
    subMenuItem: IMenuItem,
    shouldCloseSidebar?: boolean,
  ) => void;
  activeOption: IMenuItem;
  notificationsCount?: number;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = props => {
  const { currentRoute, menuItem, size, index, activeOption, notificationsCount } = props;

  const activePanel = !!currentRoute?.match(`/${menuItem.name}${menuItem?.route || ''}`);

  const handleAppIconClick = (shouldCloseSidebar?: boolean) => e => {
    e.preventDefault();
    props.onMenuItemClick(menuItem, shouldCloseSidebar);
  };

  const hasSubRoutes = menuItem.subRoutes?.length > 0;

  const handleSubrouteClick = (
    menuItem: IMenuItem,
    subMenuItem: IMenuItem,
    shouldCloseSidebar?: boolean,
  ) => {
    props.onSubMenuItemClick(menuItem, subMenuItem, shouldCloseSidebar);
  };
  return (
    <>
      <>
        <DesktopAccordionPanel
          size={size}
          key={`${index}-${menuItem.label}`}
          hasChevron={hasSubRoutes}
          forwardedAs={hasSubRoutes ? 'div' : 'a'}
          onClick={handleAppIconClick()}
          isActive={activePanel}
          label={
            <MenuItemLabel
              menuItem={menuItem}
              isActive={activePanel}
              hasNewNotifs={notificationsCount > 0}
            />
          }
          {...(!hasSubRoutes && {
            href: `${location.origin}/${menuItem.name}${menuItem.route ?? ''}`,
          })}
        >
          <MenuSubItems
            isMobile={false}
            menuItem={menuItem}
            activeOption={activeOption}
            onOptionClick={handleSubrouteClick}
          />
        </DesktopAccordionPanel>
      </>
      <>
        <MobileAccordionPanel
          size={size}
          key={`${index}-mobile-${menuItem.label}`}
          hasChevron={hasSubRoutes}
          forwardedAs={hasSubRoutes ? 'div' : 'a'}
          onClick={handleAppIconClick(true)}
          isActive={activePanel}
          label={
            <MenuItemLabel
              menuItem={menuItem}
              isActive={activePanel}
              hasNewNotifs={notificationsCount > 0}
            />
          }
          {...(!hasSubRoutes && {
            href: `${location.origin}/${menuItem.name}${menuItem.route ?? ''}`,
          })}
        >
          <MenuSubItems
            isMobile={true}
            menuItem={menuItem}
            activeOption={activeOption}
            onOptionClick={(menu, subMenu) => handleSubrouteClick(menu, subMenu, true)}
          />
        </MobileAccordionPanel>
      </>
    </>
  );
};

SidebarMenuItem.displayName = 'SidebarMenuItem';
export default SidebarMenuItem;
