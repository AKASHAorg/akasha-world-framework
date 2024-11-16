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
import Web3Connector from '../common/web3.connector';

@injectable()
class AWF_Profile {
  private _gql: Gql;
  private _auth: AWF_Auth;
  private _ipfs: IpfsConnector;
  readonly _ceramic: CeramicService;
  private readonly _web3: Web3Connector;
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
}

export default AWF_Profile;
