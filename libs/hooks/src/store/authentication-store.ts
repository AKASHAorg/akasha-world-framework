import getSDK from '@akashaorg/core-sdk';
import type {
  IGetProfileInfo,
  IAuthenticationState,
  IAuthenticationStore,
} from '@akashaorg/typings/lib/ui';
import { createStore } from 'jotai';
import { atomWithImmer } from 'jotai-immer';

const store = createStore();

/**
 * Singleton store for managing login, logout, session restoration and fetching profile.
 * It uses jotai to manage the store
 */
export class AuthenticationStore<T> implements IAuthenticationStore<T> {
  #initialState: IAuthenticationState<T> = {
    authenticatedDID: null,
    authenticatedProfile: null,
    authenticatedProfileError: null,
    isAuthenticating: false,
    authenticationError: null,
  };
  #sdk = getSDK();
  static #instance = null;
  #getProfileInfo: IGetProfileInfo<T>['getProfileInfo'];
  #userAtom = atomWithImmer<IAuthenticationState<T>>(this.#initialState);

  /**
   * Prevent singleton store from being instantiated outside of this class
   */
  private constructor(getProfileInfo: IGetProfileInfo<T>['getProfileInfo']) {
    this.#getProfileInfo = getProfileInfo;
    this.#restoreSession();
  }

  /**
   * Get the singleton instance
   */
  static getInstance<T>(
    getProfileInfo: IGetProfileInfo<T>['getProfileInfo'],
  ): AuthenticationStore<T> {
    if (!AuthenticationStore.#instance) {
      AuthenticationStore.#instance = new AuthenticationStore<T>(getProfileInfo);
    }
    return AuthenticationStore.#instance;
  }

  /**
   * Handles login
   */
  login = async ({ provider, checkRegistered = false }) => {
    try {
      store.set(this.#userAtom, prev => ({
        ...prev,
        isAuthenticating: true,
      }));
      const result = await this.#sdk.api.auth.signIn({
        provider,
        checkRegistered,
      });
      if (!result?.data?.id) {
        store.set(this.#userAtom, prev => ({
          ...prev,
          isAuthenticating: false,
        }));
        return;
      }
      await this.#handleLoggedInState(result.data?.id);
    } catch (error) {
      store.set(this.#userAtom, prev => ({
        ...prev,
        authenticationError: error,
        isAuthenticating: false,
      }));
    }
  };

  /**
   * Handles logout
   * Reset the store to the initial state
   */
  logout = () => {
    this.#sdk.api.auth.signOut().then(() => {
      store.set(this.#userAtom, () => this.#initialState);
    });
  };

  /**
   * Handles logged in state
   * Fetch the authenticated profile info for the authenticatedDID and set the authenticatedProfile state
   */
  #handleLoggedInState = async (authenticatedDID: string) => {
    if (authenticatedDID) {
      const { data: profileInfo, error } = await this.#getProfileInfo({
        profileDID: authenticatedDID,
      });
      store.set(this.#userAtom, prev => ({
        ...prev,
        authenticatedDID,
        authenticatedProfile: profileInfo,
        authenticatedProfileError: error,
        isAuthenticating: false,
      }));
    }
  };

  /**
   * Initiates session restore for current authenticated user
   **/
  #restoreSession = async () => {
    try {
      store.set(this.#userAtom, prev => ({
        ...prev,
        isAuthenticating: true,
      }));
      const result = await this.#sdk.api.auth.getCurrentUser();
      if (!result) {
        store.set(this.#userAtom, prev => ({
          ...prev,
          isAuthenticating: false,
        }));
        return;
      }
      await this.#handleLoggedInState(result?.id);
    } catch (error) {
      store.set(this.#userAtom, prev => ({
        ...prev,
        authenticationError: error,
        isAuthenticating: false,
      }));
    }
  };

  /**
   * Takes a callback function and subscribes it to the store, when the store changes the callback is invoked.
   * This in turns causes a component to re-render
   * @param listener - callback listener which subscribes to the store
   * @returns function that cleans up the subscription
   **/
  subscribe = (listener: () => void) => {
    const subscription = store.sub(this.#userAtom, listener);
    return () => subscription();
  };

  /**
   * Get a snapshot of store data
   */
  getSnapshot = () => {
    return store.get(this.#userAtom);
  };
}
