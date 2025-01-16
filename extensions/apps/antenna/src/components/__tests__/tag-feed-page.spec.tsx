import React from 'react';
import TagFeedPage from '../pages/tag-feed-page/tag-feed-page';
import userEvent from '@testing-library/user-event';
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
  TAG_NAME,
  getSubscriptionsMocks,
  getTagFeedMocks,
} from '../__mocks__';
import { formatRelativeTime, truncateDid } from '@akashaorg/design-system-core/lib/utils';
import { getTagFeedPageMocks } from '../__mocks__';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';

const baseComponent = (mocks?: Readonly<MockedResponse<unknown, unknown>[]> | undefined) => (
  <MockedProvider mocks={mocks} cache={new InMemoryCache(APOLLO_TYPE_POLICIES)}>
    <TagFeedPage tagName={TAG_NAME} />
  </MockedProvider>
);

describe('< TagFeedPage /> component', () => {
  describe('should render tag feed page', () => {
    it('should render placeholder if there are no subscribed topics', async () => {
      const { mocks } = getTagFeedPageMocks({ count: 0 });
      renderWithAllProviders(baseComponent(mocks), {});
      expect(await screen.findByText(TAG_NAME)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
      expect(screen.getByText(/0 beam/i)).toBeInTheDocument();
      expect(screen.getByText(/there is no content found for the/i)).toBeInTheDocument();
      expect(
        screen.getByText(/be the first one to create a beam for this topic! 🚀/i),
      ).toBeInTheDocument();
    });

    it('should render a beam on tag feed for subscribed topics', async () => {
      const { mocks } = getTagFeedPageMocks({ count: 1 });
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
      expect(await screen.findByTestId('tag-feed')).toBeInTheDocument();
      const tagFeed = screen.getByTestId('tag-feed');
      await waitFor(() =>
        expect(within(tagFeed).getByTestId('avatar-source')).toHaveAttribute(
          'srcset',
          avatar.default.src,
        ),
      );
      expect(within(tagFeed).getByTestId('reflections-count')).toHaveTextContent(
        String(TAG_FEED.reflectionsCount),
      );
      const infoBox = within(tagFeed).getByTestId('info-box');
      await waitFor(() => expect(infoBox).toHaveTextContent(name));
      expect(infoBox).toHaveTextContent(truncateDid(did.id));
      expect(infoBox).toHaveTextContent(formatRelativeTime(beamData.createdAt, 'en'));
      expect(await screen.findByText(/published via/i)).toBeInTheDocument();
    });
  });

  describe('should subscribe to a topic', () => {
    beforeEach(async () => {
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
    });

    it('should change button text from subscribe to subscribed', async () => {
      const { mocks } = getTagFeedPageMocks({ count: 0 });
      const subscriptionMocks = getSubscriptionsMocks({ tag: TAG_NAME });
      renderWithAllProviders(baseComponent([...mocks, ...subscriptionMocks]), {});
      const user = userEvent.setup();
      expect(await screen.findByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
      user.click(screen.getByRole('button', { name: 'Subscribe' }));
      expect(await screen.findByRole('button', { name: 'Subscribed' })).toBeInTheDocument();
    });

    it('should show subscribed text on button when a topic was previously subscribed', async () => {
      const { mocks } = getTagFeedPageMocks({ count: 0, tag: TAG_NAME });
      renderWithAllProviders(baseComponent(mocks), {});
      expect(await screen.findByText(TAG_NAME)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Subscribed' })).toBeInTheDocument();
    });
  });
});
