import { Color, Status, STATUS_TO_COLOR_CLASSES_MAP } from '../../types/common.types';

export function getIconClasses(status: Status, disabled?: boolean): Color {
  if (disabled) {
    return { light: 'grey2', dark: 'grey7' };
  }

  if (status) {
    return STATUS_TO_COLOR_CLASSES_MAP[status];
  }
}
