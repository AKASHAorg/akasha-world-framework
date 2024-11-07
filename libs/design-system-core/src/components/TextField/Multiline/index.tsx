import React, { forwardRef, useState } from 'react';
import { apply, tw } from '@twind/core';
import { MultlineProps } from '../types';
import EditorMeter from '../../EditorMeter';
import Stack from '../../Stack';
import { getContainerClasses } from '../../../utils/getContainerClasses';
import { getInputClasses } from '../../../utils/getInputClasses';
import { getRadiusClasses } from '../../../utils/getRadiusClasses';

const MAX_LENGTH = 280;

export const Multiline: React.FC<MultlineProps> = forwardRef((props, ref) => {
  const { id, status, disabled, radius, ...rest } = props;

  // internal state to update letter count as the user types
  const [letterCount, setLetterCount] = useState(rest.value?.toString().length);

  const containerStyle = getContainerClasses(disabled, status);
  const textAreaStyle = getInputClasses(disabled, status);
  const radiusStyle = getRadiusClasses(radius);

  return (
    <Stack
      direction="row"
      spacing="gap-x-2"
      padding="pt-1 px-2.5 pb-2"
      customStyle={`${containerStyle} ${radiusStyle}`}
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
});
