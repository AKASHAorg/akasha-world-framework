import React, { useState } from 'react';
import EntryCardLoading from '@akashaorg/design-system-components/lib/components/Entry/EntryCardLoading';
import ReflectionCard from '../components/cards/reflection-card';
import { useGetReflectionByIdQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { useTranslation } from 'react-i18next';
import { NetworkErrorCard } from '../components/cards/network-error-card';
import {
  selectReflectionActive,
  selectReflectionAuthorId,
  selectReflectionBeamId,
  selectReflectionContent,
  selectReflectionCreatedAt,
  selectReflectionId,
  selectReflectionNsfw,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-reflection-by-id-query';

export type EditableReflectionResolverProps = {
  reflectID: string;
  onContentClick: () => void;
  onReflect: () => void;
};

export const EditableReflectionResolver = ({
  reflectID,
  onContentClick,
  onReflect,
}: EditableReflectionResolverProps) => {
  const { t } = useTranslation('ui-lib-feed');

  const reflectionReq = useGetReflectionByIdQuery({
    variables: {
      id: reflectID,
    },
    fetchPolicy: 'cache-first',
    skip: !reflectID,
  });

  const [reloadCount, setReloadCount] = useState(0);

  if (reflectionReq.loading) return <EntryCardLoading noWrapperCard={true} />;

  if (reflectionReq.error)
    return (
      <NetworkErrorCard
        title={t('Reflection can’t be loaded')}
        message={t('Unable to load reflection content. Click “Reload” to reload the reflection.')}
        reloadCount={reloadCount}
        borderRadius={0}
        onReload={async () => {
          setReloadCount(reloadCount + 1);
          await reflectionReq.refetch();
        }}
      />
    );

  const reflectionContent = selectReflectionContent(reflectionReq.data);

  return (
    <React.Suspense>
      <ReflectionCard
        reflectionData={{
          id: selectReflectionId(reflectionReq.data),
          active: selectReflectionActive(reflectionReq.data),
          authorId: selectReflectionAuthorId(reflectionReq.data),
          createdAt: selectReflectionCreatedAt(reflectionReq.data),
          nsfw: selectReflectionNsfw(reflectionReq.data),
          content: reflectionContent,
          beamID: selectReflectionBeamId(reflectionReq.data),
        }}
        contentClickable={true}
        onContentClick={onContentClick}
        onReflect={onReflect}
      />
    </React.Suspense>
  );
};
