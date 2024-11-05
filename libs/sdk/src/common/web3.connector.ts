import { inject, injectable } from 'inversify';
import { BrowserProvider, ethers } from 'ethers';
import {
  // EthProviders,
  // EthProvidersSchema,
  PROVIDER_ERROR_CODES,
  TYPES,
  WEB3_EVENTS,
} from '@akashaorg/typings/lib/sdk';
import Logging from '../logging';
import EventBus from './event-bus';
import pino from 'pino';
import { createFormattedValue } from '../helpers/observable';
import { validate } from './validator';
import { z } from 'zod';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';
import AWF_Config from './config';

@injectable()
class Web3Connector {
  #logFactory: Logging;
  #log: pino.Logger;
  #web3Instance: ethers.BrowserProvider | undefined | null;
  #globalChannel: EventBus;
  #wallet: ethers.Wallet | null;
  #w3modal: ReturnType<typeof createWeb3Modal>;
  #currentProviderType: string | undefined | null;
  readonly network = 'sepolia';
  #networkId = '0xaa36a7';
  // mapping for network name and ids
  readonly networkId = Object.freeze({
    mainnet: 1,
    ropsten: 3,
    rinkeby: 4,
    goerli: 5,
    kovan: 42,
    sepolia: 11155111,
  });
  private _config: AWF_Config;
  /*
   * Web3Connector constructor
   *
   * @param logFactory - Logging factory to create logger
   * @param globalChannel - EventBus for emitting events
   *
   * Initializes:
   * - Logger
   * - EventBus
   * - Web3Modal configuration
   *   - Project ID (required)
   *   - Chain configuration
   *   - Theming
   *   - Privacy and terms URLs
   *
   * Creates Web3Modal instance
   * Registers wallet change event listeners
   *
   * Throws error if WALLETCONNECT_PROJECT_ID env var not set
   */
  constructor(
    @inject(TYPES.Log) logFactory: Logging,
    @inject(TYPES.EventBus) globalChannel: EventBus,
    @inject(TYPES.Config) config: AWF_Config,
  ) {
    this.#logFactory = logFactory;
    this.#log = this.#logFactory.create('Web3Connector');
    this.#globalChannel = globalChannel;
    this.#web3Instance = null;
    this.#wallet = null;
    this._config = config;
    const projectId = this._config.getOption('wallet_connect_project_id');
    if (!projectId) {
      throw new Error('WALLETCONNECT_PROJECT_ID is not set');
    }
    const chains = [
      {
        chainId: this.networkId.sepolia,
        name: 'Ethereum',
        currency: 'ETH',
        explorerUrl: 'https://sepolia.etherscan.io/',
        rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      },
    ];

    const ethersConfig = defaultConfig({
      metadata: {
        name: 'AKASHA World',
        description: 'AKASHA Web3Modal',
        url: 'https://akasha.world',
        icons: ['https://avatars.githubusercontent.com/u/9638191'],
      },
      defaultChainId: this.networkId.sepolia,
      rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      enableCoinbase: true,
    });

    this.#w3modal = createWeb3Modal({
      ethersConfig,
      projectId,
      chains,
      themeMode: 'light',
      themeVariables: {
        '--w3m-font-family': 'Inter, Content-font, Roboto, sans-serif',
        '--w3m-color-mix': '#7222d2',
        '--w3m-accent': '#4e71ff',
      },
      privacyPolicyUrl: 'https://akasha.org/privacy-policy/',
      termsConditionsUrl: 'https://akasha.org/legal/',
    });
    this.#_registerWalletChangeEvents();
  }

  /*
   * Connect to a web3 wallet provider
   *
   * @returns {Promise<{connected: boolean, unsubscribe?: () => void}>}
   * - Returns a promise that resolves to an object indicating if connected
   * - The object contains:
   *   - connected: boolean - Whether successfully connected or not
   *   - unsubscribe: () => void - Optional function to unsubscribe from provider changes
   *
   * The method first checks if already connected.
   * If not connected:
   * - Opens the Web3Modal connect modal view
   * - Subscribes to provider changes
   * - When provider, isConnected and address is set, resolves promise
   *
   * If already connected, resolves returning current connected state.
   */
  async connect(): Promise<{ connected: boolean; unsubscribe?: () => void }> {
    if (!this.#w3modal.getIsConnected()) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async resolve => {
        const unsubscribe = this.#w3modal.subscribeProvider(state => {
          if (state.provider && state.isConnected && state.address) {
            resolve({ connected: true, unsubscribe });
          }
        });
        await this.#w3modal.open({ view: 'Connect' });
      });
    }
    return { connected: this.#w3modal.getIsConnected() };
  }

  /*
   * Get the current Web3Modal theme
   */
  getCurrentTheme() {
    return this.#w3modal.getThemeMode();
  }

  /*
   * Toggle the Web3Modal dark theme
   *
   * @param {boolean} enable - Optional flag to force enable dark theme
   *
   * If enable passed:
   * - Enables dark theme
   *
   * If no enable passed:
   * - Toggles dark on if currently light
   * - Toggles dark off if currently dark
   */
  toggleDarkTheme(enable?: boolean) {
    const themeMode = this.#w3modal.getThemeMode();
    if (enable || themeMode !== 'dark') {
      this.#w3modal.setThemeMode('dark');
    } else {
      this.#w3modal.setThemeMode('light');
    }
  }

  /*
   * Register event listeners for wallet provider changes
   *
   * Subscribes to provider changes from Web3Modal:
   * - On provider connected:
   *   - Set web3 instance from Web3Modal provider
   *   - Set current provider type
   *   - Emit CONNECTED event with provider type
   *   - Register web3 provider change event listeners
   *
   * - On provider disconnected:
   *   - Remove web3 provider change event listeners
   *
   * This allows reacting to changes in wallet connection state.
   */
  #_registerWalletChangeEvents() {
    this.#w3modal.subscribeProvider(event => {
      if (event.isConnected) {
        const provider = this.#w3modal.getWalletProvider();
        if (provider) {
          this.#web3Instance = new BrowserProvider(provider);
        }
        this.#currentProviderType = this.#w3modal?.getWalletProviderType();
        this.#globalChannel.next({
          data: { providerType: this.#currentProviderType },
          event: WEB3_EVENTS.CONNECTED,
        });
        if (this.#web3Instance) {
          // need to find a different way
          //this.#_registerProviderChangeEvents(this.#web3Instance);
        }
      } else {
        if (this.#web3Instance) {
          this.#web3Instance.removeAllListeners(['accountsChanged', 'chainChanged']);
        }
      }
    });
  }

  /*
   * Get current Web3Connector state
   *
   * @returns {Object} State object containing:
   * - providerType: Current provider type
   * - connected: Whether provider is connected
   * - address: Current selected address
   * - chainId: Current chain ID
   */
  get state() {
    return {
      providerType: this.#currentProviderType,
      connected: this.#w3modal.getIsConnected(),
      address: this.#w3modal.getAddress(),
      chainId: this.#w3modal.getChainId(),
    };
  }

  /**
   * Get access to the web3 provider instance
   */
  get provider() {
    if (this.#web3Instance) {
      return this.#web3Instance;
    }
  }

  get walletProvider() {
    if (this.#w3modal) {
      return this.#w3modal.getWalletProvider();
    }
  }

  /*
   * Disconnect from the current web3 provider
   *
   * Resets the web3 instance and provider type to null.
   * Calls Web3Modal disconnect if connected.
   * Emits DISCONNECTED event.
   *
   * @returns {Promise<void>}
   * Promise resolves when disconnected.
   */
  async disconnect(): Promise<void> {
    this.#web3Instance = null;
    this.#currentProviderType = null;
    if (this.#w3modal && this.#w3modal.getIsConnected()) {
      await this.#w3modal?.disconnect();
    }
    this.#globalChannel.next({
      data: undefined,
      event: WEB3_EVENTS.DISCONNECTED,
    });
  }

  /**
   * Enforce personal_sign method for message signature
   * @param message - Human readable string to sign
   */
  @validate(z.string().min(3))
  async signMessage(message: string) {
    const signer = await this.getSigner();
    if (signer) {
      return signer.signMessage(message);
    }
  }

  async getSigner() {
    if (!this.#web3Instance) {
      this.#log.warn('Must provide a signer!');
      return;
    }
    return this.#web3Instance.getSigner();
  }

  /*
   * Resolve an address to an ENS name
   */
  @validate(z.string().min(20))
  async lookupAddress(address: string) {
    if (!this.#web3Instance) {
      return Promise.resolve({ ens: null });
    }
    const ens = await this.#web3Instance.lookupAddress(address);
    return { ens };
  }

  getRequiredNetwork() {
    if (!this.network) {
      throw new Error('The required ethereum network was not set!');
    }
    return createFormattedValue({ name: this.network, chainId: this.networkId[this.network] });
  }

  async switchToRequiredNetwork() {
    if (this.#web3Instance instanceof ethers.BrowserProvider) {
      const result = await this.#web3Instance.send('wallet_switchEthereumChain', [
        { chainId: this.#networkId },
      ]);
      return createFormattedValue(result);
    }
    const err: Error & {
      code?: number;
    } = new Error(`Method wallet_switchEthereumChain not supported on the current provider`);
    err.code = PROVIDER_ERROR_CODES.WrongNetwork;
    throw err;
  }

  async #_getCurrentAddress() {
    return this.#w3modal.getAddress() || null;
  }

  getCurrentEthAddress() {
    return this.#_getCurrentAddress();
  }

  checkCurrentNetwork() {
    return this.#_checkCurrentNetwork();
  }

  get CAIP10() {
    const chainIdNameSpace = `eip155:${this.state.chainId}`;
    const address = `${chainIdNameSpace}:${this.state.address}`;
    return {
      address,
      chainIdNameSpace,
    };
  }

  /**
   * Ensures that the web3 provider is connected to the specified network
   */
  async #_checkCurrentNetwork() {
    if (!this.#w3modal.getIsConnected()) {
      throw new Error('Must connect first to a provider!');
    }
    const network = this.#w3modal.getState();
    if (network.selectedNetworkId !== this.networkId[this.network]) {
      const error: Error & { code?: number } = new Error(
        `Please change the ethereum network to ${this.network}!`,
      );
      error.code = PROVIDER_ERROR_CODES.WrongNetwork;
      throw error;
    }
    this.#log.info(`currently on network: ${network.selectedNetworkId}`);
  }

  /*
   * Register event listeners for provider changes
   *
   * @param {Object} provider - The web3 provider instance
   * @param {Function} provider.on - The provider's 'on' method to add listeners
   *
   * Registers listeners for:
   * - accountsChanged - Emits event with new ETH address
   * - chainChanged - Emits event with new chain ID
   *
   * Throws errors if:
   * - Provider not specified
   * - Provider does not support .on() method
   */
  #_registerProviderChangeEvents(provider: {
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
  }) {
    if (!provider) {
      throw new Error('Provider not specified');
    }
    if (!provider.on) {
      throw new Error('Provider does not support on method');
    }
    provider.on('accountsChanged', ethAddress => {
      this.#log.warn(`ethereum address changed ${ethAddress}`);
      this.#globalChannel.next({
        data: {
          ethAddress,
        },
        event: WEB3_EVENTS.ACCOUNT_CHANGED,
      });
    });
    provider.on('chainChanged', chainId => {
      this.#log.warn(`ethereum chain ID changed ${chainId}`);
      this.#globalChannel.next({
        data: {
          chainId,
        },
        event: WEB3_EVENTS.CHAIN_CHANGED,
      });
    });
  }
}

export default Web3Connector;
