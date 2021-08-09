import React, { PureComponent } from 'react';
import DS from '@akashaproject/design-system';
import { I18nextProvider } from 'react-i18next';
import EntryFeed from './entry-feed';
import ProfileFeed from './profile-feed';
import { IAkashaError, RootComponentProps } from '@akashaproject/ui-awf-typings';
import i18next from 'i18next';
import { IContentClickDetails } from '@akashaproject/design-system/src/components/EntryCard/entry-box';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-chained-backend';
import Fetch from 'i18next-fetch-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import { initReactI18next } from 'react-i18next';
import { ItemTypes } from '@akashaproject/ui-awf-typings/lib/app-loader';

const { ThemeSelector, lightTheme, darkTheme } = DS;

export interface IFeedWidgetProps {
  logger: any;
  virtualListRef?: any;
  listHeader?: React.ReactElement;
  itemType: ItemTypes;
  loadMore: (payload: any) => void;
  loadItemData?: ({ itemId }: { itemId: string }) => void;
  getShareUrl?: (entryId: string) => string;
  itemIds: string[];
  itemsData: { [key: string]: any };
  errors: { [key: string]: IAkashaError };
  /* eth address of the logged in user */
  ethAddress: string | null;
  profilePubKey: string | null;
  onNavigate: (itemType: ItemTypes, details: IContentClickDetails) => void;
  singleSpaNavigate: (url: string) => void;
  navigateToModal: (props: any) => void;
  onLoginModalOpen: () => void;
  isFetching?: boolean;
  hasMoreItems: boolean;
  // totalItems: number | null;
  loggedProfile?: any;
  contentClickable?: boolean;
  onEntryFlag: (entryId: string, contentType: string) => () => void;
  handleFlipCard?: (entry: any, isQuote: boolean) => () => void;
  onEntryRemove?: (entryId: string) => void;
  removeEntryLabel?: string;
  removedByMeLabel?: string;
  removedByAuthorLabel?: string;
  uiEvents: RootComponentProps['uiEvents'];
}

export default class FeedWidgetRoot extends PureComponent<IFeedWidgetProps> {
  public state: { errors: any } = {
    errors: this.props.errors,
  };
  public componentDidCatch(error: Error, errorInfo: any) {
    if (this.props.logger) {
      this.props.logger.error('feed-widget error %j %j', error, errorInfo);
    }
    this.setState({
      errors: {
        'feedWidget.app': {
          error: new Error(`${error} \n Additional info: \n ${errorInfo}`),
          critical: false,
        },
      },
    });
  }

  public render() {
    const { logger } = this.props;

    i18next
      .use(initReactI18next)
      .use(Backend)
      .use(LanguageDetector)
      .use({
        type: 'logger',
        log: logger.info,
        warn: logger.warn,
        error: logger.error,
      })
      .init({
        fallbackLng: 'en',
        ns: ['ui-widget-feed'],
        saveMissing: false,
        saveMissingTo: 'all',
        load: 'languageOnly',
        debug: true,
        cleanCode: true,
        keySeparator: false,
        defaultNS: 'ui-widget-feed',
        backend: {
          backends: [LocalStorageBackend, Fetch],
          backendOptions: [
            {
              prefix: 'i18next_res_v0',
              expirationTime: 24 * 60 * 60 * 1000,
            },
            {
              loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
          ],
        },
      });
    return (
      <React.Suspense fallback={<></>}>
        <I18nextProvider i18n={i18next} defaultNS="ui-widget-feed">
          <ThemeSelector
            settings={{ activeTheme: 'Light-Theme' }}
            availableThemes={[lightTheme, darkTheme]}
            style={{ height: '100%' }}
            plain={true}
          >
            {this.props.itemType === ItemTypes.ENTRY && (
              <EntryFeed {...this.props} errors={{ ...this.state.errors, ...this.props.errors }} />
            )}
            {this.props.itemType === ItemTypes.PROFILE && (
              <ProfileFeed
                {...this.props}
                errors={{ ...this.state.errors, ...this.props.errors }}
              />
            )}
          </ThemeSelector>
        </I18nextProvider>
      </React.Suspense>
    );
  }
}
