import React from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ScrollTopWrapper from '@akashaorg/design-system-core/lib/components/ScrollTopWrapper';
import ScrollTopButton from '@akashaorg/design-system-core/lib/components/ScrollTopButton';
import { useAnalytics, useRootComponentProps } from '@akashaorg/ui-core-hooks';
import { BeamCard, BeamFeedByAuthor } from '@akashaorg/ui-lib-feed';
import {
  selectBeamContent,
  selectBeamId,
  selectNsfw,
} from '@akashaorg/ui-core-hooks/lib/selectors/get-beam-by-id-query';

type ProfileBeamsPageProps = {
  profileDID: string;
};

const ProfileBeamsPage: React.FC<ProfileBeamsPageProps> = props => {
  const { profileDID } = props;
  const [analyticsActions] = useAnalytics();
  const { getCorePlugins } = useRootComponentProps();
  const navigateTo = React.useRef(getCorePlugins().routing.navigateTo);

  return (
    <Stack direction="column" spacing="gap-y-4" fullWidth>
      <BeamFeedByAuthor
        did={profileDID}
        scrollRestorationStorageKey={`app-profile_${profileDID}_beams`}
        estimatedHeight={150}
        itemSpacing={8}
        scrollOptions={{ overScan: 10 }}
        scrollTopIndicator={(listRect, onScrollToTop) => (
          <ScrollTopWrapper placement={listRect.left}>
            <ScrollTopButton hide={false} onClick={onScrollToTop} />
          </ScrollTopWrapper>
        )}
        renderItem={itemData => {
          const nsfw = selectNsfw(itemData);
          const beamId = selectBeamId(itemData);
          const beamContent = selectBeamContent(itemData);
          if (beamContent) {
            return (
              <BeamCard
                beamData={itemData}
                contentClickable={true}
                showNSFWCard={nsfw}
                showHiddenContent={false}
                onContentClick={() =>
                  navigateTo.current({
                    appName: '@akashaorg/app-antenna',
                    getNavigationUrl: navRoutes => `${navRoutes.Beam}/${beamId}`,
                  })
                }
                onReflect={() =>
                  navigateTo.current({
                    appName: '@akashaorg/app-antenna',
                    getNavigationUrl: navRoutes =>
                      `${navRoutes.Beam}/${beamId}${navRoutes.Reflect}`,
                  })
                }
              />
            );
          }
        }}
        trackEvent={analyticsActions.trackEvent}
      />
    </Stack>
  );
};

export default ProfileBeamsPage;
