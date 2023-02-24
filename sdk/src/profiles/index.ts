import { inject, injectable } from 'inversify';
import Web3Connector from '../common/web3.connector';
import { TYPES, PROFILE_EVENTS } from '@akashaorg/typings/sdk';
import Gql from '../gql';
import AWF_Auth from '../auth';
import Logging from '../logging';
import { throwError } from 'rxjs';
import { resizeImage } from '../helpers/img';
import EventBus from '../common/event-bus';
import pino from 'pino';
import { UserProfileFragmentDataFragment } from '@akashaorg/typings/sdk/graphql-operation-types';
import { DataProviderInput } from '@akashaorg/typings/sdk/graphql-types';
import { createFormattedValue } from '../helpers/observable';
import IpfsConnector from '../common/ipfs.connector';
import { z } from 'zod';
// tslint:disable-next-line:no-var-requires
// eslint-disable-next-line @typescript-eslint/no-var-requires
const urlSource = require('ipfs-utils/src/files/url-source');

@injectable()
class AWF_Profile {
  private readonly _web3: Web3Connector;
  private _log: pino.Logger;
  private _gql: Gql;
  private _auth: AWF_Auth;
  private _globalChannel: EventBus;
  private _ipfs: IpfsConnector;
  public readonly TagSubscriptions = '@TagSubscriptions';

  constructor(
    @inject(TYPES.Log) log: Logging,
    @inject(TYPES.Gql) gql: Gql,
    @inject(TYPES.Auth) auth: AWF_Auth,
    @inject(TYPES.EventBus) globalChannel: EventBus,
    @inject(TYPES.IPFS) ipfs: IpfsConnector,
  ) {
    this._log = log.create('AWF_Profile');
    this._gql = gql;
    this._auth = auth;
    this._globalChannel = globalChannel;
    this._ipfs = ipfs;
  }

  /**
   * Mutation request to add a profile provider to the profile object
   * @param opt
   */
  async addProfileProvider(opt: DataProviderInput[]) {
    const auth = await this._auth.authenticateMutationData(
      opt as unknown as Record<string, unknown>[],
    );
    const newProfileProvider = await this._gql.getAPI().AddProfileProvider(
      { data: opt },
      {
        Authorization: `Bearer ${auth.token}`,
        Signature: auth.signedData.signature.toString(),
      },
    );
    // @emits PROFILE_EVENTS.ADD_PROVIDER
    this._globalChannel.next({
      data: newProfileProvider,
      event: PROFILE_EVENTS.ADD_PROVIDER,
      args: opt,
    });
    return newProfileProvider;
  }

  /**
   *
   * @param opt
   */
  async makeDefaultProvider(opt: DataProviderInput[]) {
    const auth = await this._auth.authenticateMutationData(
      opt as unknown as Record<string, unknown>[],
    );
    const makeDefaultProvider = await this._gql.getAPI().MakeDefaultProvider(
      { data: opt },
      {
        Authorization: `Bearer ${auth.token}`,
        Signature: auth.signedData.signature.toString(),
      },
    );
    // @emits PROFILE_EVENTS.DEFAULT_PROVIDER
    this._globalChannel.next({
      data: makeDefaultProvider,
      event: PROFILE_EVENTS.DEFAULT_PROVIDER,
      args: opt,
    });
    return makeDefaultProvider;
  }

  /**
   *
   * @param userName
   */
  async registerUserName(userName: string) {
    z.string().min(3).parse(userName);
    const auth = await this._auth.authenticateMutationData(userName);
    const registerUserName = await this._gql.getAPI().RegisterUsername(
      { name: userName },
      {
        Authorization: `Bearer ${auth.token}`,
        Signature: auth.signedData.signature.toString(),
      },
    );
    // @emits PROFILE_EVENTS.REGISTER_USERNAME
    this._globalChannel.next({
      data: registerUserName,
      event: PROFILE_EVENTS.REGISTER_USERNAME,
      args: { userName },
    });
    return registerUserName;
  }

  /**
   *
   * @param opt
   */
  async getProfile(opt: { ethAddress?: string; pubKey?: string }) {
    let resp: UserProfileFragmentDataFragment;
    if (opt.pubKey) {
      const tmp = await this._gql.getAPI().ResolveProfile({ pubKey: opt.pubKey });
      resp = tmp.resolveProfile;
    } else if (opt.ethAddress) {
      const tmp = await this._gql.getAPI().GetProfile({ ethAddress: opt.ethAddress });
      resp = tmp.getProfile;
    } else {
      throw new Error('Must provide ethAddress or pubKey value');
    }
    return createFormattedValue(resp);
  }

  /**
   *
   * @param pubKey
   */
  async follow(pubKey: string) {
    z.string().min(32).parse(pubKey);
    const auth = await this._auth.authenticateMutationData(pubKey);
    const followResult = await this._gql.getAPI().Follow(
      { pubKey: pubKey },
      {
        Authorization: `Bearer ${auth.token}`,
        Signature: auth.signedData.signature.toString(),
      },
    );
    // @emits PROFILE_EVENTS.FOLLOW
    this._globalChannel.next({
      data: followResult,
      event: PROFILE_EVENTS.FOLLOW,
      args: { pubKey },
    });
    return followResult;
  }

  /**
   *
   * @param pubKey
   */
  async unFollow(pubKey: string) {
    z.string().min(32).parse(pubKey);
    const auth = await this._auth.authenticateMutationData(pubKey);
    const unFollowResult = await this._gql.getAPI().UnFollow(
      { pubKey: pubKey },
      {
        Authorization: `Bearer ${auth.token}`,
        Signature: auth.signedData.signature.toString(),
      },
    );
    // @emits PROFILE_EVENTS.UNFOLLOW
    this._globalChannel.next({
      data: unFollowResult,
      event: PROFILE_EVENTS.UNFOLLOW,
      args: { pubKey },
    });
    return unFollowResult;
  }

  /**
   *
   * @param opt
   */
  async isFollowing(opt: { follower: string; following: string }) {
    return this._gql.getAPI().IsFollowing({ follower: opt.follower, following: opt.following });
  }

  /**
   *
   * @param data
   */
  async saveMediaFile(data: {
    content: Buffer | ArrayBuffer | string | any;
    isUrl?: boolean;
    name?: string;
    config?: {
      quality?: number;
      maxWidth: number;
      maxHeight: number;
      autoRotate?: boolean;
      mimeType?: string;
    };
    email?: string; // temporary workaround until space delegation works
  }) {
    let file;
    let path;
    if (!data.isUrl && !data.name) {
      throw new Error('Must specify a name for the media file');
    }
    if (data.isUrl) {
      const source = urlSource(data.content);
      const arr = [];

      for await (const entry of source.content) {
        arr.push(entry);
      }
      path = data.name ? data.name : source.path;
      file = new File(arr, path, { type: 'image/*' });
    } else {
      file = data.content;
      path = data.name;
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
    // const buckPath = `ewa/${path}/${resized.size.width}x${resized.size.height}`;
    // const bufferImage: ArrayBuffer = await resized.image.arrayBuffer();
    const CID = await this._ipfs.uploadFile(resized.image, data.email);
    const cid: string = CID.toString();
    return { CID: cid, size: resized.size, blob: resized.image };
  }

  /**
   *
   * @param name
   */
  async searchProfiles(name: string) {
    z.string().min(3).parse(name);
    return this._gql.getAPI().SearchProfiles({ name: name });
  }

  /**
   *
   */
  async getTrending() {
    return this.searchProfiles('');
  }

  /**
   *
   * @param tagName
   */
  async toggleTagSubscription(tagName: string) {
    z.string().min(3).parse(tagName);
    const auth = await this._auth.authenticateMutationData({ sub: tagName });
    const toggledTag = await this._gql.getAPI().ToggleInterestSub(
      { sub: tagName },
      {
        Authorization: `Bearer ${auth.token}`,
        Signature: auth.signedData.signature.toString(),
      },
    );
    // @emits PROFILE_EVENTS.TAG_SUBSCRIPTION
    this._globalChannel.next({
      data: { status: toggledTag },
      event: PROFILE_EVENTS.TAG_SUBSCRIPTION,
      args: { tagName },
    });
    return toggledTag;
  }

  /**
   *
   */
  async getTagSubscriptions() {
    const currUser = await this._auth.getCurrentUser();
    return this.getInterests(currUser.pubKey);
  }

  /**
   *
   * @param tagName
   */
  async isSubscribedToTag(tagName: string) {
    const res = await this.getTagSubscriptions();
    if (!res || !res?.getInterests?.length) {
      return false;
    }
    const el = res.getInterests.indexOf(tagName);
    return el !== -1;
  }

  /**
   *
   * @param keyword
   */
  async globalSearch(keyword: string) {
    z.string().min(3).parse(keyword);
    return this._gql.getAPI().GlobalSearch({ keyword: keyword });
  }

  /**
   *
   * @param pubKey
   * @param limit
   * @param offset
   */
  async getFollowers(pubKey: string, limit: number, offset?: number) {
    return this._gql.getAPI().GetFollowers({ pubKey, limit, offset });
  }

  /**
   *
   * @param pubKey
   * @param limit
   * @param offset
   */
  async getFollowing(pubKey: string, limit: number, offset?: number) {
    return this._gql.getAPI().GetFollowing({ pubKey, limit, offset });
  }

  /**
   * Retrieve subscription list
   * @param pubKey
   */
  async getInterests(pubKey: string) {
    return this._gql.getAPI().GetInterests({ pubKey });
  }
}

export default AWF_Profile;
