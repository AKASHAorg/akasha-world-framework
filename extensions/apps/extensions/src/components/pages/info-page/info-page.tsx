import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import {
  ChevronRightIcon,
  FlagIcon,
  ShareIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { useTranslation } from 'react-i18next';
import { transformSource, useAkashaStore, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import {
  formatDate,
  formatRelativeTime,
  truncateDid,
} from '@akashaorg/design-system-core/lib/utils';
import { useGetAppsQuery } from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import {
  selectAkashaApp,
  selectLatestRelease,
} from '@akashaorg/ui-awf-hooks/lib/selectors/get-apps-query';
import { NetworkStatus } from '@apollo/client';
import { AppInfoHeader } from '@akashaorg/design-system-components/lib/components/AppInfo/header';
import Section, { DividerPosition } from '@akashaorg/design-system-core/lib/components/Section';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ExtensionImageGallery from '@akashaorg/design-system-components/lib/components/ExtensionImageGallery';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import CopyToClipboard from '@akashaorg/design-system-core/lib/components/CopyToClipboard';
import ProfileAvatarButton from '@akashaorg/design-system-core/lib/components/ProfileAvatarButton';
import Pill from '@akashaorg/design-system-core/lib/components/Pill';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { useInstalledExtensions } from '@akashaorg/ui-awf-hooks/lib/use-installed-extensions';
import { UninstallModal } from './uninstall-modal';
import AppCoverImage from './AppCoverImage';
import StackedAvatar from '@akashaorg/design-system-core/lib/components/StackedAvatar';
import { AppInfoNotificationCards } from '@akashaorg/design-system-components/lib/components/AppInfo/notification-cards';

type InfoPageProps = {
  appId: string;
};

export const InfoPage: React.FC<InfoPageProps> = ({ appId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('app-extensions');
  const { navigateToModal, decodeAppName, getDefaultExtensionNames, getCorePlugins, logger } =
    useRootComponentProps();
  const [showUninstallModal, setShowUninstallModal] = useState(false);

  const [showImageGalleryOverlay, setShowImageGalleryOverlay] = useState(false);
  const {
    data: { authenticatedDID },
  } = useAkashaStore();

  const navigateTo = useRef(getCorePlugins().routing.navigateTo);

  const appReq = useGetAppsQuery({
    variables: {
      first: 1,
      filters: { where: { name: { equalTo: decodeAppName(appId) } } },
    },
  });

  const installedExtensionsReq = useInstalledExtensions();
  const isInstalled = useMemo(() => {
    if (installedExtensionsReq.data) {
      return installedExtensionsReq.data.some(ext => ext.name === decodeAppName(appId));
    }
  }, [appId, decodeAppName, installedExtensionsReq.data]);

  const handleInstallClick = () => {
    if (!authenticatedDID) {
      return navigateToModal({
        name: 'login',
        redirectTo: location.pathname,
      });
    }

    navigate({
      to: '/install/$appId',
      params: {
        appId,
      },
    }).catch(err => logger.error('cannot navigate to /install/$appId : %o', err));
  };

  const handleUninstallClick = () => {
    setShowUninstallModal(true);
  };

  const handleOpenClick = () => {
    navigateTo.current({
      appName: decodeAppName(appId),
      getNavigationUrl: () => '/',
    });
  };

  const handleExtensionReportClick = () => {
    navigateTo.current({
      appName: '@akashaorg/app-vibes',
      getNavigationUrl: () => `/report/extension/${appData.id}`,
    });
  };

  const handleReleasesClick = () => {
    navigate({
      to: '/info/$appId/versions',
      params: {
        appId,
      },
    }).catch(err => logger.error('cannot navigate to /info/$appId/versions : %o', err));
  };

  const handleDeveloperClick = () => {
    navigate({
      to: '/info/$appId/developer/$devDid',
      params: {
        appId,
        devDid: appData.author.id,
      },
    }).catch(err => logger.error('cannot navigate to /info/$appId/developer/$devDid : %o', err));
  };

  const handleCollaboratorsClick = () => {
    navigate({
      to: '/info/$appId/collaborators',
      params: {
        appId,
      },
    }).catch(err => logger.error('cannot navigate to /info/$appId/collaborators : %o', err));
  };

  const handleLatestUpdateClick = () => {
    navigate({
      to: '/info/$appId/audit-log',
      params: {
        appId,
      },
    }).catch(err => logger.error('cannot navigate to /info/$appId/audit-log : %o', err));
  };

  const handleLicenseClick = () => {
    navigate({
      to: '/info/$appId/license',
      params: {
        appId,
      },
    }).catch(err => logger.error('cannot navigate to /info/$appId/license : %o', err));
  };

  const handleDescriptionClick = () => {
    navigate({
      to: '/info/$appId/description',
      params: {
        appId,
      },
    }).catch(err => logger.error('cannot navigate to /info/$appId/license : %o', err));
  };

  const appData = selectAkashaApp(appReq.data);
  const latestRelease = useMemo(() => selectLatestRelease(appReq.data), [appReq.data]);

  const extensionTypeLabel = useMemo(() => {
    if (!appData?.applicationType) {
      return '';
    }
    switch (appData.applicationType) {
      case AkashaAppApplicationType.App:
        return t('App');
      case AkashaAppApplicationType.Plugin:
        return t('Plugin');
      case AkashaAppApplicationType.Widget:
        return t('Widget');
      default:
        return t('Other');
    }
  }, [appData?.applicationType, t]);

  const coverImageSrc = useMemo(() => {
    if (appData?.coverImage?.src) {
      return transformSource(appData.coverImage)?.src;
    }
    return null;
  }, [appData]);

  const isDefaultWorldExtension = useMemo(() => {
    if (!appId) {
      return false;
    }

    return getDefaultExtensionNames().includes(decodeAppName(appId));
  }, [appId, decodeAppName, getDefaultExtensionNames]);

  const contributorAvatars = useMemo(() => {
    if (appData?.contributors?.length) {
      return appData.contributors
        .filter(contrib => !!contrib?.akashaProfile)
        .map(contrib => {
          return {
            ...contrib.akashaProfile,
            avatar: transformSource(contrib.akashaProfile.avatar?.default),
          };
        });
    }
  }, [appData?.contributors]);

  return (
    <>
      {appReq.error && (
        <Stack>
          <ErrorLoader
            type="script-error"
            title={t('There was an error loading the app info')}
            details={t('We cannot show this app right now')}
          />
        </Stack>
      )}
      {!appReq.error && appReq.networkStatus === NetworkStatus.ready && !appData && (
        <ErrorLoader
          type="no-apps"
          title={t('Extension not found!')}
          details={t('The extension you are trying to view cannot be found.')}
        />
      )}
      {!appReq.error && appReq.networkStatus === NetworkStatus.ready && !!appData && (
        <>
          <AppCoverImage src={coverImageSrc} appType={appData.applicationType} />
          <Stack>
            <Stack spacing="gap-y-6">
              <Card padding="p-4" margin="mb-2" radius={{ bottom: 20 }}>
                <AppInfoHeader
                  displayName={appData.displayName}
                  extensionType={appData.applicationType}
                  extensionAvatar={{
                    width: appData.logoImage?.width,
                    height: appData.logoImage?.height,
                    src: transformSource(appData.logoImage)?.src,
                  }}
                  nsfw={appData.nsfw}
                  nsfwLabel={'NSFW'}
                  extensionTypeLabel={extensionTypeLabel}
                  share={{ label: t('Share'), icon: <ShareIcon /> }}
                  report={{
                    label: t('Flag'),
                    icon: <FlagIcon />,
                    onClick: handleExtensionReportClick,
                    color: { light: 'errorLight', dark: 'errorDark' },
                  }}
                  onInstallClick={handleInstallClick}
                  onUninstallClick={handleUninstallClick}
                  onOpenClick={handleOpenClick}
                  isDefaultWorldExtension={isDefaultWorldExtension}
                  isInstalled={isInstalled}
                  isInstallable={!!latestRelease}
                  defaultAppPillLabel={t('Default')}
                />

                {!latestRelease && (
                  <AppInfoNotificationCards
                    notification={{
                      message: t('This extension has no releases yet, so it cannot be installed.'),
                      title: t('No releases found'),
                    }}
                  />
                )}

                {appData.description && (
                  <Section
                    dividerPosition={DividerPosition.Top}
                    title={t('Description')}
                    viewMoreLabel={t('Read More')}
                    onClickviewMoreLabel={handleDescriptionClick}
                  >
                    <Text lineClamp={2} variant="body1">
                      {appData.description}
                    </Text>
                  </Section>
                )}
                <Section title={t('Developer')} dividerPosition={DividerPosition.Top}>
                  {appData.author?.akashaProfile && (
                    <Card onClick={handleDeveloperClick} type="plain">
                      <Stack direction="row" align="center">
                        <ProfileAvatarButton
                          profileId={appData.author?.akashaProfile?.did?.id}
                          label={appData.author?.akashaProfile?.name}
                          avatar={transformSource(appData.author?.akashaProfile?.avatar?.default)}
                          alternativeAvatars={appData.author?.akashaProfile?.avatar?.alternatives?.map(
                            alternative => transformSource(alternative),
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
                  )}
                </Section>
                {appData.gallery?.length && (
                  <Section
                    dividerPosition={DividerPosition.Top}
                    title={t('Gallery')}
                    viewMoreLabel={t('View All')}
                    onClickviewMoreLabel={() => {
                      setShowImageGalleryOverlay(!showImageGalleryOverlay);
                    }}
                  >
                    <ExtensionImageGallery
                      images={appData.gallery?.map(gImage => ({
                        ...gImage,
                        src: transformSource(gImage)?.src,
                      }))}
                      showOverlay={showImageGalleryOverlay}
                      toggleOverlay={() => setShowImageGalleryOverlay(!showImageGalleryOverlay)}
                    />
                  </Section>
                )}

                <Section title={t('General Information')} dividerPosition={DividerPosition.Top}>
                  <Stack spacing="gap-y-2">
                    <Stack direction="row" justify="between">
                      <Text variant="body2" color={{ light: 'grey4', dark: 'grey7' }}>
                        {t('Package name')}
                      </Text>
                      <Button variant="text" size="md" label={appData.name} />
                    </Stack>
                    <Divider />
                    <Stack direction="row" justify="between">
                      <Text variant="body2" color={{ light: 'grey4', dark: 'grey7' }}>
                        {t('Extension ID')}
                      </Text>
                      <Button variant="text" size="md" label={truncateDid(appData.id)} />
                    </Stack>
                    <Divider />
                    <Stack direction="row" justify="between">
                      <Text variant="body2" color={{ light: 'grey4', dark: 'grey7' }}>
                        {t('Latest update')}
                      </Text>
                      <Button
                        variant="text"
                        size="md"
                        label={formatRelativeTime(latestRelease?.node?.createdAt)}
                        onClick={handleLatestUpdateClick}
                      />
                    </Stack>
                    <Divider />
                    <Stack direction="row" justify="between">
                      <Text variant="body2" color={{ light: 'grey4', dark: 'grey7' }}>
                        {t('License')}
                      </Text>
                      <Button
                        variant="text"
                        size="md"
                        label={appData.license}
                        onClick={handleLicenseClick}
                      />
                    </Stack>
                    <Divider />
                    <Stack direction="row" justify="between">
                      <Text variant="body2" color={{ light: 'grey4', dark: 'grey7' }}>
                        {t('Created on')}
                      </Text>
                      <Text variant="body2">{formatDate(appData.createdAt, 'DD MMM YYYY')}</Text>
                    </Stack>
                  </Stack>
                </Section>
                {appData.links?.length > 0 && (
                  <Section title={t('Useful Links')} dividerPosition={DividerPosition.Top}>
                    <Stack customStyle="flex-wrap">
                      {appData.links?.map((link, idx) => (
                        <CopyToClipboard key={`${link.href}_${idx}`} stringToBeCopied={link.href}>
                          <Button variant="text" size="md" label={link.label} />
                        </CopyToClipboard>
                      ))}
                    </Stack>
                  </Section>
                )}
                {contributorAvatars?.length > 0 && (
                  <Section title={t('Collaborators')} dividerPosition={DividerPosition.Top}>
                    <Card type="plain" onClick={handleCollaboratorsClick}>
                      <Stack direction="row" align="center">
                        <StackedAvatar userData={contributorAvatars} maxAvatars={4} size="xs" />
                        <Icon
                          icon={<ChevronRightIcon />}
                          size="sm"
                          color={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                          customStyle="ml-auto"
                        />
                      </Stack>
                    </Card>
                  </Section>
                )}
                <Section
                  title={t('Latest Release')}
                  dividerPosition={DividerPosition.Top}
                  viewMoreLabel={latestRelease ? t('View Info') : undefined}
                  onClickviewMoreLabel={handleReleasesClick}
                >
                  {!!latestRelease && (
                    <Stack spacing="gap-y-4">
                      <Stack>
                        <Text variant="body1" color={{ light: 'grey4', dark: 'grey7' }}>
                          {t('Version')} {latestRelease?.node?.version}
                        </Text>
                        <Text variant="footnotes2">
                          {formatDate(latestRelease?.node?.createdAt, 'MMM YYYY')}
                        </Text>
                      </Stack>
                      <Text lineClamp={2} variant="body1">
                        {latestRelease?.node?.meta?.find(meta => meta.property === 'description')
                          ?.value || t('This release has no description added.')}
                      </Text>
                    </Stack>
                  )}
                  {!latestRelease && (
                    <Text variant="body1">{t('This extension does not have a release yet.')}</Text>
                  )}
                </Section>

                {appData.keywords?.length > 0 && (
                  <Section title={''} dividerPosition={DividerPosition.Top}>
                    <Stack direction="row" spacing="gap-x-2">
                      {appData.keywords?.map((keyword, idx) => (
                        <Pill
                          borderColor={{ light: 'secondaryLight', dark: 'secondaryDark' }}
                          type="info"
                          key={`${keyword}_${idx}`}
                          label={keyword}
                        />
                      ))}
                    </Stack>
                  </Section>
                )}
              </Card>
            </Stack>
          </Stack>
          <UninstallModal
            appName={appData.name}
            appDisplayName={appData.displayName}
            show={showUninstallModal}
            onModalClose={() => {
              setShowUninstallModal(false);
            }}
          />
        </>
      )}
    </>
  );
};
