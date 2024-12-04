export enum ChannelOptionIndexes {
  ANTENNA = 1,
  PROFILE = 2,
  VIBES = 3,
}
export type NotificationParsedMetaData = {
  data: NotificationMetaTypes | string;
  channelIndex?: number;
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

export type UserSettingType = {
  index: number;
  appName: string;
  enabled: boolean;
  active?: boolean;
};
export type AdditionalMetadata = {
  data: string;
  type: string;
  domain: string;
};

export type PushOrgNotification = {
  payload_id: number;
  sender: string;
  epoch: string;
  payload: {
    data: {
      app: string;
      sid: string;
      url: string;
      acta: string;
      aimg: string;
      amsg: string;
      asub: string;
      icon: string;
      type: number;
      epoch: string;
      etime: string;
      hidden: string;
      silent: string;
      sectype: string | null;
      additionalMeta?: AdditionalMetadata;
      parsedMetaData?: NotificationParsedMetaData;
    };
    recipients: {
      [key: string]: string | null;
    };
    notification: {
      body: string;
      title: string;
    };
    verificationProof: string;
  };
  source: string;
  etime: string;
  sid: string | null;
  timestamp?: Date;
  isUnread?: boolean;
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
