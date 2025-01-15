import React, { useCallback } from 'react';
import EditorPlaceholder from '@akashaorg/design-system-components/lib/components/EditorPlaceholder';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ScrollTopWrapper from '@akashaorg/design-system-core/lib/components/ScrollTopWrapper';
import ScrollTopButton from '@akashaorg/design-system-core/lib/components/ScrollTopButton';
import WorldVersionInfoCard from '@akashaorg/design-system-components/lib/components/WorldVersionInfoCard';
import BeamFeed from '@akashaorg/ui-lib-feed/lib/components/beam-feed';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import {
  useAnalytics,
  useRootComponentProps,
  transformSource,
  useAkashaStore,
  hasOwn,
  useNsfwToggling,
  useDismissedCard,
} from '@akashaorg/ui-core-hooks';
import { Helmet, helmetData } from '@akashaorg/design-system-core/lib/utils';
import { IModalNavigationOptions } from '@akashaorg/typings/lib/ui';
import { BeamContentResolver, getNsfwFiltersForBeamFeed } from '@akashaorg/ui-lib-feed';
import { useInstalledAndDefaultApps } from '../../../utils/use-installed-and-default-apps';

const GlobalAntennaPage: React.FC<unknown> = () => {
  const {
    data: { authenticatedProfile, authenticatedDID },
  } = useAkashaStore();
  const { navigateToModal, worldConfig } = useRootComponentProps();
  const { t } = useTranslation('app-antenna');
  const [analyticsActions] = useAnalytics();
  const _navigateToModal = React.useRef(navigateToModal);
  const navigate = useNavigate();
  const { showNsfw } = useNsfwToggling();
  const [dismissed, dismissCard] = useDismissedCard(
    '@akashaorg/ui-widget-layout_version-info-card',
  );

  const installedAndDefaultApps = useInstalledAndDefaultApps();

  const showLoginModal = React.useCallback(
    (redirectTo?: { modal: IModalNavigationOptions }, message?: string) => {
      _navigateToModal.current?.({
        name: 'login',
        redirectTo,
        message,
      });
    },
    [],
  );

  const handleEditorPlaceholderClick = useCallback(() => {
    if (!authenticatedDID) {
      showLoginModal();
      return;
    }
    navigate({ to: '/editor' });
  }, [authenticatedDID, navigate, showLoginModal]);

  return (
    <Stack fullWidth={true}>
      <Helmet helmetData={helmetData}>
        <title>{worldConfig.title}</title>
      </Helmet>
      <Stack spacing="gap-y-4">
        {!dismissed && (
          <WorldVersionInfoCard
            titleLabel={t('Attention: Testing Environment')}
            description={t(
              'Things might be a bit unstable, and all data may be lost during updates.',
            )}
            onDismissCard={dismissCard}
          />
        )}
        <EditorPlaceholder
          profileId={authenticatedDID}
          avatar={authenticatedProfile?.avatar}
          actionLabel={t(`Start Beaming`)}
          placeholderLabel={t(`From Your Mind to the World 🧠 🌏 ✨`)}
          onClick={handleEditorPlaceholderClick}
          transformSource={transformSource}
        />
        <BeamFeed
          dataTestId="beam-feed"
          scrollRestorationStorageKey="akasha-global-antenna"
          estimatedHeight={150}
          itemSpacing={16}
          scrollOptions={{ overScan: 5 }}
          scrollTopIndicator={(listRect, onScrollToTop) => (
            <ScrollTopWrapper placement={listRect.left}>
              <ScrollTopButton hide={false} onClick={onScrollToTop} />
            </ScrollTopWrapper>
          )}
          filters={{
            and: [
              { where: { active: { equalTo: true } } },
              {
                or: [
                  ...getNsfwFiltersForBeamFeed({
                    showNsfw: showNsfw,
                    isLoggedIn: !!authenticatedDID,
                  }),
                ],
              },
            ],
          }}
          trackEvent={analyticsActions.trackEvent}
          renderItem={itemData => {
            if (!hasOwn(itemData, 'content')) {
              /**
               * Set the showNSFWCard prop to false
               * so as to prevent NSFW beams from being displayed
               * in the antenna feed when NSFW setting is off
               */
              return (
                <BeamContentResolver
                  beamId={itemData.beamID}
                  showNSFWCard={false}
                  preventNavigation={
                    !installedAndDefaultApps?.find(app => app.id === itemData.appID)
                  }
                />
              );
            }
          }}
        />
      </Stack>
    </Stack>
  );
};

export default GlobalAntennaPage;
