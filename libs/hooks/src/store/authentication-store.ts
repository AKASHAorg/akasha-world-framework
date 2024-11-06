import getSDK from '@akashaorg/core-sdk';
import type {
  IGetProfileInfo,
  IAuthenticationState,
  IAuthenticationStore,
} from '@akashaorg/typings/lib/ui';
import { createStore } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import { AUTH_EVENTS, CurrentUser } from '@akashaorg/typings/lib/sdk';

const store = createStore();

/**
 * Singleton store for managing login, logout, session restoration and fetching profile.
 * It uses jotai to manage the store
 */
/**
 * Singleton store for managing login, logout, session restoration and fetching profile.
 * It uses jotai to manage the store.
 *
 * @class AuthenticationStore
 * @implements {IAuthenticationStore<T>}
 * @template T
 */
/**
 * Singleton store for managing login, logout, session restoration and fetching profile.
 * It uses jotai to manage the store.
 *
 * @class AuthenticationStore
 * @implements {IAuthenticationStore<T>}
 * @template T
 */
/**
 * The AuthenticationStore class is a singleton store that manages login, logout, session restoration, and fetching user profile information. It uses the jotai library to manage the store state.
 *
 * The class provides methods to handle user authentication, including logging in, logging out, and restoring the current user's session. It also provides a method to subscribe to changes in the store state, allowing components to re-render when the authentication state changes.
 *
 * The class is designed to be a singleton, with a static `getInstance` method that returns the single instance of the class. The constructor is private, preventing the class from being instantiated directly.
 *
 * @class AuthenticationStore
 * @implements {IAuthenticationStore<T>}
 * @template T
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
  #logger = this.#sdk.services.log.create('AuthenticationStore');
  static #instance = null;
  #getProfileInfo: IGetProfileInfo<T>['getProfileInfo'];
  #userAtom = atomWithImmer<IAuthenticationState<T>>(this.#initialState);

  /**
   * Prevent singleton store from being instantiated outside of this class
   */
  private constructor(getProfileInfo: IGetProfileInfo<T>['getProfileInfo']) {
    this.#getProfileInfo = getProfileInfo;
    // the order here is important
    this.#initEventListeners();
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

  #initEventListeners() {
    this.#sdk.api.globalChannel.subscribe({
      next: resp => {
        switch (resp.event) {
          case AUTH_EVENTS.READY:
            this.#handleLoggedInState((resp.data as CurrentUser).id).then(() => {
              this.#logger.info('AuthenticationStore signed in');
            });
            break;
          case AUTH_EVENTS.SIGN_OUT:
            this.#logger.info('Store signing out');
            store.set(this.#userAtom, () => this.#initialState);
            break;
          default:
            break;
        }
      },
    });
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
      this.#logger.info('Signed out');
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
