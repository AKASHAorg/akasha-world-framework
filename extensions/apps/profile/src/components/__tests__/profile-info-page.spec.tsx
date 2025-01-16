import React from 'react';
import ProfileInfoPage from '../pages/profile-info';
import userEvent from '@testing-library/user-event';
import * as useAkashaStore from '@akashaorg/ui-core-hooks/lib/store/use-akasha-store';
import * as useProfileStats from '@akashaorg/ui-core-hooks/lib/use-profile-stats';
import {
  screen,
  renderWithAllProviders,
  getAuthenticationStore,
  waitFor,
} from '@akashaorg/af-testing';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import {
  APOLLO_TYPE_POLICIES,
  AUTHENTICATED_DID,
  AUTHENTICATED_PROFILE,
  PROFILE_DID,
  PROFILE_STATS,
} from '../__mocks__/constants';
import {
  getEmptyProfileMock,
  getFollowMock,
  getProfileInfoMocks,
} from '../__mocks__/get-profile-info-mocks';
import { truncateDid } from '@akashaorg/design-system-core/lib/utils';
import { getFollowProfileMocks } from '../__mocks__/get-follow-profile-mocks';

const baseComponent = (
  mocks: Readonly<MockedResponse<unknown, unknown>[]> | undefined,
  profileDID?: string,
) => (
  <MockedProvider mocks={mocks} cache={new InMemoryCache(APOLLO_TYPE_POLICIES)}>
    <ProfileInfoPage profileDID={profileDID ?? PROFILE_DID} />
  </MockedProvider>
);

describe('< ProfileInfoPage /> component', () => {
  describe('should render profile info', () => {
    const { mocks, profileData } = getProfileInfoMocks({ profileDID: PROFILE_DID });
    const { name, did, avatar, background, description, links } = profileData.akashaProfile;

    beforeEach(async () => {
      jest.spyOn(useProfileStats, 'useProfileStats').mockReturnValue({
        data: { ...PROFILE_STATS },
        loading: false,
        error: null,
      });
    });

    it('should render profile header', async () => {
      renderWithAllProviders(baseComponent(mocks), {});
      expect(await screen.findByText(name)).toBeInTheDocument();
      expect(screen.getByText(truncateDid(did.id))).toBeInTheDocument();
      expect(screen.getByTestId('avatar-source')).toHaveAttribute('srcset', avatar.default.src);
      expect(screen.getByTestId('cover-image')).toHaveStyle(
        `background-image: url(${background.default.src})`,
      );
      expect(screen.getByRole('button', { name: 'follow' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'settings' })).toBeInTheDocument();
    });

    it('should render bio', async () => {
      renderWithAllProviders(baseComponent(mocks), {});
      expect(await screen.findByText(/bio/i)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('should render stats', async () => {
      renderWithAllProviders(baseComponent(mocks), {});
      await waitFor(() =>
        expect(screen.getByLabelText(/beams/i)).toHaveTextContent(String(PROFILE_STATS.totalBeams)),
      );
      expect(screen.getByLabelText(/interests/i)).toHaveTextContent(
        String(PROFILE_STATS.totalTopics),
      );
      expect(screen.getByLabelText(/followers/i)).toHaveTextContent(
        String(PROFILE_STATS.totalFollowers),
      );
      expect(screen.getByLabelText(/following/i)).toHaveTextContent(
        String(PROFILE_STATS.totalFollowing),
      );
    });

    it('should render social link', async () => {
      renderWithAllProviders(baseComponent(mocks), {});
      expect(await screen.findByText(/find me on/i)).toBeInTheDocument();
      expect(screen.getByText(links[0].href)).toBeInTheDocument();
    });

    it('should display empty profile card for users with no profile information', async () => {
      const emptyProfileMock = getEmptyProfileMock(PROFILE_DID);
      renderWithAllProviders(baseComponent(emptyProfileMock), {});
      expect(
        await screen.findByText(/it seems this user hasn't filled in their information just yet./i),
      ).toBeInTheDocument();
    });

    it('should display "fill my info" card for authenticated user with empty profile', async () => {
      jest.spyOn(useAkashaStore, 'useAkashaStore').mockReturnValue({
        authenticationStore: getAuthenticationStore(),
        data: {
          authenticatedDID: AUTHENTICATED_DID,
          authenticatedProfile: AUTHENTICATED_PROFILE,
          authenticatedProfileError: null,
          authenticationError: null,
          isAuthenticating: false,
        },
      });
      const emptyProfileMock = getEmptyProfileMock(AUTHENTICATED_DID);
      renderWithAllProviders(baseComponent(emptyProfileMock, AUTHENTICATED_DID), {});
      expect(
        await screen.findByText(/uh-uh! it looks like you haven’t filled your information!/i),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Fill my info' })).toBeInTheDocument();
    });

    it('should display NSFW card when viewing another users NSFW profile', async () => {
      const { mocks } = getProfileInfoMocks({ profileDID: PROFILE_DID, nsfw: true });
      const followMock = getFollowMock();
      renderWithAllProviders(baseComponent([...mocks, ...followMock]), {});
      expect(await screen.findByText(/nsfw profile/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View Profile' })).toBeInTheDocument();
    });

    it('should display NSFW pill for authenticated users viewing their own profile', async () => {
      jest.spyOn(useAkashaStore, 'useAkashaStore').mockReturnValue({
        authenticationStore: getAuthenticationStore(),
        data: {
          authenticatedDID: AUTHENTICATED_DID,
          authenticatedProfile: AUTHENTICATED_PROFILE,
          authenticatedProfileError: null,
          authenticationError: null,
          isAuthenticating: false,
        },
      });
      const { mocks } = getProfileInfoMocks({ profileDID: AUTHENTICATED_DID, nsfw: true });
      const followMock = getFollowMock();
      renderWithAllProviders(baseComponent([...mocks, ...followMock], AUTHENTICATED_DID), {});
      expect(await screen.findByText(/nsfw/i)).toBeInTheDocument();
    });
  });

  describe('should allow user to interact with profile info', () => {
    beforeEach(() => {
      jest.spyOn(useAkashaStore, 'useAkashaStore').mockReturnValue({
        authenticationStore: getAuthenticationStore(),
        data: {
          authenticatedDID: AUTHENTICATED_DID,
          authenticatedProfile: AUTHENTICATED_PROFILE,
          authenticatedProfileError: null,
          authenticationError: null,
          isAuthenticating: false,
        },
      });
      jest.spyOn(useProfileStats, 'useProfileStats').mockReturnValue({
        data: { ...PROFILE_STATS },
        loading: false,
        error: null,
      });
    });

    //@TODO revisit this test case
    it.skip('should follow other profile', async () => {
      const { mocks, profileData } = getProfileInfoMocks({ profileDID: PROFILE_DID });
      const followMock = getFollowMock();
      const followProfileMocks = getFollowProfileMocks({
        profileDID: PROFILE_DID,
        isFollowing: true,
      });
      const followingMock = getFollowMock({
        profileDID: PROFILE_DID,
        isFollowing: true,
      });
      const user = userEvent.setup();
      renderWithAllProviders(
        baseComponent([...mocks, ...followMock, ...followingMock, ...followProfileMocks]),
        {},
      );
      expect(await screen.findByText(profileData.akashaProfile.name)).toBeInTheDocument();
      expect(screen.getByText(truncateDid(profileData.akashaProfile.did.id))).toBeInTheDocument();
      expect(screen.getByTestId('avatar-source')).toHaveAttribute(
        'srcset',
        profileData.akashaProfile.avatar.default.src,
      );
      expect(screen.getByTestId('cover-image')).toHaveStyle(
        `background-image: url(${profileData.akashaProfile.background.default.src})`,
      );
      expect(screen.getByRole('button', { name: 'follow' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'settings' })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: 'following' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'follow' }));
      expect(await screen.findByRole('img', { name: 'following' })).toBeInTheDocument();
    });

    it('should display NSFW profiles to authenticated users upon view profile request', async () => {
      const user = userEvent.setup();
      const { mocks } = getProfileInfoMocks({ profileDID: PROFILE_DID, nsfw: true });
      const followMock = getFollowMock();
      renderWithAllProviders(baseComponent([...mocks, ...followMock]), {});
      expect(await screen.findByText(/nsfw profile/i)).toBeInTheDocument();
      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'View Profile' }));
      });
      expect(screen.queryByText(/nsfw profile/i)).not.toBeInTheDocument();
    });
  });
});
