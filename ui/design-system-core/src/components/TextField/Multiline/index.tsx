import React, { useState } from 'react';
import EditorMeter from '../../EditorMeter';
import Stack from '../../Stack';
import { getContainerClasses } from '../Input/getContainerClasses';
import { getInputClasses } from '../Input/getInputClasses';
import { MultlineProps } from '../types';
import { tw } from '@twind/core';
import { forwardRef } from 'react';

const MAX_LENGTH = 280;

export const Multiline: React.FC<MultlineProps> = forwardRef(({ disabled, ...rest }, ref) => {
  const [letterCount, setLetterCount] = useState(0);
  const containerStyle = getContainerClasses(disabled);
  const textAreaStyle = getInputClasses(disabled);

  return (
    <Stack customStyle={`${containerStyle} py-2.5`} spacing="gap-x-2">
      <textarea
        className={tw(`resize-none w-full ${textAreaStyle}`)}
        maxLength={MAX_LENGTH}
        onChange={event => {
          setLetterCount(event.target.value.length);
        }}
        ref={ref}
        {...rest}
      ></textarea>
      <EditorMeter
        max={MAX_LENGTH}
        value={letterCount}
        background="grey6"
        customStyle="ml-auto mt-auto"
      />
    </Stack>
  );
});
