import { injectable } from 'inversify';
import { env } from './env';

export const SDKConfigOptions = [
  'ceramic_api_endpoint',
  'graphql_uri',
  'indexing_did',
  'w3_storage_delegate_base_url',
  'ipfs_path_gateway',
  'ipfs_origin_gateway',
  'ipfs_fallback_gateway',
  'wallet_connect_project_id',
  'log_level',
  'api_status_path',
  'push_protocol_channel_id',
] as const;

@injectable()
class AWF_Config {
  readonly #_config: { [k in (typeof SDKConfigOptions)[number]]: string };

  constructor() {
    this.#_config = {
      ceramic_api_endpoint: env.PUBLIC_CERAMIC_API_ENDPOINT,
      graphql_uri: env.PUBLIC_GRAPHQL_URI,
      indexing_did: env.PUBLIC_INDEXING_DID,
      w3_storage_delegate_base_url: env.PUBLIC_W3_STORAGE_DELEGATE_BASE_URL,
      wallet_connect_project_id: env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
      log_level: env.PUBLIC_LOG_LEVEL || 'warn',
      ipfs_path_gateway: 'https://cloudflare-ipfs.com/ipfs/',
      ipfs_origin_gateway: 'ipfs.w3s.link',
      ipfs_fallback_gateway: 'ipfs.cf-ipfs.com',
      api_status_path: env.PUBLIC_API_STATUS_PATH || '',
      push_protocol_channel_id: env.PUBLIC_PUSH_PROTOCOL_CHANNEL_ID,
    };
  }

  /**
   * Set a config value.
   * @param key - Config key
   * @param value - New config value
   *
   * @example
   *
   * ```
   * const config = new Config();
   * config.setOption('log_level', 'debug');
   * ```
   */
  setOption(key: (typeof SDKConfigOptions)[number], value: string) {
    this.#_config[key] = value.trim();
  }

  /**
   * Get a config value.
   * @param key - Config key
   * @returns Config value
   *
   * @example
   *
   * ```
   * const config = new Config();
   * const ceramicEndpoint = config.get('ceramic_api_endpoint');
   * ```
   */
  getOption(key: (typeof SDKConfigOptions)[number]) {
    const value = this.#_config[key];
    if (typeof value === 'undefined') {
      return '';
    }
    return this.#_config[key];
  }
}

export default AWF_Config;
