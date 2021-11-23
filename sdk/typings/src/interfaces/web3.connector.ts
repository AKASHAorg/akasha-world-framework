import ILogService, { ILogger } from './log';
import { Observable } from 'rxjs';

export enum EthProviders {
  None = 1,
  Web3Injected,
  WalletConnect,
  FallbackProvider,
  Torus,
}

export interface IWeb3Connector<T> {
  network: string;
  networkId: Readonly<{
    kovan: number;
    rinkeby: number;
    mainnet: number;
    goerli: number;
    ropsten: number;
  }>;
  readonly provider: T;

  connect(provider: EthProviders): Promise<boolean>;

  disconnect(): void;

  signMessage(message: string): Promise<any>;

  getCurrentAddress(): Observable<{ data: string | null }>;

  checkCurrentNetwork(): Observable<{ data: void }>;
}
