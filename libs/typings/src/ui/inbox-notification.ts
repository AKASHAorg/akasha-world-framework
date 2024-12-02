export type InboxNotification = {
  title: string;
  body: string;
  date: string;
  isSeen: boolean;
  notificationTypeIcon: React.Component;
  notificationTypeTitle: string;
  notificationAppIcon: React.Component;
  ctaLinkTitle?: string;
  ctaLinkUrl?: string;
};
