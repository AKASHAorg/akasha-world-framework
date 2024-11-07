import React, { forwardRef } from 'react';
import Text, { TextProps } from '../Text';
import { tw, apply } from '@twind/core';
import { ArrowPathIcon } from '../Icon/hero-icons-outline';
import { ButtonIcon } from './button-icon';
import { IconOnlyButton } from './IconOnlyButton';
import { ButtonProps, ButtonSize } from './types';
import { getTextClasses } from './getTextClasses';
import { getContainerClasses } from './getContainerClasses';
import { getColorClasses } from '../../utils';

/**
 * A Button allows users to take actions when appropriate with a tap(on touch-screen devices)
 * or click of a mouse.
 * A Button component comes with three variants: primary, secondary (default), and text.
 * A Button component accepts all the props that a native html button accepts plus
 * additional customization props, such as those listed below:
 * @param label - button label (optional)
 * @param icon - React.ReactElement button icon if any (optional)
 * @param iconDirection - 'left' | 'right' (optional) where the icon will be placed
 * @param size - button size (optional)
 * @param variant - button variant (optional) the default is 'secondary'
 * @param disabled - boolean (optional) whether the button is disabled or not
 * @param loading - boolean (optional) whether to apply loading state to the button
 * @param iconOnly - boolean (optional) whether it is an icon-only button with no label
 * @param greyBg - boolean (optional) whether to apply grey background styling
 * @param plainIcon - boolean (optional) whether to apply plain-icon styling to the icon
 * @param solidIcon - boolean (optional) whether to apply solid-icon styling to the icon
 * @param plain - boolean (optional) a plain button has no styling applied, can be used as a
 * click wrapper
 * @param breakPointSize - (optional) customize sizes for the break points
 * @param active - boolean (optional) whether the button is active
 * @param hover - boolean (optional)
 * @param hoverColors - (optional) styling for hover state
 * @param customStyle - (optional) custom styling if any
 * @param ref - (optional)
 *
 * @example
 * ```tsx
 *  <Button variant={'primary'} label={'Primary button'} size={'sm'} onClick={onclickHandler} />
 * ```
 **/
const Button: React.FC<ButtonProps> = forwardRef((props, ref) => {
  const {
    plain,
    icon,
    iconDirection = 'left',
    label,
    size = 'sm',
    variant = 'secondary',
    disabled = false,
    loading = false,
    iconOnly = false,
    greyBg = false,
    plainIcon = false,
    solidIcon = false,
    children,
    breakPointSize,
    customStyle = '',
    active,
    hover = plain ? false : true,
    hoverColors,
    ...rest
  } = props;

  if (plain) {
    const disabledStyle = disabled ? 'opacity-50' : '';
    const hoverStyle =
      !disabled && hover
        ? getColorClasses(
            hoverColors?.background
              ? hoverColors.background
              : {
                  light: 'secondaryLight/30',
                  dark: 'secondaryDark/30',
                },
            'hover:bg',
          )
        : '';
    return (
      <button
        ref={ref}
        type="button"
        className={tw(apply`${disabledStyle} ${hoverStyle} ${customStyle}`)}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    );
  }

  if (iconOnly || size === 'xs') {
    if (!icon) return null;
    return (
      <IconOnlyButton
        icon={icon}
        solidIcon={solidIcon}
        size={size}
        variant={variant}
        loading={loading}
        greyBg={greyBg}
        plainIcon={plainIcon}
        disabled={disabled}
        breakPointSize={breakPointSize}
        customStyle={customStyle}
        active={active}
        hover={hover}
        hoverColors={hoverColors}
        ref={ref}
        {...rest}
      />
    );
  }

  const containerStyle = getContainerClasses({
    variant,
    loading,
    greyBg,
    disabled,
    active,
    hover,
    hoverColors,
  });
  const textStyle = getTextClasses({ variant, loading, disabled, hover, hoverColors, active });
  const breakPointStyle = breakPointSize
    ? BUTTON_SIZE_MAP_BY_BREAKPOINT(breakPointSize.breakPoint)[breakPointSize.size]
    : '';
  const buttonSizeStyle = variant !== 'text' ? BUTTON_SIZE_MAP[size] : '';
  const buttonPaddingStyle = variant !== 'text' ? BUTTON_SIZE_PADDING_MAP[size] : '';

  return (
    <button
      ref={ref}
      type="button"
      className={tw(
        apply`flex justify-center items-center gap-x-1 group ${containerStyle} ${buttonSizeStyle} ${breakPointStyle} ${buttonPaddingStyle} ${customStyle}`,
      )}
      {...rest}
      disabled={disabled}
    >
      {loading ? (
        <ButtonIcon
          size={size}
          icon={<ArrowPathIcon />}
          variant={variant}
          greyBg={greyBg}
          loading={true}
          breakPointSize={breakPointSize}
          disabled={disabled}
          customStyle={customStyle}
        />
      ) : (
        <>
          {icon && iconDirection === 'left' && (
            <ButtonIcon
              size={size}
              icon={icon}
              solid={solidIcon}
              variant={variant}
              greyBg={greyBg}
              loading={false}
              breakPointSize={breakPointSize}
              disabled={disabled}
              active={active}
              hoverColor={hover ? hoverColors?.icon : null}
            />
          )}
          <Text variant={BUTTON_SIZE_TEXT_MAP[size]} as="span" customStyle={textStyle}>
            {label}
          </Text>
          {icon && iconDirection === 'right' && (
            <ButtonIcon
              size={size}
              icon={icon}
              solid={solidIcon}
              variant={variant}
              greyBg={greyBg}
              loading={false}
              breakPointSize={breakPointSize}
              disabled={disabled}
              active={active}
              hoverColor={hover ? hoverColors?.icon : null}
            />
          )}
        </>
      )}
    </button>
  );
});

export const BUTTON_SIZE_MAP: Record<Exclude<ButtonSize, 'xs'>, string> = {
  sm: 'h-[1.875rem] rounded-[1.25rem]',
  md: 'h-10 rounded-3xl',
  lg: 'h-[3.625rem] rounded-[1.875rem]',
};

export const BUTTON_SIZE_PADDING_MAP: Record<Exclude<ButtonSize, 'xs'>, string> = {
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-6',
};

export const BUTTON_SIZE_TEXT_MAP: Record<Exclude<ButtonSize, 'xs'>, TextProps['variant']> = {
  sm: 'button-sm',
  md: 'button-md',
  lg: 'button-lg',
};

const BUTTON_SIZE_MAP_BY_BREAKPOINT = (
  breakPoint: string,
): Record<Exclude<ButtonSize, 'xs'>, string> => ({
  sm: `${breakPoint}:h-[1.875rem]`,
  md: `${breakPoint}:h-10`,
  lg: `${breakPoint}:h-[3.625rem]`,
});

export default Button;
