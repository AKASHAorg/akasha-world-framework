import { inject, injectable } from 'inversify';
import { TYPES } from '@akashaorg/typings/lib/sdk';
import AWF_Auth from '../auth';

import { resizeImage } from '../helpers/img';

import { createFormattedValue } from '../helpers/observable';
import IpfsConnector from '../common/ipfs.connector';
import { z } from 'zod';
import { validate } from '../common/validator';
import Gql from '../gql';
import CeramicService from '../common/ceramic';
import { hasOwn } from '../helpers/types';
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import Web3Connector from '../common/web3.connector';
import type { PushStream } from '@pushprotocol/restapi/src/lib/pushstream/PushStream';

@injectable()
class AWF_Profile {
  private _gql: Gql;
  private _auth: AWF_Auth;
  private _ipfs: IpfsConnector;
  readonly _ceramic: CeramicService;
  private readonly _web3: Web3Connector;
  private _pushClient?: PushAPI;
  private _notificationsStream?: PushStream;
  constructor(
    @inject(TYPES.Gql) gql: Gql,
    @inject(TYPES.Auth) auth: AWF_Auth,
    @inject(TYPES.IPFS) ipfs: IpfsConnector,
    @inject(TYPES.Ceramic) ceramic: CeramicService,
    @inject(TYPES.Web3) web3: Web3Connector,
  ) {
    this._auth = auth;
    this._ipfs = ipfs;
    this._gql = gql;
    this._ceramic = ceramic;
    this._web3 = web3;
  }

  /**
   *
   * @param id - DID string of the profile
   */
  @validate(z.string().min(3))
  async getProfileStats(id: string) {
    const stats = {
      totalFollowing: 0,
      totalFollowers: 0,
      totalBeams: 0,
      totalTopics: 0,
      totalReflections: 0,
    };
    const data = await this._gql.getAPI().GetProfileStatsByDid({ id: id });
    if (data.node) {
      if (hasOwn(data.node, 'akashaBeamListCount')) {
        stats.totalBeams = data?.node?.akashaBeamListCount;
      }
      if (hasOwn(data.node, 'akashaFollowListCount')) {
        stats.totalFollowing = data?.node?.akashaFollowListCount;
      }
      if (hasOwn(data.node, 'akashaProfile')) {
        stats.totalFollowers = data?.node?.akashaProfile?.followersCount || 0;
      }

      if (hasOwn(data.node, 'akashaReflectListCount')) {
        stats.totalReflections = data?.node?.akashaReflectListCount;
      }
    }

    // getting all the interests
    const interests = await this._gql.getAPI().GetInterestsByDid({ id: id });
    if (
      interests.node &&
      hasOwn(interests.node, 'akashaProfileInterests') &&
      interests.node.akashaProfileInterests
    ) {
      stats.totalTopics = interests.node.akashaProfileInterests.topics.length;
    }
    return createFormattedValue(stats);
  }

  /**
   *
   * @param data - media file data
   */
  async saveMediaFile(data: {
    content: File | Buffer | ArrayBuffer | string | any;
    isUrl?: boolean;
    name?: string;
    config?: {
      quality?: number;
      maxWidth: number;
      maxHeight: number;
      autoRotate?: boolean;
      mimeType?: string;
    };
  }) {
    let file: File;
    let path: string;
    if (!data.isUrl && !data.name) {
      throw new Error('Must specify a name for the media file');
    }
    const current = await this._auth.getCurrentUser();
    if (!current?.id) {
      throw new Error('Must be logged in to upload media');
    }
    if (data.isUrl) {
      const { default: urlSource } = await import('ipfs-utils/src/files/url-source');
      const source = urlSource(data.content);
      const arr: BlobPart[] = [];

      if (!source.content) {
        throw new Error('Could not read the url');
      }
      for await (const entry of source.content) {
        arr.push(entry);
      }
      path = data.name ? data.name : source.path;

      path = `${current.id}/${path}`;
      file = new File(arr, path, { type: 'image/*' });
    } else {
      path = `${current.id}/${data.name!}`;
      const content = data.content instanceof Blob ? [data.content] : data.content;
      file = new File(content, path, { type: data.content?.type || 'image/*' });
    }
    //const sess = await this._auth.getSession();
    if (!data.config) {
      data.config = {
        maxWidth: 640,
        maxHeight: 640,
        autoRotate: false,
      };
    }
    const resized = await resizeImage({
      file,
      config: data.config,
    });

    if (!resized.image) {
      throw new Error('Failed to resize image');
    }
    const CID = await this._ipfs.uploadFile(resized.image);
    if (!CID) {
      throw new Error('Failed to upload file');
    }
    const cid: string = CID.toString();
    return { CID: cid, size: resized.size, blob: resized.image };
  }

  async initNotificationsStream() {
    const signer = await this._web3.getSigner();
    // @Todo: explore case with signer being null, no authenticated user
    this._pushClient = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.STAGING,
      // account: pushAccount,
    });

    const notificationsEnabled = await this.enableBrowserNotifications();
    this._notificationsStream = await this._pushClient.initStream([CONSTANTS.STREAM.NOTIF]);
    this._notificationsStream.on(CONSTANTS.STREAM.NOTIF, async (data: any) => {
      if (notificationsEnabled) {
        const notification = new Notification(data?.message?.notification.body, {
          body: data?.message?.notification.body,
          icon: data?.channel?.icon,
          data: data?.message?.payload,
        });
        // can assign event listeners to the notification
        notification.onclick = (event: any) => {
          event.preventDefault();
          window.open(data?.message?.payload?.cta || data?.channel?.url, '_blank'); // Expecting all actions to be defined as CTA link
        };
      } else {
        console.warn('Notifications are not granted.');
        // here handle inapp notifications without sending browser notifications
      }
    });

    await this._notificationsStream.connect();
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

  async getSubscriptions() {
    const subs = await this.notificationsClient.notification.subscriptions({ limit: 100 });
    const info = await this.notificationsClient.channel.info();

    return {
      subscriptions: subs,
      channelInfo: info,
    };
  }

  async getNotifications() {
    const inboxNotifications = await this.notificationsClient.notification.list('INBOX', {
      account: this._web3.CAIP10.address,
      limit: 125,
    });
    return inboxNotifications;
  }

  async enableBrowserNotifications() {
    if (!this._pushClient) {
      throw new Error('Notifications client not initialized');
    }
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
}

export default AWF_Profile;
