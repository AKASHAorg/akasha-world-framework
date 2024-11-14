import * as React from 'react';
import { apply, tw } from '@twind/core';

import { LogoSourceType } from '@akashaorg/typings/lib/ui';

import Stack from '../Stack';

import IconByType from './icon-by-type';
import { BasicIconSize, BasicSize, BreakPointSize, Color, Radius } from '../types/common.types';
import {
  getWidthClasses,
  getHeightClasses,
  getElevationClasses,
  getRadiusClasses,
  getColorClasses,
} from '../../utils';
import { IconProps } from '../Icon';

export type AppIconProps = {
  appImg?: LogoSourceType;
  placeholderIcon: React.ReactElement;
  solid?: boolean;
  accentColor?: boolean;
  // props for notifications icon
  stackedIcon?: boolean;
  hasNewNotifs?: boolean;
  size?: BasicIconSize;
  iconSize?: IconProps['size'];
  breakPointSize?: BreakPointSize;
  hover?: boolean;
  active?: boolean;
  iconColor?: Color;
  background?: Color;
  backgroundSize?: number | { width: number; height: number };
  radius?: Radius;
  customStyle?: string;
};

/**
 * An AppIcon component provides a fast and easy way to include a custom app icon
 * for your application.
 * You can easily customize its icon, size, border, background color, etc. and
 * apply custom styling using the corresponding props. A boolean `hasNewNotifs` prop can
 * also be passed to indicate whether that app has new notifications.
 * #### Usage
 * @example
 * ```tsx
 *  <AppIcon
 *    placeholderIcon={<Walletconnect />}
 *    background={{ gradient: 'gradient-to-b', from: 'orange-50', to: 'orange-200' }}
 *    radius={24}
 *    size={{ width: 80, height: 80 }}
 *    backgroundSize={80}
 *    iconColor="self-color"
 *   />
 * ```
 **/
//@TODO: revisit implementation of AppIcon component(it may well be removed)
const AppIcon: React.FC<AppIconProps> = props => {
  const {
    appImg,
    placeholderIcon,
    solid,
    size = 'md',
    iconSize,
    breakPointSize,
    accentColor,
    stackedIcon,
    hasNewNotifs,
    hover,
    active,
    iconColor,
    background,
    backgroundSize,
    radius,
    customStyle = '',
  } = props;

  const breakPointStyle = breakPointSize
    ? APP_ICON_CONTAINER_SIZE_MAP_BY_BREAKPOINT(breakPointSize.breakPoint)[breakPointSize.size]
    : '';

  const sizeStyle = `${
    typeof size === 'object'
      ? `${getWidthClasses(size?.width)} ${getHeightClasses(size?.height)}`
      : APP_ICON_CONTAINER_SIZE_MAP[size]
  } ${breakPointStyle}`;

  const hoverStyle = hover
    ? `${`hover:${getElevationClasses('4')}`} ${`group-hover:${getElevationClasses('4')}`}`
    : '';

  const activeStyle = active ? 'bg-secondaryLight/30 hover:bg-secondaryDark' : '';
  const iconContainerRadius = radius ? getRadiusClasses(radius) : '';
  const iconContainerBackgroundSize = backgroundSize
    ? `${getWidthClasses(
        typeof backgroundSize === 'object' ? backgroundSize.width : backgroundSize,
      )} ${getHeightClasses(
        typeof backgroundSize === 'object' ? backgroundSize.height : backgroundSize,
      )}`
    : '';
  const iconContainerBackground = background ? getColorClasses(background, 'bg') : '';
  const iconContainerStyle = apply`group relative rounded-full bg-grey9 dark:bg-grey3 ${sizeStyle} ${hoverStyle} ${activeStyle} ${iconContainerBackground} ${iconContainerRadius} ${iconContainerBackgroundSize} ${customStyle}`;
  const notifyStyle =
    typeof size === 'object'
      ? `${getWidthClasses(size?.width)} ${getHeightClasses(size?.height)}`
      : NOTIFY_MAP[size];

  if (stackedIcon)
    return (
      <Stack align="center" justify="center" customStyle={iconContainerStyle}>
        <IconByType
          appImg={appImg}
          size={iconSize ?? size}
          breakPointSize={breakPointSize}
          placeholderIcon={placeholderIcon}
          solid={solid}
          accentColor={accentColor}
          color={iconColor}
        />
        {hasNewNotifs && (
          <div className={tw(`rounded-full absolute top-0  bg-secondaryDark ${notifyStyle})`)} />
        )}
      </Stack>
    );

  return (
    <Stack align="center" justify="center" customStyle={iconContainerStyle}>
      <IconByType
        appImg={appImg}
        size={iconSize ?? size}
        breakPointSize={breakPointSize}
        placeholderIcon={placeholderIcon}
        solid={solid}
        accentColor={accentColor}
        color={iconColor}
      />
    </Stack>
  );
};

const APP_ICON_CONTAINER_SIZE_MAP: Record<BasicSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
};

const APP_ICON_CONTAINER_SIZE_MAP_BY_BREAKPOINT = (
  breakPoint: string,
): Record<BasicSize, string> => ({
  xs: `${breakPoint}:h-6 ${breakPoint}:w-6`,
  sm: `${breakPoint}:h-8 ${breakPoint}:w-8`,
  md: `${breakPoint}:h-10 ${breakPoint}:w-10`,
  lg: `${breakPoint}:h-12 ${breakPoint}:w-12`,
  xl: `${breakPoint}:h-14 ${breakPoint}:w-14`,
});

const NOTIFY_MAP: Record<BasicSize, string> = {
  xs: 'right-[0.1875rem] w-1 h-1',
  sm: 'right-[0.1875rem] w-2 h-2',
  md: 'right-[0.125rem] w-3 h-3',
  lg: 'right-1.5 w-3 h-3',
  xl: 'right-2 w-3 h-3',
};

export default AppIcon;
