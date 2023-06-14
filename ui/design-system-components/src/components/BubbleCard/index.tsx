import * as React from 'react';
import { Descendant } from 'slate';
import BasicCardBox from '@akashaorg/design-system-core/lib/components/BasicCardBox';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Text from '@akashaorg/design-system-core/lib/components/Text';

import { formatRelativeTime, ILocale } from '../../utils/time';
import ReadOnlyEditor from '../ReadOnlyEditor';
import dayjs from 'dayjs';
import { tw } from '@twind/core';

export interface IBubbleCardProps {
  locale: ILocale;
  senderName?: string;
  youLabel: string;
  content?: Descendant[];
  isRead?: boolean;
  isFromLoggedUser?: boolean;
  chatTimestamp?: string;
  handleMentionClick?: (pubKey: string) => void;
  handleTagClick?: (name: string) => void;
  handleLinkClick?: (url: string) => void;
}

const BubbleCard: React.FC<IBubbleCardProps> = props => {
  const {
    locale,
    senderName,
    youLabel,
    content,
    isRead,
    isFromLoggedUser,
    chatTimestamp,
    handleMentionClick,
    handleTagClick,
    handleLinkClick,
  } = props;

  const time = dayjs(+chatTimestamp / 1000000).format('HH:mm');
  const relativeTime = formatRelativeTime(+chatTimestamp / 1000000, locale);
  const iconType = isRead ? 'checkDouble' : 'checkSimple';

  return (
    <div>
      <div className={tw(`flex flex-row justify-between mb-1`)}>
        <Text variant="body1">{isFromLoggedUser ? youLabel : senderName}</Text>
        <Text variant="subtitle1">{relativeTime}</Text>
      </div>
      <BasicCardBox
        noBorderRadius
        customStyle="min-h-min" // allows cards to adjust in a y-scrollable container
      >
        <div className={tw(`p-2 cursor-pointer bg(grey9 dark:grey3)`)}>
          <div className={tw(`flex flex-row justify-between`)}>
            <div className={tw(`flex flex-row items-start`)}>
              <div className={tw(`flex flex-row items-start ml-2`)}>
                <ReadOnlyEditor
                  content={content}
                  handleMentionClick={handleMentionClick}
                  handleTagClick={handleTagClick}
                  handleLinkClick={handleLinkClick}
                />
              </div>
            </div>
            {/* should be used once we allow deleting messages */}
            {/* {isFromLoggedUser && (
              <div direction="row" height="fit-content" flex={{ shrink: 0 }} align="start">
                <Icon size="xs" plain={true} type="moreDark" />
              </div>
            )} */}
          </div>
          <div className={tw(`flex flex-row h-fit shrink-0 justify-end`)}>
            {chatTimestamp && <Text variant="subtitle1">{time}</Text>}
            {/* should be used once we have bidirectional read function */}
            {/* {isFromLoggedUser && <Icon size="sm" accentColor={isRead} type={iconType} />} */}
          </div>
        </div>
      </BasicCardBox>
    </div>
  );
};

export default BubbleCard;
