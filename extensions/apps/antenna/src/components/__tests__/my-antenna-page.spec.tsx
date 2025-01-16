import React from 'react';
import MyAntennaPage from '../pages/my-antenna-page';
import * as useAkashaStore from '@akashaorg/ui-core-hooks/lib/store/use-akasha-store';
import {
  screen,
  renderWithAllProviders,
  getAuthenticationStore,
  waitFor,
  within,
} from '@akashaorg/af-testing';
import {
  APOLLO_TYPE_POLICIES,
  AUTHENTICATED_DID,
  AUTHENTICATED_PROFILE,
  TAG_FEED,
  getMyAntennaPageMocks,
} from '../__mocks__';
import { formatRelativeTime, truncateDid } from '@akashaorg/design-system-core/lib/utils';
import { getTagFeedMocks } from '../__mocks__';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';

const { mocks } = getMyAntennaPageMocks();

const baseComponent = (mocks?: Readonly<MockedResponse<unknown, unknown>[]> | undefined) => (
  <MockedProvider mocks={mocks} cache={new InMemoryCache(APOLLO_TYPE_POLICIES)}>
    <MyAntennaPage />
  </MockedProvider>
);

describe('< MyAntennaPage /> component', () => {
  describe('should render my antenna page', () => {
    it('should render placeholder if there are no subscribed topics', async () => {
      renderWithAllProviders(baseComponent(), {});
      expect(screen.getByText(/add some magic to your feed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Customize My Feed' })).toBeInTheDocument();
    });

    it('should render a beam on tag feed for subscribed topics', async () => {
      const { mocks: tagFeedMocks, profileData, beamData } = getTagFeedMocks();
      const { name, did, avatar } = profileData.akashaProfile;

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
      renderWithAllProviders(baseComponent([...mocks, ...tagFeedMocks]), {});
      expect(await screen.findByText(/your customized view of akasha world/i)).toBeInTheDocument();
      const tagFeed = screen.getByTestId('tag-feed');
      await waitFor(() =>
        expect(within(tagFeed).getByTestId('avatar-source')).toHaveAttribute(
          'srcset',
          avatar.default.src,
        ),
      );
      const infoBox = within(tagFeed).getByTestId('info-box');
      expect(within(tagFeed).getByTestId('reflections-count')).toHaveTextContent(
        String(TAG_FEED.reflectionsCount),
      );
      await waitFor(() => expect(infoBox).toHaveTextContent(name));
      expect(infoBox).toHaveTextContent(truncateDid(did.id));
      expect(infoBox).toHaveTextContent(formatRelativeTime(beamData.createdAt, 'en'));
      expect(await screen.findByText(/published via/i)).toBeInTheDocument();
    });
  });
});
