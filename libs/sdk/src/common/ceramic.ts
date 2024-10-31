import { inject, injectable } from 'inversify';
import { TYPES } from '@akashaorg/typings/lib/sdk';
import DB from '../db';
import Web3Connector from './web3.connector';
import EventBus from './event-bus';
import Logging from '../logging';
import Settings from '../settings';
import AWF_Config from './config';
import pino from 'pino';
import { DIDSession } from 'did-session';
import { EthereumWebAuth } from '@didtools/pkh-ethereum';
import { ComposeClient } from '@composedb/client';
import { AccountId } from 'caip';
import { sha256 } from 'crypto-hash';
import { definition } from '@akashaorg/composedb-models/lib/runtime-definition';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import KeyResolver from 'key-did-resolver';
import { fromString } from 'uint8arrays/from-string';
import { validate } from './validator';
import { z } from 'zod';

@injectable()
export default class CeramicService {
  private _db: DB;
  private readonly _web3: Web3Connector;
  private _globalChannel: EventBus;
  private _log: pino.Logger;
  private _settings: Settings;
  private _composeClient: ComposeClient;
  private _didSession?: DIDSession;
  private _ceramic_endpoint: string;
  private _config: AWF_Config;

  constructor(
    @inject(TYPES.Db) db: DB,
    @inject(TYPES.Web3) web3: Web3Connector,
    @inject(TYPES.EventBus) globalChannel: EventBus,
    @inject(TYPES.Log) log: Logging,
    @inject(TYPES.Settings) settings: Settings,
    @inject(TYPES.Config) config: AWF_Config,
  ) {
    this._db = db;
    this._web3 = web3;
    this._globalChannel = globalChannel;
    this._log = log.create('AWF_Ceramic');
    this._settings = settings;
    this._config = config;
    this._ceramic_endpoint = this._config.getOption('ceramic_api_endpoint');
    this._composeClient = new ComposeClient({
      ceramic: this._ceramic_endpoint,
      definition: definition,
    });
  }

  async getAccountID(): Promise<AccountId> {
    const ethAddress = await this._web3.getCurrentEthAddress();
    if (!ethAddress) {
      throw new Error('No eth address connected!');
    }
    return new AccountId({
      address: ethAddress,
      chainId: this._web3.CAIP10.chainIdNameSpace,
    });
  }

  /*
Creates an Ethereum account ID and DID session to authenticate with Ceramic.

Parameters:
- chainNameSpace: The Ethereum chain namespace ('eip155')
- chainId: The Ethereum chain ID from the connected Web3 provider
- chainIdNameSpace: The combined chain namespace and ID
- ethAddress: The current Ethereum address from the Web3 connector
- accountId: The Ethereum account ID created from the address and chain ID
- web3Provider: The underlying Web3 provider instance
- authMethod: The Ethereum authentication method for Ceramic
- this._didSession: The Ceramic DID session

Functionality:
1. Get the Ethereum chain ID from the connected Web3 provider
2. Get the current Ethereum address from Web3
3. Create an Ethereum account ID from the address and chain ID
4. Get the Ethereum authentication method from Web3
5. Create a DID session with the authentication method
6. Set the DID on the ComposeClient instance
*/
  async connect(): Promise<DIDSession> {
    const ethAddress = await this._web3.getCurrentEthAddress();
    if (!ethAddress) {
      throw new Error('No eth address connected!');
    }
    const accountId = await this.getAccountID();
    const web3Provider = this._web3.walletProvider;
    if (!web3Provider) {
      throw new Error('No provider found for ceramic:connect!');
    }

    const authMethod = await EthereumWebAuth.getAuthMethod(web3Provider, accountId);
    this._didSession = await DIDSession.get(accountId, authMethod, {
      resources: this._composeClient.resources,
      expiresInSecs: 60 * 60 * 24 * 7, // 1 week
    });
    this._composeClient.setDID(this._didSession.did);
    return this._didSession;
  }

  @validate(z.string().length(64))
  async connectWithKey(key: string) {
    const privateKey = fromString(key, 'base16');
    const did = new DID({
      provider: new Ed25519Provider(privateKey),
      resolver: KeyResolver.getResolver(),
    });
    await did.authenticate();
    this._composeClient.setDID(did);
    return did;
  }

  getComposeClient() {
    return this._composeClient;
  }

  async hasSession(): Promise<boolean> {
    const accountId = await this.getAccountID();
    return DIDSession.hasSessionFor(accountId, this._composeClient.resources);
  }

  async geResourcesHash() {
    const hash = await sha256(this._composeClient.resources.join(''));
    return {
      hash: hash,
      resources: this._composeClient.resources,
    };
  }

  async setCeramicEndpoint(endPoint: string) {
    this._ceramic_endpoint = endPoint;
    await this.disconnect();
  }

  getOptions() {
    return {
      endpointURL: this._ceramic_endpoint,
    };
  }

  async disconnect() {
    try {
      const accountId = await this.getAccountID();
      const hasSession = await this.hasSession();
      if (hasSession) {
        await DIDSession.remove(accountId);
      }
    } catch (e) {
      this._log.warn('Error disconnecting DIDSession', e);
    }

    if (this._didSession) {
      this._didSession = undefined;
      this._composeClient = new ComposeClient({
        ceramic: this._ceramic_endpoint,
        definition: definition,
      });
    }
  }
}
