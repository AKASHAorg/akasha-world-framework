import { ChannelInfo, UserSetting } from './../../../typings/lib/sdk/notification';
import { PushAPI, CONSTANTS, ProgressHookType, FeedsOptions } from '@pushprotocol/restapi';
import { inject, injectable } from 'inversify';
import { PUSH_PROTOCOL_EVENTS, TYPES } from '@akashaorg/typings/lib/sdk';
import Logging from '../logging';
import EventBus from './event-bus';
import pino from 'pino';
import AWF_Config from './config';
import Web3Connector from './web3.connector';
import { PushStream } from '@pushprotocol/restapi/src/lib/pushstream/PushStream';

@injectable()
class PushProtocol {
  #logFactory: Logging;
  #log: pino.Logger;
  #globalChannel: EventBus;
  private readonly _web3: Web3Connector;
  private _config: AWF_Config;
  private _pushClient?: PushAPI;
  private _notificationsStream?: PushStream;
  private _akashaChannelAccount = '0x7Ebe714066149bEef3c2f60cC89eadF50Da23C26';

  constructor(
    @inject(TYPES.Log) logFactory: Logging,
    @inject(TYPES.EventBus) globalChannel: EventBus,
    @inject(TYPES.Config) config: AWF_Config,
    @inject(TYPES.Web3) web3: Web3Connector,
  ) {
    this.#logFactory = logFactory;
    this.#log = this.#logFactory.create('Notification');
    this.#globalChannel = globalChannel;
    this._config = config;
    this._web3 = web3;
  }
  /**
   * Initialize the push client.
   * @param options - Initialization options with readonly flag to initialize the client in read-only mode without prompting for signature.
   * @returns Promise<void> -
   * @throws Will throw an error if initialization fails or if the user declines the signing request.
   */
  async initialize(options: { readonly?: boolean } = {}): Promise<void> {
    if (!this._web3.provider) throw new Error('Must connect first to a web3 provider!');

    const isInitializedInWriteMode = this._pushClient && !this._pushClient.readmode();
    if (isInitializedInWriteMode) return;

    const { readonly = true } = options;
    try {
      if (readonly) {
        if (this._pushClient) return;
        // Readonly will not prompt the user with a signing process
        await this.initializeReadOnlyClient();
      } else {
        /**
         * We initialize with a signer in order to send notification or change the opt-in/settings
         * If the user clicks cancel, this method will throw an Error
         */
        await this.initializeWritableClient();
      }
    } catch (e) {
      this.#log.error(e, 'Error in initializing the client');
      throw new Error('Error in intializing the client');
    }
  }

  async listenToNotificationEvents() {
    this.initialize();

    const accepted = await this.enableBrowserNotifications();
    if (!accepted) return;

    this._notificationsStream = await this._pushClient!.initStream([CONSTANTS.STREAM.NOTIF], {
      filter: {
        channels: [this._akashaChannelAccount],
      },
    });
    this._notificationsStream.on(CONSTANTS.STREAM.NOTIF, (data: any) => {
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

  async getSettingsNotification(): Promise<UserSetting[]> {
    this.initialize();
    const subscriptions: Array<ChannelInfo> = await this._pushClient!.notification.subscriptions({
      channel: this._akashaChannelAccount,
    });
    if (!subscriptions.length) throw new Error('There is no settings for this channel');
    const channelSubscriptionInfo = subscriptions[0];
    let userSettings: UserSetting[] = [];
    try {
      userSettings = JSON.parse(channelSubscriptionInfo.user_setting) as UserSetting[];
      return userSettings;
    } catch (e) {
      this.#log.error(e, 'Error parsing user settings');
      throw new Error('Unable to parse user Settings');
    }
  }

  async toggleSettings(newSettings: { enabled: boolean }[]): Promise<void> {
    this.initialize({ readonly: false });
    const settingsFromChannel = await this.getSettingsNotification();
    if (newSettings.length !== settingsFromChannel.length)
      // If the settings are sent without order or there are some opt-in missing PushProtocol sets all the opt-in to false
      throw new Error(
        'Settings must contain all the opt-ins available. Please be aware that the order of the opt-in sent matter',
      );
    await this._pushClient!.notification.subscribe(this._akashaChannelAccount, {
      settings: newSettings,
    });
  }

  async getNotifications(page: number = 1, limit: number = 10) {
    this.initialize();
    const options: FeedsOptions = {
      channels: [this._akashaChannelAccount],
      account: this._web3.state.address,
      page,
      limit,
    };

    const inboxNotifications = await this.notificationsClient.notification.list('INBOX', options);
    return inboxNotifications;
  }

  async enableBrowserNotifications() {
    this.initialize();
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

  private async initializeReadOnlyClient(): Promise<void> {
    const address = this._web3.state.address;
    this._pushClient = await PushAPI.initialize({ account: address });
  }

  private async initializeWritableClient(): Promise<void> {
    const signer = await this._web3.getSigner();
    this._pushClient = await PushAPI.initialize(signer, {
      progressHook: (info: ProgressHookType) => {
        if (info.level === 'ERROR') {
          this.#log.error(info);
          // TBD: if te error message should be sent like this?
          // #Reason for firing this event is the case other extensions need to listen for this information
          // #Discussion1: The notification event listener should be turned off
          this.#globalChannel.next({
            data: { error: info },
            event: PUSH_PROTOCOL_EVENTS.SUBSCRIPTION_NOT_ACCEPTED,
          });
          throw new Error('Error in during intializing');
        }
      },
    });

    if (this._pushClient.readmode()) {
      throw new Error('The user did not sign the message');
    }
  }

  get notificationsClient() {
    if (!this._pushClient) {
      throw new Error('Notifications client not initialized');
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

export default PushProtocol;
