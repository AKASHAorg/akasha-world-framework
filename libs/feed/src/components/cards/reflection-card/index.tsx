import React from 'react';
import EntryCard, {
  EntryCardProps,
} from '@akashaorg/design-system-components/lib/components/Entry/EntryCard';
import AuthorProfileAvatar from '../author-profile-avatar';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import Link from '@akashaorg/design-system-core/lib/components/Link';
import { useAkashaStore } from '@akashaorg/ui-core-hooks';
import { EntityTypes, ReflectionData } from '@akashaorg/typings/lib/ui';
import { decodeb64SlateContent, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { Trans, useTranslation } from 'react-i18next';
import { canDecodeContent } from '../../../utils/can-decode-content';

export type ReflectionCardProps = Pick<
  EntryCardProps,
  | 'contentClickable'
  | 'noWrapperCard'
  | 'onContentClick'
  | 'onEdit'
  | 'onReflect'
  | 'editable'
  | 'notEditableLabel'
  | 'hideActionButtons'
  | 'disableActions'
  | 'hover'
  | 'lastEntry'
> & {
  reflectionData: ReflectionData;
  hidePublishTime?: boolean;
  pending?: boolean;
};

const ReflectionCard: React.FC<ReflectionCardProps> = props => {
  const { t } = useTranslation('ui-lib-feed');
  const { reflectionData, hidePublishTime, pending, onReflect, ...rest } = props;
  const { getCorePlugins } = useRootComponentProps();
  const {
    data: { authenticatedDID },
  } = useAkashaStore();
  const isLoggedIn = !!authenticatedDID;

  const navigateTo = getCorePlugins().routing.navigateTo;

  const handleMentionClick = profileDID => {
    navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${profileDID}`,
    });
  };

  const handleFlagReflection = () => {
    navigateTo({
      appName: '@akashaorg/app-vibes',
      getNavigationUrl: () => `/report/reflection/${reflectionData.id}`,
    });
  };

  return (
    <EntryCard
      dataTestId={pending ? 'pending-reflection-card' : 'reflection-card'}
      entryData={reflectionData}
      reflectAnchorLink="/@akashaorg/app-antenna/reflection"
      {...(canDecodeContent(reflectionData.content)
        ? {
            slateContent: reflectionData.content.flatMap(item => decodeb64SlateContent(item.value)),
          }
        : {
            errorTitle: t('Reflection can’t be loaded'),
            errorMessage: t('Unable to decode reflection content.'),
          })}
      noWrapperCard={true}
      flagAsLabel={t('Flag')}
      isViewer={authenticatedDID === reflectionData.authorId}
      isLoggedIn={isLoggedIn}
      removed={{
        author: (
          <Trans
            defaults={`
                {textComponent}You have delisted this reflection.{textComponent}
                {textComponent}Some users may still be able to see it in the beam page.{textComponent}
                `}
            components={{
              textComponent: <Text variant="button-sm" />,
            }}
          />
        ),
        others: t(
          `
                {textComponent}This reflection was delisted by the author.{textComponent}
                {textComponent}All reflections are disabled.{textComponent}
                `,
          {
            textComponent: <Text />,
          },
        ),
      }}
      moderated={{
        author: (
          <Trans
            defaults={`
                {textComponent}AKASHA world members won't be able to see the content {textComponent}
                {textComponent}of your reflection because you have violated the following {textComponent}
                {linkComponent}Code of conduct{linkComponent}
                `}
            component={{
              textComponent: <Text />,
              linkComponent: <Link />,
            }}
          />
        ),
        others: (
          <Trans
            defaults={`
                {textComponent}This reflection has been delisted for the violation of our Code of Conduct.{textComponent}
                {textComponent}All reflections are disabled.{textComponent}
                `}
            components={{
              textComponent: <Text />,
            }}
          />
        ),
      }}
      itemType={EntityTypes.REFLECT}
      onReflect={onReflect}
      onEntryFlag={handleFlagReflection}
      onMentionClick={handleMentionClick}
      profileAvatar={
        <AuthorProfileAvatar
          authorId={reflectionData.authorId}
          hidePublishTime={hidePublishTime}
          pending={pending}
          createdAt={reflectionData?.createdAt}
        />
      }
      {...rest}
    />
  );
};

export default ReflectionCard;
