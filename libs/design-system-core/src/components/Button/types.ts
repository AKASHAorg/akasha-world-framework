import { LegacyRef } from 'react';
import { BasicSize, BreakPointSize, Color } from '../types/common.types';

export type ButtonProps = {
  label?: string;
  icon?: React.ReactElement;
  iconDirection?: 'left' | 'right';
  size?: ButtonSize;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
  greyBg?: boolean;
  plainIcon?: boolean;
  solidIcon?: boolean;
  plain?: boolean;
  breakPointSize?: BreakPointSize;
  active?: boolean;
  hover?: boolean;
  hoverColors?: { background?: Color; border?: Color; text?: Color; icon?: Color };
  ref?: LegacyRef<HTMLButtonElement>;
  customStyle?: string;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export type Variant = 'primary' | 'secondary' | 'text';

export type ButtonSize = Exclude<BasicSize, 'xl'>;
