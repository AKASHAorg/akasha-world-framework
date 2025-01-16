import { ParcelConfigObject } from 'single-spa';
import { ExtensionActivity, LayoutSlots, SupportedUILibs } from './app-loader';

/**
 * Type defining widget loading base configuration object
 **/
type BaseWidgetInterface = {
  mountsIn: string;
  activeWhen?: ExtensionActivity;
  loadingFn?: () => Promise<ParcelConfigObject>;
  rootComponent?: () => Promise<{ default: React.ElementType }>;
  UILib?: SupportedUILibs;
};

/**
 * Type defining widget loading configuration object
 **/
export type WidgetInterface = BaseWidgetInterface & {
  extensionSlots?: Record<string, string>;
};

/**
 * Type defining layout widget loading configuration object
 **/
export type LayoutWidgetInterface = BaseWidgetInterface & {
  extensionSlots: LayoutSlots;
};

/**
 * Interface defining widget state store defined as a plugin
 **/
export interface IWidgetStorePlugin {
  registerWidget(widgetConf: WidgetInterface & { appName: string }): void;
  unregisterWidget(widgetName: string): void;
  /**
   * get all the installed widgets
   **/
  getWidgets: () => WidgetInterface[];
  /** registers a callback function which is called when the widget
   * is removed/unregistered
   **/
  onWidgetUnload: (name: string, callback: () => void) => void;
  /**
   * Matches the slotName with the widget's mountsIn property
   **/
  getMatchingWidgets: (
    slotName: string,
    location: Location,
  ) => (WidgetInterface & { appName: string })[];
}
