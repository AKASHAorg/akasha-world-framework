import * as React from 'react';
import { StyledDrop } from './styled-drop';

interface IBasicPopover {
  className?: string;
  children: any;
  closePopover: () => {};
  target: React.RefObject<any>;
  gap?: string;
}

const BasicPopover: React.FC<IBasicPopover> = ({ children, ...props }) => {
  const { className, target, closePopover, gap } = props;
  return (
    <StyledDrop
      overflow="hidden"
      gap={gap}
      target={target}
      align={{ top: 'bottom', right: 'left' }}
      onClickOutside={closePopover}
      onEsc={closePopover}
      className={className}
    >
      {children}
    </StyledDrop>
  );
};

export default BasicPopover;
