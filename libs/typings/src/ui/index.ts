import singleSpa from 'single-spa';

export * from './root-component';
export * from './app-loader';
export * from './analytics';
export * from './extensions';
export * from './editor';
export * from './entry';
export * from './sidebar-menu-items';
export * from './moderation';
export * from './navigation';
export * from './plugins';
export * from './profile';
export * from './root-component';
export * from './router';
export * from './type-utils';
export * from './ui-events';
export * from './widgets';
export * from './design-system';
export * from './extension-point';
export * from './editor-blocks';
export * from './media';
export * from './store';
export * from './inbox-notification';

export enum LEGAL_DOCS {
  TERMS_OF_USE = 'TermsOfUse',
  TERMS_OF_SERVICE = 'TermsOfService',
  PRIVACY_POLICY = 'PrivacyPolicy',
  CODE_OF_CONDUCT = 'CodeOfConduct',
  APP_GUIDE = 'AppGuide',
}

export type SingleSpaRoutingEvent = CustomEvent<singleSpa.SingleSpaCustomEventDetail>;
