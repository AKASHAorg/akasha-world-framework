import React from 'react';
import Following from './following';
import EngagementTab from '../engagement-tab';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import InfoCard from '@akashaorg/design-system-core/lib/components/InfoCard';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import ProfileEngagementLoading from '@akashaorg/design-system-components/lib/components/Profile/placeholders/profile-engagement-loading';
import routes, { FOLLOWING } from '../../../routes';
import {
  useGetFollowingListByDidQuery,
  useGetProfileByDidQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { useRootComponentProps, useAkashaStore, useNsfwToggling } from '@akashaorg/ui-awf-hooks';
import { useTranslation } from 'react-i18next';
import { ENTRY_PER_PAGE, ITEM_SPACING } from '../constants';
import { selectProfileData } from '@akashaorg/ui-awf-hooks/lib/selectors/get-profile-by-did-query';
import { selectPageInfo } from '@akashaorg/ui-awf-hooks/lib/selectors/get-followers-list-by-did-query';

type FollowingPageProps = {
  profileDID: string;
};

const FollowingPage: React.FC<FollowingPageProps> = props => {
  const { profileDID } = props;
  const {
    data: { authenticatedDID, isAuthenticating: authenticating },
  } = useAkashaStore();
  const { getCorePlugins } = useRootComponentProps();
  const isLoggedIn = !!authenticatedDID;
  const navigateTo = getCorePlugins().routing.navigateTo;
  const { t } = useTranslation('app-profile');
  const { showNsfw } = useNsfwToggling();

  const profileDataReq = useGetProfileByDidQuery({
    fetchPolicy:
      'cache-first' /* data is prefetched during route matching as a result we prefer reading cache first here  */,
    variables: { id: profileDID },
    skip: authenticatedDID === profileDID,
  });

  const profileData = selectProfileData(profileDataReq.data);

  const { data, loading, error, fetchMore } = useGetFollowingListByDidQuery({
    fetchPolicy:
      'cache-only' /* data is prefetched during route matching as a result we read from cache here */,
    variables: {
      id: profileDID,
      first: ENTRY_PER_PAGE,
    },
    skip: !isLoggedIn,
  });

  const pageInfo = selectPageInfo(data);

  if (
    !data /* data is undefined until prefetching is complete therefore we display skeleton */ ||
    authenticating
  )
    return (
      <EngagementTab profileDID={profileDID}>
        <ProfileEngagementLoading itemSpacing={ITEM_SPACING} />
      </EngagementTab>
    );

  const onError = () => {
    navigateTo?.({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: navRoutes => `${navRoutes.rootRoute}/${profileDID}${routes[FOLLOWING]}`,
    });
  };

  const viewerIsOwner = authenticatedDID === profileDID;

  return (
    <EngagementTab profileDID={profileDID}>
      {error && (
        <Stack customStyle="mt-8">
          <InfoCard
            titleLabel={t('Oops! Something went wrong!')}
            bodyLabel={
              <>
                {t('Click')} {<Button label="here" variant="text" onClick={onError} />}{' '}
                {t('to try again!')}
              </>
            }
          />
        </Stack>
      )}
      {data && (
        <Following
          authenticatedDID={authenticatedDID}
          showNsfw={showNsfw}
          followingsData={data}
          profileAnchorLink={'/@akashaorg/app-profile'}
          emptyEntryTitleLabel={
            <>
              {`${viewerIsOwner ? t('You are') : `${profileData?.name} ${t('is')}`} ${t(
                'not following anyone yet',
              )}`}
              !
            </>
          }
          emptyEntryBodyLabel={
            viewerIsOwner ? (
              <>
                {t('Following others will help you see interesting')}
                <br /> {t('contents written and shared by them')}!
              </>
            ) : null
          }
          hasNextPage={pageInfo && pageInfo.hasNextPage}
          loading={loading}
          onLoadMore={() => {
            fetchMore({
              variables: {
                after: pageInfo.endCursor,
              },
            });
          }}
        />
      )}
    </EngagementTab>
  );
};

export default FollowingPage;
