import React, { SetStateAction, useEffect, useMemo } from 'react';

import { IMenuItem } from '@akashaorg/typings/lib/ui';

import Accordion from '@akashaorg/design-system-core/lib/components/Accordion';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';

import MenuItemLabel from './menu-item-label';
import MenuSubItems from './menu-sub-items';

export type ListSidebarAppsProps = {
  list: IMenuItem[];
  activeAccordionId: string;
  activeOption: IMenuItem;
  hasBorderTop?: boolean;
  setActiveAccordionId: React.Dispatch<SetStateAction<string>>;
  handleAccordionClick: (id: string) => void;
  onOptionClick: (menu: IMenuItem, submenu: IMenuItem) => void;
  onClickMenuItem?: (menuItem: IMenuItem, isMobile?: boolean) => void;
};

const getIsActiveMenu = (appName: string) => !!location.pathname.match(`/${appName}/`);

const ListSidebarApps: React.FC<ListSidebarAppsProps> = props => {
  const {
    list,
    activeAccordionId,
    activeOption,
    hasBorderTop = false,
    setActiveAccordionId,
    handleAccordionClick,
    onOptionClick,
    onClickMenuItem,
  } = props;

  const [appsWithSubroutes, otherApps]: IMenuItem[][] = useMemo(() => {
    return list.reduce(
      (acc, app) => {
        if (app.subRoutes.length > 0) {
          acc[0].push(app);
        } else {
          acc[1].push(app);
        }
        return acc;
      },
      [[], []],
    );
  }, [list]);

  useEffect(() => {
    /**
     * checks if any of the accordion's sub menu or app's sub route
     * is currently active, and keeps same open even after refresh
     */
    appsWithSubroutes.forEach((app, idx) =>
      app.subRoutes.some(() => location.pathname.includes(`/${app.name}`))
        ? setActiveAccordionId(`${app.name}${idx}`)
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuItemClick = (app: IMenuItem) => () => {
    /**
     * close any open accordion,
     * then call handler
     */
    setActiveAccordionId(null);
    onClickMenuItem(app);
  };

  const borderStyle = hasBorderTop ? 'border(t-1 grey9 dark:grey3)' : '';
  const activeMenuItemBg = 'bg(grey9 dark:grey1)';

  return (
    <Stack direction="column" customStyle={`py-2 ${borderStyle}`}>
      {appsWithSubroutes.map((app, idx) => {
        const isActiveMenu = getIsActiveMenu(app.name);
        return (
          <Accordion
            key={app.label + idx}
            accordionId={`${app.name}${idx}`}
            open={`${app.name}${idx}` === activeAccordionId}
            titleNode={<MenuItemLabel menuItem={app} isActiveMenu={isActiveMenu} />}
            contentNode={
              <MenuSubItems
                menuItem={app}
                activeOption={activeOption}
                onOptionClick={onOptionClick}
              />
            }
            handleClick={handleAccordionClick}
            customStyle={`py-2 px-6 bg(hover:grey8 dark:hover:grey5) ${
              isActiveMenu ? activeMenuItemBg : ''
            }`}
          />
        );
      })}

      {otherApps.map((app, idx) => {
        const isActiveMenu = getIsActiveMenu(app.name);
        return (
          <button key={app.label + idx} onClick={handleMenuItemClick(app)}>
            <Stack
              padding="py-2 px-6"
              customStyle={`bg(hover:grey8 dark:hover:grey5)  ${
                isActiveMenu ? activeMenuItemBg : ''
              }`}
            >
              <MenuItemLabel menuItem={app} isActiveMenu={isActiveMenu} />
            </Stack>
          </button>
        );
      })}
    </Stack>
  );
};

export default ListSidebarApps;
