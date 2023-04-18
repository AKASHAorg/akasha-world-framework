import React, { PropsWithChildren } from 'react';
import { apply, tw } from '@twind/core';

export interface DividerProps {
  customStyle?: string;
}

const Divider: React.FC<PropsWithChildren<DividerProps>> = ({ customStyle = '', children }) => {
  return (
    <div className={tw(apply`rounded-[1.25rem] h-px w-full bg-grey8 dark:bg-grey5 ${customStyle}`)}>
      {children}
    </div>
  );
};

export default Divider;
