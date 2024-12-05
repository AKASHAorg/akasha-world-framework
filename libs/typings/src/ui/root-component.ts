import React from 'react';
import type singleSpa from 'single-spa';
import type { IAppConfig } from './extensions';
import type { Subject } from 'rxjs';
import type { UIEventData } from './ui-events';
import type { IModalNavigationOptions } from './navigation';
import type i18n from 'i18next';
import type { CorePlugins, IPlugin } from './plugins';
import type { WorldConfig, IQueryString, LayoutSlots } from './app-loader';
import type { ILogger } from '../sdk/log';

/**
 * Interface defining props shared via root component provider which are available for all apps and widgets
 **/
export interface IRootComponentProps {
  activeWhen?: { path: string };
  domElement?: HTMLElement;
  uiEvents: Subject<UIEventData>;
  i18next?: typeof i18n;
  plugins?: IPlugin & { core: CorePlugins };
  layoutSlots: LayoutSlots;
  logger: ILogger;
  name?: string;
  singleSpa: typeof singleSpa;
  baseRouteName: string;
  worldConfig: WorldConfig;
  domElementGetter?: () => HTMLElement;
  navigateToModal: (opts: IModalNavigationOptions) => void;
  getModalFromParams: (location: Location) => { name: string; message?: string; title?: string };
  getAppRoutes?: (appId: string) => IAppConfig['routes'];
  parseQueryString: (queryString: string) => IQueryString;
  encodeAppName: (name: string) => string;
  decodeAppName: (name: string) => string;
  children?: React.ReactNode;
  cancelNavigation: (shouldCancel: boolean, callback: (targetUrl: string) => void) => () => void;
}

/**
 * Interface defining props of a root extension point component
 **/
export interface IRootExtensionProps<D = Record<string, unknown>> extends IRootComponentProps {
  extensionData: D;
}
