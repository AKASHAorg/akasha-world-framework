export function getWidthClasses(width: string | number) {
  if (typeof width === 'string') {
    return width;
  }

  if (typeof width === 'number') return `w-[${width / 16}rem]`;

  return '';
}
