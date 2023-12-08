import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { RootExtensionProps } from '@akashaorg/typings/lib/ui';
import {
  getFollowList,
  hasOwn,
  transformImageVersions,
  useLoggedIn,
  useProfileStats,
  useRootComponentProps,
  withProviders,
} from '@akashaorg/ui-awf-hooks';
import {
  useGetBeamByIdQuery,
  useGetFollowDocumentsByDidQuery,
  useGetProfileByDidQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { Extension } from '@akashaorg/ui-lib-extensions/lib/react/extension';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import ProfileMiniCard from '@akashaorg/design-system-components/lib/components/ProfileMiniCard';

const ProfileCardWidget: React.FC<RootExtensionProps> = props => {
  const { plugins } = props;

  const { beamId } = useParams<{ beamId?: string }>();
  const { t } = useTranslation('ui-widget-mini-profile');

  const { isLoggedIn, authenticatedDID } = useLoggedIn();

  const { data: beam } = useGetBeamByIdQuery({ variables: { id: beamId } });

  const authorId = beam?.node && hasOwn(beam.node, 'author') ? beam?.node?.author.id : '';

  const { data: authorProfileData } = useGetProfileByDidQuery({
    variables: {
      id: authorId,
    },
    skip: beam?.node && !hasOwn(beam.node, 'author'),
  });

  const profileData =
    authorProfileData?.node && hasOwn(authorProfileData.node, 'akashaProfile')
      ? authorProfileData.node.akashaProfile
      : null;

  const { data: stats } = useProfileStats(authorId);

  const {
    data: { totalBeams, totalFollowers },
  } = stats;

  const { data: followDocuments } = useGetFollowDocumentsByDidQuery({
    variables: {
      id: authenticatedDID,
      following: [authorId],
      last: 1,
    },
    skip: !isLoggedIn,
  });

  const followList = isLoggedIn
    ? getFollowList(
        followDocuments?.node && hasOwn(followDocuments.node, 'akashaFollowList')
          ? followDocuments.node?.akashaFollowList?.edges?.map(edge => edge?.node)
          : null,
      )
    : null;

  const handleCardClick = () => {
    plugins['@akashaorg/app-routing']?.routing?.navigateTo?.({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: navRoutes => `${navRoutes.rootRoute}/${authorId}`,
    });
  };

  return (
    <ProfileMiniCard
      profileData={{ ...profileData, avatar: transformImageVersions(profileData?.avatar) }}
      authenticatedDID={authenticatedDID}
      beamsLabel={t('Beams')}
      followingLabel={t('Following')}
      followersLabel={t('Followers')}
      stats={{ followers: totalFollowers, beams: totalBeams }}
      handleClick={handleCardClick}
      footerExt={
        <Extension
          name={`follow_${profileData?.id}`}
          extensionData={{
            profileID: profileData?.id,
            isFollowing: followList?.get(profileData?.id)?.isFollowing,
            followId: followList?.get(profileData?.id)?.id,
            isLoggedIn,
          }}
        />
      }
    />
  );
};

// Router is required for the useRouteMatch hook to extract the postId from the url
const Wrapped = (props: RootExtensionProps) => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <Router>
      <Routes>
        <Route
          path="@akashaorg/app-akasha-integration/beam/:beamId"
          element={
            <I18nextProvider i18n={getTranslationPlugin().i18n}>
              <ProfileCardWidget {...props} />
            </I18nextProvider>
          }
        />
      </Routes>
    </Router>
  );
};

const reactLifecycles = singleSpaReact({
  React,
  ReactDOMClient: ReactDOM,
  rootComponent: withProviders(Wrapped),
  errorBoundary: (err, errorInfo, props: RootExtensionProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }
    return (
      <ErrorLoader type="script-error" title="Error in mini profile widget" details={err.message} />
    );
  },
});

export const bootstrap = reactLifecycles.bootstrap;

export const mount = reactLifecycles.mount;

export const unmount = reactLifecycles.unmount;
