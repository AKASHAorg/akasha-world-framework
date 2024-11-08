import React, { forwardRef, HTMLAttributes } from 'react';
import { apply, tw } from '@twind/core';
import { ButtonIcon } from '../button-icon';
import { ButtonProps, ButtonSize } from '../types';
import { ArrowPathIcon } from '../../Icon/hero-icons-outline';
import { getContainerClasses } from '../getContainerClasses';

type IconOnlyButtonProps = {
  icon: ButtonProps['icon'];
  solidIcon: ButtonProps['solidIcon'];
  size: ButtonProps['size'];
  variant: ButtonProps['variant'];
  loading: ButtonProps['loading'];
  greyBg: ButtonProps['greyBg'];
  plainIcon: ButtonProps['greyBg'];
  disabled: ButtonProps['disabled'];
  breakPointSize: ButtonProps['breakPointSize'];
  customStyle: ButtonProps['customStyle'];
  active: ButtonProps['active'];
  hover: ButtonProps['hover'];
  hoverColors: ButtonProps['hoverColors'];
  ref?: ButtonProps['ref'];
};

export const IconOnlyButton: React.FC<IconOnlyButtonProps & HTMLAttributes<HTMLButtonElement>> =
  forwardRef(
    (
      {
        icon,
        solidIcon,
        size,
        variant,
        loading,
        greyBg,
        plainIcon,
        breakPointSize,
        disabled,
        customStyle = '',
        active,
        hover,
        hoverColors,
        ...rest
      },
      ref,
    ) => {
      const containerStyle = plainIcon
        ? ''
        : getContainerClasses({
            variant,
            loading,
            greyBg,
            disabled,
            active,
            hover,
            hoverColors,
          });

      const breakPointStyle = breakPointSize
        ? BUTTON_SIZE_MAP_BY_BREAKPOINT(breakPointSize.breakPoint)[breakPointSize.size]
        : '';

      const plainIconStyle = plainIcon ? 'h-auto w-auto' : '';

      return (
        <button
          ref={ref}
          type="button"
          className={tw(
            apply`flex ${plainIcon ? '' : 'justify-center'} items-center group rounded-full ${containerStyle} ${BUTTON_SIZE_MAP[size]} ${breakPointStyle} ${plainIconStyle} ${customStyle}`,
          )}
          disabled={disabled}
          {...rest}
        >
          <ButtonIcon
            size={size}
            icon={loading ? <ArrowPathIcon /> : icon}
            solid={solidIcon}
            variant={variant}
            greyBg={greyBg}
            loading={loading}
            breakPointSize={breakPointSize}
            disabled={disabled}
          />
        </button>
      );
    },
  );

const BUTTON_SIZE_MAP: Record<ButtonSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

const BUTTON_SIZE_MAP_BY_BREAKPOINT = (breakPoint: string): Record<ButtonSize, string> => ({
  xs: `${breakPoint}:h-6 ${breakPoint}:w-6`,
  sm: `${breakPoint}:h-8 ${breakPoint}:w-8`,
  md: `${breakPoint}:h-12 ${breakPoint}:w-12`,
  lg: `${breakPoint}:h-14 ${breakPoint}:w-14`,
});
