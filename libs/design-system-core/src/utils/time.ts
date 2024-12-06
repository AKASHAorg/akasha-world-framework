import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/ro';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

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

export { formatDate, formatDateShort, formatRelativeTime };
