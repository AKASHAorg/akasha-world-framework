/* eslint-disable unicorn/consistent-function-scoping */
import { IRootComponentProps } from '@akashaorg/typings/lib/ui';
import { genWorldConfig } from './world-config';
import { uiEventsMock } from '../mocks/uiEvents';

const corePluginsMock = {
  routing: {
    navigateTo: () => {},
    handleRedirect: () => {},
    getUrlForApp: () => '',
    registerRoute: () => {},
    unregisterRoute: () => {},
    subscribe: () => () => {},
    getSnapshot: () => ({
      all: {},
      activeExtensionsNames: {},
      byArea: {},
    }),
    cancelNavigation: () => () => {},
  },
  contentBlockStore: {
    registerContentBlocks: () => {},
    registerContentBlock: () => {},
    getInfos: () => [],
    getMatchingBlocks: () => [],
  },
  extensionPointStore: {
    registerExtensionPoints: () => {},
    registerExtensionPoint: () => {},
    getExtensionPoints: () => [],
    getMatchingExtensions: () => [],
  },
  widgetStore: {
    registerWidget: () => {},
    unregisterWidget: () => {},
    getWidgets: () => [],
    onWidgetUnload: () => {},
    getMatchingWidgets: () => [],
  },
  extensionInstaller: {
    acceptUserAgreement: () => Promise.resolve(),
    installExtension: () => Promise.resolve(),
    postInstallExtension: () => Promise.resolve(),
    cancelInstallation: () => Promise.resolve(),
    retryFromError: () => Promise.resolve(),
    // modify statusCodes as needed
    getStaticStatusCodes: () => ({ status: {} as any, error: {} as any }),
    subscribe: () => () => {},
  },
  extensionUninstaller: {
    uninstallExtension: () => {},
  },
  testModeLoader: {
    load: () => Promise.resolve(),
    unload: () => Promise.resolve(),
    getStaticStatusCodes: () => ({ status: {} as any, error: {} as any }),
    // eslint-disable-next-line unicorn/consistent-function-scoping
    subscribe: () => () => {},
  },
};

const log: any = {
  info: () => {
    /*  */
  },
  warn: () => {
    /*  */
  },
  error: () => {
    /*  */
  },
};
export const genAppProps = (): IRootComponentProps & {
  getTranslationPlugin: (ns?: string) => any;
  getCorePlugins: () => any;
} => ({
  logger: log,
  navigateToModal: () => ({}),
  uiEvents: uiEventsMock,
  layoutSlots: {},
  singleSpa: null,
  worldConfig: genWorldConfig(),
  getTranslationPlugin: () => ({ i18n: {} }),
  getCorePlugins: () => corePluginsMock,
  parseQueryString: () => ({}),
  plugins: {
    core: corePluginsMock,
  },
  baseRouteName: '',
  domElement: null,
  encodeAppName: name => name,
  decodeAppName: name => name,
  getModalFromParams: () => ({ name: 'test-modal' }),
  cancelNavigation: () => () => {},
});
