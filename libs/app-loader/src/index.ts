import {
  ContentBlockEvents,
  ExtensionPointEvents,
  IAppConfig,
  IntegrationRegistrationOptions,
  IPlugin,
  IRootComponentProps,
  RouteRegistrationEvents,
  UIEventData,
  WidgetEvents,
  WorldConfig,
} from '@akashaorg/typings/lib/ui';
import { Subject, Subscription } from 'rxjs';
import {
  hide404,
  hideError,
  hidePageSplash,
  show404,
  showError,
  showPageSplash,
} from './html-template-handlers';
import * as singleSpa from 'single-spa';
import {
  getReleaseById,
  getRemoteLatestExtensionInfos,
  getUserInstalledExtensions,
  getWorldDefaultExtensions,
} from './extensions';
import getSDK from '@akashaorg/awf-sdk';
import { ILogger } from '@akashaorg/typings/lib/sdk/log';
import Logging from '@akashaorg/awf-sdk/src/logging/index';
import {
  checkActivityFn,
  extractAppNameFromPath,
  getDomElement,
  getModalFromParams,
  navigateToModal,
  parseQueryString,
} from './utils';
import EventBus from '@akashaorg/awf-sdk/src/common/event-bus';
import { AUTH_EVENTS, EXTENSION_EVENTS } from '@akashaorg/typings/lib/sdk';
import { InstalledExtensionSchema } from '@akashaorg/awf-sdk/src/db/installed-extensions.schema';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { ContentBlockStore } from './plugins/content-block-store';
import { ExtensionPointStore } from './plugins/extension-point-store';
import { WidgetStore } from './plugins/widget-store';

const isWindow = window && typeof window !== 'undefined';

type SystemModuleType = {
  register?: (opts: IntegrationRegistrationOptions) => IAppConfig;
  initialize?: (opts: Partial<IntegrationRegistrationOptions>) => Promise<void> | void;
  registerPlugin?: (
    opts: Omit<IntegrationRegistrationOptions, 'layoutSlots'> & {
      encodeAppName: (name: string) => string;
      decodeAppName: (name: string) => string;
    },
  ) => Promise<IPlugin>;
  uninstall?: (opts: IntegrationRegistrationOptions) => Promise<void> | void;
};

export default class AppLoader {
  worldConfig: WorldConfig;
  uiEvents: Subject<UIEventData>;
  extensionConfigs: Map<string, IAppConfig & { name: string }>;
  extensionModules: Map<string, SystemModuleType>;
  extensionData: Awaited<ReturnType<typeof getWorldDefaultExtensions>>;
  layoutConfig: IAppConfig;
  logger: ILogger;
  parentLogger: Logging;
  plugins: IPlugin;
  globalChannel: EventBus;
  user: { id: string };
  globalChannelSub: Subscription;
  userExtensions: InstalledExtensionSchema[];
  appNotFound: boolean;
  erroredApps: string[];
  constructor(worldConfig: WorldConfig) {
    this.worldConfig = worldConfig;
    this.uiEvents = new Subject<UIEventData>();
    this.extensionConfigs = new Map();
    this.extensionModules = new Map();
    this.extensionData = [];
    this.layoutConfig = null;
    this.parentLogger = getSDK().services.log;
    this.logger = this.parentLogger.create('app-loader');
    this.plugins = {};
    this.globalChannel = getSDK().api.globalChannel;
    this.user = null;
    this.globalChannelSub = null;
    this.userExtensions = [];
    this.appNotFound = false;
    this.erroredApps = [];
  }

  start = async () => {
    if (isWindow) {
      showPageSplash();
      window.addEventListener('single-spa:before-first-mount', this.onBeforeFirstMount);
      window.addEventListener('single-spa:first-mount', this.onFirstMount);
      window.addEventListener('single-spa:routing-event', this.onRouting);
      singleSpa.addErrorHandler(err => {
        this.logger.error(`single-spa error: ${err}`);
        this.erroredApps.push(err.appOrParcelName);
        hideError(this.layoutConfig.extensionSlots.applicationSlotId);
        showError(this.layoutConfig.extensionSlots.applicationSlotId);
      });
    }

    singleSpa.start({
      urlRerouteOnly: true,
    });

    singleSpa.setUnmountMaxTime(5000, false);

    this.extensionData = await getWorldDefaultExtensions(this.worldConfig);

    const layoutData = this.extensionData.find(data => data.name === this.worldConfig.layout);

    if (!layoutData) {
      this.logger.error('layout not found. Cannot continue.');
      return;
    }
    this.extensionModules = await this.importModules(this.extensionData);
    await this.loadCorePlugins();
    await this.loadPlugins(this.extensionModules);
    await this.loadLayoutConfig();
    await this.initializeExtensions(this.extensionModules);
    this.extensionConfigs = this.registerExtensions(this.extensionModules);
    this.renderLayout();

    this.listenGlobalChannel().catch();
    // automatic logging in if previous session is detected
    const sdk = getSDK();
    await sdk.api.auth.getCurrentUser();
  };
  onBeforeFirstMount = () => {
    hidePageSplash();
  };
  onFirstMount = () => {
    this.singleSpaRegister(this.extensionConfigs);
  };
  onRouting = (ev: CustomEvent) => {
    const newURL = new URL(ev.detail.newUrl);
    const { appsByNewStatus } = ev.detail;
    if (this.appNotFound) {
      hide404(this.layoutConfig.extensionSlots.applicationSlotId);
    }
    // make sure we are no longer on the path of the broken app
    if (this.erroredApps.length && !appsByNewStatus.SKIP_BECAUSE_BROKEN.length) {
      // Note: The broken apps are siloed by the single-spa and it will not even try to mount them again.
      // So, this error is only seen now. Afterwards no error will be thrown and we cannot show a card anymore.
      hideError(this.layoutConfig.extensionSlots.applicationSlotId);
      // unload the app. Currently this does not have any effect on the frontend.
      // if we decide to also unregister the app, it will have some side-effects like plugins will no longer work
      // alternatively we can choose just to remove the menuItem from the sidebar.
      // @TODO: decide if we can also unregister the broken app.
      this.erroredApps.forEach(appName => {
        singleSpa.unloadApplication(appName);
      });

      this.erroredApps = [];
    }

    const actuallyMountedApps = appsByNewStatus.MOUNTED.filter(
      (name: string) => name !== this.worldConfig.layout,
    );

    if (
      newURL.pathname !== '/' &&
      appsByNewStatus.MOUNTED.length === 0 &&
      singleSpa.getAppNames().length > 0
    ) {
      // wrong typings for the parameters of the checkActivityFunctions
      // provided by the single-spa. More info: https://github.com/single-spa/single-spa/issues/1000
      const matchingApps = singleSpa.checkActivityFunctions(newURL as unknown as Location);
      if (matchingApps.filter(name => name !== this.worldConfig.layout).length === 0) {
        this.logger.warn(`No application matches path: ${newURL.pathname}`);
        const appName = extractAppNameFromPath(newURL.pathname);
        // hide if template was already mounted
        hide404(this.layoutConfig.extensionSlots.applicationSlotId);
        show404(
          this.layoutConfig.extensionSlots.applicationSlotId,
          appName,
          `/${this.worldConfig.extensionsApp}${this.extensionConfigs.get(this.worldConfig.extensionsApp)?.routes.default || '/'}`,
        );
        this.appNotFound = true;
      }
    }

    if ((!actuallyMountedApps || !actuallyMountedApps.length) && newURL.pathname === '/') {
      const homepageAppName = this.worldConfig.homepageApp;
      if (!homepageAppName) {
        this.logger.error(`There is no homepageApp defined in the world config! Cannot redirect!`);
        return;
      }
      if (isWindow) {
        window.history.replaceState(null, null, `/${this.worldConfig.homepageApp}/`);
      }
    }
  };
  importModules = async (extensionData: typeof this.extensionData) => {
    if (!extensionData.length) return;
    const sdk = getSDK();
    const modules = new Map();
    for (const extension of extensionData) {
      if (this.extensionModules.has(extension.name) || modules.has(extension.name)) {
        continue;
      }
      if ('isLocal' in extension && Object.hasOwn(extension, 'isLocal')) {
        if (!extension.source || typeof extension.source !== 'string') {
          this.logger.warn(
            `Locally loaded extensions requires a 'source: string' property but ${typeof extension.source} was provided for: ${extension.name}. Skipping!`,
          );
          continue;
        }
        const source = sdk.services.common.ipfs.buildOriginLink(extension.source);
        const module = await System.import<SystemModuleType>(`${source}`);
        modules.set(extension.name, module);
      } else {
        const latestReleaseNode = extension.releases?.edges[0]?.node;
        if (!latestReleaseNode || !latestReleaseNode?.source) {
          this.logger.warn(`There is no release or release source for the app: ${extension.name}`);
          continue;
        }
        const source = sdk.services.common.ipfs.multiAddrToUri(latestReleaseNode.source);
        const module = await System.import<SystemModuleType>(`${source}/index.js`);
        modules.set(extension.name, module);
      }
    }
    return modules;
  };
  listenGlobalChannel = async () => {
    // listen for user login event and fetch the extensions
    const sdk = getSDK();
    if (this.globalChannelSub) this.globalChannelSub.unsubscribe();

    this.globalChannelSub = sdk.api.globalChannel.subscribe({
      next: resp => {
        switch (resp.event) {
          case AUTH_EVENTS.SIGN_IN:
            this.handleLogin(resp.data);
            break;
          case AUTH_EVENTS.SIGN_OUT:
            this.handleLogout();
            break;
          case EXTENSION_EVENTS.INFO_READY:
            this.handleExtensionInstall(resp.data);
            break;
          case EXTENSION_EVENTS.REMOVED:
            this.handleExtensionUninstall(resp.data);
            break;
          default:
            break;
        }
      },
    });
  };
  handleLogin = (loginData: { id?: string }) => {
    // user logged in
    if (loginData && loginData.id) {
      this.user = { id: loginData.id };
      //@Todo: fix this
      //this.loadUserExtensions().catch(err => this.logger.error(err));
    }
  };
  handleLogout = () => {
    // unload user extensions
  };

  fireGlobalChannelEvent = (event, data) => {
    this.globalChannel.next({
      event,
      data,
    });
  };

  handleExtensionInstall = async (releaseData: { id?: string; version?: string }) => {
    // listen for extension installs
    if (!this.user?.id) {
      // user not logged in, cannot continue
      return;
    }
    const releaseNode = await getReleaseById(releaseData.id);
    if (!releaseNode) {
      console.log('error or release not found');
      this.fireGlobalChannelEvent(EXTENSION_EVENTS.INSTALL_STATUS, {
        error: 'release id not found',
      });
      return;
    }

    const src = releaseNode.source;

    if (!src) {
      this.fireGlobalChannelEvent(EXTENSION_EVENTS.INSTALL_STATUS, {
        error: 'release does not have a source',
      });
      return;
    }

    this.extensionData.push({ source: src, isLocal: false });
    const module = await this.importModules([{ source: src, isLocal: false }]);
    const plugins = await this.loadPlugins(module);
    this.plugins = Object.assign(this.plugins, plugins);
    await this.initializeExtensions(module);
    const extensionConfig = this.registerExtensions(module);
    this.singleSpaRegister(extensionConfig);
    this.fireGlobalChannelEvent(EXTENSION_EVENTS.INSTALL_STATUS, {
      progress: 'extension registered',
    });
  };

  handleExtensionUninstall = (data: { name?: string }) => {
    // listen for extension uninstalls
  };

  loadUserExtensions = async () => {
    // @TODO: implement when ready
    this.userExtensions = await getUserInstalledExtensions();
    const manifests = await getRemoteLatestExtensionInfos(
      this.userExtensions.map(e => ({ name: e.appName })),
    );
    const modules = await this.importModules(manifests);
    const _plugins = await this.loadPlugins(modules);
    await this.initializeExtensions(modules);
    const extensionConfigs = this.registerExtensions(modules);
    this.singleSpaRegister(extensionConfigs);
  };

  loadCorePlugins = async () => {
    const contentBlockStore = ContentBlockStore.getInstance(this.uiEvents);
    const extensionPointStore = ExtensionPointStore.getInstance(this.uiEvents);
    const widgetStore = WidgetStore.getInstance(this.uiEvents);

    this.plugins = Object.assign({}, this.plugins, {
      core: {
        contentBlockStore: {
          getInfos: contentBlockStore.getContentBlockInfos,
          getMatchingBlocks: contentBlockStore.getMatchingBlocks,
        },
        extensionPointStore: {
          getExtensionPoints: extensionPointStore.getExtensions,
          getMatchingExtensionPoints: extensionPointStore.getMatchingExtensions,
        },
        widgetStore: {
          getWidgets: widgetStore.getWidgets,
          getMatchingWidgets: widgetStore.getMatchingWidgets,
        },
      },
    });
  };

  loadPlugins = async (extensionModules: Map<string, SystemModuleType>) => {
    for (const [name, module] of extensionModules) {
      if (this.extensionConfigs.has(name)) {
        continue;
      }
      if (module.registerPlugin && typeof module.registerPlugin === 'function') {
        // load plugin;
        this.plugins[name] = await module.registerPlugin({
          worldConfig: this.worldConfig,
          logger: this.parentLogger.create(`${name}_plugin`),
          uiEvents: this.uiEvents,
          encodeAppName: name => name,
          decodeAppName: (name: string) => decodeURIComponent(name),
        });
      }
    }
  };

  initializeExtensions = async (extensionModules: Map<string, SystemModuleType>) => {
    for (const [name, module] of extensionModules) {
      if (module.initialize && typeof module.initialize === 'function') {
        await module.initialize({
          uiEvents: this.uiEvents,
          plugins: this.plugins,
          worldConfig: this.worldConfig,
          layoutSlots: this.layoutConfig.extensionSlots,
          logger: this.parentLogger.create(`${name}_initialize`),
        });
      }
    }
  };

  loadLayoutConfig = async () => {
    const layoutModule = this.extensionModules.get(this.worldConfig.layout);
    if (!layoutModule) {
      this.logger.error('Layout module not loaded!');
      return;
    }
    if (layoutModule.register && typeof layoutModule.register === 'function') {
      const logger = this.parentLogger.create(this.worldConfig.layout);
      this.layoutConfig = layoutModule.register({
        worldConfig: this.worldConfig,
        uiEvents: this.uiEvents,
        logger,
        layoutSlots: {},
      });
    }
  };

  registerExtensions = (extensionModules: Map<string, SystemModuleType>) => {
    const extensionConfigs = new Map();
    for (const [name, mod] of extensionModules) {
      if (name === this.worldConfig.layout) continue;
      if (this.extensionConfigs.has(name) || extensionConfigs.has(name)) continue;
      if (mod.register && typeof mod.register === 'function') {
        const config = mod.register({
          layoutSlots: this.layoutConfig.extensionSlots,
          worldConfig: this.worldConfig,
          logger: this.parentLogger.create(name),
          uiEvents: this.uiEvents,
        });
        extensionConfigs.set(name, { ...config, name });
        // fire register events
        this.uiEvents.next({
          event: RouteRegistrationEvents.RegisterRoutes,
          data: {
            name,
            menuItems: config?.menuItems,
            navRoutes: config?.routes,
          },
        });
        if (config?.contentBlocks) {
          this.uiEvents.next({
            event: ContentBlockEvents.RegisterContentBlock,
            data: config.contentBlocks.map(eb => ({ ...eb, appName: name })),
          });
        }
        if (config?.extensionPoints) {
          this.uiEvents.next({
            event: ExtensionPointEvents.RegisterExtensionPoint,
            data: config.extensionPoints.map(ext => ({ ...ext, appName: name })),
          });
        }
        const extensionData = this.extensionData.find(man => man.name === name);
        if (extensionData && extensionData.applicationType === AkashaAppApplicationType.Widget) {
          this.uiEvents.next({
            event: WidgetEvents.RegisterWidget,
            data: { ...config, appName: name },
          });
        }
      }
    }
    return extensionConfigs;
  };
  renderLayout = () => {
    const layoutConf = this.layoutConfig;
    const logger = this.parentLogger.create(this.worldConfig.layout);
    singleSpa.registerApplication({
      name: this.worldConfig.layout,
      app: layoutConf.loadingFn,
      activeWhen: () => true,
      customProps: {
        domElement: getDomElement(layoutConf, this.worldConfig.layout, logger),
        singleSpa,
        baseRouteName: `/${this.worldConfig.layout}`,
        encodeAppName: (name: string) => name,
        decodeAppName: (name: string) => decodeURIComponent(name),
        navigateToModal: navigateToModal,
        getModalFromParams: getModalFromParams,
        parseQueryString: parseQueryString,
        worldConfig: this.worldConfig,
        layoutSlots: layoutConf.extensionSlots,
        uiEvents: this.uiEvents,
        logger,
        plugins: this.plugins,
      },
    });
  };
  singleSpaRegister = (extensionConfigs: Map<string, IAppConfig & { name: string }>) => {
    for (const [name, conf] of extensionConfigs) {
      if (singleSpa.getAppNames().includes(name)) continue;
      if (!conf.loadingFn || typeof conf.loadingFn !== 'function') continue;

      const extensionData = this.extensionData.find(m => m.name === name);
      if (extensionData.applicationType !== AkashaAppApplicationType.App) continue;

      const activeWhen: singleSpa.Activity = checkActivityFn({
        config: conf,
        encodedAppName: decodeURIComponent(name),
        enabled: true,
        location,
        extensionType: extensionData.applicationType,
      });

      const customProps: IRootComponentProps & { domElementGetter: () => HTMLElement } = {
        domElementGetter: () => getDomElement(conf, name, this.logger),
        singleSpa,
        baseRouteName: `/${name}`,
        encodeAppName: name => name,
        decodeAppName: name => decodeURIComponent(name),
        navigateToModal: navigateToModal,
        getModalFromParams: getModalFromParams,
        parseQueryString: parseQueryString,
        worldConfig: this.worldConfig,
        layoutSlots: this.layoutConfig.extensionSlots,
        uiEvents: this.uiEvents,
        logger: this.parentLogger.create(name),
        plugins: this.plugins,
      };
      singleSpa.registerApplication({
        name,
        app: conf.loadingFn,
        activeWhen,
        customProps: {
          ...customProps,
        },
      });
    }
  };
}
