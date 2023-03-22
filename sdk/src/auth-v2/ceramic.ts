import { inject, injectable } from 'inversify';
import { TYPES } from '@akashaorg/typings/sdk';
import DB from '../db/index';
import Web3Connector from '../common/web3.connector';
import EventBus from '../common/event-bus';
import Logging from '../logging/index';
import Settings from '../settings/index';
import Gql from '../gql/index';
import pino from 'pino';
import { DIDSession } from 'did-session';
import { EthereumWebAuth } from '@didtools/pkh-ethereum';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { AccountId } from 'caip';
import { ethers } from 'ethers';

@injectable()
export default class CeramicService {
  private _db: DB;
  private readonly _web3: Web3Connector;
  private _globalChannel: EventBus;
  private _log: pino.Logger;
  private _settings: Settings;
  private _ceramicClient?: CeramicClient;
  private _didSession?: DIDSession;
  private _gql: Gql;
  constructor(
    @inject(TYPES.Db) db: DB,
    @inject(TYPES.Web3) web3: Web3Connector,
    @inject(TYPES.EventBus) globalChannel: EventBus,
    @inject(TYPES.Log) log: Logging,
    @inject(TYPES.Settings) settings: Settings,
    @inject(TYPES.Gql) gql: Gql,
  ) {
    this._db = db;
    this._web3 = web3;
    this._globalChannel = globalChannel;
    this._log = log.create('AWF_Ceramic');
    this._settings = settings;
    this._gql = gql;
  }
  async connect() {
    const chainNameSpace = 'eip155';
    const chainId = this._web3.networkId[this._web3.network];
    const chainIdNameSpace = `${chainNameSpace}:${chainId}`;
    const ethAddress = await this._web3.getCurrentEthAddress();
    if (!ethAddress) {
      throw new Error('No eth address connected!');
    }
    const accountId = new AccountId({ address: ethAddress, chainId: chainIdNameSpace });
    let web3Provider;
    if (this._web3.provider instanceof ethers.providers.Web3Provider) {
      web3Provider = this._web3.provider.provider;
    }
    const authMethod = await EthereumWebAuth.getAuthMethod(web3Provider, accountId);
    this._didSession = await DIDSession.authorize(authMethod, { resources: ['ceramic://*'] });
    this._ceramicClient = new CeramicClient(process.env.CERAMIC_API_ENDPOINT);
    this._ceramicClient.did = this._didSession.did;
  }
  async disconnect() {
    if (this._ceramicClient) {
      await this._ceramicClient.close();
      this._didSession = undefined;
      this._ceramicClient = undefined;
    }
  }
}
