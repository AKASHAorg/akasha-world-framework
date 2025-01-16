import React, { createRef } from 'react';
import BeamPage from '../pages/entry-page/beam-page';
import ReflectEditor from '../reflect-editor';
import userEvent from '@testing-library/user-event';
import * as useAkashaStore from '@akashaorg/ui-core-hooks/lib/store/use-akasha-store';
import {
  screen,
  renderWithAllProviders,
  waitFor,
  getAuthenticationStore,
  within,
} from '@akashaorg/af-testing';
import { AkashaBeamStreamModerationStatus } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { formatRelativeTime, truncateDid } from '@akashaorg/design-system-core/lib/utils';
import {
  AUTHENTICATED_DID,
  AUTHENTICATED_PROFILE,
  BEAM_ID,
  BEAM_SECTION,
  APOLLO_TYPE_POLICIES,
  NEW_REFLECTION,
  NEW_REFLECTION_ID,
  REFLECTION_ID,
  REFLECT_FEED,
  getBeamSectionMocks,
  getEmptyReflectionStreamMock,
  getPendingReflectMock,
  getReflectEditorMocks,
  getReflectFeedMocks,
  NEW_REFLECTION_BEYOND_TEXT_LIMIT,
} from '../__mocks__';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import { RawBeamData } from '@akashaorg/typings/lib/ui';
import { EditorActions } from '@akashaorg/design-system-components/lib/components/Editor';

const {
  mocks: beamSectionMocks,
  profileData: beamSectionProfileData,
  beamData,
} = getBeamSectionMocks();

const editorActionsRef = createRef<EditorActions>();

const baseComponent = (
  mocks: Readonly<MockedResponse<unknown, unknown>[]> | undefined,
  mockedBeamData?: RawBeamData,
  isActive?: boolean,
) => (
  <MockedProvider mocks={mocks} cache={new InMemoryCache(APOLLO_TYPE_POLICIES)}>
    <BeamPage
      isActive={isActive ?? true}
      beamStatus={AkashaBeamStreamModerationStatus.Ok}
      beamData={{ node: mockedBeamData ?? beamData }}
      beamId={BEAM_ID}
      renderEditor={({ beamId, reflectToId, showEditor, setShowEditor }) => (
        <ReflectEditor
          beamId={beamId}
          reflectToId={reflectToId}
          showEditor={showEditor}
          setShowEditor={setShowEditor}
          editorActionsRef={editorActionsRef}
        />
      )}
    />
  </MockedProvider>
);

describe('< BeamPage /> component', () => {
  describe('should render beam page', () => {
    const {
      mocks: reflectFeedMocks,
      profileData: reflectFeedProfileData,
      reflectionData,
      previewData,
    } = getReflectFeedMocks({
      beamId: BEAM_ID,
      reflectionId: REFLECTION_ID,
      authorProfileDID: REFLECT_FEED.authorProfileDID,
      reflectionContent: REFLECT_FEED.content,
      preview: {
        reflectionId: REFLECT_FEED.preview.reflectionId,
        content: REFLECT_FEED.preview.content,
      },
    });

    it('should render beam section', async () => {
      renderWithAllProviders(
        baseComponent([...beamSectionMocks, ...getEmptyReflectionStreamMock()]),
        {},
      );
      expect(screen.getByText(/Share your thoughts/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reflect' })).toBeInTheDocument();
      const beamSection = screen.getByTestId('beam-section');
      await waitFor(() =>
        expect(within(beamSection).getAllByTestId('avatar-source')[0]).toHaveAttribute(
          'srcset',
          beamSectionProfileData.akashaProfile.avatar.default.src,
        ),
      );
      await waitFor(() =>
        expect(within(beamSection).getByTestId('reflections-count')).toHaveTextContent(
          String(BEAM_SECTION.reflectionsCount),
        ),
      );
      const infoBox = within(beamSection).getAllByTestId('info-box')[0];
      await waitFor(() =>
        expect(infoBox).toHaveTextContent(beamSectionProfileData.akashaProfile.name),
      );
      expect(infoBox).toHaveTextContent(truncateDid(beamSectionProfileData.akashaProfile.did.id));
      expect(infoBox).toHaveTextContent(formatRelativeTime(beamData.createdAt, 'en'));
    });

    it('should render a reflection on reflect feed', async () => {
      renderWithAllProviders(baseComponent([...beamSectionMocks, ...reflectFeedMocks]), {});
      const reflectFeed = screen.getByTestId('reflect-feed');
      await waitFor(() =>
        expect(within(reflectFeed).getAllByTestId('avatar-source')[0]).toHaveAttribute(
          'srcset',
          reflectFeedProfileData.akashaProfile.avatar.default.src,
        ),
      );
      const infoBox = within(reflectFeed).getAllByTestId('info-box')[0];
      await waitFor(() =>
        expect(infoBox).toHaveTextContent(reflectFeedProfileData.akashaProfile.name),
      );
      expect(await within(reflectFeed).findByText(REFLECT_FEED.content)).toBeInTheDocument();
      expect(infoBox).toHaveTextContent(truncateDid(reflectFeedProfileData.akashaProfile.did.id));
      expect(infoBox).toHaveTextContent(formatRelativeTime(reflectionData.createdAt, 'en'));
    });

    it('should render preview of a reflection on reflect feed', async () => {
      renderWithAllProviders(baseComponent([...beamSectionMocks, ...reflectFeedMocks]), {});
      const reflectFeed = screen.getByTestId('reflect-feed');
      await waitFor(() =>
        expect(within(reflectFeed).getAllByTestId('avatar-source')[1]).toHaveAttribute(
          'srcset',
          reflectFeedProfileData.akashaProfile.avatar.default.src,
        ),
      );
      const infoBox = within(reflectFeed).getAllByTestId('info-box')[1];
      await waitFor(() =>
        expect(infoBox).toHaveTextContent(reflectFeedProfileData.akashaProfile.name),
      );
      expect(
        await within(reflectFeed).findByText(REFLECT_FEED.preview.content),
      ).toBeInTheDocument(),
        expect(infoBox).toHaveTextContent(truncateDid(reflectFeedProfileData.akashaProfile.did.id));
      expect(infoBox).toHaveTextContent(
        formatRelativeTime(previewData.akashaReflectIndex.edges[0].node.createdAt, 'en'),
      );
    });

    it('should disable reflection editor when the beam is delisted', async () => {
      renderWithAllProviders(
        baseComponent(
          [...beamSectionMocks, ...getEmptyReflectionStreamMock()],
          {
            ...beamData,
            active: false,
          },
          false,
        ),
        {},
      );
      expect(screen.queryByRole('button', { name: 'Reflect' })).not.toBeInTheDocument();
      expect(screen.queryByText(/Share your thoughts/i)).not.toBeInTheDocument();
    });
  });

  describe('should publish reflection', () => {
    const reflectEditorMocks = getReflectEditorMocks({
      reflectionId: NEW_REFLECTION_ID,
      authorProfileDID: AUTHENTICATED_DID,
      content: NEW_REFLECTION,
    });

    const {
      mocks: reflectFeedMocks,
      reflectionData: newReflectionData,
      profileData: reflectFeedProfileData,
    } = getReflectFeedMocks({
      beamId: BEAM_ID,
      reflectionId: NEW_REFLECTION_ID,
      authorProfileDID: AUTHENTICATED_DID,
      reflectionContent: NEW_REFLECTION,
    });

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

    it('should render pending reflect card', async () => {
      renderWithAllProviders(
        baseComponent([
          ...beamSectionMocks,
          ...getEmptyReflectionStreamMock(),
          ...reflectEditorMocks,
          ...getPendingReflectMock(AUTHENTICATED_DID),
        ]),
        {},
      );
      const user = userEvent.setup();
      const reflectButton = screen.getByRole('button', { name: 'Reflect' });
      user.click(reflectButton);
      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      editorActionsRef.current?.insertText(NEW_REFLECTION);
      await waitFor(() => expect(screen.getByRole('textbox')).toHaveTextContent(NEW_REFLECTION));
      user.click(screen.getByRole('button', { name: 'Reflect' }));
      expect(await screen.findByTestId('pending-reflection-card')).toBeInTheDocument();
    });

    it('should render published reflection on reflect feed', async () => {
      renderWithAllProviders(
        baseComponent([
          ...beamSectionMocks,
          ...getEmptyReflectionStreamMock(),
          ...reflectEditorMocks,
          ...reflectFeedMocks,
        ]),
        {},
      );
      const user = userEvent.setup();
      const reflectButton = screen.getByRole('button', { name: 'Reflect' });
      const reflectFeed = screen.getByTestId('reflect-feed');
      user.click(reflectButton);
      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      editorActionsRef.current?.insertText(NEW_REFLECTION);
      await waitFor(() => expect(screen.getByRole('textbox')).toHaveTextContent(NEW_REFLECTION));
      await user.click(screen.getByRole('button', { name: 'Reflect' }));
      expect(await screen.findByTestId('pending-reflection-card')).toBeInTheDocument();
      expect(await within(reflectFeed).findByTestId('reflection-card')).toBeInTheDocument();
      expect(within(reflectFeed).getByText(NEW_REFLECTION)).toBeInTheDocument();
      const infoBox = within(reflectFeed).getByTestId('info-box');
      await waitFor(() =>
        expect(infoBox).toHaveTextContent(reflectFeedProfileData.akashaProfile.name),
      );
      expect(await within(reflectFeed).findByTestId('avatar-source')).toHaveAttribute(
        'srcset',
        reflectFeedProfileData.akashaProfile.avatar.default.src,
      );
      expect(infoBox).toHaveTextContent(truncateDid(reflectFeedProfileData.akashaProfile.did.id));
      expect(infoBox).toHaveTextContent(formatRelativeTime(newReflectionData.createdAt, 'en'));
    });

    it('should show error when text exceeds block limit', async () => {
      renderWithAllProviders(
        baseComponent([
          ...beamSectionMocks,
          ...getEmptyReflectionStreamMock(),
          ...reflectEditorMocks,
          ...reflectFeedMocks,
        ]),
        {},
      );
      const user = userEvent.setup();
      const reflectButton = screen.getByRole('button', { name: 'Reflect' });
      user.click(reflectButton);
      expect(await screen.findByRole('textbox')).toBeInTheDocument();
      NEW_REFLECTION_BEYOND_TEXT_LIMIT.forEach(text => {
        editorActionsRef.current?.insertText(text);
        editorActionsRef.current?.insertBreak();
      });
      await user.click(screen.getByRole('button', { name: 'Reflect' }));
      expect(
        await screen.findByText(/text block exceeds line limit, please review!/i),
      ).toBeInTheDocument();
    });
  });
});
