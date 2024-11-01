import { AnalyticsEventData } from './analytics';

/**
 * Enum defining events related to theming
 **/
export const enum ThemingEvents {
  ThemeChange = 'theme-change',
}

/**
 * Type defining theming event object
 **/
export type ThemingEvent = {
  event: ThemingEvents;
  data: {
    name: string;
  };
};

/**
 * Enum defining notification events
 **/
export const enum NotificationEvents {
  ShowNotification = 'show-notification',
  SnoozeNotifications = 'snooze-notifications',
  UnsnoozeNotifications = 'unsnooze-notifications',
}

/**
 * Enum defining notification types
 **/
export const enum NotificationTypes {
  Info = 'info',
  Caution = 'caution',
  Success = 'success',
  Error = 'error',
}

/**
 * Type defining notification event object
 **/
export type NotificationEvent = {
  event: NotificationEvents;
  data?: {
    type: NotificationTypes;
    title: string;
    description?: string;
    ctaLabel?: string;
    dismissable?: boolean;
  };
};

/**
 * Enum defining global event types
 **/
export enum EventTypes {
  Instantiated = 'instantiated',
  ShowSidebar = 'show-sidebar',
  HideSidebar = 'hide-sidebar',
  ShowWidgets = 'show-widgets',
  HideWidgets = 'hide-widgets',
  LayoutShowLoadingUser = 'layout:show-loading-user',
  SetInitialCookieType = 'set-initial-cookie-type',
  GoBackToPreviousRoute = 'routing:go-back-to-previous-route',
  RefetchMyExtensions = 'refetch-my-extensions',
}

/**
 * Enum defining entity types
 **/
export const enum EntityTypes {
  BEAM = 0,
  PROFILE = 1,
  REFLECT = 2,
  TAG = 3,
  ARTICLE = 4,
}

/**
 * Type defining global event data object
 **/
export type EventDataTypes = {
  //profile stream id
  profileID?: string;
  isLoggedIn?: boolean;
  followId?: string;
  version?: string;
  itemId?: string;
  reflectId?: string;
  itemType?: EntityTypes;
};

/**
 * Type defining global UI event data object
 **/
// @TODO: split EventTypes with their respective EventDataTypes as the example below
export type UIEventData =
  | {
      event: EventTypes;
      data?: EventDataTypes;
    }
  | AnalyticsEventData
  | ThemingEvent
  | NotificationEvent;
