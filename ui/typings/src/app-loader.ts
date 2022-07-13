import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ParcelConfigObject } from 'single-spa';
import { LogoSourceType, RootComponentProps, RootExtensionProps, ValueOf } from './index';

export type ActivityFn = (
  location: Location,
  pathToActiveWhen: (path: string, exact?: boolean) => (location: Location) => boolean,
  layoutConfig?: IAppConfig['extensions'],
) => boolean;

export interface UIEventData {
  event: EventTypes;
  data?: EventDataTypes;
}

export interface ModalNavigationOptions {
  name: string;
  pubKey?: string;
  entryId?: string;
  entryType?: ItemTypes;
  [key: string]: string | unknown | undefined;
}

export interface IntegrationRegistrationOptions {
  worldConfig: {
    title: string;
  };
  uiEvents: RootComponentProps['uiEvents'];
  layoutConfig: IAppConfig['extensions'];
  integrations?: {
    manifests: BaseIntegrationInfo[];
    configs: Record<string, IAppConfig>;
  };
  extensionData?: UIEventData['data'];
}

export interface ExtensionMatcherFn<G = BehaviorSubject<unknown>> {
  (
    uiEvents: ReplaySubject<UIEventData>,
    globalChannel: G,
    extProps: Omit<
      RootExtensionProps,
      'uiEvents' | 'extensionData' | 'domElement' | 'baseRouteName'
    >,
    parentConfig: IAppConfig & { name: string },
  ): (extConfig: Record<string, ReturnType<ExtensionLoaderFn>>) => void;
}

/**
 * Extension loader function
 * must return a promise with a singleSpaLifecycle object
 */
export type ExtensionLoaderFn = (
  loadingFunction: () => Promise<ParcelConfigObject<Omit<RootExtensionProps, 'baseRouteName'>>>,
) => {
  load: (props: Omit<RootExtensionProps, 'baseRouteName'>, parentAppName: string) => void;
  unload: (event: UIEventData, parentAppName: string) => void;
};

export interface IAppConfig {
  /**
   * Optional property.
   * When defined, it overrides the default functionality
   * of loading based on application name
   * @example
   * Given the appName = `@akashaorg/some-app-name`
   * The default functionality is to match against a route which starts with `/@akashaorg/some-app-name`
   * By specifying the activeWhen property we can specify other pathname on which this app/widget will load
   *
   * ```
   * activeWhen: (location, singleSpaPathToActiveWhen) => {
   *         return singleSpaPathToActiveWhen('/@akashaorg/other-app-name')(location)
   * }
   * ```
   *
   * This functionality is most useful for widgets.
   */
  activeWhen?: ActivityFn;
  /**
   * The id of the html element
   * that this app will mount in
   **/
  mountsIn: string;

  /**
   * routes that are defined here can be used
   * by other apps for navigation
   */
  routes?: {
    [key: string]: string;
  };
  loadingFn: () => Promise<ISingleSpaLifecycle>;
  /**
   * A simple mapping of the extension points exposed by this widget
   */
  extensions?: {
    /**
     * load modals inside this node
     */
    modalSlotId?: string;
    /**
     * main app and plugin area
     */
    pluginSlotId?: string;
    /**
     * load root widgets inside this node
     * do not use this for app defined widgets
     */
    rootWidgetSlotId?: string;
    /**
     * topbar loading node
     */
    topbarSlotId?: string;
    /**
     * load app defined widgets into this node
     */
    widgetSlotId?: string;

    /**
     * cookie widget slot
     */
    cookieWidgetSlotId?: string;
    /**
     * sidebar area slot
     */
    sidebarSlotId?: string;
    /*
     * Mode for hiding the widget area
     * @warning: In the future, this will be deprecated
     */
    focusedPluginSlotId?: string;
    [key: string]: string;
  };

  /**
   * Defines the component that will be mounted into an extension point
   */
  extends?: (matcher: ReturnType<ExtensionMatcherFn>, extLoader: ExtensionLoaderFn) => void;

  /**
   * Keywords that defines this widget.
   * Useful for filtering through integrations
   * @deprecated - define it in app manifest (package.json)
   */
  tags?: string[];
  /**
   * Namespace used by the app for i18next
   */
  i18nNamespace?: string[];
  /**
   * Only used for topbar.
   * @deprecated - use extension points
   */
  menuItems: IMenuItem | IMenuItem[];
}

export type IWidgetConfig = Omit<IAppConfig, 'routes' | 'menuItems'>;

export enum LogLevels {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export enum INTEGRATION_TYPES {
  APPLICATION,
  PLUGIN,
  WIDGET,
}

export interface BaseIntegrationInfo {
  name: string;
  integrationType: INTEGRATION_TYPES;
  sources: string[];
  version?: string;
  enabled?: boolean;
}

export interface IntegrationModule {
  register?: (opts: IntegrationRegistrationOptions) => IAppConfig;
  getPlugin?: (
    opts: IntegrationRegistrationOptions & {
      encodeAppName: (name: string) => string;
      decodeAppName: (name: string) => string;
    },
  ) => Promise<PluginConf>;
}

export interface ISdkConfig {
  /**
   * Define the log level
   */
  logLevel: LogLevels;
}

/**
 * World configuration object
 */

export interface ILoaderConfig {
  /**
   * Apps that are installed by default on this world.
   * homePageApp is loaded by default, no need to be specified here
   */
  defaultApps: string[];
  /**
   * Widgets that are installed by default on this world.
   * layout widget is loaded by default, no need to be specified here
   */
  defaultWidgets: string[];
  /**
   * The layout widget of this world. This widget always mounts in the root element.
   */
  layout: string;
  /**
   * The app to load when you navigate to the home page.
   */
  homepageApp: string;
  /**
   * Define this world's title
   */
  title: string;
  analytics?: {
    siteId: string;
    trackerUrl: string;
  };
  registryOverrides?: BaseIntegrationInfo[];
}

export interface ISingleSpaLifecycle {
  bootstrap: (props: unknown) => Promise<unknown>;
  mount: (props: unknown) => Promise<unknown>;
  unmount: (props: unknown) => Promise<unknown>;
  update?: (props: unknown) => Promise<unknown>;
}

export enum MenuItemType {
  Plugin = 'plugin',
  App = 'app',
  Internal = 'internal',
}

export enum MenuItemAreaType {
  AppArea = 'app-area', // body of sidebar
  UserAppArea = 'user-app-area', // user installed app area of sidebar
  UserWidgetArea = 'user-widget-area', // user installed widget area of sidebar
  QuickAccessArea = 'quick-access-area', // right of topbar
  BottomArea = 'bottom-area', // footer of sidebar
  SearchArea = 'search-area', // middle of topbar
  OtherArea = 'other-area', // not displayed
}

export interface IMenuItem {
  index?: number;
  label: string;
  route?: string;
  type?: MenuItemType;
  area?: ValueOf<MenuItemAreaType>[]; // area is optional because subroutes dont have an area to be mounted
  logo?: LogoSourceType;
  name?: string;
  subRoutes?: IMenuItem[];
}

export enum EventTypes {
  Instantiated = 'instantiated',
  InstallIntegration = 'install-integration',
  RegisterIntegration = 'register-integration',
  UninstallIntegration = 'uninstall-integration',
  ExtensionPointMount = 'extension-point-mount',
  ExtensionPointMountRequest = 'extension-point-mount-request',
  ExtensionPointUnmount = 'extension-point-unmount',
  ExtensionPointUnmountRequest = 'extension-point-unmount-request',
  ModalRequest = 'modal-mount-request',
  ModalMount = 'modal-mount',
  ModalUnmount = 'modal-unmount',
  ShowSidebar = 'show-sidebar',
  HideSidebar = 'hide-sidebar',

  /*
   * Events that are handled by the layout widget
   */

  /**
   * `layout:ready` event is fired after first render, when the layout is
   * already subscribed to the event bus. We need this event for the initial load
   * of the world app, when we might have a modal to load.
   */
  LayoutReady = 'layout:ready',
  LayoutShowLoadingUser = 'layout:show-loading-user',
  LayoutShowAppLoading = 'layout:show-app-loading',
  LayoutShowAppNotFound = 'layout:show-app-not-found',
  ThemeChange = 'theme-change',
}

export type EventDataTypes = {
  name: string;
  version?: string;
  entryId?: string;
  entryType?: ItemTypes;
  menuItems?: IMenuItem | IMenuItem[];
  navRoutes?: Record<string, string>;
  [key: string]: unknown;
};

export const enum ItemTypes {
  ENTRY = 0,
  PROFILE,
  COMMENT,
  TAG,
}

export interface PluginConf {
  [namespace: string]: {
    [key: string]: unknown;
  };
}
