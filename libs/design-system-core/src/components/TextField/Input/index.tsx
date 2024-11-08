import React, { forwardRef, useState } from 'react';
import { apply, tw } from '@twind/core';
import { InputProps } from '../types';
import { Color } from '../../types/common.types';
import Icon from '../../Icon';
import Stack from '../../Stack';
import { getIconClasses } from '../utils/get-icon-classes';
import { getInputClasses } from '../utils/get-input-classes';
import { getContainerClasses } from '../utils/get-container-classes';
import { getRadiusClasses } from '../../../utils';

export const Input: React.FC<InputProps> = forwardRef((props, ref) => {
  const { id, radius, status, iconLeft, iconRight, readOnly, disabled, altBg, fullWidth, ...rest } =
    props;

  // internal state to change icon color on focus/blur
  const [isFocused, setisFocused] = useState(false);

  const containerStyle = getContainerClasses(disabled, status, readOnly, altBg);
  const inputStyle = getInputClasses(disabled, status, readOnly);
  const iconColor = getIconClasses(status, disabled);
  const radiusStyle = getRadiusClasses(radius);

  const iconFocusColor: Color = { light: 'secondaryLight', dark: 'secondaryDark' };

  const handleFocus = () => setisFocused(true);
  const handleBlur = () => setisFocused(false);

  return (
    <Stack
      direction="row"
      align="center"
      spacing="gap-x-2"
      padding="py-2 px-2.5"
      fullWidth={fullWidth}
      customStyle={`${containerStyle} ${radiusStyle}`}
    >
      {iconLeft && (
        <Icon
          icon={iconLeft}
          color={isFocused && !status ? iconFocusColor : iconColor}
          disabled={disabled}
        />
      )}
      <input
        ref={ref}
        type="text"
        aria-labelledby={id}
        className={tw(apply`${inputStyle}`)}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {iconRight && (
        <Icon
          icon={iconRight}
          color={isFocused && !status ? iconFocusColor : iconColor}
          disabled={disabled}
        />
      )}
    </Stack>
  );
});
