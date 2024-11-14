import { ButtonProps } from './types';

import { getColorClasses } from '../../utils/get-color-classes';
interface ITextClasses {
  variant: ButtonProps['variant'];
  loading: ButtonProps['loading'];
  disabled: ButtonProps['disabled'];
  hover: ButtonProps['hover'];
  hoverColors: ButtonProps['hoverColors'];
  active: ButtonProps['active'];
}

export function getTextClasses({
  variant,
  loading,
  disabled,
  hover,
  hoverColors,
  active,
}: ITextClasses) {
  if (variant === 'text') {
    const textColorStyle = getColorClasses(
      {
        light: 'secondaryLight',
        dark: 'secondaryDark',
      },
      'text',
    );
    const hoverStyle =
      !loading && !disabled && hover
        ? getColorClasses(
            {
              light: 'secondaryDark',
              dark: 'white',
            },
            'group-hover:text',
          )
        : '';
    return `${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${textColorStyle} ${hoverStyle}`;
  }

  if (variant === 'primary') {
    return 'text-white';
  }

  if (variant === 'secondary') {
    const textColorStyle = getColorClasses(
      {
        light: 'secondaryLight',
        dark: active ? 'grey1' : 'secondaryDark',
      },
      'text',
    );
    const hoverTextColor = hoverColors?.text
      ? getColorClasses(hoverColors.text, 'group-hover:text')
      : 'dark:group-hover:text-white';
    const hoverStyle = !loading && !disabled && hover ? hoverTextColor : '';
    return `${textColorStyle} ${hoverStyle}`;
  }

  return '';
}
