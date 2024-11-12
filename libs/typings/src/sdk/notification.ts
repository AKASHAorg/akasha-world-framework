export enum ChannelOptionIndexes {
  ANTENNA = 1,
  PROFILE = 2,
  VIBES = 3,
}

export type NewFollowNotification = NotificationBasicData & {
  follower: string;
};

export type NewReflectionNotification = NewMentionNotification &
  NotificationBasicData & {
    reflectionID: string;
  };

export type NewMentionNotification = NotificationBasicData & {
  author: string;
  beamID: string;
};

type NotificationBasicData = {
  appId: string;
};
