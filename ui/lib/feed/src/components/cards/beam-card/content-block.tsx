import React, { useState } from 'react';
import NSFW from '@akashaorg/design-system-components/lib/components/Entry/NSFW';
import NSFWBlock from './nsfw-block';
import { hasOwn, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { ContentBlockExtension } from '@akashaorg/ui-lib-extensions/lib/react/content-block';
import { ContentBlockModes } from '@akashaorg/typings/lib/ui';
import { useTranslation } from 'react-i18next';

type ContentBlockType = {
  blockID: string;
  authenticatedDID: string;
  showHiddenContent: boolean /*@TODO: better use apollo filters than this flag to filter our block content */;
};
const ContentBlock: React.FC<ContentBlockType> = props => {
  const { blockID, authenticatedDID, showHiddenContent } = props;
  const { t } = useTranslation('ui-lib-feed');
  const [showNsfwContent, setShowNsfwContent] = useState(false);
  const [nsfw, setNsfw] = useState(false);
  const { navigateToModal } = useRootComponentProps();

  const showNSFWCard = nsfw && (!showNsfwContent || !authenticatedDID);

  const showLoginModal = () => {
    navigateToModal({ name: 'login' });
  };

  return (
    <ContentBlockExtension
      hideContent={showNSFWCard}
      readMode={{ blockID }}
      mode={ContentBlockModes.READONLY}
    >
      {blockData => {
        const nsfw = blockData && hasOwn(blockData, 'id') ? blockData.nsfw : false;
        return (
          <NSFWBlock
            nsfw={nsfw}
            onNsfwChange={() => {
              setNsfw(nsfw);
            }}
          >
            {showHiddenContent && showNSFWCard && (
              <NSFW
                clickToViewLabel={t('Click to View')}
                sensitiveContentLabel={t('Sensitive Content!')}
                onClickToView={() => {
                  if (!authenticatedDID) {
                    showLoginModal();
                    return;
                  }
                  setShowNsfwContent(true);
                }}
              />
            )}
          </NSFWBlock>
        );
      }}
    </ContentBlockExtension>
  );
};

export default ContentBlock;
