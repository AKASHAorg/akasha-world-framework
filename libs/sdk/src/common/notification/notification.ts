import { PushStream } from '@pushprotocol/restapi/src/lib/pushstream/PushStream';
import {
  type ApiSubscriptionType,
  type UserSetting,
  type FeedsOptions,
  PushAPI,
  CONSTANTS,
} from '@pushprotocol/restapi/src/lib';

import Logging from '../../logging';
import EventBus from '../event-bus';
import AWF_Config from '../config';
import Web3Connector from '../web3.connector';
import { validate } from '../validator';

import { inject, injectable } from 'inversify';
import pino from 'pino';
import { z } from 'zod';

import {
  type AdditionalMetadata,
  type UserSettingType,
  type PushOrgNotification,
  type InitializeOptions,
  type ChannelSettings,
  InitializeOptionsSchema,
  ChannelInfoResponseSchema,
  ChannelUserSettingsSchema,
  ChannelOptionIndexSchema,
} from './notification-schemas';
import {
  TYPES,
  NOTIFICATION_EVENTS,
  type ChannelOptionIndex,
  type NotificationMetaTypes,
  type NotificationParsedMetaData,
} from '@akashaorg/typings/lib/sdk';

@injectable()
class NotificationService {
  private _log: pino.Logger;
  private _logFactory: Logging;
  private _globalChannel: EventBus;
  private readonly _web3: Web3Connector;
  private _config: AWF_Config;
  private _pushClient?: PushAPI;
  private _notificationsStream?: PushStream;
  private _notificationChannelId: string;
  public readonly latestSeenNotificationIDKey = 'latestSeenNotificationIDKey';
  public readonly notificationsEnabledStatusKey = 'notificationsEnabledStatusKey';

  constructor(
    @inject(TYPES.Log) logFactory: Logging,
    @inject(TYPES.EventBus) globalChannel: EventBus,
    @inject(TYPES.Config) config: AWF_Config,
    @inject(TYPES.Web3) web3: Web3Connector,
  ) {
    this._logFactory = logFactory;
    this._log = this._logFactory.create('Notification');
    this._globalChannel = globalChannel;
    this._config = config;
    this._web3 = web3;
    this._notificationChannelId = this._config.getOption('push_protocol_channel_id');
  }
  /**
   * Initialize the push client.
   * @param options - Initialization options with readonly set to true initialize the client in read-only mode without prompting for signature.
   * @throws Will throw an error if initialization fails or if the user declines the signing request.
   */
  @validate(InitializeOptionsSchema)
  async initialize(options: InitializeOptions = { readonly: true }) {
    if (!this._web3.state.connected) throw new Error('Must connect first to a web3 provider!');
    const { readonly } = options;

    const isWriteMode = !this._pushClient?.readmode();
    const clientIsAlreadyInitialized = this._pushClient && (isWriteMode || readonly);
    if (clientIsAlreadyInitialized) return;

    if (readonly) {
      // Readonly will not prompt the user with a signing process
      const address = this._web3.state.address;
      this._pushClient = await PushAPI.initialize({ account: address });
    } else {
      /**
       * We initialize with a signer in order to send notification or change the opt-in/settings
       * If the user clicks cancel, this method will throw an Error
       */
      await this.initializeWritableClient();
    }
  }

  checkIfNotificationsEnabled(): boolean {
    const isWriteMode = this._pushClient && !this._pushClient.readmode();
    return !!isWriteMode;
  }

  /**
   * Initializes and listens to notification events using PushProtocol.
   *
   * This method enables browser notifications, sets up a stream to receive
   * notifications, and displays the notifications
   * to the user. Additionally, it allows users to interact with notifications
   * through click events.
   * The `notificationsClient` must be initialized in read mode before invoking this method
   * @throws {Error} If the user refuses to accept browser notifications.
   * @throws {Error} If `notificationsClient` is not initialized in read mode.
   */
  async listenToNotificationEvents() {
    // Prompt the user to enable browser notifications.
    const accepted = await this.enableBrowserNotifications();
    if (!accepted) throw new Error('The user has refused to receive notifications');

    // Initialize a notification stream using the notifications client.
    this._notificationsStream = await this.notificationsClient.initStream(
      [CONSTANTS.STREAM.NOTIF],
      {
        filter: {
          channels: [this._notificationChannelId],
        },
      },
    );
    // Listen for incoming notifications on the specified stream.
    this._notificationsStream.on(CONSTANTS.STREAM.NOTIF, (data: any) => {
      // Extract notification data and create a browser Notification instance.
      const notification = new Notification(data?.message?.notification.body, {
        body: data?.message?.notification.body,
        icon: data?.channel?.icon,
        data: data?.message?.payload,
      });
      // Add a click event listener to the notification.
      notification.onclick = (event: any) => {
        event.preventDefault();
        window.open(data?.message?.payload?.cta || data?.channel?.url, '_blank');
      };
    });

    await this._notificationsStream.connect();
  }
  /**
   * Stops listening to notification events and disconnects the notification stream.
   * @throws {Error} If there is an issue disconnecting the notification stream.
   */
  async stopListeningToNotificationEvents() {
    if (this._notificationsStream) {
      await this._notificationsStream.disconnect();
      this._notificationsStream.removeAllListeners(CONSTANTS.STREAM.NOTIF);
      this._notificationsStream = undefined;
    }
  }
  /**
   * Retrieves the settings of notification channel.
   *
   * This method fetches information about a notification channel
   * validates the response against a predefined schema,
   * and returns the parsed channel settings.
   * The `notificationsClient` must be initialized in read mode before invoking this method
   * @returns {Promise<ChannelSettings[]>}
   * @throws {Error} If the `notificationsClient` is not initialized.
   * @throws {Error} If the channel response fails to parse against the schema.
   */
  async getSettingsOfChannel(): Promise<ChannelSettings[]> {
    const response = await this.notificationsClient.channel.info(this._notificationChannelId);
    const parseResponse = ChannelInfoResponseSchema.safeParse(response);
    if (!parseResponse.success) throw new Error('Channel Settings unable to parse');

    return parseResponse.data;
  }

  /**
   * Retrieves the user-specific settings for channel.
   *
   * This method fetches the user's subscription details validates the data against a predefined schema
   * and returns the parsed user settings.
   * The `notificationsClient` must be initialized in read mode before invoking this method
   * @returns {Promise<UserSettingType[] | null>} Null is resolved when user has not set any preferences yet
   * @throws {Error} If the `notificationsClient` is not initialized.
   * @throws {Error} If the subscription data fails to parse against the schema.
   */
  async getSettingsOfUser(): Promise<UserSettingType[] | null> {
    // Fetch Subscription of user
    const subscriptions: ApiSubscriptionType[] =
      await this.notificationsClient.notification.subscriptions({
        channel: this._notificationChannelId,
      });

    const channelSubscriptionInfo = subscriptions.find(
      subscription => subscription.channel === this._notificationChannelId,
    );
    if (!channelSubscriptionInfo) return null;

    // Parse the response
    const result = ChannelUserSettingsSchema.safeParse(channelSubscriptionInfo);
    if (!result.success) throw new Error('User Settings unable to parse');

    return result.data.userSettings;
  }

  /**
   * Updates the user's notification settings
   *
   * This method validates the new settings against the channel's available settings
   * to ensure all opt-ins are provided in the correct order. If the validation passes,
   * it updates the user's notification settings by subscribing with the new settings.
   *
   * **Important:**
   * - The 'subscribe' method of notification will prompt the user with the signing dialog.
   * - The `newSettings` array must contain all available opt-ins for the channel.
   * - The order of the opt-ins in the `newSettings` array must match the channel's settings.
   * - If either condition is not met, the PushProtocol will set all opt-ins to false.
   *
   * The `notificationsWriteClient` must be initialized before calling this method.
   *
   * @param {UserSetting[]} newSettings - An array of user settings to update. Each setting must align with the channel's available opt-ins and their order.
   *
   * @throws {Error} If the new settings do not match the length or order of the channel's settings.
   * @throws {Error} If the `notificationsWriteClient` is not initialized.
   * @returns {boolean} If true - success, false - error while setting settings
   */
  @validate(
    z.array(
      z.object({
        enabled: z.boolean(),
      }),
    ),
  )
  async setSettings(newSettings: UserSetting[]): Promise<boolean> {
    const settingsFromChannel = await this.getSettingsOfChannel();
    if (newSettings.length !== settingsFromChannel.length)
      // If the settings are sent without order or there are some opt-in missing PushProtocol sets all the opt-in to false
      throw new Error(
        'Settings must contain all the opt-ins available. Please be aware that the order of the opt-in sent matter',
      );
    const response = await this.notificationsWriteClient.notification.subscribe(this._notificationChannelId, {
      settings: newSettings,
    });

    return response.status === 204 ? true : false
  }

  /**
   * Get notifications and filter(optionaly) them by channel option/app indexes.
   * If there is no channel option/app index sent then it will return notificatons from all the options.
   * 'notificationsClient' must be initialized
   *  Efficiency Strategy:
   * Since PushProtocol does not support filtering the notification based on given options/apps.
   * For better performance, the method fetches notifications with a 100 limit per request and filters them locally.
   * The `startIndex` and `endIndex` are calculated to return only the notifications relevant to the requested page and limit.
   * @example
   * Example usage: Fetch notifications on page 1 with a limit of 50 notifications
   * and filter them to include only the "Antenna" and "Profile" apps.
   * const notifications = await getNotifications(1, 50, [ChannelOptionIndexes.ANTENNA, ChannelOptionIndexes.PROFILE]);
   * @returns {Promise<PushOrgNotification[]>} - Returns an array of filtered PushOrgNotifications based on the specified channel options.
   * @throws {Error} If the `notificationsClient` is not initialized.
   */
  @validate(
    z.number().positive().optional(),
    z.number().positive().max(100).optional(),
    z.array(ChannelOptionIndexSchema).optional(),
  )
  async getNotifications(
    page: number = 1,
    limit: number = 30,
    channelOptionIndexes: ChannelOptionIndex[] = [],
  ): Promise<PushOrgNotification[]> {
    if (!this._web3.state.address?.length) {
      return [];
    }
    // Fetch notifications
    const options: FeedsOptions = {
      channels: [this._notificationChannelId],
      account: this._web3.state.address,
      page: page,
      limit: limit,
      raw: true,
    };

    let notifications: PushOrgNotification[] = [];

    const latestStoredNotificationID = this.getLatestStoredNotificationID();
    // if there are no options/apps specified.
    if (!channelOptionIndexes.length) {
      notifications = await this.notificationsClient.notification.list('INBOX', options);
      for (const notification of notifications) {
        this.parseNotificationData(notification, latestStoredNotificationID);
      }
    } else {
      // Calculate the indices for slicing
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      // By fetching a high limit per page (limit: 100), the code minimizes http requests to pushProtocol service and only makes additional calls if necessary, which improves efficiency.
      options.page = 1;
      options.limit = 100;
      let hasMorePages = true;
      while (hasMorePages && notifications.length < endIndex) {
        const inboxNotifications: PushOrgNotification[] =
          await this.notificationsClient.notification.list('INBOX', options);

        // Filter notifications based on app options
        const filteredNotifications = inboxNotifications.filter(notification => {
          this.parseNotificationData(notification, latestStoredNotificationID);
          const parsedMetaData = notification.payload.data.parsedMetaData;
          return (
            parsedMetaData?.channelIndex !== undefined &&
            channelOptionIndexes.includes(parsedMetaData.channelIndex)
          );
        });
        notifications.push(...filteredNotifications);

        // if there is no notification fetched then it means that there is no pages
        hasMorePages = !!inboxNotifications.length;
        options.page++;
      }

      notifications = notifications.slice(startIndex, endIndex);
    }

    // Set latest seen Notification ID so we can know which notification marked as seen
    // Find the largest SID among fetched notifications
    const largestFetchedNotificationID = Math.max(
      ...notifications.map(n => n.payload_id),
      latestStoredNotificationID,
    );
    // Update local storage if there is a new largest notification ID
    if (largestFetchedNotificationID > latestStoredNotificationID) {
      this.setLatestStoredNotificationID(largestFetchedNotificationID.toString());
    }

    return notifications;
  }

  async enableBrowserNotifications() {
    if (!('Notification' in window)) {
      // Check if the browser supports notifications
      throw new Error('This browser does not support desktop notification');
    } else if (Notification.permission === 'granted') {
      return true;
    } else if (Notification.permission !== 'denied') {
      // We need to ask the user for permission
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }

    return false;
  }
  /**
   * This method processes a notification object to add parsed metadata, convert
   * its epoch timestamp to a `Date` object, and determine whether the notification
   * is unread based on the latest stored notification ID.
   *
   * @param {PushOrgNotification} notification - The notification object to parse and .
   * @param {number} latestStoredNotificationID - The ID of the most recently stored notification.
   * Used to determine the unread status of the current notification.
   *
   * @returns PushOrgNotification - The enriched notification object with:
   *   - `parsedMetaData`: Parsed metadata (if `additionalMeta` exists).
   *   - `timestamp`: A `Date` object representing the notification's epoch time.
   *   - `isUnread`: A boolean indicating whether the notification is unread.
   */
  private parseNotificationData(
    notification: PushOrgNotification,
    latestStoredNotificationID: number,
  ) {
    if (notification.payload.data.additionalMeta) {
      const metaData: NotificationParsedMetaData = this.parseMetaData(
        notification.payload.data.additionalMeta,
      );
      notification.payload.data.parsedMetaData = metaData;
    }
    notification.timestamp = new Date(notification.epoch);
    notification.isUnread = latestStoredNotificationID
      ? notification.payload_id > latestStoredNotificationID
      : true;

    return notification;
  }

  /**
   * Parses meta data of the notification that we sent.
   * This method extracts the channel index and parses the `data` field from the
   * provided 'additionalMetaData' field of notification fetched. It handles potential parsing errors gracefully
   * and logs warnings for invalid data.
   * @param {AdditionalMetadata} metaData - The metadata object to parse. It contains:
   *   - `type` (string): A string with a format like `type+index`, where `index` is the channel option index.
   *   - `data` (string): A JSON-encoded string or raw string data.
   *
   * @returns {NotificationParsedMetaData} - A structured object containing:
   *   - `channelIndex` (number | undefined): The parsed channel index, or `undefined` if parsing fails.
   *   - `data` (NotificationMetaTypes | string): The parsed data, or the original string if parsing fails.
   */
  private parseMetaData(metaData: AdditionalMetadata): NotificationParsedMetaData {
    let indexOfOption: number | undefined;
    let data: NotificationMetaTypes | string = '';

    // Safely access 'type' and split it
    const splitType = metaData?.type.split('+') ?? [];
    if (splitType.length > 1) {
      indexOfOption = parseInt(splitType[1], 10);
      if (isNaN(indexOfOption)) {
        this._log.warn({
          data: metaData.type,
          msg: 'Unable to parse index from type',
        });
        indexOfOption = undefined;
      }
    }

    // Parse the 'data' field as JSON
    if (metaData?.data) {
      try {
        data = JSON.parse(metaData.data);
      } catch (error) {
        this._log.warn({
          data: metaData.data,
          msg: 'Unable to parse data',
          error,
        });
        data = metaData?.data;
      }
    }

    // Return the parsed index and data
    return {
      channelIndex: indexOfOption,
      data,
    };
  }

  private async initializeWritableClient(): Promise<void> {
    const signer = await this._web3.getSigner();
    if (!signer) throw new Error('There is no signer');
    this._pushClient = await PushAPI.initialize(signer);

    if (this._pushClient.readmode()) {
      this._globalChannel.next({
        event: NOTIFICATION_EVENTS.SUBSCRIPTION_NOT_ACCEPTED,
        data: {},
      });
      throw new Error('The user did not sign the message');
    }
  }

  private getLatestStoredNotificationID() {
    return parseInt(localStorage.getItem(this.localStorageKeyOfLatestSeenNotification) || '0', 10);
  }

  private setLatestStoredNotificationID(val: string) {
    return localStorage.set(this.localStorageKeyOfLatestSeenNotification, val);
  }

  getNotificationsEnabledStatus(): boolean {
    const status = localStorage.getItem(this.localStorageKeyOfNotificationsEnabledStatus);
    return status ? JSON.parse(status) : false;
  }

  setNotificationsEnabledStatus(val: boolean) {
    return localStorage.setItem(this.localStorageKeyOfNotificationsEnabledStatus, val.toString());
  }

  private get localStorageKeyOfLatestSeenNotification() {
    return `${this._web3.state.address}-${this.latestSeenNotificationIDKey}`;
  }

  private get localStorageKeyOfNotificationsEnabledStatus() {
    return `${this._web3.state.address}-${this.notificationsEnabledStatusKey}`;
  }

  get notificationsClient() {
    if (!this._pushClient) {
      throw new Error('Notifications client not initialized');
    }
    return this._pushClient;
  }

  get notificationsWriteClient() {
    if (!this._pushClient || this._pushClient.readmode()) {
      throw new Error('Notification client should be intialized in write mode');
    }
    return this._pushClient;
  }

  get notificationsStream() {
    if (!this._notificationsStream) {
      throw new Error('Notifications stream not initialized');
    }
    // this can be used for managing the event listeners
    // for example, to unsubscribe from the stream
    return this._notificationsStream;
  }
}

export default NotificationService;
