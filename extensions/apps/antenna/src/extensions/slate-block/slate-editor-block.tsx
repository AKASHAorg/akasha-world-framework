import React, { RefObject, useCallback, useImperativeHandle, useRef, useState } from 'react';
import EditorBox from '@akashaorg/design-system-components/lib/components/Editor';
import {
  encodeSlateToBase64,
  transformSource,
  useRootComponentProps,
  useMentions,
  useAkashaStore,
} from '@akashaorg/ui-core-hooks';
import { useTranslation } from 'react-i18next';
import {
  ContentBlockModes,
  type IPublishData,
  type BlockInstanceMethods,
  type ContentBlockRootProps,
  type CreateContentBlock,
  type IRootExtensionProps,
} from '@akashaorg/typings/lib/ui';
import { Draft } from '../../utils';
import {
  AkashaContentBlockBlockDef,
  type BlockLabeledValue,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  useCreateContentBlockMutation,
  useGetAppsByPublisherDidQuery,
} from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import getSDK from '@akashaorg/core-sdk';
import { selectLatestAppVersionId } from '@akashaorg/ui-core-hooks/lib/selectors/get-apps-by-publisher-did-query';

export const SlateEditorBlock = (
  props: ContentBlockRootProps & { blockRef?: RefObject<BlockInstanceMethods> },
) => {
  const { name, logger } = useRootComponentProps<IRootExtensionProps>();
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const retryCount = useRef<number>();
  const sdk = useRef(getSDK());

  const { t } = useTranslation('app-antenna');

  const [createContentBlock, contentBlockQuery] = useCreateContentBlockMutation();

  const indexingDid = sdk.current.services.common.misc.getIndexingDID();

  const appReq = useGetAppsByPublisherDidQuery({
    variables: {
      id: indexingDid,
      first: 1,
      filters: { where: { name: { equalTo: props.blockInfo.appName } } },
      sorting: { createdAt: SortOrder.Desc },
    },
    context: { source: sdk.current.services.gql.contextSources.default },
  });
  const appVersionID = selectLatestAppVersionId(appReq.data);

  const beamDraft = new Draft<IPublishData['slateContent']>({
    storage: localStorage,
    appName: name,
    userId: authenticatedDID,
  });

  const canSaveDraft = props.blockInfo.mode === ContentBlockModes.EDIT;
  const draftBeamData = canSaveDraft ? beamDraft.get() : null;

  const editorActionsRef = useRef(null);

  const createBlock = useCallback(
    async ({ nsfw }: CreateContentBlock) => {
      if (!appVersionID) {
        return {
          response: {
            blockID: null,
            error: t('Extension not found!'),
          },
          blockInfo: props.blockInfo,
          retryCount: retryCount.current,
        };
      }

      const editorValue = editorActionsRef?.current?.children;

      const editorMentions: string[] = editorActionsRef?.current?.getAddedSlateMentions();

      const content = encodeSlateToBase64(editorValue);

      const contentBlockValue: BlockLabeledValue = {
        label: props.blockInfo.appName,
        propertyType: props.blockInfo.propertyType,
        value: content,
      };
      try {
        const resp = await createContentBlock({
          variables: {
            i: {
              content: {
                appVersionID: appVersionID,
                createdAt: new Date().toISOString(),
                content: [contentBlockValue],
                active: true,
                kind: AkashaContentBlockBlockDef.Text,
                nsfw,
              },
            },
          },
          context: { source: sdk.current.services.gql.contextSources.composeDB },
        });
        return {
          response: { blockID: resp.data.createAkashaContentBlock.document.id },
          blockInfo: props.blockInfo,
          retryCount: retryCount.current,
          editorMentions,
        };
      } catch (err) {
        logger.error('error creating content block', err);
        return {
          response: {
            blockID: null,
            error: err.message,
          },
          blockInfo: props.blockInfo,
          retryCount: retryCount.current,
        };
      }
    },
    [createContentBlock, props.blockInfo, logger, appVersionID, t],
  );

  const retryCreate = useCallback(
    (arg: CreateContentBlock) => {
      if (contentBlockQuery.called) {
        contentBlockQuery.reset();
      }
      retryCount.current += 1;
      return createBlock(arg);
    },
    [contentBlockQuery, createBlock],
  );

  useImperativeHandle(
    props.blockRef,
    () => ({
      createBlock,
      retryBlockCreation: retryCreate,
      handleFocusBlock,
    }),
    [createBlock, retryCreate],
  );

  const { setMentionQuery, mentions } = useMentions(authenticatedDID);
  const handleGetMentions = (query: string) => {
    setMentionQuery(query);
  };

  const [isFocusedEditor, setIsFocusedEditor] = useState(false);
  /**
   * this is used to display/hide elements only when a block instance is focused
   * must be exposed to outer components through useImperativeHandle
   * the logic for updating the currently focused block is in beam-editor
   */
  const handleFocusBlock = (focus: boolean) => {
    setIsFocusedEditor(focus);
  };

  return (
    <EditorBox
      showAvatar={false}
      profileId={'profileId'}
      placeholderLabel={'write here'}
      maxEncodedLengthErrLabel={t('Text block exceeds line limit, please review!')}
      noMentionsLabel={t('You are not following anyone with that name')}
      getMentions={handleGetMentions}
      mentions={mentions}
      withMeter={isFocusedEditor}
      withToolbar={isFocusedEditor}
      initialEditorValue={draftBeamData}
      editorActionsRef={editorActionsRef}
      showCancelButton={false}
      showPostButton={false}
      transformSource={transformSource}
      handleDisablePublish={props.blockInfo?.externalHandler}
      encodingFunction={encodeSlateToBase64}
      mentionsLimit={{ count: 1, label: t('Only one person can be mentioned per block.') }}
    />
  );
};
