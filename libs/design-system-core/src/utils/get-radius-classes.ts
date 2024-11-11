import { Radius } from '../components/types/common.types';

export function getRadiusClasses(radius: Radius) {
  if (typeof radius === 'number') {
    return `rounded-[${radius / 16}rem]`;
  }

  if (typeof radius === 'object') {
    if (radius.top) {
      return `rounded-t-[${radius.top / 16}rem]`;
    }

    if (radius.bottom) {
      return `rounded-b-[${radius.bottom / 16}rem]`;
    }
  }

  if (typeof radius === 'string') return radius;

  return '';
}
