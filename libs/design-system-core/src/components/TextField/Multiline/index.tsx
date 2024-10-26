import React, { useState } from 'react';
import EditorMeter from '../../EditorMeter';
import Stack from '../../Stack';
import { getContainerClasses } from '../Input/getContainerClasses';
import { getInputClasses } from '../Input/getInputClasses';
import { MultlineProps } from '../types';
import { apply, tw } from '@twind/core';
import { forwardRef } from 'react';
import { getRadiusClasses } from '../../../utils/getRadiusClasses';

const MAX_LENGTH = 280;

export const Multiline: React.FC<MultlineProps> = forwardRef(
  ({ id, status, disabled, radius, ...rest }, ref) => {
    const [letterCount, setLetterCount] = useState(rest.value?.toString().length);
    const containerStyle = getContainerClasses(disabled, status);
    const textAreaStyle = getInputClasses(disabled, status);
    const radiusStyle = getRadiusClasses(radius);

    return (
      <Stack
        direction="row"
        customStyle={`${containerStyle} ${radiusStyle} pt-1 pb-2`}
        spacing="gap-x-2"
      >
        <textarea
          ref={ref}
          aria-labelledby={id}
          className={tw(apply(`resize-none w-full ${textAreaStyle}`))}
          maxLength={rest.maxLength ?? MAX_LENGTH}
          onChange={event => {
            setLetterCount(event.target.value.length);
            rest.onChange(event);
          }}
          {...rest}
        />
        <EditorMeter
          max={rest.maxLength ?? MAX_LENGTH}
          value={letterCount}
          background="grey6"
          customStyle="ml-auto mt-auto shrink-0"
        />
      </Stack>
    );
  },
);
