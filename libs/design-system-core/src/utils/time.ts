import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/ro';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
import isYesterday from 'dayjs/plugin/isYesterday';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(isYesterday);
dayjs.extend(isToday);

const formatDate = (date: string, format = 'D MMM YYYY  H[h]mm', locale?: string) => {
  if (dayjs(date).isValid()) {
    let time = dayjs(date);
    if (/^[0-9]*$/.test(date)) {
      time = date.length > 10 ? dayjs(+date) : dayjs.unix(+date);
    }
    if (locale) {
      return time.locale(locale).format(format);
    }
    return time.format(format);
  }
  return '';
};

const formatDateShort = (date: string, locale?: string) => {
  if (dayjs(date).isValid()) {
    let time = dayjs(date);
    if (/^[0-9]*$/.test(date)) {
      time = date.length > 10 ? dayjs(+date) : dayjs.unix(+date);
    }
    if (locale) {
      return time.locale(locale).format('D MMMM YYYY');
    }
    return time.format('D MMMM YYYY');
  }
  return '';
};

const formatRelativeTime = (date: string, locale?: string) => {
  if (dayjs(date).isValid()) {
    let time = dayjs(date);
    if (/^[0-9]*$/.test(date)) {
      time = date.length > 10 ? dayjs(+date) : dayjs.unix(+date);
    }

    if (locale) {
      return time.locale(locale).fromNow();
    }
    return time.fromNow();
  }
  return '';
};
/**
 * Returns the date in format: 'DD MMM HH:mm'
 * If the date is today it returns the hours or minutes passed,
 * If the date is yesterday then it returns this format: [Yesterday] HH:mm
 */
const formatRelativeDateTime = (date: string, locale?: string) => {
  if (dayjs(date).isValid()) {
    let time = dayjs(date);
    if (/^[0-9]*$/.test(date)) {
      time = date.length > 10 ? dayjs(+date) : dayjs.unix(+date);
    }

    if (locale) {
      time = time.locale(locale);
    }

    if (time.isToday()) {
      // If the date is today
      return time.fromNow();
    } else if (time.isYesterday()) {
      // If the date is yesterday
      return time.calendar(null, {
        lastDay: '[Yesterday] HH:mm',
      });
    } else {
      // If the date is before yesterday
      return time.format('DD MMM HH:mm');
    }
  }
  return '';
};

export { formatDate, formatDateShort, formatRelativeTime, formatRelativeDateTime };
