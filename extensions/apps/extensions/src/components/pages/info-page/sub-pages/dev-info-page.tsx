import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import AppList from '@akashaorg/design-system-components/lib/components/AppList';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ProfileAvatarButton from '@akashaorg/design-system-core/lib/components/ProfileAvatarButton';
import { ProfileImageVersions } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { transformSource, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useGetAppsByPublisherDidQuery } from '@akashaorg/ui-awf-hooks/lib/generated';
import getSDK from '@akashaorg/core-sdk';
import {
  selectApps,
  selectPageInfo,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-by-publisher-did-query';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import { NetworkStatus } from '@apollo/client';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import DefaultEmptyCard from '@akashaorg/design-system-components/lib/components/DefaultEmptyCard';

type DevInfoPageProps = {
  devDid: string;
  name: string;
  avatar: ProfileImageVersions;
  error?: string;
};

export const DevInfoPage = (props: DevInfoPageProps) => {
  const { devDid, name, avatar } = props;
  const navigate = useNavigate();
  const { getCorePlugins, encodeAppName } = useRootComponentProps();
  const { t } = useTranslation('app-extensions');
  const navigateTo = useRef(getCorePlugins().routing.navigateTo);
  const sdk = useRef(getSDK());

  const appsReq = useGetAppsByPublisherDidQuery({
    variables: {
      id: devDid,
      first: 5,
    },
    context: { source: sdk.current.services.gql.contextSources.default },
  });
  const pageInfo = selectPageInfo(appsReq.data);

  /*
    @todo: the followings will be required to filter curated apps

    const appIds = useMemo(() => {
    if (appsReq.networkStatus === NetworkStatus.ready) {
      return selectApps(appsReq.data)?.map(app => app.id) || [];
    }
  }, [appsReq]);

    const appStreamReq = useGetAppsStreamSuspenseQuery({
     variables: {
       indexer: sdk.current.services.common.misc.getIndexingDID(),
       first: appIds?.length,
       filters: {
         where: { applicationID: { in: appIds } },
       },
     },
     skip: !appIds || appIds.length === 0,
   });

   */

  const handleProfileClick = () => {
    navigateTo.current({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${devDid}`,
    });
  };

  const handleAppOpen = React.useCallback(
    (appName: string) => () => {
      navigate({
        to: '/info/$appId',
        params: {
          appId: encodeAppName(appName),
        },
      });
    },
    [encodeAppName, navigate],
  );

  const handleLoadMoreApps = () => {
    if (pageInfo?.hasNextPage) {
      appsReq.fetchMore({
        variables: {
          after: pageInfo?.endCursor,
        },
      });
    }
  };

  const apps = useMemo(
    () =>
      selectApps(appsReq.data)
        // @todo: we'll need to show the curated apps only. filtering will be made here
        ?.filter(() => true)
        .map(app => ({
          ...app,
          logoImage: transformSource(app.logoImage),
          action: <Button onClick={handleAppOpen(app.name)} label={t('Open')} />,
        })),
    [appsReq.data, handleAppOpen, t],
  );

  return (
    <>
      <Card padding="p-4">
        <Stack spacing="gap-y-4">
          <Text variant="h5">{t('Developer')}</Text>
          <ProfileAvatarButton
            profileId={devDid}
            label={name}
            avatar={transformSource(avatar?.default)}
            alternativeAvatars={avatar?.alternatives?.map(alt => transformSource(alt))}
            onClick={handleProfileClick}
          />
          {appsReq.error && (
            <>
              <Divider />
              <ErrorLoader
                noWrapperCard={true}
                type="list-not-available"
                title={`${t('Uh-oh')}!${t("We couldn't load the extension list")}!`}
                details={`${t('It seems there is a problem retreving the list of extensions')}. ${t('Please try again later')}!`}
              />
            </>
          )}
          {appsReq.networkStatus === NetworkStatus.ready && !apps?.length && (
            <>
              <Divider />
              <DefaultEmptyCard
                noBorder={true}
                assetName="longbeam-notfound"
                infoText={t('There are no releases for this extension yet')}
              />
            </>
          )}
          {apps && apps.length > 0 && (
            <>
              <Divider />
              <AppList
                hasNextPage={pageInfo?.hasNextPage}
                loading={appsReq.loading}
                apps={apps}
                onLoadMore={handleLoadMoreApps}
              />
            </>
          )}
          {appsReq.loading && (
            <Stack direction="column" align="center">
              <Spinner />
            </Stack>
          )}
        </Stack>
      </Card>
    </>
  );
};
