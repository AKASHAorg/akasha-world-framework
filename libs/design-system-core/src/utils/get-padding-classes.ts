import { Padding } from '../components/types/common.types';

export function getPaddingClasses(padding: Padding) {
  if (typeof padding === 'number') {
    return `p-[${padding / 16}rem]`;
  }

  if (typeof padding === 'object') return `px-[${padding.x / 16}rem] py-[${padding.y / 16}rem]`;

  if (typeof padding === 'string') return padding;

  return '';
}
