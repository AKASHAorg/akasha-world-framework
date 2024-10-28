import type IDBService from './db.js';
import type IGqlClient from './gql.js';
import type { ServiceCallResult } from './responses.js';
import { EthProviders, EthProvidersSchema } from './web3.connector.js';

export * from './events.js';
export * from './responses.js';
export * from './common.js';
export * from './registry.js';

export {
  IDBService,
  ServiceCallResult,
  IGqlClient,
  EthProviders,
  EthProvidersSchema,
  ServiceTypes as TYPES,
};

const ServiceTypes = {
  Gql: Symbol.for('awf-Gql'),
  Stash: Symbol.for('awf-Stash'),
  Log: Symbol.for('awf-Log'),
  Settings: Symbol.for('awf-Settings'),
  AppSettings: Symbol.for('awf-app-Settings'),
  Db: Symbol.for('awf-Db'),
  Web3: Symbol.for('awf-Web3'),
  EventBus: Symbol.for('awf-EventBus'),
  Auth: Symbol.for('awf-AUTH'),
  ENS: Symbol.for('awf-ENS'),
  Profile: Symbol.for('awf-Profile'),
  Entry: Symbol.for('awf-Entry'),
  Comment: Symbol.for('awf-Comment'),
  Tag: Symbol.for('awf-Tag'),
  IPFS: Symbol.for('awf-IPFS'),
  ICRegistry: Symbol.for('awf-ic-Registry'),
  Misc: Symbol.for('awf-Misc'),
  Lit: Symbol.for('awf-LIT'),
  Ceramic: Symbol.for('awf-Ceramic'),
  Config: Symbol.for('awf-Config'),
  ScrollState: Symbol.for('awf-scroll-state'),
  PushProtocol: Symbol.for('awf-push-protocol'),
};
