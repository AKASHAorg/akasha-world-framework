import React, { ReactNode } from 'react';
import DynamicInfiniteScroll, { DynamicInfiniteScrollProps } from '../DynamicInfiniteScroll';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import {
  AkashaAppApplicationType,
  AppImageSource,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  Plugin,
  App,
  Widget,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';

export type App = {
  displayName?: string;
  logoImage?: AppImageSource;
  description?: string;
  applicationType?: AkashaAppApplicationType;
  action?: ReactNode;
};

export type AppListProps = {
  apps: App[];
  showAppTypeIndicator?: boolean;
  overScan?: number;
} & Pick<DynamicInfiniteScrollProps, 'hasNextPage' | 'loading' | 'onLoadMore'>;

const ENTRY_HEIGHT = 92;

const ITEM_SPACING = 16;

/**
 * Component that renders a list of apps
 * @param apps - array of extensions
 * @param showAppTypeIndicator
 * @param loading -  boolean (optional) indicates if data is loading
 * @param hasNextPage - boolean (optional) used for pagination to indicate if next set of data is available
 * @param onLoadMore - handler for loading more data
 * @param overScan
 */
const AppList: React.FC<AppListProps> = ({
  apps,
  showAppTypeIndicator,
  loading,
  hasNextPage,
  onLoadMore,
  overScan = 1,
}) => {
  const getIconByAppType = (applicationType: AkashaAppApplicationType) => {
    switch (applicationType) {
      case AkashaAppApplicationType.App:
        return <App />;
      case AkashaAppApplicationType.Plugin:
        return <Plugin />;
      case AkashaAppApplicationType.Widget:
        return <Widget />;
    }
  };

  return (
    <DynamicInfiniteScroll
      count={apps.length}
      estimatedHeight={ENTRY_HEIGHT}
      overScan={overScan}
      itemSpacing={ITEM_SPACING}
      hasNextPage={hasNextPage}
      loading={loading}
      onLoadMore={onLoadMore}
    >
      {({ index, itemIndex }) => {
        const app = apps[itemIndex];
        return (
          <Stack spacing="gap-y-4">
            <Stack direction="row" justify="between" align="center" spacing="gap-x-8">
              <Stack direction="row" spacing="gap-x-3">
                <AppAvatar appType={app.applicationType} avatar={app.logoImage} />
                <Stack direction="column" spacing="gap-y-1">
                  <Stack direction="row" spacing="gap-2">
                    <Text variant="button-sm">{app.displayName}</Text>
                    {showAppTypeIndicator && (
                      <Stack
                        customStyle="w-[18px] h-[18px] rounded-full"
                        background={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                        justify="center"
                        align="center"
                      >
                        <Icon
                          color={{ light: 'secondaryLight', dark: 'white' }}
                          size={'xs'}
                          solid
                          icon={getIconByAppType(app.applicationType)}
                        />
                      </Stack>
                    )}
                  </Stack>
                  <Text
                    variant="footnotes2"
                    weight="normal"
                    color={{ light: 'grey4', dark: 'grey7' }}
                    lineClamp={2}
                  >
                    {app.description || app.displayName}
                  </Text>
                </Stack>
              </Stack>

              {app.action}
            </Stack>
            {index < apps.length - 1 && <Divider />}
          </Stack>
        );
      }}
    </DynamicInfiniteScroll>
  );
};

export default AppList;
