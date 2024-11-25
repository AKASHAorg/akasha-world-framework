import React, { Suspense } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import InterestsPage from '../pages/interests';
import EditProfilePage from '../pages/edit-profile';
import FollowingPage from '../pages/following';
import FollowersPage from '../pages/followers';
import ProfileInfoPage from '../pages/profile-info';
import ProfileBeamsPage from '../pages/profile-beams';
import ProfileHeader from '../profile-header';
import ProfileWithAuthorization from '../profile-with-authorization';
import menuRoute, { BEAMS, EDIT, INTERESTS, FOLLOWERS, FOLLOWING } from '../../routes';
import getSDK from '@akashaorg/core-sdk';
import { ProfileLoading } from '@akashaorg/design-system-components/lib/components/Profile';
import {
  CatchBoundary,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  ScrollRestoration,
  redirect,
} from '@tanstack/react-router';
import {
  GetProfileByDidDocument,
  GetFollowersListByDidDocument,
  GetFollowingListByDidDocument,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { ICreateRouter, IRouterContext } from '@akashaorg/typings/lib/ui';
import { NotFoundComponent } from './not-found-component';
import { ENTRY_PER_PAGE } from '../pages/constants';

const rootRoute = createRootRouteWithContext<IRouterContext>()({
  component: () => (
    <>
      <ScrollRestoration getKey={location => location.pathname} />
      <Outlet />
    </>
  ),
  notFoundComponent: () => <NotFoundComponent />,
});

const defaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    const result = await getSDK().api.auth.getCurrentUser();
    if (result?.id) {
      throw redirect({ to: '/$profileDID', params: { profileDID: result.id }, replace: true });
    }
  },
});

const profileInfoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$profileDID',
  loader: ({ context, params }) => {
    context.apolloClient.query({
      query: GetProfileByDidDocument,
      variables: {
        id: params.profileDID,
      },
    });
  },
  component: () => {
    const { profileDID } = profileInfoRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'profile_info_reset'} errorComponent={NotFoundComponent}>
        <Suspense fallback={<ProfileLoading />}>
          <ProfileInfoPage profileDID={profileDID} />
        </Suspense>
      </CatchBoundary>
    );
  },
});

const profileEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `$profileDID${menuRoute[EDIT]}`,
  component: () => {
    const { profileDID } = profileEditRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'profile_edit_reset'} errorComponent={NotFoundComponent}>
        <Suspense fallback={<ProfileLoading />}>
          <ProfileWithAuthorization editingProfile={true} profileDID={profileDID}>
            <EditProfilePage profileDID={profileDID} />
          </ProfileWithAuthorization>
        </Suspense>
      </CatchBoundary>
    );
  },
});

const followersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `$profileDID${menuRoute[FOLLOWERS]}`,
  loader: ({ context, params }) => {
    context.apolloClient.query({
      query: GetFollowersListByDidDocument,
      variables: {
        id: params.profileDID,
        first: ENTRY_PER_PAGE,
      },
    });
  },
  component: () => {
    const { profileDID } = followersRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'followers_reset'} errorComponent={NotFoundComponent}>
        <ProfileWithAuthorization profileDID={profileDID}>
          <Card radius={20} padding="p-0">
            <ProfileHeader profileDID={profileDID} plain={true} customStyle="sticky top-3.5 z-50" />
            <FollowersPage profileDID={profileDID} />
          </Card>
        </ProfileWithAuthorization>
      </CatchBoundary>
    );
  },
});

const followingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `$profileDID${menuRoute[FOLLOWING]}`,
  loader: ({ context, params }) => {
    context.apolloClient.query({
      query: GetFollowingListByDidDocument,
      variables: {
        id: params.profileDID,
        first: ENTRY_PER_PAGE,
      },
    });
  },
  component: () => {
    const { profileDID } = followingRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'following_reset'} errorComponent={NotFoundComponent}>
        <ProfileWithAuthorization profileDID={profileDID}>
          <Card radius={20} padding="p-0">
            <ProfileHeader profileDID={profileDID} plain={true} customStyle="sticky top-3.5 z-50" />
            <FollowingPage profileDID={profileDID} />
          </Card>
        </ProfileWithAuthorization>
      </CatchBoundary>
    );
  },
});

const interestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `$profileDID${menuRoute[INTERESTS]}`,
  component: () => {
    const { profileDID } = interestsRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'interests_reset'} errorComponent={NotFoundComponent}>
        <ProfileWithAuthorization profileDID={profileDID}>
          <ProfileHeader profileDID={profileDID} />
          <InterestsPage profileDID={profileDID} />
        </ProfileWithAuthorization>
      </CatchBoundary>
    );
  },
});

const beamsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `$profileDID${menuRoute[BEAMS]}`,
  component: () => {
    const { profileDID } = beamsRoute.useParams();
    return (
      <CatchBoundary getResetKey={() => 'profile_beams_reset'} errorComponent={NotFoundComponent}>
        <ProfileWithAuthorization profileDID={profileDID}>
          <ProfileHeader profileDID={profileDID} />
          <ProfileBeamsPage profileDID={profileDID} />
        </ProfileWithAuthorization>
      </CatchBoundary>
    );
  },
});

const routeTree = rootRoute.addChildren([
  defaultRoute,
  profileInfoRoute,
  profileEditRoute,
  followersRoute,
  followingRoute,
  interestsRoute,
  beamsRoute,
]);

export const router = ({ baseRouteName, apolloClient }: ICreateRouter) =>
  createRouter({
    routeTree,
    basepath: baseRouteName,
    context: {
      apolloClient,
    },
    defaultErrorComponent: ({ error }) => <NotFoundComponent error={error} />,
  });
