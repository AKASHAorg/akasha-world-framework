export function getHeightClasses(height: string | number) {
  if (typeof height === 'string') {
    return height;
  }

  if (typeof height === 'number') return `h-[${height / 16}rem]`;

  return '';
}
