import getSDK from '@akashaorg/core-sdk';
import { filter } from 'rxjs';
import { GlobalEventBusData, WEB3_EVENTS } from '@akashaorg/typings/lib/sdk';
import React, { useEffect, useState } from 'react';
import { logError } from './utils/error-handler';

/**
 * A utility function to switch to required network for supported wallets
 */
export const switchToRequiredNetwork = async () => {
  const sdk = getSDK();
  await sdk.services.common.web3.switchToRequiredNetwork();
};

const checkNetworkState = async () => {
  const sdk = getSDK();
  const res = { networkNotSupported: false };
  try {
    await sdk.services.common.web3.checkCurrentNetwork();
  } catch (error) {
    res.networkNotSupported = true;
  }
  return res;
};

/**
 * Hook to check if the web3 provider is set to function on the Rinkeby test network
 * @param enabler - boolean (optional) that can control when to start verifying network state
 * @returns networkNotSupported: true if web3 provider is not on the specified network
 * @example useNetworkState hook
 * ```typescript
 * const networkStateQuery = useNetworkState(true);
 *
 * const networkNotSupported = networkStateQuery.data.networkNotSupported;
 * ```
 */
export function useNetworkState(enabler?: boolean) {
  const [data, setData] = useState<{
    networkNotSupported: boolean;
  }>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await checkNetworkState();
        if (res) {
          setData(res);
          setIsLoading(false);
          setIsFetched(true);
        }
      } catch (err) {
        setError(err);
        logError('useNetworkState', err);
        setIsLoading(false);
        setIsFetched(true);
      }
    };

    if (enabler) {
      fetchData();
    }
  }, [enabler]);

  return { data, isLoading, error, isFetched };
}

const getCurrentNetwork = () => {
  const sdk = getSDK();
  const res = sdk.services.common.web3.network;
  return res;
};

/**
 * Hook to check the user's current web3 network
 * @returns network name
 * @example useCurrentNetwork hook
 * ```typescript
 * const currentNetworkQuery = useCurrentNetwork(true);
 *
 * const network = currentNetworkQuery.data;
 * ```
 */
export function useCurrentNetwork(enabler?: boolean) {
  const [data, setData] = useState<string>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCurrentNetwork();
        if (res) {
          setData(res);
          setIsLoading(false);
        }
      } catch (err) {
        setError(err);
        logError('useCurrentNetwork', err);
        setIsLoading(false);
      }
    };

    if (enabler) {
      fetchData();
    }
  }, [enabler]);

  return { data, isLoading, error };
}

const getRequiredNetwork = async () => {
  const sdk = getSDK();
  const networkName = sdk.services.common.web3.getRequiredNetwork();
  return networkName.data;
};

/**
 * A hook to get required network name from the SDK
 * @example useRequiredNetworkName hook
 * ```typescript
 * const requiredNetworkQuery = useRequiredNetworkName();
 *
 * const requiredNetworkName = requiredNetworkQuery.data;
 * ```
 */
export function useRequiredNetwork() {
  const [data, setData] = useState<{
    name: string;
    chainId: string;
  }>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRequiredNetwork();
        if (res) {
          setData(res);
          setIsLoading(false);
          setIsSuccess(true);
        }
      } catch (err) {
        setError(err);
        logError('useRequiredNetwork', err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error, isSuccess };
}

export function useNetworkChangeListener() {
  const [currentNetwork, setCurrentNetwork] = React.useState(null);
  const globalChannel = getSDK().api.globalChannel;
  const call = globalChannel.pipe(filter(data => data.event === WEB3_EVENTS.CHAIN_CHANGED));
  const sub = call.subscribe((event: GlobalEventBusData<{ chainId: number | string }>) => {
    if (!currentNetwork || currentNetwork.chainId !== event.data?.chainId) {
      setCurrentNetwork(event.data);
    }
  });
  const unsubscribe = () => {
    sub.unsubscribe();
  };
  return [currentNetwork, unsubscribe];
}
