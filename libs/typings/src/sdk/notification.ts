export enum ChannelOptionIndexes {
  ANTENNA = 1,
  PROFILE = 2,
  VIBES = 3,
}
export type NotificationParsedMetaData = {
  data: NotificationMetaTypes;
  channelIndex: number;
};

export type UnknownMetaData = { [key: string]: unknown };

export type FollowNotificationMetaData = NotificationBaseMetaData & {
  type: 'following';
  follower: string;
};

export type ReflectionNotificationMetaData = NotificationBaseMetaData & {
  type: 'reflection';
  author: string;
  beamID: string;
  reflectionID: string;
};

export type MentionNotificationMetaData = NotificationBaseMetaData & {
  type: 'mention';
  author: string;
  beamID: string;
};

export type NotificationBaseMetaData = {
  appId: string;
};

export type NotificationMetaTypes =
  | UnknownMetaData
  | FollowNotificationMetaData
  | ReflectionNotificationMetaData
  | MentionNotificationMetaData;

export type ChannelOptionIndex =
  | ChannelOptionIndexes.ANTENNA
  | ChannelOptionIndexes.PROFILE
  | ChannelOptionIndexes.VIBES;
