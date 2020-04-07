export const capitalize = (str?: string) => {
  return str!
    .split(' ')
    .map(subs => `${subs.substr(0, 1).toUpperCase()}${subs.substr(1, subs.length - 1)}`)
    .join(' ');
};

export const truncateMiddle = (str: string, startChars: number, endChars: number) => {
  let truncated = '';
  truncated += str.substring(0, startChars);
  truncated += '...';
  truncated += str.substring(str.length - endChars, str.length);
  return truncated;
};

/**
 * Check if is base64 encoded...
 * Simple check
 */
export const isBase64 = (str: string) => {
  if (str.length > 0 && typeof str === 'string') {
    if (str.startsWith('data:') && /;base64/.test(str)) {
      return true;
    }
    return false;
  }  if (typeof str !== 'string') {
    console.error('cannot check', typeof str, 'type');
    return false;
  }
  return false;
};
