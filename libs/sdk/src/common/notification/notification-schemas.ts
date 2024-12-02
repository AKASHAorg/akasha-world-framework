import { z, boolean } from 'zod';
import { ChannelOptionIndexes } from '@akashaorg/typings/lib/sdk/notification';

export const setNewSettingsSchema = z.array(
  z.object({
    enable: boolean(),
  }),
);

export const InitializeOptionsSchema = z
  .object({
    readonly: z.boolean(),
  })
  .default({
    readonly: true,
  });

export type InitializeOptions = z.infer<typeof InitializeOptionsSchema>;

const NotificationSettingTypeSchema = z.object({
  index: z.number(),
  default: z.boolean(),
  description: z.string(),
});

export const ChannelInfoResponseSchema = z
  .object({
    channel_settings: z.string(),
    channel: z.string(),
  })
  .transform((data, ctx) => {
    try {
      const parsedData: ChannelSettings[] = JSON.parse(data.channel_settings);
      return parsedData;
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JSON string',
      });
      return z.NEVER;
    }
  });

export type ChannelSettings = z.infer<typeof NotificationSettingTypeSchema>;

export type UserSettingType = {
  index: number;
  appName: string;
  enabled: boolean;
};
export const ChannelUserSettingsSchema = z
  .object({
    channel: z.string(),
    user_settings: z.string().nullable(), // Allow null values
  })
  .transform((data, ctx) => {
    let userSettings: UserSettingType[] = [];
    if (data.user_settings !== null) {
      try {
        const parsedSettings = JSON.parse(data.user_settings);
        userSettings = parsedSettings.map(item => {
          return {
            index: item.index,
            appName: item.description,
            enabled: item.user,
          };
        });
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON string',
        });
        return z.NEVER;
      }
    }
    return {
      channel: data.channel,
      userSettings: userSettings,
    };
  });
export type ChannelUserSettingsType = z.infer<typeof NotificationSettingTypeSchema>;

export const MetaDataSchema = z.object({
  data: z.string(),
  type: z.string(),
});

export const ChannelOptionIndexSchema = z.nativeEnum(ChannelOptionIndexes);
