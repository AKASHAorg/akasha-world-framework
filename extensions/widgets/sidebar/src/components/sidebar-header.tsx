import React, { Suspense, useMemo, useState } from 'react';
import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import DidField from '@akashaorg/design-system-core/lib/components/DidField';
import ProfileNameField from '@akashaorg/design-system-core/lib/components/ProfileNameField';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { transformSource, hasOwn } from '@akashaorg/ui-core-hooks';
import { useTranslation } from 'react-i18next';
import { useGetProfileByDidSuspenseQuery } from '@akashaorg/ui-core-hooks/lib/generated/apollo';
import {
  PowerIcon,
  XMarkIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';

export type SidebarHeaderProps = {
  authenticatedDID: string;
  connectLabel: string;
  cancelLabel: string;
  isLoggedIn: boolean;
  isAuthenticating: boolean;
  logoutClickHandler: () => void;
  loginClickHandler: () => void;
  handleProfileAvatarClick: (authenticatedDID: string) => void;
};

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  authenticatedDID,
  connectLabel,
  cancelLabel,
  isLoggedIn,
  isAuthenticating,
  loginClickHandler,
  logoutClickHandler,
  handleProfileAvatarClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const { t } = useTranslation('ui-widget-sidebar');

  const { data, error } = useGetProfileByDidSuspenseQuery({
    variables: {
      id: authenticatedDID,
    },
    skip: !authenticatedDID,
  });

  const profileName = useMemo(() => {
    if (data) {
      return hasOwn(data?.node, 'akashaProfile') ? data?.node?.akashaProfile?.name : '';
    }
  }, [data]);

  const avatar = useMemo(() => {
    if (data) {
      return hasOwn(data?.node, 'akashaProfile') ? data?.node?.akashaProfile?.avatar : null;
    }
  }, [data]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // this padding style will adjust the header's vertical space to maintain the same height through different states
  const headerPadding = profileName && isLoggedIn && !isAuthenticating ? 'pb-[2.125rem]' : '';

  if (error) return null;

  return (
    <Stack
      direction="row"
      padding="p-4"
      background={isAuthenticating ? { light: 'secondaryLight/30', dark: 'grey5' } : null}
      customStyle={`border(b-1 grey9 dark:grey3) rounded-t-2xl ${headerPadding}`}
    >
      <Stack direction="row" customStyle="grow group">
        <Stack customStyle="w-fit h-fit mr-2">
          <Avatar
            profileId={authenticatedDID}
            avatar={transformSource(avatar?.default)}
            alternativeAvatars={avatar?.alternatives?.map(alternative =>
              transformSource(alternative),
            )}
            isClickable={isLoggedIn}
            onClick={() => handleProfileAvatarClick(authenticatedDID)}
          />
        </Stack>
        <Stack justify="center" customStyle={'w-fit flex-grow'}>
          {!isLoggedIn && <Text variant="button-md"> {t('Guest')}</Text>}
          {isLoggedIn && (
            <Suspense fallback={<Text variant="button-md">{t('Fetching your info...')}</Text>}>
              <Button onClick={() => handleProfileAvatarClick(authenticatedDID)} plain>
                <ProfileNameField
                  did={authenticatedDID}
                  profileName={profileName}
                  size="md"
                  truncateText
                  showMissingNameWarning
                  missingNameWarningLabel={t(
                    'Your profile is unfollowable due to the lack of basic information, like your name.',
                  )}
                  hover={true}
                />
              </Button>
            </Suspense>
          )}
          {isLoggedIn && (
            <DidField
              did={authenticatedDID}
              textColor="grey7"
              copyLabel={t('Copy to clipboard')}
              copiedLabel={t('Copied')}
            />
          )}
          {!isLoggedIn && (
            <Text
              variant="footnotes2"
              color="grey7"
              customStyle="whitespace-normal"
              truncate
              breakWord
            >
              {t('Connect to see')}
              <br />
              {t('member only features.')}
            </Text>
          )}
        </Stack>
      </Stack>
      <Stack customStyle="w-fit h-fit self-start">
        {isAuthenticating && (
          <Button
            variant="primary"
            size="sm"
            onClick={logoutClickHandler}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...(!isHovered && { loading: true })}
            {...(isHovered && { label: cancelLabel, iconDirection: 'right', icon: <XMarkIcon /> })}
          />
        )}
        {!isAuthenticating && (
          <>
            {isLoggedIn && (
              <Button icon={<PowerIcon />} size="sm" iconOnly={true} onClick={logoutClickHandler} />
            )}
            {!isLoggedIn && (
              <Button
                size="sm"
                variant="primary"
                label={connectLabel}
                onClick={loginClickHandler}
              />
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default SidebarHeader;
