import { Status } from '../components/types/common.types';

const STATUS_TO_BORDER_CLASSES_MAP: Record<Status, string> = {
  success: 'border border-success',
  error: 'border border(errorLight dark:errorDark)',
  warning: 'border border(warningLight dark:warningDark)',
};

export function getContainerClasses(
  disabled: boolean,
  status: Status,
  readOnly?: boolean,
  altBg?: boolean,
) {
  const defaultBgColors = `white dark:grey3`;
  const altBgColors = `grey9 dark:grey3`;
  const style = `rounded-lg bg(${altBg ? altBgColors : defaultBgColors}) border border(grey6 dark:none))`;

  if (!disabled && !readOnly && !status) {
    return `${style} focus-within:border focus-within:border-secondaryLight dark:focus-within:border-secondaryDark`;
  }

  if (disabled || readOnly) {
    return `${style} bg(grey8 dark:grey5)`;
  }

  if (status) {
    return `${style} ${STATUS_TO_BORDER_CLASSES_MAP[status]}`;
  }
}
