import * as React from 'react';
import singleSpaReact from 'single-spa-react';
import ReactDOM from 'react-dom';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import DS from '@akashaproject/design-system';
import { uploadMediaToTextile } from '@akashaproject/ui-awf-hooks/lib/utils/media-utils';
import { useLoginState, withProviders } from '@akashaproject/ui-awf-hooks';
import { useCreatePost, useEditPost, usePost } from '@akashaproject/ui-awf-hooks/lib/use-posts.new';
import { useTagSearch } from '@akashaproject/ui-awf-hooks/lib/use-tag.new';
import { useMentionSearch } from '@akashaproject/ui-awf-hooks/lib/use-mentions.new';
import { mapEntry } from '@akashaproject/ui-awf-hooks/lib/utils/entry-utils';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useGetProfile } from '@akashaproject/ui-awf-hooks/lib/use-profile.new';
import { IPublishData } from '@akashaproject/ui-awf-typings/lib/entry';
import i18next, { setupI18next } from '../i18n';

const {
  EditorModal,
  ModalContainer,
  ModalCard,
  Spinner,
  ThemeSelector,
  ErrorLoader,
  lightTheme,
  darkTheme,
} = DS;

const EditorModalContainer = (props: RootComponentProps) => {
  const { t } = useTranslation();

  const [loginState] = useLoginState({});
  const [mentionQuery, setMentionQuery] = React.useState(null);
  const [tagQuery, setTagQuery] = React.useState(null);
  const mentionSearch = useMentionSearch(mentionQuery);
  const tagSearch = useTagSearch(tagQuery);

  const profileDataReq = useGetProfile(loginState.pubKey);

  // const [mentionsState, mentionsActions] = useMentions({});
  const isEditing = React.useMemo(
    () => props.activeModal.hasOwnProperty('entryId') && props.activeModal.action === 'edit',
    [props.activeModal],
  );

  const hasEmbed = React.useMemo(
    () => props.activeModal.hasOwnProperty('embedEntry'),
    [props.activeModal],
  );

  const embeddedPost = usePost(props.activeModal.embedEntry, hasEmbed);

  const editingPost = usePost(props.activeModal.entryId, isEditing);

  const editPost = useEditPost();

  const publishPost = useCreatePost();

  const entryData = React.useMemo(() => {
    if (editingPost.status === 'success') {
      return mapEntry(editingPost.data);
    }
    return undefined;
  }, [editingPost.data, editingPost.status]);

  const embedEntryData = React.useMemo(() => {
    if (embeddedPost.status === 'success') {
      return mapEntry(embeddedPost.data);
    }
    return undefined;
  }, [embeddedPost.status, embeddedPost.data]);

  const handleEntryPublish = React.useCallback(
    (data: IPublishData) => {
      if (!profileDataReq.data) {
        return;
      }
      if (isEditing) {
        editPost.mutate({ entryID: props.activeModal.entryId, ...data });
      } else {
        publishPost.mutate({ ...data, pubKey: profileDataReq.data.pubKey });
      }
      props.singleSpa.navigateToUrl(location.pathname);
    },
    [isEditing, props.activeModal, props.singleSpa, editPost, publishPost, profileDataReq.data],
  );

  const handleModalClose = () => {
    props.singleSpa.navigateToUrl(location.pathname);
  };

  const handleMentionQueryChange = (query: string) => {
    setMentionQuery(query);
  };

  const handleTagQueryChange = (query: string) => {
    setTagQuery(query);
  };

  if (
    (isEditing && editingPost.isLoading) ||
    (props.activeModal.embedEntry && embeddedPost.isLoading)
  ) {
    return <>{t('Loading Editor')}</>;
  }
  return (
    <>
      {profileDataReq.status === 'error' && <>Error occured</>}
      {embeddedPost.status === 'error' && <>Error loading embedded content..</>}
      {editingPost.status === 'error' && <>Error loading post</>}

      {(profileDataReq.status === 'loading' ||
        embeddedPost.status === 'loading' ||
        editingPost.status === 'loading') && (
        <ModalContainer>
          <ModalCard>
            <Spinner />
          </ModalCard>
        </ModalContainer>
      )}

      {(!editingPost.isLoading || !embeddedPost.isLoading) &&
        profileDataReq.status === 'success' && (
          <EditorModal
            titleLabel={isEditing ? t('Edit Post') : t('New Post')}
            avatar={profileDataReq.data?.avatar}
            ethAddress={loginState.ethAddress}
            postLabel={t('Publish')}
            placeholderLabel={t('Write something')}
            emojiPlaceholderLabel={t('Search')}
            discardPostLabel={t('Discard Post')}
            discardPostInfoLabel={t(
              "You have not posted yet. If you leave now you'll discard your post.",
            )}
            keepEditingLabel={t('Keep Editing')}
            onPublish={handleEntryPublish}
            handleNavigateBack={handleModalClose}
            getMentions={handleMentionQueryChange}
            getTags={handleTagQueryChange}
            tags={tagSearch.data}
            mentions={mentionSearch.data}
            uploadRequest={uploadMediaToTextile}
            embedEntryData={embedEntryData}
            style={{ width: '36rem' }}
            editorState={entryData?.content}
          />
        )}
    </>
  );
};

const Wrapped = (props: RootComponentProps) => {
  return (
    <I18nextProvider i18n={i18next}>
      <EditorModalContainer {...props} />
    </I18nextProvider>
  );
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: withProviders(Wrapped),
  errorBoundary: (err, errorInfo, props) => {
    if (props.logger) {
      props.logger.error('Error: %o; Info: %s', err, errorInfo);
    }

    return (
      <ThemeSelector
        availableThemes={[lightTheme, darkTheme]}
        settings={{ activeTheme: 'LightTheme' }}
      >
        <ModalContainer>
          <ErrorLoader type="script-error" title="Error in editor modal" details={err.message} />
        </ModalContainer>
      </ThemeSelector>
    );
  },
});

export const bootstrap = (props: RootComponentProps) => {
  return setupI18next({
    logger: props.logger,
    // must be the same as the one in ../../i18next.parser.config.js
    namespace: 'app-akasha-integration',
  });
};

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
