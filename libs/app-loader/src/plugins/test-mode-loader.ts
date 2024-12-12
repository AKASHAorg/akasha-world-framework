import getSDK from '@akashaorg/core-sdk';
import { AUTH_EVENTS } from '@akashaorg/typings/lib/sdk';
import { ILogger } from '@akashaorg/typings/lib/sdk/log';
import { SystemModuleType } from '../type-utils';
import { AkashaAppEdgeNode, staticInstallStatusCodes } from './utils';
import type AppLoader from '../index';
import { IAppConfig, ITestModeLoaderPlugin, LocalReleaseData } from '@akashaorg/typings/lib/ui';

/**
 * Plugin that handles loading extensions in test mode.
 */

type ExtensionTestModeConfig = {
  importModule: (extensionData: AppLoader['extensionData'][0]) => Promise<SystemModuleType>;
  registerAdditionalResources: (name: string, module: SystemModuleType) => Promise<void>;
  initializeExtension: (name: string, module: SystemModuleType) => Promise<void>;
  registerExtension: (name: string, module: SystemModuleType) => IAppConfig & { name: string };
  finalizeInstall: (
    info: AkashaAppEdgeNode,
    extensionModule: SystemModuleType,
    extensionConfig: IAppConfig & { name: string },
  ) => void;
};

export class TestModeLoader implements ITestModeLoaderPlugin {
  #sdk: ReturnType<typeof getSDK>;
  #user: { id?: string };
  #logger: ILogger;
  readonly #importModule: ExtensionTestModeConfig['importModule'];
  readonly #registerAdditionalResources: ExtensionTestModeConfig['registerAdditionalResources'];
  readonly #initializeExtension: ExtensionTestModeConfig['initializeExtension'];
  readonly #registerExtension: ExtensionTestModeConfig['registerExtension'];
  readonly #finalizeInstall: ExtensionTestModeConfig['finalizeInstall'];
  listeners: (({
    currentStatus,
    errorStatus,
  }: {
    currentStatus?: symbol;
    errorStatus?: symbol;
  }) => void)[];

  constructor(config: ExtensionTestModeConfig) {
    this.#sdk = getSDK();
    this.#user = {};
    this.#logger = this.#sdk.services.log.create('ExtensionTestMode');
    this.#importModule = config.importModule;
    this.#initializeExtension = config.initializeExtension;
    this.#registerAdditionalResources = config.registerAdditionalResources;
    this.#finalizeInstall = config.finalizeInstall;
    this.#registerExtension = config.registerExtension;
    this.listeners = [];
  }

  listenAuthEvents() {
    this.#sdk.api.globalChannel.subscribe({
      next: evObj => {
        if (evObj.event === AUTH_EVENTS.SIGN_IN) {
          const userData: { id?: string } = evObj.data;
          if ('id' in userData && userData.hasOwnProperty('id')) {
            this.#user = userData;
            this.loadStoredExtensions();
          }
        }
        if (evObj.event === AUTH_EVENTS.SIGN_OUT) {
          this.#user = {};
        }
      },
    });
  }

  getTestSessionKey = () => {
    return `EXTENSIONS_IN_TEST_MODE_${this.#user.id}`;
  };
  getStaticStatusCodes() {
    return staticInstallStatusCodes;
  }

  loadStoredExtensions() {
    const storage = sessionStorage.getItem(this.getTestSessionKey());

    if (storage) {
      let extensions = [];
      try {
        extensions = JSON.parse(storage);
        if (extensions.length) {
          extensions.forEach(ext => {
            this.load(ext);
          });
        }
      } catch (err) {
        this.#logger.error('Failed to load test mode extensions %s', err.message);
      }
    }
  }

  async load(localReleaseData: LocalReleaseData) {
    if (!this.#user.id) {
      return;
    }
    if (!localReleaseData.source) {
      return this.#notifyErrorStatus(this.getStaticStatusCodes().error.EXTENSION_DATA_INVALID);
    }

    let extensionModule: SystemModuleType;

    try {
      extensionModule = await this.#importModule({
        name: localReleaseData.appName,
        source: localReleaseData.source,
        applicationType: localReleaseData.applicationType,
        isLocal: true,
      });
    } catch (err) {
      this.#logger.error('Failed to import extension: %s', err.message);
    }

    try {
      if (extensionModule && typeof extensionModule.registerResources === 'function') {
        await this.#registerAdditionalResources(localReleaseData.appName, extensionModule);
      }
    } catch (err) {
      this.#logger.error('failed to register additional resources: %s', err.message);
    }

    try {
      if (extensionModule && typeof extensionModule.initialize === 'function') {
        await this.#initializeExtension(localReleaseData.appName, extensionModule);
      }
    } catch (err) {
      this.#logger.error('Failed to initialize extension: %s', err.message);
    }

    try {
      if (extensionModule && typeof extensionModule.register === 'function') {
        const extensionConfig = this.#registerExtension(localReleaseData.appName, extensionModule);

        const storage = sessionStorage.getItem(this.getTestSessionKey());
        let extensions = [];
        if (storage) {
          try {
            const existingExtensions = JSON.parse(storage);
            if (existingExtensions) {
              extensions = existingExtensions;
            }
          } catch (err) {
            this.#logger.error('failed to parse session storage: %s', err.message);
          }
        }
        try {
          if (!extensions.find(ext => ext.appName === localReleaseData.appName)) {
            extensions.push(localReleaseData);
            sessionStorage.setItem(this.getTestSessionKey(), JSON.stringify(extensions));
          }
        } catch (err) {
          this.#logger.error('failed to save extension to session storage: %s', err.message);
        }

        this.#finalizeInstall(
          {
            applicationType: localReleaseData.applicationType,
            createdAt: undefined,
            description: '',
            displayName: '',
            license: '',
            releasesCount: 0,
            name: localReleaseData.appName,
            id: localReleaseData.applicationID,
            releases: {},
            author: { id: this.#user.id, isViewer: true },
          },
          extensionModule,
          extensionConfig,
        );
        this.#notifyCurrentStatus(this.getStaticStatusCodes().status.EXTENSION_TEST_LOAD_SUCCESS);
      } else {
        this.#logger.error(
          'Make sure you export a function named `register` from you extension`s index.js file',
        );
      }
    } catch (err) {
      this.#logger.error(err);
    }
  }

  // requires full page refresh
  async unload() {
    sessionStorage.removeItem(this.getTestSessionKey());
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

  subscribe(cb: TestModeLoader['listeners'][0]) {
    this.listeners.push(cb);
    return () => {
      this.listeners.filter(listener => listener !== cb);
    };
  }
}
