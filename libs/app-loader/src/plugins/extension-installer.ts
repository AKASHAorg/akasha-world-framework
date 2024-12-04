import type AppLoader from '../index';
import getSDK from '@akashaorg/core-sdk';
import { AUTH_EVENTS } from '@akashaorg/typings/lib/sdk';
import { SystemModuleType } from '../type-utils';
import { IAppConfig, IExtensionInstallerPlugin } from '@akashaorg/typings/lib/ui';
import { ILogger } from '@akashaorg/typings/lib/sdk/log';
import { AkashaAppEdgeNode, selectLatestRelease, staticInstallStatusCodes } from './utils';
import { AkashaApp } from '@akashaorg/typings/lib/sdk/graphql-types-new';

type ExtensionInstallerOptions = {
  importModule: (extensionData: AppLoader['extensionData'][0]) => Promise<SystemModuleType>;
  getLatestExtensionVersion: (
    appName: string,
    logger?: ILogger,
  ) => Promise<AkashaAppEdgeNode | undefined>;
  initializeExtension: (name: string, module: SystemModuleType) => Promise<void>;
  registerExtension: (name: string, module: SystemModuleType) => IAppConfig & { name: string };
  finalizeInstall: (
    info: AkashaAppEdgeNode,
    extensionModule: SystemModuleType,
    extensionConfig: IAppConfig & { name: string },
  ) => void;
  registerAdditionalResources: (name: string, module: SystemModuleType) => Promise<void>;
};

export class ExtensionInstaller implements IExtensionInstallerPlugin {
  readonly #importModule: ExtensionInstallerOptions['importModule'];
  readonly #getLatestExtensionVersion: ExtensionInstallerOptions['getLatestExtensionVersion'];
  readonly #initializeExtension: ExtensionInstallerOptions['initializeExtension'];
  readonly #registerExtension: ExtensionInstallerOptions['registerExtension'];
  readonly #finalizeInstall: ExtensionInstallerOptions['finalizeInstall'];
  readonly #registerAdditionalResources: ExtensionInstallerOptions['registerAdditionalResources'];
  listeners: (({
    currentStatus,
    errorStatus,
  }: {
    currentStatus?: symbol;
    errorStatus?: symbol;
  }) => void)[];
  #sdk: ReturnType<typeof getSDK>;
  #logger: ILogger;
  #extensionName: string;
  #user: { id?: string };
  #extensionInfo?: AkashaAppEdgeNode;
  #extensionModule: SystemModuleType;
  #extensionConfig: IAppConfig & { name: string };

  constructor(options: ExtensionInstallerOptions) {
    this.#importModule = options.importModule;
    this.#getLatestExtensionVersion = options.getLatestExtensionVersion;
    this.#initializeExtension = options.initializeExtension;
    this.#registerExtension = options.registerExtension;
    this.#finalizeInstall = options.finalizeInstall;
    this.#registerAdditionalResources = options.registerAdditionalResources;
    this.listeners = [];
    this.#sdk = getSDK();
    this.#logger = this.#sdk.services.log.create('ExtensionInstaller');
    this.#user = null;
  }

  getStaticStatusCodes() {
    return staticInstallStatusCodes;
  }
  async acceptUserAgreement(extensionData: AkashaApp) {
    const release = selectLatestRelease(extensionData);
    const installedExtensionsTable = this.#sdk.services.db.getCollections().installedExtensions;
    const installedExtension = await installedExtensionsTable.get({
      appName: extensionData.name,
    });

    if (
      installedExtension &&
      installedExtension.version === extensionData.version &&
      installedExtension.termsAccepted
    ) {
      return;
    }

    if (installedExtension && installedExtension.version !== extensionData.version) {
      installedExtensionsTable.update(extensionData.name, {
        version: extensionData.version,
        termsAccepted: true,
        releaseId: release.node.id,
        source: release.node.source,
      });
      return;
    }

    this.#sdk.services.db.getCollections().installedExtensions.add({
      appName: extensionData.name,
      version: release.node.version,
      applicationType: extensionData.applicationType,
      termsAccepted: true,
      releaseId: release.node.id,
      source: release.node.source,
    });
  }
  listenAuthEvents() {
    this.#sdk.api.globalChannel.subscribe({
      next: evObj => {
        if (evObj.event === AUTH_EVENTS.SIGN_IN) {
          const userData: { id?: string } = evObj.data;
          if ('id' in userData && userData.hasOwnProperty('id')) {
            this.#user = userData;
          }
        }
        if (evObj.event === AUTH_EVENTS.SIGN_OUT) {
          this.#user = null;
        }
      },
    });
  }

  resetAndCleanup() {
    this.#extensionInfo = undefined;
    this.#extensionModule = undefined;
    this.#extensionConfig = undefined;
    this.listeners = [];
    this.#extensionName = undefined;
  }
  // get the extension information from the registry
  async #fetchExtensionStep(extensionID: string): Promise<boolean> {
    this.#notifyCurrentStatus(this.getStaticStatusCodes().status.FETCHING_EXTENSION_DATA);
    try {
      const extensionData = await this.#getLatestExtensionVersion(extensionID);
      if (extensionData) {
        this.#extensionInfo = extensionData;
        return true;
      }
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_NOT_FOUND);
      return false;
    } catch (err) {
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_FETCH_ERROR);
      return false;
    }
  }
  // import systemjs module
  async #importModuleStep(): Promise<boolean> {
    this.#notifyCurrentStatus(this.getStaticStatusCodes().status.IMPORTING_MODULE);
    try {
      const latestRelease = selectLatestRelease(this.#extensionInfo);
      if (!latestRelease) {
        this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_IMPORT_ERROR);
        return false;
      }
      const data = {
        ...this.#extensionInfo,
        isLocal: true,
        source: latestRelease.node.source,
      };
      const module = await this.#importModule(data);

      if (!module) {
        return false;
      }
      this.#extensionModule = module;
      return true;
    } catch (err) {
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_IMPORT_ERROR);
      return false;
    }
  }
  // depending on the error, we want to retry installation
  async retryFromError(errorStatus: symbol) {
    if (!this.#extensionName) {
      return;
    }
    switch (errorStatus) {
      // start from the beginning
      case this.getStaticStatusCodes().error.EXTENSION_FETCH_ERROR:
      case this.getStaticStatusCodes().error.EXTENSION_IMPORT_ERROR:
        return this.installExtension(this.#extensionName);
      // directly run postInstall
      case this.getStaticStatusCodes().error.EXTENSION_INITIALIZATION_FAILED:
        return this.postInstallExtension();
      // try to remove the extension from db and rerun postInstall
      case this.getStaticStatusCodes().error.EXTENSION_INFO_SAVE_FAILED:
        try {
          await this.#sdk.services.appSettings.uninstall(this.#extensionName);
        } catch (err) {
          // do nothing.
        }
        return this.postInstallExtension();
      case this.getStaticStatusCodes().error.EXTENSION_REGISTER_RESOURCES_FAILED:
        // @todo: cleanup the resources (from the db? through the sdk?) and rerun install
        return this.installExtension(this.#extensionName);
      case this.getStaticStatusCodes().error.EXTENSION_FINALIZATION_FAILED:
        return this.postInstallExtension();
    }
  }
  // the tricky part of cancelling is when the extension reaches the single-spa register.
  // @todo: more cleanups might be necessary on the app-loader
  async cancelInstallation() {
    try {
      await this.#sdk.services.appSettings.uninstall(this.#extensionInfo.name);
    } catch (err) {
      this.#logger.error(err);
    }
    this.resetAndCleanup();
  }

  async postInstallExtension() {
    if (
      this.#extensionModule.initialize &&
      typeof this.#extensionModule.initialize === 'function'
    ) {
      this.#notifyCurrentStatus(this.getStaticStatusCodes().status.INITIALIZING_EXTENSION);
      try {
        await this.#initializeExtension(this.#extensionInfo.name, this.#extensionModule);
      } catch (err) {
        this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_INITIALIZATION_FAILED);
        return;
      }
    }

    this.#notifyCurrentStatus(this.getStaticStatusCodes().status.REGISTERING_EXTENSION);
    const extConf = this.#registerExtension(this.#extensionInfo.name, this.#extensionModule);
    if (!extConf) {
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_REGISTRATION_FAILED);
      return;
    }
    this.#extensionConfig = extConf;
    // at this point we are safe to register it into singleSpa
    // since everything went well we can also store the config into the local db.
    this.#notifyCurrentStatus(this.getStaticStatusCodes().status.SAVING_EXTENSION_INFO);
    try {
      await this.#sdk.services.appSettings.install({
        releaseId: this.#extensionInfo.releases.edges[0].node.id,
        appName: this.#extensionInfo.name,
        version: this.#extensionInfo.releases.edges[0].node.version,
        source: this.#extensionInfo.releases.edges[0].node.source,
        applicationType: this.#extensionInfo.applicationType,
      });
    } catch (err) {
      this.#logger.warn(`Looks like the extension was not saved in the database! ${err.message}`);
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_INFO_SAVE_FAILED);
      return;
    }
    this.#notifyCurrentStatus(this.getStaticStatusCodes().status.FINALIZING_INSTALL);
    try {
      this.#finalizeInstall(this.#extensionInfo, this.#extensionModule, this.#extensionConfig);
      this.#notifyCurrentStatus(this.getStaticStatusCodes().status.INSTALL_SUCCESS);
    } catch (err) {
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_FINALIZATION_FAILED);
      return;
    }
  }

  async installExtension(extensionID: string) {
    if (!this.#user?.id) {
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.USER_NOT_CONNECTED);
      return;
    }

    this.#extensionName = extensionID;

    if (!(await this.#fetchExtensionStep(extensionID))) {
      return;
    }

    const isExtensionDataValid = validateExtensionData(this.#extensionInfo);
    const isReleaseDataValid = validateReleaseData(this.#extensionInfo.releases.edges);

    if (!isExtensionDataValid) {
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_DATA_INVALID);
      return this.resetAndCleanup();
    }

    if (!isReleaseDataValid) {
      this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_RELEASE_DATA_INVALID);
      return this.resetAndCleanup();
    }

    if (isExtensionDataValid && isReleaseDataValid) {
      if (!(await this.#importModuleStep())) {
        return;
      }
      // @TODO: We need to register additional resources (like composeDB models) even before initialization.
      if (
        this.#extensionModule.registerResources &&
        typeof this.#extensionModule.registerResources === 'function'
      ) {
        this.#notifyCurrentStatus(this.getStaticStatusCodes().status.REGISTERING_RESOURCES);
        try {
          await this.#registerAdditionalResources(this.#extensionInfo.name, this.#extensionModule);
          this.#notifyCurrentStatus(
            this.getStaticStatusCodes().status.REGISTERING_RESOURCES_SUCCESS,
          );
        } catch (err) {
          this.#notifyErrorStatus(
            this.getStaticStatusCodes().error.EXTENSION_REGISTER_RESOURCES_FAILED,
          );
        }
        // handle signature in the installation screen
        return;
      }
      await this.postInstallExtension();
    }
  }

  #notifyErrorStatus(
    errorStatus: ReturnType<typeof this.getStaticStatusCodes>['error'][keyof ReturnType<
      typeof this.getStaticStatusCodes
    >['error']],
  ) {
    this.listeners.forEach(listener => {
      listener({
        errorStatus,
      });
    });
  }

  #notifyCurrentStatus(
    currentStatus: ReturnType<typeof this.getStaticStatusCodes>['status'][keyof ReturnType<
      typeof this.getStaticStatusCodes
    >['status']],
  ) {
    this.listeners.forEach(listener => {
      listener({
        currentStatus,
      });
    });
  }

  subscribe(cb: ExtensionInstaller['listeners'][0]) {
    this.listeners.push(cb);
    return () => {
      this.listeners.filter(listener => listener !== cb);
    };
  }
}

const validateExtensionData = (_extData: AkashaAppEdgeNode) => {
  return true;
};

const validateReleaseData = (releaseEdges: AkashaAppEdgeNode['releases']['edges']) => {
  return releaseEdges.length;
};
