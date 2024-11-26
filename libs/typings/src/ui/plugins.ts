import { IContentBlockStorePlugin } from './editor-blocks';
import { IExtensionPointStorePlugin } from './extension-point';
import { NavigateToParams } from './navigation';
import { IMenuItem, MenuItemAreaType } from './sidebar-menu-items';
import { IWidgetStorePlugin } from './widgets';
import { AkashaApp } from '../sdk/graphql-types-new';

/**
 * Interface defining plugin configuration object
 */
export interface IPlugin {
  [namespace: string]: {
    [key: string]: any;
  };
}

/**
 * Type defining param of a function which fetches profile info
 * @internal
 **/
type UserInfoParams = {
  profileDID: string;
};

/**
 * Interface defining method for fetching profile info inside a profile plugin
 */
export interface IGetProfileInfo<T> {
  getProfileInfo(params: UserInfoParams): Promise<{ data: T; error: string }>;
}

/**
 * Interface defining a profile plugin
 */
export interface IProfilePlugin<T> {
  getProfileInfo: IGetProfileInfo<T>['getProfileInfo'];
}

type RouteMenuItem = IMenuItem & { navRoutes: Record<string, string> };

export type RouteRepository = {
  all: Record<string, RouteMenuItem>;
  activeExtensionsNames: {
    apps?: string[];
    widgets?: string[];
  };
  byArea: { [key in MenuItemAreaType]?: Array<RouteMenuItem> };
};

/**
 * The routing plugin is part of core plugins provided by the app-loader.
 * It contains methods to navigate between apps, and access to all the routes registered by the installed
 * and default apps.
 **/

export interface IRoutingPlugin {
  registerRoute(routeData: {
    name: string;
    menuItems?: IMenuItem | IMenuItem[];
    navRoutes?: Record<string, string>;
  }): void;
  unregisterRoute(extensionName: string): void;
  navigateTo(params: NavigateToParams, replace?: boolean): void;
  getUrlForApp(params: NavigateToParams): string;
  handleRedirect(options: { search: URLSearchParams; fallback: NavigateToParams }): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): RouteRepository;
}

type InstallerErrorCodes =
  | 'USER_NOT_CONNECTED'
  | 'EXTENSION_NOT_FOUND'
  | 'EXTENSION_FETCH_ERROR'
  | 'EXTENSION_DATA_INVALID'
  | 'EXTENSION_RELEASE_DATA_INVALID'
  | 'EXTENSION_IMPORT_ERROR'
  | 'EXTENSION_INITIALIZATION_FAILED'
  | 'EXTENSION_REGISTER_RESOURCES_FAILED'
  | 'EXTENSION_REGISTRATION_FAILED'
  | 'EXTENSION_INFO_SAVE_FAILED'
  | 'EXTENSION_FINALIZATION_FAILED';

type InstallerStatusCodes =
  | 'FETCHING_EXTENSION_DATA'
  | 'IMPORTING_MODULE'
  | 'REGISTERING_RESOURCES'
  | 'REGISTERING_RESOURCES_SUCCESS'
  | 'INITIALIZING_EXTENSION'
  | 'REGISTERING_EXTENSION'
  | 'SAVING_EXTENSION_INFO'
  | 'FINALIZING_INSTALL'
  | 'INSTALL_SUCCESS';

type InstallerStaticCodes = {
  error: Record<InstallerErrorCodes, symbol>;
  status: Record<InstallerStatusCodes, symbol>;
};

/**
 * Core plugin for installing extensions.
 */
export interface IExtensionInstallerPlugin {
  /**
   * Starts the installation flow of an extension
   * If the extension has additional resources to register (ex. composeDB models)
   * this function will return right after registering additional resources.
   * The installation should be resumed by calling postInstallExtension().
   */
  installExtension(extensionName: string): Promise<void>;

  acceptUserAgreement(extensionData: AkashaApp): Promise<void>;

  /**
   * Resumes the installation after additional resources were registered
   * (ex. signature successfully handled)
   */
  postInstallExtension(): Promise<void>;

  /**
   * Cancels the current installation process.
   */
  cancelInstallation(): Promise<void>;

  /**
   * Retry the execution from an error based on the provided error status.
   */
  retryFromError(errorStatus: symbol): Promise<void>;

  /**
   * Returns the static status codes that will be used for installing/uninstalling progress/status.
   */
  getStaticStatusCodes(): InstallerStaticCodes;
  subscribe(
    listener: (status: { currentStatus?: symbol; errorStatus?: symbol }) => void,
  ): () => void;
}

export type CorePlugins = {
  routing: IRoutingPlugin;
  contentBlockStore: IContentBlockStorePlugin;
  extensionPointStore: IExtensionPointStorePlugin;
  widgetStore: IWidgetStorePlugin;
  extensionInstaller: IExtensionInstallerPlugin;
  extensionUninstaller: {
    uninstallExtension(extensionName: string): void;
  };
};
