import * as PushProtocol from '@pushprotocol/restapi';
import type { PushStream } from '@pushprotocol/restapi/src/lib/pushstream/PushStream';

import * as SdkTypes from '@akashaorg/typings/lib/sdk';

import Logging from '../../logging';
import EventBus from '../event-bus';
import AWF_Config from '../config';
import Web3Connector from '../web3.connector';
import { validate } from '../validator';

import { inject, injectable } from 'inversify';
import pino from 'pino';
import { z } from 'zod';
import * as notificationSchemas from './notification-schemas';

@injectable()
class NotificationService {
  private _log: pino.Logger;
  private _logFactory: Logging;
  private _globalChannel: EventBus;
  private readonly _web3: Web3Connector;
  private _config: AWF_Config;
  private _pushClient?: PushProtocol.PushAPI;
  private _notificationsStream?: PushStream;
  private _notificationChannelId: string;

  constructor(
    @inject(SdkTypes.TYPES.Log) logFactory: Logging,
    @inject(SdkTypes.TYPES.EventBus) globalChannel: EventBus,
    @inject(SdkTypes.TYPES.Config) config: AWF_Config,
    @inject(SdkTypes.TYPES.Web3) web3: Web3Connector,
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
  @validate(notificationSchemas.InitializeOptionsSchema)
  async initialize(options: notificationSchemas.InitializeOptions = { readonly: true }) {
    if (!this._web3.state.connected) throw new Error('Must connect first to a web3 provider!');
    const { readonly } = options;

    const isWriteMode = !this._pushClient?.readmode();
    const clientIsAlreadyInitialized = this._pushClient && (isWriteMode || readonly);
    if (clientIsAlreadyInitialized) return;

    if (readonly) {
      // Readonly will not prompt the user with a signing process
      const address = this._web3.state.address;
      this._pushClient = await PushProtocol.PushAPI.initialize({ account: address });
    } else {
      /**
       * We initialize with a signer in order to send notification or change the opt-in/settings
       * If the user clicks cancel, this method will throw an Error
       */
      await this.initializeWritableClient();
    }
  }

  async listenToNotificationEvents() {
    const accepted = await this.enableBrowserNotifications();
    if (!accepted) throw new Error('The user has refused to receive notifications');

    this._notificationsStream = await this.notificationsClient!.initStream(
      [PushProtocol.CONSTANTS.STREAM.NOTIF],
      {
        filter: {
          channels: [this._notificationChannelId],
        },
      },
    );
    this._notificationsStream.on(PushProtocol.CONSTANTS.STREAM.NOTIF, (data: any) => {
      const notification = new Notification(data?.message?.notification.body, {
        body: data?.message?.notification.body,
        icon: data?.channel?.icon,
        data: data?.message?.payload,
      });
      // can assign event listeners to the notification
      notification.onclick = (event: any) => {
        event.preventDefault();
        window.open(data?.message?.payload?.cta || data?.channel?.url, '_blank');
      };
    });

    await this._notificationsStream.connect();
  }

  async stopListeningToNotificationEvents() {
    if (this._notificationsStream) {
      await this._notificationsStream.disconnect();
      this._notificationsStream.removeAllListeners(PushProtocol.CONSTANTS.STREAM.NOTIF);
      this._notificationsStream = undefined;
    }
  }

  async getSettingsOfChannel(): Promise<notificationSchemas.ChannelSettings[]> {
    const response = await this.notificationsClient.channel.info(this._notificationChannelId);
    const parseResponse = notificationSchemas.ChannelInfoResponseSchema.safeParse(response);
    if (!parseResponse.success) throw new Error('User Settings unable to parse');

    return parseResponse.data;
  }

  async getSettingsOfUser(): Promise<notificationSchemas.UserSettingType[]> {
    const subscriptions: PushProtocol.ApiSubscriptionType[] =
      await this.notificationsClient.notification.subscriptions({
        channel: this._notificationChannelId,
      });
    const channelSubscriptionInfo = subscriptions.find(
      subscription => subscription.channel === this._notificationChannelId,
    );
    if (!channelSubscriptionInfo) throw new Error('Settings not found');

    const result = notificationSchemas.ChannelUserSettingsSchema.safeParse(channelSubscriptionInfo);
    if (!result.success) throw new Error('User Settings unable to parse');

    return result.data.userSettings;
  }

  @validate(
    z.array(
      z.object({
        enable: z.boolean(),
      }),
    ),
  )
  async setSettings(newSettings: PushProtocol.UserSetting[]): Promise<void> {
    const settingsFromChannel = await this.getSettingsOfChannel();
    if (newSettings.length !== settingsFromChannel.length)
      // If the settings are sent without order or there are some opt-in missing PushProtocol sets all the opt-in to false
      throw new Error(
        'Settings must contain all the opt-ins available. Please be aware that the order of the opt-in sent matter',
      );
    await this.notificationsWriteClient.notification.subscribe(this._notificationChannelId, {
      settings: newSettings,
    });
  }
  @validate(z.number(), z.number())
  async getNotifications(page: number = 1, limit: number = 100) {
    const options: PushProtocol.FeedsOptions = {
      channels: [this._notificationChannelId],
      account: this._web3.state.address,
      page,
      limit,
      raw: true,
    };

    const inboxNotifications = await this.notificationsClient.notification.list('INBOX', options);

    return inboxNotifications;
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

  private async initializeWritableClient(): Promise<void> {
    const signer = await this._web3.getSigner();
    if (!signer) throw new Error('There is no signer');
    this._pushClient = await PushProtocol.PushAPI.initialize(signer);

    if (this._pushClient.readmode()) {
      this._globalChannel.next({
        event: SdkTypes.NOTIFICATION_EVENTS.SUBSCRIPTION_NOT_ACCEPTED,
        data: {},
      });
      throw new Error('The user did not sign the message');
    }
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
