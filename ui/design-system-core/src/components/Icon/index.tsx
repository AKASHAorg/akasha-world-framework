import React from 'react';

import { IconType } from '@akashaorg/typings/lib/ui';

import Stack from '../Stack';

import { PassedIcon } from './passed-icon';

import { BasicIconSize, BasicSize, BreakPointSize, Color } from '../types/common.types';
import { getWidthClasses, getHeightClasses, getColorClasses } from '../../utils';

export interface IconProps {
  color?: Color;
  ref?: React.Ref<HTMLDivElement>;
  type: IconType;
  size?: BasicIconSize;
  breakPointSize?: BreakPointSize;
  accentColor?: boolean;
  disabled?: boolean;
  hover?: boolean;
  testId?: string;
  customStyle?: string;
  hoverColor?: Color;
  solid?: boolean;
  rotateAnimation?: boolean;
}

const fillOnlyIcons: IconType[] = [
  'akasha',
  'discord',
  'telegram',
  'twitter',
  'widget',
  'metamask',
];

const Icon: React.FC<IconProps> = props => {
  const {
    type,
    ref,
    accentColor = false,
    size = 'md',
    breakPointSize,
    color,
    disabled,
    hover,
    testId,
    customStyle = '',
    hoverColor,
    solid = false,
    rotateAnimation = false,
  } = props;

  const breakPointStyle = breakPointSize
    ? ICON_SIZE_MAP_BY_BREAKPOINT(breakPointSize.breakPoint)[breakPointSize.size]
    : '';

  const sizeStyle =
    typeof size === 'object'
      ? `${getWidthClasses(size?.width)} ${getHeightClasses(size?.height)}`
      : `${ICON_SIZE_MAP[size]} ${breakPointStyle}`;

  const isFillOnlyIcon = fillOnlyIcons.includes(type) || solid;

  const baseStyle = `select-none ${
    hover
      ? `cursor-pointer ${getColorClasses(
          hoverColor,
          isFillOnlyIcon ? 'group-hover:[&>*]:fill' : 'group-hover:[&>*]:stroke',
        )}`
      : ''
  }`;

  let colorStyle: string;
  if (color) {
    colorStyle = `${getColorClasses(color, isFillOnlyIcon ? '[&>*]:fill' : '[&>*]:stroke')}`;
  } else {
    colorStyle = isFillOnlyIcon
      ? '[&>*]:fill-black dark:[&>*]:fill-white'
      : '[&>*]:stroke-black dark:[&>*]:stroke-white';
  }

  const accentColorStyle = accentColor
    ? `${
        isFillOnlyIcon
          ? '[&>*]:fill-secondaryLight dark:[&>*]:fill-secondaryDark'
          : '[&>*]:stroke-secondaryLight dark:[&>*]:stroke-secondaryDark'
      }`
    : '';

  // Note: setting accentColor to true will overrride other color styles
  const activeIconColorStyle = accentColor ? accentColorStyle : colorStyle;

  const disabledStyle = disabled ? 'opacity-50' : '';

  const rotateStyle = rotateAnimation ? 'animate-spin' : '';

  const iconStyle = `${baseStyle} ${activeIconColorStyle} ${sizeStyle} ${disabledStyle} ${rotateStyle}`;

  return (
    <Stack ref={ref} customStyle={customStyle}>
      <PassedIcon customStyle={iconStyle} testId={testId} type={type} solid={solid} />
    </Stack>
  );
};

const ICON_SIZE_MAP: Record<BasicSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-7 w-7',
};

const ICON_SIZE_MAP_BY_BREAKPOINT = (breakPoint: string): Record<BasicSize, string> => ({
  xs: `${breakPoint}:h-3 ${breakPoint}:w-3`,
  sm: `${breakPoint}:h-4 ${breakPoint}:w-4`,
  md: `${breakPoint}:h-5 ${breakPoint}:w-5`,
  lg: `${breakPoint}:h-6 ${breakPoint}:w-6`,
  xl: `${breakPoint}:h-7 ${breakPoint}:w-7`,
});

export default Icon;
