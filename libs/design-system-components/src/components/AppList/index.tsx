import React from 'react';
import DynamicInfiniteScroll, { DynamicInfiniteScrollProps } from '../DynamicInfiniteScroll';
import ExtensionCard, { ExtensionCardProps } from '../ExtensionCard';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import { XCircleIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-solid';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export type AppListProps = {
  apps: ExtensionCardProps[];
  loadErrorMessage?: {
    title: string;
    message: string;
  };
} & Pick<DynamicInfiniteScrollProps, 'overScan' | 'hasNextPage' | 'loading' | 'onLoadMore'>;

const ENTRY_HEIGHT = 92;

const ITEM_SPACING = 16;

/**
 * Component that renders a list of apps
 * @param apps - array of extensions
 * @param showAppTypeIndicator - boolean (optional) to show app type
 * @param loading -  boolean (optional) indicates if data is loading
 * @param hasNextPage - boolean (optional) used for pagination to indicate if next set of data is available
 * @param onLoadMore - handler for loading more data
 * @param overScan - overscan value
 */
const AppList: React.FC<AppListProps> = ({
  apps,
  loading,
  hasNextPage,
  onLoadMore,
  overScan = 1,
  loadErrorMessage,
}) => {
  return (
    <DynamicInfiniteScroll
      count={apps.length}
      estimatedHeight={ENTRY_HEIGHT}
      overScan={overScan}
      itemSpacing={ITEM_SPACING}
      lanes={2}
      hasNextPage={hasNextPage}
      loading={loading}
      onLoadMore={onLoadMore}
      listWrapperStyle={
        apps.length > 1
          ? 'grid grid-cols-[repeat(auto-fit,_minmax(min(16rem,_100%),_1fr))] gap-4'
          : 'flex'
      }
    >
      {({ itemIndex }) => {
        if (!apps[itemIndex]) {
          return (
            <Card customStyle="h-full flex flex-col justify-center items-center">
              <Icon
                icon={<XCircleIcon />}
                solid={true}
                color={{ light: 'errorLight', dark: 'errorDark' }}
                customStyle="mb-4"
              />
              <Text variant="button-md">{loadErrorMessage?.title}</Text>
              <Text variant="body2">{loadErrorMessage?.message}</Text>
            </Card>
          );
        }

        const {
          coverImageSrc,
          displayName,
          applicationType,
          extensionTypeLabel,
          author,
          description,
          action,
          defaultLabel,
          nsfwLabel,
          isDefaultWorldExtension,
          nsfw,
          featured,
        } = apps[itemIndex];

        return (
          <ExtensionCard
            coverImageSrc={coverImageSrc}
            displayName={displayName}
            applicationType={applicationType}
            extensionTypeLabel={extensionTypeLabel}
            author={author}
            description={description}
            action={action}
            nsfw={nsfw}
            featured={featured || apps.length === 1}
            defaultLabel={defaultLabel}
            nsfwLabel={nsfwLabel}
            isDefaultWorldExtension={isDefaultWorldExtension}
            customStyle="h-full"
          />
        );
      }}
    </DynamicInfiniteScroll>
  );
};

export default AppList;
