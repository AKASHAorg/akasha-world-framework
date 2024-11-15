import React from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ProfileAvatarButton from '@akashaorg/design-system-core/lib/components/ProfileAvatarButton';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import ExtensionSubRouteHeader from '../../InfoSubroutePageHeader';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { transformSource, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import {
  AkashaAppApplicationType,
  AppImageSource,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { selectExtensionCollaborators } from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-query';
import { useContributors } from './use-contributors';
import { ChevronRightIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';

type ContributorsPageProps = {
  appId: string;
  extensionLogo?: AppImageSource;
  extensionName?: string;
  extensionDisplayName?: string;
  contributors?: ReturnType<typeof selectExtensionCollaborators>;
  extensionType?: AkashaAppApplicationType;
};

export const ContributorsPage = (props: ContributorsPageProps) => {
  const { appId, extensionLogo, extensionName, extensionDisplayName, extensionType, contributors } =
    props;
  const { t } = useTranslation('app-extensions');
  const { decodeAppName } = useRootComponentProps();
  const { localExtensionData, contributorsProfile, loading, error } = useContributors({
    appName: decodeAppName(appId),
    publishedAppContributorsProfile: contributors?.map(contributor => contributor.akashaProfile),
  });
  const navigate = useNavigate();

  return (
    <>
      <Card padding="p-4">
        <Stack spacing="gap-y-4">
          <ExtensionSubRouteHeader
            pageTitle={t('Contributors')}
            appName={extensionDisplayName ?? localExtensionData?.displayName}
            packageName={extensionName ?? localExtensionData?.name}
            appType={extensionType ?? localExtensionData?.applicationType}
            appLogo={extensionLogo ?? localExtensionData?.logoImage}
          />
          <Divider />
          <Stack direction="column" spacing="gap-y-4">
            {loading && (
              <Stack align="center" justify="center">
                <Spinner />
              </Stack>
            )}
            {error && (
              <Stack>
                <ErrorLoader
                  type="script-error"
                  title={t('There was an error loading the contributors')}
                  details={error.message}
                />
              </Stack>
            )}
            {contributorsProfile?.map((contributor, index) => (
              <Stack key={contributor.id} direction="column" spacing="gap-y-4">
                <Card
                  onClick={() => {
                    navigate({
                      to: '/info/$appId/developer/$devDid',
                      params: {
                        appId,
                        devDid: contributor?.did.id,
                      },
                    });
                  }}
                  type="plain"
                >
                  <Stack direction="row" align="center">
                    <ProfileAvatarButton
                      profileId={contributor?.did.id}
                      label={contributor?.name}
                      avatar={transformSource(contributor?.avatar?.default)}
                      alternativeAvatars={contributor?.avatar?.alternatives?.map(alternative =>
                        transformSource(alternative),
                      )}
                    />
                    <Icon
                      icon={<ChevronRightIcon />}
                      size="sm"
                      color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                      customStyle="ml-auto"
                    />
                  </Stack>
                </Card>
                {index < contributorsProfile.length - 1 && <Divider />}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Card>
    </>
  );
};
