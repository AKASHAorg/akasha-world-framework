import React, { useMemo, useRef, useState } from 'react';
import EntryCard, {
  EntryCardProps,
} from '@akashaorg/design-system-components/lib/components/Entry/EntryCard';
import ContentBlockRenderer from './content-block-renderer';
import ActionButtons from './action-buttons';
import AuthorProfileAvatar from '../author-profile-avatar';
import { sortByKey, useAkashaStore } from '@akashaorg/ui-awf-hooks';
import { EntityTypes } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps, useNsfwToggling } from '@akashaorg/ui-awf-hooks';
import { Trans, useTranslation } from 'react-i18next';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import { GetBeamByIdQuery } from '@akashaorg/typings/lib/sdk/graphql-operation-types-new';
import {
  selectAppId,
  selectBeamActive,
  selectBeamAuthor,
  selectBeamContent,
  selectBeamId,
  selectBeamTags,
  selectCreatedAt,
  selectNsfw,
  selectReflectionsCount,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-beam-by-id-query';
import getSDK from '@akashaorg/core-sdk';
import { FlagIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { TrashIcon } from '@heroicons/react/24/outline';

type BeamCardProps = Pick<
  EntryCardProps,
  | 'contentClickable'
  | 'noWrapperCard'
  | 'onContentClick'
  | 'onReflect'
  | 'hideActionButtons'
  | 'disableActions'
  | 'showHiddenContent'
  | 'customStyle'
> & {
  beamData: GetBeamByIdQuery;
  hidePublishTime?: boolean;
  showNSFWCard: boolean;
  showLoginModal?: () => void;
};

const BeamCard: React.FC<BeamCardProps> = props => {
  const { t } = useTranslation('ui-lib-feed');
  const {
    beamData,
    hidePublishTime,
    onReflect,
    showHiddenContent,
    showNSFWCard,
    showLoginModal,
    onContentClick,
    ...rest
  } = props;

  const sdk = useRef(getSDK());

  const { getCorePlugins, navigateToModal } = useRootComponentProps();
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const [showBlockName, setShowBlockName] = useState(false);
  const navigateTo = getCorePlugins().routing.navigateTo;

  const { showNsfw } = useNsfwToggling();

  const handleFlagBeam = () => {
    if (!beamId) return;
    navigateTo({
      appName: '@akashaorg/app-vibes',
      getNavigationUrl: () => `/report/beam/${beamId}`,
    });
  };

  const beamContent = selectBeamContent(beamData);
  const reflectionsCount = selectReflectionsCount(beamData);
  const beamAuthor = selectBeamAuthor(beamData);

  const beamId = useMemo<string | null>(() => {
    return selectBeamId(beamData);
  }, [beamData]);

  const handleTagClick = (tag: string) => {
    navigateTo({
      appName: '@akashaorg/app-antenna',
      getNavigationUrl: routes => `${routes.Tags}/${tag}`,
    });
  };

  const handleEntryRemove = () => {
    navigateToModal({
      name: `remove-beam-confirmation`,
      beamId,
    });
  };

  const sortedEntryContent = React.useMemo(() => {
    return sortByKey(beamContent, 'order');
  }, [beamContent]);

  const beamTagsList = useMemo(() => {
    const tags = selectBeamTags(beamData);
    if (tags?.length) {
      return tags
        .filter(labeledTag => labeledTag.labelType === sdk.current.services.gql.labelTypes.TAG)
        .map(labeledTag => labeledTag.value);
    }
    return [];
  }, [beamData]);

  const isSelectBeamActive = selectBeamActive(beamData);
  const isViewer = authenticatedDID === beamAuthor.id;
  const flagAsLabel = t('Flag');
  const removeEntryLabel = t('Remove');
  const menuItems = [
    ...(!isViewer && flagAsLabel
      ? [
          {
            icon: <FlagIcon />,
            label: flagAsLabel,
            color: { light: 'errorLight', dark: 'errorDark' } as const,
            disabled: false,
            onClick: handleFlagBeam,
          },
        ]
      : []),
    ...(isViewer && removeEntryLabel
      ? [
          {
            icon: <TrashIcon />,
            label: t('Remove'),
            color: { light: 'errorLight', dark: 'errorDark' } as const,
            onClick: handleEntryRemove,
          },
        ]
      : []),
  ];

  return (
    <EntryCard
      dataTestId="beam-card"
      nsfwText={t('To view explicit or sensitive content, please connect to confirm your consent.')}
      entryData={{
        id: beamId,
        active: isSelectBeamActive,
        authorId: selectBeamAuthor(beamData).id,
        createdAt: selectCreatedAt(beamData),
        nsfw: selectNsfw(beamData),
        tags: beamTagsList,
      }}
      reflectionsCount={reflectionsCount}
      reflectAnchorLink="/@akashaorg/app-antenna/beam"
      sortedContents={sortedEntryContent}
      isViewer={isViewer}
      removed={{
        author: (
          <Trans
            defaults={`
              <txt>You have delisted this beam.</txt>
              <txt>Some users may still be able to see it in the antenna.</txt>
            `}
            components={{
              txt: <Text variant="button-sm" />,
            }}
          />
        ),
        others: (
          <Trans
            defaults={`
              <txt>This beam was delisted by the author.</txt>
              <txt>All reflections are disabled.</txt>
            `}
            components={{
              txt: <Text variant="button-sm" />,
            }}
          />
        ),
      }}
      moderated={{
        author: (
          <Trans
            defaults={`
              <txt>AKASHA world members won’t be able to see the content </txt>
              <txt>of your beam because you have violated the following <lnk>Code of Conduct</lnk></txt>
              <btn></btn>
            `}
            components={{
              txt: <Text variant="button-sm" />,
              lnk: <Link to={''} />,
              btn: (
                <Button
                  variant="text"
                  onClick={() => console.log('tap to view')}
                  label={t('Tap to view')}
                />
              ),
            }}
          />
        ),
        others: (
          <Trans
            defaults={`
              <txt>This beam has been delisted for the violation of our <lnk>Code of Conduct</lnk>.</txt>
              <txt>All reflections are disabled.</txt>
            `}
            components={{
              txt: <Text variant="button-sm" />,
              lnk: <Link to={''} />,
            }}
          />
        ),
      }}
      nsfw={{
        sensitiveContentLabel: t('Sensitive Content!'),
        clickToViewLabel: t('Click to View'),
      }}
      showHiddenContent={showHiddenContent}
      showNSFWCard={showNSFWCard}
      nsfwUserSetting={showNsfw}
      showLoginModal={showLoginModal}
      isLoggedIn={!!authenticatedDID}
      itemType={EntityTypes.BEAM}
      onTagClick={handleTagClick}
      onReflect={() => {
        if (!authenticatedDID) {
          showLoginModal?.();
          return;
        }
        onReflect();
      }}
      onContentClick={onContentClick}
      profileAvatar={
        <AuthorProfileAvatar
          authorId={beamAuthor.id}
          hidePublishTime={hidePublishTime}
          createdAt={selectCreatedAt(beamData)}
        />
      }
      menuItems={isSelectBeamActive && menuItems}
      actionsRight={
        isSelectBeamActive && (
          <ActionButtons
            appId={selectAppId(beamData)}
            showBlockName={showBlockName}
            showHiddenContent={showHiddenContent}
            onShowBlockName={() => {
              setShowBlockName(!showBlockName);
            }}
          />
        )
      }
      {...rest}
    >
      {({ blockID }) => (
        <React.Suspense fallback={<></>}>
          <ContentBlockRenderer
            blockID={blockID}
            authenticatedDID={authenticatedDID}
            showHiddenContent={showHiddenContent}
            beamIsNsfw={showNSFWCard}
            showBlockName={showBlockName}
          />
        </React.Suspense>
      )}
    </EntryCard>
  );
};

export default BeamCard;
