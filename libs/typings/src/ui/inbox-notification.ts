export type InboxNotification = {
  title: string;
  body: string;
  date: string;
  isSeen: boolean;
  notificationTypeIcon: React.ReactElement;
  notificationTypeTitle: string;
  notificationAppIcon: React.ReactElement;
  ctaLinkTitle?: string;
  ctaLinkUrl?: string;
  appName?: string;
};
