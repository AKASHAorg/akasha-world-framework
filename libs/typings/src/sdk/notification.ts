import * as PushProtocol from '@pushprotocol/restapi';
import { z } from 'zod';

export type Setting = {
  name: string;
  enabled: boolean;
};

export const InitializeOptionsSchema = z
  .object({
    readonly: z.boolean(),
  })
  .default({
    readonly: true,
  });

export type InitializePushProtocolOptions = z.infer<typeof InitializeOptionsSchema>;

const NotificationSettingTypeSchema = z.object({
  type: z.number(),
  default: z.boolean(),
  description: z.string(),
});

export const ChannelInfoResponseSchema = z.object({
  channel_settings: z.array(NotificationSettingTypeSchema),
  channel: z.string(),
}).transform(data => {
  const { channel_settings, ...rest } = data;
  return {
      ...rest,
      channelSettings: channel_settings,
  };
});



export type ChannelInfo = z.infer<typeof ChannelInfoResponseSchema>;
