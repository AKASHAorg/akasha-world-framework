import React from 'react';
import DS from '@akashaproject/design-system';
import EntryFeed from './entry-feed';
import ProfileFeed from './profile-feed';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import { IContentClickDetails } from '@akashaproject/design-system/lib/components/EntryCard/entry-box';
import { ItemTypes } from '@akashaproject/ui-awf-typings/lib/app-loader';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { ILogger } from '@akashaproject/sdk-typings/lib/interfaces/log';

const { ThemeSelector, lightTheme, darkTheme } = DS;

export interface EntryListPage {
  results: string[];
}

export interface IFeedWidgetProps {
  logger: ILogger;
  pages: EntryListPage[];
  itemType: ItemTypes;
  onLoadMore: () => void;
  getShareUrl?: (entryId: string) => string;
  /* eth address of the logged in user */
  ethAddress: string | null;
  profilePubKey: string | null;
  onNavigate: (itemType: ItemTypes, details: IContentClickDetails) => void;
  singleSpaNavigate: (url: string) => void;
  navigateToModal: (props: any) => void;
  onLoginModalOpen: () => void;
  requestStatus: 'success' | 'loading' | 'error' | 'idle';
  hasNextPage: boolean;
  loggedProfile?: any;
  contentClickable?: boolean;
  onEntryFlag: (entryId: string, contentType: string) => () => void;
  onEntryRemove?: (entryId: string) => void;
  removeEntryLabel?: string;
  removedByMeLabel?: string;
  removedByAuthorLabel?: string;
  uiEvents: RootComponentProps['uiEvents'];
  itemSpacing?: number;
  i18n: typeof i18n;
}

const FeedWidgetRoot: React.FC<IFeedWidgetProps> = props => {
  return (
    <I18nextProvider i18n={props.i18n}>
      <ThemeSelector
        settings={{ activeTheme: 'Light-Theme' }}
        availableThemes={[lightTheme, darkTheme]}
        style={{ height: '100%' }}
        plain={true}
      >
        {props.itemType === ItemTypes.ENTRY && <EntryFeed {...props} />}
        {props.itemType === ItemTypes.COMMENT && <EntryFeed {...props} />}
        {props.itemType === ItemTypes.PROFILE && <ProfileFeed {...props} />}
      </ThemeSelector>
    </I18nextProvider>
  );
};

export default FeedWidgetRoot;
