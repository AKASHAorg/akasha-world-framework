import React from 'react';
import { tw } from '@twind/core';

import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Text from '@akashaorg/design-system-core/lib/components/Text';

import { IMenuItem } from '@akashaorg/typings/ui';

export interface IMenuItemLabelProps {
  menuItem: IMenuItem;
  isActive: boolean;
  hasNewNotifs?: boolean;
  onClickMenuItem?: (menuItem: IMenuItem, isMobile?: boolean) => void;
}

const MenuItemLabel: React.FC<IMenuItemLabelProps> = props => {
  const { menuItem, isActive, onClickMenuItem } = props;

  const handleClick = () => {
    if (typeof onClickMenuItem === 'function') {
      onClickMenuItem(menuItem);
    }
  };

  return (
    <div
      className={tw('flex flex-row items-center')}
      onClick={e => {
        e.preventDefault();
        handleClick();
      }}
    >
      <Avatar src={{ url: 'https://placebeard.it/360x360' }} />
      <Text
        variant="body1"
        className={`ml-2.5 ${isActive ? 'text-secondary' : 'text-black dark:text-white'}`}
      >
        {menuItem.label}
      </Text>
    </div>
  );
};

export default MenuItemLabel;
