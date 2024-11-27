import React, { ReactElement, ReactNode, Ref, Fragment, useState } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import EntryCardRemoved from '../EntryCardRemoved';
import CardActions from './card-actions';
import InlineNotification from '@akashaorg/design-system-core/lib/components/InlineNotification';
import {
  EllipsisHorizontalIcon,
  FlagIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import ReadOnlyEditor from '../../ReadOnlyEditor';
import NSFW, { NSFWProps } from '../NSFW';
import Menu from '@akashaorg/design-system-core/lib/components/Menu';
import { getColorClasses } from '@akashaorg/design-system-core/lib/utils';
import { Descendant } from 'slate';
import { AkashaBeam } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { type EntryData, EntityTypes, NavigateToParams } from '@akashaorg/typings/lib/ui';
import { ListItem } from '@akashaorg/design-system-core/lib/components/List';
import Pill from '@akashaorg/design-system-core/lib/components/Pill';
import ErrorBoundary, {
  ErrorBoundaryProps,
} from '@akashaorg/design-system-core/lib/components/ErrorBoundary';
import { TrashIcon } from '@heroicons/react/24/outline';

type BeamProps = {
  sortedContents: AkashaBeam['content'];
  itemType: EntityTypes.BEAM;
  children: (props: { blockID: string }) => ReactElement;
};

type ReflectProps = {
  itemType: EntityTypes.REFLECT;
  navigateTo?: (args: NavigateToParams) => void;
} & ({ slateContent: Descendant[] } | { errorTitle: string; errorMessage: string });

export type EntryCardProps = {
  entryData: EntryData;
  profileAvatar: ReactNode;
  flagAsLabel?: string;
  moderatedContentLabel?: string;
  ctaLabel?: string;
  removeEntryLabel?: string;
  notEditableLabel?: string;
  editLabel?: string;
  removed?: {
    author: React.ReactNode;
    others: React.ReactNode;
  };
  moderated?: {
    author: React.ReactNode;
    others: React.ReactNode;
  };
  nsfw?: Omit<NSFWProps, 'onClickToView'>;
  reflectAnchorLink?: string;
  disableReporting?: boolean;
  isViewer?: boolean;
  isLoggedIn: boolean;
  disableActions?: boolean;
  noWrapperCard?: boolean;
  hideActionButtons?: boolean;
  showHiddenContent?: boolean;
  showNSFWCard?: boolean;
  nsfwUserSetting?: boolean;
  contentClickable?: boolean;
  lastEntry?: boolean;
  hover?: boolean;
  editable?: boolean;
  actionsRight?: ReactNode;
  reflectionsCount?: number;
  customStyle?: string;
  ref?: Ref<HTMLDivElement>;
  dataTestId?: string;
  onReflect?: () => void;
  onTagClick?: (tag: string) => void;
  onMentionClick?: (profileId: string) => void;
  onContentClick?: () => void;
  onEntryRemove?: (itemId: string) => void;
  onEntryFlag?: () => void;
  onEdit?: () => void;
  showLoginModal?: (title?: string, message?: string) => void;
} & (BeamProps | ReflectProps);

const EntryCard: React.FC<EntryCardProps> = props => {
  const {
    entryData,
    profileAvatar,
    ref,
    flagAsLabel,
    removed,
    nsfw,
    reflectAnchorLink,
    disableReporting,
    isViewer,
    isLoggedIn,
    disableActions = false,
    noWrapperCard = false,
    hideActionButtons,
    showHiddenContent,
    showNSFWCard,
    nsfwUserSetting,
    contentClickable,
    lastEntry,
    hover,
    actionsRight,
    reflectionsCount,
    customStyle,
    onTagClick,
    onContentClick,
    onEntryFlag,
    onReflect,
    showLoginModal,
    removeEntryLabel,
    onEntryRemove,
    dataTestId,
    ...rest
  } = props;

  /**
   * showNSFWContent determines whether to display the content underneath the overlay,
   * so if the showNSFWCard prop is true (which means to show the overlay), showNSFWContent should be false.
   * It is later toggled through an onClickToView handler.
   */
  const [showNSFWContent, setShowNSFWContent] = useState(!showNSFWCard);
  const showHiddenStyle = showHiddenContent ? '' : 'max-h-[50rem]';
  const contentClickableStyle =
    contentClickable && !showNSFWCard ? 'cursor-pointer' : 'cursor-default';

  const menuItems: ListItem[] = [
    ...(!isViewer && flagAsLabel
      ? [
          {
            icon: <FlagIcon />,
            label: flagAsLabel,
            color: { light: 'errorLight', dark: 'errorDark' } as const,
            disabled: disableReporting,
            onClick: onEntryFlag,
          },
        ]
      : []),
    ...(isViewer && removeEntryLabel && rest.itemType === EntityTypes.BEAM
      ? [
          {
            icon: <TrashIcon />,
            label: removeEntryLabel,
            color: { light: 'errorLight', dark: 'errorDark' } as const,
            onClick: onEntryRemove,
          },
        ]
      : []),
  ];
  const hoverStyleLastEntry = lastEntry ? 'rounded-b-2xl' : '';
  const hoverStyle = hover
    ? `${getColorClasses({ light: 'grey9/60', dark: 'grey3' }, 'hover:bg')} ${hoverStyleLastEntry}`
    : '';

  const errorBoundaryProps: Pick<ErrorBoundaryProps, 'errorObj' | 'logger'> = {
    errorObj: {
      type: 'script-error',
      title: 'Error in beam rendering',
    },
  };

  const entryCardUi = (
    <Card
      type="plain"
      dataTestId={dataTestId}
      /**
       * attach onClick handler if;
       * 'showNSFWContent' state (initially derived from the inverse of the 'showNSFWCard' prop) is true
       */
      {...(showNSFWContent && { onClick: onContentClick })}
    >
      <Stack spacing="gap-y-2" padding="p-4" customStyle={`grow min-h-[inherit] ${hoverStyle}`}>
        <Stack direction="row" justify="between">
          {profileAvatar}
          <Menu
            anchor={{
              icon: <EllipsisHorizontalIcon />,
              plainIcon: true,
              iconOnly: true,
              size: 'md',
            }}
            items={menuItems}
            disabled={disableActions}
            customStyle="shrink-0"
            onMenuClick={e => e.stopPropagation()}
          />
        </Stack>
        {!entryData.active && (
          <EntryCardRemoved
            {...(isViewer
              ? {
                  type: 'author',
                  message: removed.author,
                  onTapToView: () => {
                    //@TODO
                  },
                }
              : { type: 'others', message: removed.others })}
          />
        )}
        {entryData.active && (
          <ErrorBoundary {...errorBoundaryProps}>
            <Card
              type="plain"
              customStyle={contentClickableStyle}
              /**
               * attach onClick handler if
               * 'showNSFWContent' and 'noWrapperCard' are both true
               */
              {...(showNSFWContent && noWrapperCard && { onClick: onContentClick })}
            >
              <Stack
                align="center"
                justify="start"
                customStyle={`overflow-hidden ${showHiddenStyle} ${contentClickableStyle}`}
                data-testid="entry-content"
                fullWidth={true}
              >
                {/* show the overlay in two cases: the user not logged in, or the beam is nsfw and
              the nsfw setting is off */}
                {((showNSFWCard && !nsfwUserSetting && !showNSFWContent) ||
                  (!isLoggedIn && showNSFWCard)) && (
                  <NSFW
                    {...nsfw}
                    onClickToView={event => {
                      event.stopPropagation();
                      if (!isLoggedIn) {
                        if (showLoginModal && typeof showLoginModal === 'function') {
                          showLoginModal(
                            null,
                            'To view explicit or sensitive content, please connect to confirm your consent.',
                          );
                        }
                      } else {
                        setShowNSFWContent(true);
                      }
                    }}
                  />
                )}
                {/*
                 * display the content in case: the content is not nsfw or, the showNSFWContent flag
                 * is true or, the nsfw setting is on and the user is logged in.
                 */}
                {(!entryData.nsfw || showNSFWContent || (nsfwUserSetting && isLoggedIn)) && (
                  <Stack
                    justifySelf="start"
                    alignSelf="start"
                    align="start"
                    spacing="gap-y-2"
                    fullWidth={true}
                  >
                    {rest.itemType === EntityTypes.REFLECT ? (
                      <>
                        {'slateContent' in rest && (
                          <ReadOnlyEditor
                            content={rest.slateContent}
                            disabled={entryData.nsfw}
                            handleMentionClick={rest.onMentionClick}
                            handleLinkClick={url => {
                              rest.navigateTo?.({ getNavigationUrl: () => url });
                            }}
                          />
                        )}
                        {'errorTitle' in rest && (
                          <InlineNotification
                            title={rest.errorTitle}
                            message={rest.errorMessage}
                            type="error"
                          />
                        )}
                      </>
                    ) : (
                      rest.sortedContents?.map(item => (
                        <Fragment key={item.blockID}>
                          {rest.children({ blockID: item.blockID })}
                        </Fragment>
                      ))
                    )}
                  </Stack>
                )}
                {showHiddenContent && entryData.tags?.length > 0 && (
                  <Stack
                    padding={{ y: 16 }}
                    justify="start"
                    direction="row"
                    spacing="gap-2"
                    customStyle="flex-wrap"
                    fullWidth
                  >
                    {entryData.tags?.map((tag, index) => (
                      <Pill
                        key={index}
                        label={tag}
                        onPillClick={() => {
                          if (typeof onTagClick === 'function') {
                            onTagClick(tag);
                          }
                        }}
                        type="action"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>
          </ErrorBoundary>
        )}
        {!hideActionButtons && (
          <CardActions
            itemId={entryData.id}
            reflectAnchorLink={reflectAnchorLink}
            disableActions={disableActions || !entryData.active}
            actionsRight={actionsRight}
            reflectionsCount={reflectionsCount}
            onReflect={onReflect}
            customStyle="mt-auto"
          />
        )}
      </Stack>
    </Card>
  );

  return noWrapperCard ? (
    <> {entryCardUi}</>
  ) : (
    <Card ref={ref} padding="p-0" customStyle={`grow min-h-[inherit] ${customStyle}`}>
      {entryCardUi}
    </Card>
  );
};

export default EntryCard;
