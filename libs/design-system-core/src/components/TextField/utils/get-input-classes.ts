import { Status } from '../../types/common.types';

export function getInputClasses(disabled: boolean, status: Status, readOnly?: boolean) {
  const defaultClasses = `peer focus:outline-none w-full bg-transparent text-[0.875rem] leading-[1.375rem] font-light`;
  if (disabled) {
    return `${defaultClasses} text(grey7 dark:grey2) placeholder(grey7 dark:grey2)`;
  }

  if (status) {
    return `${defaultClasses} text(grey5 dark:white) placeholder(grey5 dark:white)`;
  }

  if (readOnly) {
    return `${defaultClasses} text-grey7 placeholder-grey7`;
  }

  return `${defaultClasses} text(grey5 dark:grey6) placeholder(grey5 dark:grey6)`;
}
