import { AvatarSize, AvatarBorderSize, AvatarBorderColor } from '../components/Avatar';
import { Color } from '../components/types/common.types';

export const avatarSizesMap = {
  xxs: 'w-4 h-4',
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
  xxl: 'w-[7.5rem] h-[7.5rem]',
};

export const avatarBorderSizesMap = {
  xxs: '1',
  xs: '1',
  sm: '2',
  md: '4',
  lg: '8',
  xl: '[12px]',
  xxl: '[16px]',
};

export const avatarBorderColorsMap = {
  white: 'white',
  darkerBlue: 'grey2',
  accent: 'secondaryDark',
};

interface IGenerateAvatarContainerStyleProps {
  size: AvatarSize;
  border: AvatarBorderSize;
  borderColor: AvatarBorderColor;
  customStyle: string;
  isClickable: boolean;
  backgroundColor: { light: Color; dark: Color };
}

export const generateAvatarContainerStyle = ({
  size,
  border,
  borderColor,
  customStyle,
  isClickable,
  backgroundColor,
}: IGenerateAvatarContainerStyleProps) =>
  `box-border cursor-${isClickable ? 'pointer' : 'default'} select-none relative overflow-hidden ${
    avatarSizesMap[size]
  } rounded-full bg-(${backgroundColor?.light ?? 'white'} dark:${backgroundColor?.dark ?? 'white'}) border-${
    border ? avatarBorderSizesMap[border] : '0'
  } border-${borderColor ? avatarBorderColorsMap[borderColor] : 'transparent'} ${customStyle}`;

export const generateActiveOverlayClass = () =>
  'bg-grey6 opacity-25 z-10 absolute top-0 left-0 w-full h-full';
