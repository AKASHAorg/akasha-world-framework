import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/ro';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(relativeTime);
dayjs.extend(calendar);

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

const notificationFormatRelativeTime = (date: string, locale?: string) => {
  if (dayjs(date).isValid()) {
    let time = dayjs(date);
    if (/^[0-9]*$/.test(date)) {
      time = date.length > 10 ? dayjs(+date) : dayjs.unix(+date);
    }

    if(locale) {
      time = time.locale(locale);
    }

    const now = dayjs();
    if (time.isSame(now, 'day')) {
      // If the date is today
      return time.fromNow();
    } else if (time.isSame(now.subtract(1, 'day'), 'day')) {
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

export { formatDate, formatDateShort, formatRelativeTime, notificationFormatRelativeTime };
