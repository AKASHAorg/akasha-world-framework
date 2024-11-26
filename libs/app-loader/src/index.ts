import { Subject, Subscription } from 'rxjs';
import {
  hide404,
  hideError,
  hideLoadingCard,
  hideNotLoggedIn,
  hidePageSplash,
  show404,
  showError,
  showLoadingCard,
  showNotLoggedIn,
  showPageSplash,
} from './html-template-handlers';
import * as singleSpa from 'single-spa';
import {
  getRemoteExtensionLatestVersion,
  getRemoteLatestExtensionInfos,
  getUserInstalledExtensions,
  getWorldDefaultExtensions,
} from './extensions';
import getSDK, { SDK_Services, SDK_API } from '@akashaorg/core-sdk';
import { InstalledExtensionSchema } from '@akashaorg/core-sdk/lib/db/installed-extensions.schema';
import {
  CorePlugins,
  IAppConfig,
  IPlugin,
  IRootComponentProps,
  UIEventData,
  WorldConfig,
} from '@akashaorg/typings/lib/ui';
import { ILogger } from '@akashaorg/typings/lib/sdk/log';
import {
  checkActivityFn,
  extractAppNameFromPath,
  getDomElement,
  getModalFromParams,
  navigateToModal,
  parseQueryString,
} from './utils';
import { AUTH_EVENTS } from '@akashaorg/typings/lib/sdk';
import { AkashaApp, AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { ContentBlockStore } from './plugins/content-block-store';
import { ExtensionPointStore } from './plugins/extension-point-store';
import { WidgetStore } from './plugins/widget-store';
import { ExtensionInstaller } from './plugins/extension-installer';
import { SystemModuleType } from './type-utils';
import { RoutingPlugin } from './plugins/routing-plugin';

const isWindow = window && typeof window !== 'undefined';
const encodeAppName = (name: string) => (isWindow ? encodeURIComponent(name) : name);
const decodeAppName = (name: string) => (isWindow ? decodeURIComponent(name) : name);

const selectLatestRelease = (extData: AppLoader['extensionData'][0]) => {
  if (extData.releasesCount > 0) {
    return extData.releases.edges
      .slice()
      .sort((a, b) => {
        return Date.parse(b.node.createdAt) - Date.parse(a.node.createdAt);
      })
      .at(0);
  }
};

export default class AppLoader {
  worldConfig: WorldConfig;
  uiEvents: Subject<UIEventData>;
  extensionConfigs: Map<string, IAppConfig & { name: string }>;
  extensionModules: Map<string, SystemModuleType>;
  extensionData: Awaited<ReturnType<typeof getWorldDefaultExtensions>>;
  layoutConfig: IAppConfig;
  logger: ILogger;
  parentLogger: SDK_Services['log'];
  plugins: IPlugin & {
    core: CorePlugins;
  };
  globalChannel: SDK_API['globalChannel'];
  user: { id: string };
  globalChannelSub: Subscription;
  userExtensions: InstalledExtensionSchema[];
  appNotFound: boolean;
  erroredApps: string[];
  isLoadingUserExtensions: boolean;
  constructor(worldConfig: WorldConfig) {
    this.worldConfig = worldConfig;
    this.uiEvents = new Subject<UIEventData>();
    this.extensionConfigs = new Map();
    this.extensionModules = new Map();
    this.extensionData = [];
    this.layoutConfig = null;
    this.parentLogger = getSDK().services.log;
    this.logger = this.parentLogger.create('app-loader');
    this.globalChannel = getSDK().api.globalChannel;
    this.user = null;
    this.globalChannelSub = null;
    this.userExtensions = [];
    this.appNotFound = false;
    this.erroredApps = [];
    this.isLoadingUserExtensions = false;
  }

  start = async () => {
    if (isWindow) {
      showPageSplash();
      window.addEventListener('single-spa:before-first-mount', this.onBeforeFirstMount);
      window.addEventListener('single-spa:first-mount', this.onFirstMount);
      window.addEventListener('single-spa:routing-event', this.onRouting);
      window.addEventListener('single-spa:before-mount-routing-event', this.beforeMountRouting);
      window.addEventListener('single-spa:app-change', this.onAppChange);
      window.addEventListener('single-spa:before-app-change', this.beforeAppChange);
      window.addEventListener('unhandledrejection', err => {
        this.logger.warn('unhandledrejection %o', err);
        hidePageSplash();
        if (this.layoutConfig) {
          showError({
            slot: this.layoutConfig?.extensionSlots.applicationSlotId,
            onRefresh: () => {
              window.location.reload();
            },
          });
        }
      });
      singleSpa.addErrorHandler(err => {
        this.logger.error('singleSpa error handler: %o', err);
        if (singleSpa.getAppStatus(err.appOrParcelName) === singleSpa.LOAD_ERROR) {
          this.logger.error('extension %s errored', err);
        }
        this.erroredApps.push(err.appOrParcelName);
        hideError(this.layoutConfig.extensionSlots.applicationSlotId);
        showError({
          slot: this.layoutConfig.extensionSlots.applicationSlotId,
          onRefresh: () => window.location.reload(),
          onUnload: () => {
            singleSpa.unloadApplication(err.appOrParcelName);
            this.plugins.core.routing.unregisterRoute(err.appOrParcelName);
          },
        });
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
    const plugins = await this.loadPlugins(this.extensionConfigs, this.extensionModules);
    this.plugins = { ...this.plugins, ...plugins };
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

  beforeMountRouting = () => {
    if (this.layoutConfig) {
      hideNotLoggedIn(this.layoutConfig.extensionSlots.applicationSlotId);
    }
  };
  beforeAppChange = (ev: CustomEvent<singleSpa.SingleSpaCustomEventDetail>) => {
    const { newUrl, oldUrl } = ev.detail;
    const appName = extractAppNameFromPath(new URL(newUrl).pathname);
    const status = singleSpa.getAppStatus(appName);
    const appsWithUnsavedChangesModal = ['@akashaorg/app-antenna', '@akashaorg/app-profile'];

    if (
      status === singleSpa.NOT_LOADED &&
      !appsWithUnsavedChangesModal.some(_ns => oldUrl.includes(_ns))
    ) {
      showLoadingCard(this.layoutConfig.extensionSlots.applicationSlotId);
    }
  };

  onAppChange = () => {
    if (!this.isLoadingUserExtensions) {
      hideLoadingCard(this.layoutConfig.extensionSlots.applicationSlotId);
    }
  };

  onRouting = async (ev: CustomEvent<singleSpa.SingleSpaCustomEventDetail>) => {
    const newURL = new URL(ev.detail.newUrl);
    const { appsByNewStatus } = ev.detail;
    if (this.appNotFound) {
      hide404(this.layoutConfig?.extensionSlots.applicationSlotId);
    }

    if (this.layoutConfig) {
      hideLoadingCard(this.layoutConfig.extensionSlots.applicationSlotId);
    }

    const appName = extractAppNameFromPath(newURL.pathname);
    // make sure we are no longer on the path of the broken app
    if (this.erroredApps.length && !appsByNewStatus.SKIP_BECAUSE_BROKEN.length) {
      // Note: The broken apps are siloed by the single-spa, and it will not even try to mount them again.
      // So, this error is only seen now. Afterward no error will be thrown and we cannot show a card anymore.
      hideError(this.layoutConfig.extensionSlots.applicationSlotId);
      // unload the app. Currently this does not have any effect on the frontend.
      // if we decide to also unregister the app, it will have some side-effects like plugins will no longer work
      // alternatively we can choose just to remove the menuItem from the sidebar.
      // @TODO: decide if we can also unregister the broken app.
      this.erroredApps.forEach(extName => {
        if (appName === extName) {
          showError({
            slot: this.layoutConfig.extensionSlots.applicationSlotId,
            onRefresh: () => window.location.reload(),
            onUnload: () => {
              System.delete(System.resolve(extName));
              this.plugins.core.routing.unregisterRoute(extName);
              singleSpa.unloadApplication(extName);
            },
          });
        }
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
        if (!this.user && !this.isLoadingUserExtensions) {
          // show not logged in error card
          showNotLoggedIn(this.layoutConfig?.extensionSlots.applicationSlotId, () => {
            this.plugins.core.routing.navigateTo({
              appName: '@akashaorg/app-auth-ewa',
              getNavigationUrl: appRoutes => {
                return `${appRoutes.Connect}?${new URLSearchParams({
                  redirectTo: location.pathname,
                }).toString()}`;
              },
            });
          });
          return;
        }

        if (this.isLoadingUserExtensions) {
          showLoadingCard(this.layoutConfig.extensionSlots.applicationSlotId);
          return;
        }
        // hide if template was already mounted
        hide404(this.layoutConfig.extensionSlots.applicationSlotId);
        show404(
          this.layoutConfig.extensionSlots.applicationSlotId,
          appName,
          `/${this.worldConfig.extensionsApp}${this.extensionConfigs.get(this.worldConfig.extensionsApp)?.routes.default || '/'}`,
          this.worldConfig.title,
        );
        this.appNotFound = true;
        return;
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

  importModules = async (
    extensionData: AppLoader['extensionData'],
  ): Promise<AppLoader['extensionModules']> => {
    if (!extensionData.length) return;
    const modules = new Map();
    for (const extension of extensionData) {
      if (this.extensionModules.has(extension.name) || modules.has(extension.name)) {
        continue;
      }
      const module = await this.importModule(extension);
      if (module) {
        modules.set(extension.name, module);
      }
    }
    return modules;
  };

  importModule = async (extensionData: AppLoader['extensionData'][0]) => {
    if ('isLocal' in extensionData && Object.hasOwn(extensionData, 'isLocal')) {
      if (!extensionData.source || typeof extensionData.source !== 'string') {
        this.logger.warn(
          'Locally loaded extensions requires a `source: string` property but %s was provided for: %s. Skipping!',
          typeof extensionData.source,
          extensionData.name,
        );
        return null;
      }
      try {
        const source = this.getUriFromSource(extensionData.source);
        if (source) {
          return System.import<SystemModuleType>(`${source}`);
        }
      } catch (err) {
        this.logger.error(
          'Locally loaded extension %s failed to load. %s',
          extensionData.name,
          extensionData.source,
        );
        return;
      }
    } else {
      const latestRelease = selectLatestRelease(extensionData);
      if (!latestRelease || !latestRelease?.node) {
        this.logger.warn('The release node is missing for the app: %s', extensionData.name);
        return null;
      }
      if (!latestRelease.node?.source) {
        this.logger.warn(
          'The release does not have a source. Cannot load app: %s. %o',
          extensionData.name,
          extensionData,
        );
        return null;
      }
      try {
        const source = this.getUriFromSource(latestRelease.node.source);
        if (source) {
          return System.import<SystemModuleType>(`${source}`);
        }
      } catch (err) {
        this.logger.error(
          'Cannot import the script files of %s. error: %s',
          extensionData.name,
          err.message,
        );
      }
    }
  };
  getUriFromSource = (source: string) => {
    if (source.startsWith('https://')) {
      if (!source.endsWith('.js')) {
        this.logger.warn(
          'When using HTTPS:// protocol make sure you include the full path to the entry file. eg. `https://example.com/path/to/index.js',
        );
        return null;
      }
      return source;
    }
    if (source.startsWith('ipfs://') || source.startsWith('/ipfs/')) {
      const hash = source.replace('ipfs://', '').replace('/ipfs/', '');
      const src = getSDK().services.common.ipfs.buildIpfsLinks(hash);
      return `${src.originLink}/index.js`;
    }
    return null;
  };
  listenGlobalChannel = async () => {
    // listen for user login event and fetch the extensions
    const sdk = getSDK();
    if (this.globalChannelSub) this.globalChannelSub.unsubscribe();

    this.globalChannelSub = sdk.api.globalChannel.subscribe({
      next: resp => {
        switch (resp.event) {
          case AUTH_EVENTS.READY:
            this.handleLogin(resp.data);
            break;
          case AUTH_EVENTS.SIGN_OUT:
            this.handleLogout();
            break;
          default:
            break;
        }
      },
    });
  };

  handleLogin = async (loginData: { id?: string }) => {
    // user logged in
    if (!loginData?.id) {
      return;
    }
    this.user = { id: loginData.id };

    this.isLoadingUserExtensions = true;

    this.userExtensions = await getUserInstalledExtensions();
    if (!this.userExtensions?.length) {
      // no extensions to load
      return;
    }
    const resp = await getRemoteLatestExtensionInfos(
      this.userExtensions.map(e => ({ name: e.appName })),
    );

    const extData = [];
    for (const extension of this.userExtensions) {
      extData.push({
        ...resp.find(ext => ext.name === extension.appName),
        ...extension,
        isLocal: true,
      });
    }

    this.extensionData = [...this.extensionData, ...extData];

    const modules = await this.importModules(extData);
    const plugins = await this.loadPlugins(this.extensionConfigs, modules);
    this.plugins = { ...this.plugins, ...plugins };
    await this.initializeExtensions(modules);
    const extensionConfigs = this.registerExtensions(modules);
    this.singleSpaRegister(extensionConfigs);
    this.isLoadingUserExtensions = false;
  };
  redirectHomeApp = () => {
    singleSpa.navigateToUrl(`/${this.worldConfig.homepageApp}/`);
  };
  // @todo: avoid needing for a full page refresh
  /**
   * Things to consider:
   * Plugins of the installed extensions will be removed.
   *   - plugins are passed as props so we need a way to update every extension
   * Cannot call singlespa.unregisterApplication
   *    - this will make that extension to be blacklisted (until a full page refresh)
   *  ExtensionPoints also needs to be unloaded.
   *    - parcels have an api to unmount.
   **/
  handleLogout = async () => {
    const mounted = singleSpa.getMountedApps();

    const isUserExtMounted = mounted.some(name =>
      this.userExtensions.some(ext => ext.appName === name),
    );

    // unload user extensions
    for (const ext of this.userExtensions) {
      if (ext.applicationType === AkashaAppApplicationType.Widget) {
        this.plugins.core.widgetStore.unregisterWidget(ext.appName);
        return;
      }
      // is an app.
      await singleSpa.unregisterApplication(ext.appName);
      const module = this.extensionModules.get(ext.appName);
      if (module) {
        const plugins = await this.loadPlugins(new Map(), new Map().set(ext.appName, module));
        for (const ns of Object.keys(plugins)) {
          if (this.plugins[ns]) {
            delete this.plugins[ns];
          }
        }
        if (this.extensionModules.has(ext.appName)) {
          this.extensionModules.delete(ext.appName);
        }
        if (this.extensionConfigs.has(ext.appName)) {
          this.extensionConfigs.delete(ext.appName);
        }
        this.userExtensions = this.userExtensions.filter(uExt => uExt.appName === ext.appName);
      }
      this.plugins.core.routing.unregisterRoute(ext.appName);
    }
    // if any of the mounted extensions are the user installed ones redirect to homepageApp
    if (isUserExtMounted) {
      this.redirectHomeApp();
    }
    this.user = null;
  };
  // no need for other cleanups because we'll trigger a full page refresh
  uninstallExtension = async (extensionName: string) => {
    const sdk = getSDK();
    try {
      await sdk.services.appSettings.uninstall(extensionName);
      return true;
    } catch (err) {
      return false;
    }
  };

  loadCorePlugins = async () => {
    const contentBlockStore = ContentBlockStore.getInstance();
    const extensionPointStore = ExtensionPointStore.getInstance();
    const widgetStore = WidgetStore.getInstance();
    const routingPlugin = RoutingPlugin.getInstance(this.parentLogger.create('RoutingPlugin'));
    const extensionInstaller = new ExtensionInstaller({
      importModule: this.importModule,
      getLatestExtensionVersion: getRemoteExtensionLatestVersion,
      initializeExtension: this.initializeExtension,
      registerExtension: this.registerExtension,
      finalizeInstall: this.finalizeExtensionInstallation,
      registerAdditionalResources: this.registerAdditionalResources,
    });

    extensionInstaller.listenAuthEvents();
    // add it directly to the plugins map
    this.plugins = Object.assign({}, this.plugins, {
      core: {
        contentBlockStore: contentBlockStore,
        extensionPointStore: extensionPointStore,
        widgetStore: widgetStore,
        extensionInstaller,
        extensionUninstaller: {
          uninstallExtension: this.uninstallExtension,
        },
        routing: routingPlugin,
      },
    });
  };

  loadPlugins = async (
    existingConfigs: AppLoader['extensionConfigs'],
    extensionModules: Map<string, SystemModuleType>,
  ) => {
    const plugins = {};
    for (const [name, module] of extensionModules) {
      if (existingConfigs.has(name)) {
        continue;
      }
      if (module.registerPlugin && typeof module.registerPlugin === 'function') {
        // load plugin;
        plugins[name] = await module.registerPlugin({
          worldConfig: this.worldConfig,
          logger: this.parentLogger.create(`${name}_plugin`),
          uiEvents: this.uiEvents,
          encodeAppName: name => name,
          decodeAppName: (name: string) => decodeURIComponent(name),
        });
      }
    }
    return plugins;
  };

  registerAdditionalResources = async (name: string, extensionModule: SystemModuleType) => {
    await extensionModule.registerResources({
      uiEvents: this.uiEvents,
      plugins: this.plugins,
      worldConfig: this.worldConfig,
      layoutSlots: this.layoutConfig.extensionSlots,
      logger: this.parentLogger.create(`${name}_registerResources`),
    });
  };

  initializeExtension = async (name: string, extensionModule: SystemModuleType) => {
    await extensionModule.initialize({
      uiEvents: this.uiEvents,
      plugins: this.plugins,
      worldConfig: this.worldConfig,
      layoutSlots: this.layoutConfig.extensionSlots,
      logger: this.parentLogger.create(`${name}_initialize`),
    });
  };

  initializeExtensions = async (extensionModules: Map<string, SystemModuleType>) => {
    for (const [name, module] of extensionModules) {
      if (module.initialize && typeof module.initialize === 'function') {
        await this.initializeExtension(name, module);
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

  registerAdditionalEntities = (
    config: IAppConfig & { name: string },
    extensionType?: AkashaAppApplicationType,
  ) => {
    this.plugins.core.routing.registerRoute({
      name: config.name,
      menuItems: config?.menuItems,
      navRoutes: config?.routes,
    });
    if (config?.contentBlocks) {
      this.plugins.core.contentBlockStore.registerContentBlocks(
        config.contentBlocks.map(block => ({ ...block, appName: config.name })),
      );
    }
    if (config?.extensionPoints) {
      this.plugins.core.extensionPointStore.registerExtensionPoints(
        config.extensionPoints.map(ext => ({ ...ext, appName: config.name })),
      );
    }
    if (extensionType === AkashaAppApplicationType.Widget) {
      this.plugins.core.widgetStore.registerWidget({ ...config, appName: config.name });
    }
  };

  registerExtension = (name: string, mod: SystemModuleType) => {
    if (mod.register && typeof mod.register === 'function') {
      try {
        const config = mod.register({
          layoutSlots: this.layoutConfig.extensionSlots,
          worldConfig: this.worldConfig,
          logger: this.parentLogger.create(name),
          uiEvents: this.uiEvents,
        });
        return { name, ...config };
      } catch (err) {
        return null;
      }
    }
    return null;
  };

  registerExtensions = (extensionModules: Map<string, SystemModuleType>) => {
    const extensionConfigs = new Map();
    for (const [name, mod] of extensionModules) {
      if (name === this.worldConfig.layout) continue;
      if (this.extensionConfigs.has(name) || extensionConfigs.has(name)) continue;
      const config = this.registerExtension(name, mod);
      if (config) {
        const extensionData = this.extensionData.find(data => data.name === config.name);
        this.registerAdditionalEntities(config, extensionData?.applicationType);
        extensionConfigs.set(name, { ...config, applicationType: extensionData.applicationType });
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
        encodeAppName: (name: string) => encodeURIComponent(name),
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

  // this function will be called at the end of the
  // installation flow. the singlespa.register function must be called last
  finalizeExtensionInstallation = (
    extensionInfo: AkashaApp,
    extensionModule: SystemModuleType,
    extensionConfig: IAppConfig & { name: string },
  ) => {
    this.extensionModules.set(extensionInfo.name, extensionModule);
    this.extensionConfigs.set(extensionInfo.name, extensionConfig);
    this.extensionData.push(extensionInfo);
    this.registerAdditionalEntities(extensionConfig, extensionInfo.applicationType);
    this.singleSpaRegister(new Map().set(extensionInfo.name, extensionConfig));
  };

  singleSpaRegister = (extensionConfigs: Map<string, IAppConfig & { name: string }>) => {
    for (const [name, conf] of extensionConfigs) {
      if (singleSpa.getAppNames().includes(name)) continue;
      if (!conf.loadingFn || typeof conf.loadingFn !== 'function') continue;

      const extensionData = this.extensionData.find(m => m.name === name);

      if (extensionData.applicationType !== AkashaAppApplicationType.App) continue;

      // apps are always mounted in the applicationSlotId
      if (!conf.mountsIn) {
        conf.mountsIn = this.layoutConfig.extensionSlots.applicationSlotId;
      }

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
        encodeAppName,
        decodeAppName,
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
