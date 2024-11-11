import { Color, isStatusType, STATUS_TO_COLOR_CLASSES_MAP } from '../components/types/common.types';

export function getColorClasses(color: Color, directive: string) {
  if (isStatusType(color)) {
    return getBaseColorClasses(STATUS_TO_COLOR_CLASSES_MAP[color], directive);
  }

  return getBaseColorClasses(color, directive);
}

function getBaseColorClasses(color: Color, directive?: string) {
  if (color && typeof color === 'string' && isValidColor(color)) {
    return directive ? `${directive}-${color}` : color;
  }

  if (color && typeof color === 'object' && 'light' in color) {
    const light = color.light;
    const dark = color.dark;

    return directive ? `${directive}-${light} dark:${directive}-${dark}` : `${light} dark:${dark}`;
  }

  if (color && typeof color === 'object' && 'from' in color) {
    const gradient = color.gradient;
    const from = color.from;
    const via = color.via;
    const to = color.to;
    const viaStyle = via ? `via-${via}` : '';
    const viaDarkStyle = via ? `dark:via-${via}` : '';
    return `bg-${gradient} from-${from} ${viaStyle} to-${to} dark:from-${from} ${viaDarkStyle} dark:to-${to}`;
  }

  return '';
}

function isValidColor(color: string) {
  if (color.trim().includes(' ')) {
    throw new Error('Invalid color!');
  }

  return true;
}
