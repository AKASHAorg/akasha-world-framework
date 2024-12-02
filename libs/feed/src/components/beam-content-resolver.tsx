import React, { useState } from 'react';
import BeamCard from './cards/beam-card';
import EntryCardLoading from '@akashaorg/design-system-components/lib/components/Entry/EntryCardLoading';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useGetBeamByIdQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { IModalNavigationOptions } from '@akashaorg/typings/lib/ui';
import {
  selectBeamId,
  selectNsfw,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-beam-by-id-query';
import { isNodeWithId } from '@akashaorg/ui-awf-hooks/lib/selectors/selector-utils';
import { NetworkErrorCard } from './cards/network-error-card';
import { useTranslation } from 'react-i18next';

export type BeamContentResolverProps = {
  beamId: string;
  showNSFWCard?: boolean;
  customStyle?: string;
};

const BeamContentResolver: React.FC<BeamContentResolverProps> = ({
  beamId,
  showNSFWCard = false,
  customStyle = '',
}) => {
  const { t } = useTranslation('ui-lib-feed');
  const { getCorePlugins, navigateToModal } = useRootComponentProps();
  const _navigateToModal = React.useRef(navigateToModal);

  const [reloadCount, setReloadCount] = useState(0);

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
  const beamReq = useGetBeamByIdQuery({
    variables: {
      id: beamId,
    },
    fetchPolicy: 'cache-first',
    skip: !beamId,
  });

  if (beamReq.loading) return <EntryCardLoading />;

  if (beamReq.error)
    return (
      <Card padding="p-0">
        <NetworkErrorCard
          title={t('Beam can’t be loaded')}
          message={t('Unable to load beam content. Click “Reload” to reload the beam.')}
          reloadCount={reloadCount}
          onReload={async () => {
            setReloadCount(reloadCount + 1);
            await beamReq.refetch();
          }}
        />
      </Card>
    );

  return (
    isNodeWithId(beamReq.data) && (
      <BeamCard
        beamData={beamReq.data}
        contentClickable={true}
        /* Display the overlay according to the passed prop showNSFWCard
         * or the nsfw property of the beam object just fetched through the
         * useIndividualBeam hook (see BeamFeed).
         * */
        showNSFWCard={showNSFWCard ?? selectNsfw(beamReq.data)}
        showLoginModal={showLoginModal}
        onContentClick={function () {
          getCorePlugins().routing.navigateTo({
            appName: '@akashaorg/app-antenna',
            getNavigationUrl: navRoutes => `${navRoutes.Beam}/${selectBeamId(beamReq.data)}`,
          });
        }}
        onReflect={function () {
          getCorePlugins().routing.navigateTo({
            appName: '@akashaorg/app-antenna',
            getNavigationUrl: navRoutes =>
              `${navRoutes.Beam}/${selectBeamId(beamReq.data)}${navRoutes.Reflect}`,
          });
        }}
        customStyle={customStyle}
      />
    )
  );
};

export default BeamContentResolver;
