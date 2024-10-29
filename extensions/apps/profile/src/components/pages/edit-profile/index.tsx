import React, { useState } from 'react';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import EditProfile from '@akashaorg/design-system-components/lib/components/EditProfile';
import getSDK from '@akashaorg/core-sdk';
import { useTranslation } from 'react-i18next';
import {
  useCreateProfileMutation,
  useGetProfileByDidSuspenseQuery,
  useUpdateProfileMutation,
} from '@akashaorg/ui-awf-hooks/lib/generated/apollo';
import { transformSource, useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import { useSaveImage } from './use-save-image';
import { PartialAkashaProfileInput } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  NotificationEvents,
  NotificationTypes,
  PublishProfileData,
} from '@akashaorg/typings/lib/ui';
import { getAvatarImage, getCoverImage } from './get-profile-images';
import { selectProfileData } from '@akashaorg/ui-awf-hooks/lib/selectors/get-profile-by-did-query';

type EditProfilePageProps = {
  profileDID: string;
};

const EditProfilePage: React.FC<EditProfilePageProps> = props => {
  const { profileDID } = props;
  const { t } = useTranslation('app-profile');
  const { getCorePlugins, logger, uiEvents } = useRootComponentProps();
  const { newAvatarImage, newCoverImage, saveImage, loading: isSavingImage } = useSaveImage();
  const [showNsfwModal, setShowNsfwModal] = useState(false);
  const [nsfwFormValues, setNsfwFormValues] = useState<PublishProfileData>();
  const navigateTo = getCorePlugins().routing.navigateTo;
  const { data, error } = useGetProfileByDidSuspenseQuery({
    variables: { id: profileDID },
  });

  const profileData = selectProfileData(data);
  const background = profileData?.background;
  const avatar = profileData?.avatar;
  const sdk = getSDK();

  const onSuccess = () => {
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Success,
        title: t('Profile updated successfully.'),
      },
    });
    navigateToProfileInfoPage();
  };

  const onError = () => {
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title: t('Profile update unsuccessful. Please try again.'),
      },
    });
    navigateToProfileInfoPage();
  };

  const onSaveImageError = () => {
    uiEvents.next({
      event: NotificationEvents.ShowNotification,
      data: {
        type: NotificationTypes.Error,
        title: t("The image wasn't uploaded correctly. Please try again!"),
      },
    });
  };

  const [createProfileMutation, { loading: createProfileProcessing }] = useCreateProfileMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
    onCompleted: () => {
      onSuccess();
    },
    onError: error => {
      onError();
      logger.error(`error in creating a profile: ${JSON.stringify(error)}`);
    },
  });
  const [updateProfileMutation, { loading: updateProfileProcessing }] = useUpdateProfileMutation({
    context: { source: sdk.services.gql.contextSources.composeDB },
    onCompleted: onSuccess,
    onError: error => {
      onError();
      logger.error(`error in updating a profile: ${JSON.stringify(error)}`);
    },
  });
  const isProcessing = createProfileProcessing || updateProfileProcessing;

  if (error)
    return (
      <ErrorLoader
        type="script-error"
        title={t('There was an error loading this profile')}
        details={t('We cannot show this profile right now')}
      />
    );

  const navigateToProfileInfoPage = () => {
    navigateTo({
      appName: '@akashaorg/app-profile',
      getNavigationUrl: () => `/${profileDID}`,
    });
  };

  const createProfile = async (
    publishProfileData: PublishProfileData,
    profileImages: Pick<PartialAkashaProfileInput, 'avatar' | 'background'>,
  ) => {
    const info = await sdk.services.gql.getAPI().GetAppsByPublisherDID({
      id: sdk.services.gql.indexingDID,
      filters: { where: { name: { equalTo: '@akashaorg/app-profile' } } },
      last: 1,
    });
    if (!info.node || !('akashaAppList' in info.node)) {
      throw new Error('@akashaorg/app-profile not found');
    }
    return createProfileMutation({
      variables: {
        i: {
          content: {
            name: publishProfileData.name,
            description: publishProfileData.bio,
            links: publishProfileData.links.map(link => ({ href: link })),
            nsfw: publishProfileData.nsfw,
            appID: info.node.akashaAppList.edges[0].node.id,
            appVersionID: info.node.akashaAppList.edges[0].node.releases.edges[0].node.id,
            createdAt: new Date().toISOString(),
            ...profileImages,
          },
        },
      },
    });
  };

  const updateProfile = async (
    publishProfileData: PublishProfileData,
    profileImages: Pick<PartialAkashaProfileInput, 'avatar' | 'background'>,
  ) => {
    updateProfileMutation({
      variables: {
        i: {
          id: profileData?.id,
          content: {
            name: publishProfileData.name,
            description: publishProfileData.bio,
            links: publishProfileData.links.map(link => ({ href: link })),
            // composedDB strips immutable fields on update
            // nsfw: publishProfileData.nsfw,
            ...profileImages,
          },
        },
      },
    });
  };

  const onProfileSave = async (publishProfileData: PublishProfileData) => {
    const isNewProfile = !profileData?.id;
    const profileImages = {
      ...getAvatarImage(newAvatarImage, isNewProfile ? false : !publishProfileData.avatar),
      ...getCoverImage(newCoverImage, isNewProfile ? false : !publishProfileData.coverImage),
    };
    if (isNewProfile) {
      await createProfile(publishProfileData, profileImages);
      return;
    }
    updateProfile(publishProfileData, profileImages);
  };

  return (
    <Stack direction="column" spacing="gap-y-4" customStyle="h-full">
      <Card radius={20} customStyle="py-4 h-full">
        <EditProfile
          defaultValues={{
            avatar: profileData?.avatar ? transformSource(profileData.avatar?.default) : null,
            coverImage: profileData?.background
              ? transformSource(profileData.background?.default)
              : null,
            name: profileData?.name ?? '',
            bio: profileData?.description ?? '',
            nsfw: profileData?.nsfw ?? false,
            links: profileData?.links?.map(link => link.href) ?? [],
          }}
          header={{
            title: t('Avatar & Cover Image'),
            coverImage: background,
            avatar: avatar,
            dragToRepositionLabel: t('Drag the image to reposition'),
            cropErrorLabel: t('Unable to crop the image. Please try again!'),
            profileId: profileDID,
            cancelLabel: t('Cancel'),
            deleteLabel: t('Delete'),
            saveLabel: t('Save'),
            imageTitle: {
              avatar: { label: t('Edit Avatar') },
              coverImage: { label: t('Edit Cover') },
            },
            deleteTitle: {
              avatar: { label: t('Delete Avatar') },
              coverImage: { label: t('Delete Cover') },
            },
            confirmationLabel: {
              avatar: t('Are you sure you want to delete your avatar?'),
              coverImage: t('Are you sure you want to delete your cover?'),
            },
            isSavingImage,
            publicImagePath: '/images',
            onImageSave: (type, image) => saveImage({ type, image, onError: onSaveImageError }),
            transformSource,
          }}
          name={{ label: t('Name'), initialValue: profileData?.name }}
          bio={{ label: t('Bio'), initialValue: profileData?.description }}
          nsfw={{
            label: t('Select NSFW if your profile contains mature or explicit content.'),
            description: t('Note: this is an irreversible action.'),
            initialValue: profileData?.nsfw,
          }}
          nsfwFieldLabel={t('NSFW Profile')}
          linkLabel={t('External URLs')}
          addNewLinkButtonLabel={t('Add new')}
          description={t(
            'You can add your personal websites or social links to be shared on your profile',
          )}
          cancelButton={{
            label: t('Cancel'),
            disabled: isProcessing,
            handleClick: () => {
              navigateToProfileInfoPage();
            },
          }}
          saveButton={{
            label: t('Save'),
            loading: isProcessing,
            handleClick: async publishProfileData => {
              if (publishProfileData?.nsfw && !profileData?.nsfw) {
                setNsfwFormValues(publishProfileData);
                setShowNsfwModal(true);
                return;
              }
              onProfileSave(publishProfileData);
            },
          }}
        />
      </Card>
      <Modal
        title={{ label: t('Changing to NSFW Profile') }}
        show={showNsfwModal}
        onClose={() => {
          setShowNsfwModal(false);
        }}
        actions={[
          {
            variant: 'text',
            label: t('Cancel'),
            onClick: () => {
              setShowNsfwModal(false);
            },
          },
          {
            variant: 'primary',
            label: 'I understand',
            onClick: () => {
              if (nsfwFormValues?.nsfw) {
                onProfileSave(nsfwFormValues);
                setShowNsfwModal(null);
              }
              setShowNsfwModal(false);
            },
          },
        ]}
      >
        <Stack direction="column" spacing="gap-y-4">
          <Text variant="body1">
            {t('Before you proceed,')}{' '}
            <Text variant="h6" as="span">
              {t('please be aware:')}
            </Text>
          </Text>
          <Text variant="body1">
            <Text variant="h6" color={{ light: 'errorLight', dark: 'errorDark' }} as="span">
              {t('Irreversible Action:')}{' '}
            </Text>
            {t('Changing your profile to NSFW (Not Safe For Work)')}
            <br /> {t(
              'means all current and future posts will be marked as NSFW. This action is',
            )}{' '}
            <br />
            {t('permanent and cannot be undone')}.
          </Text>
          <Text variant="body1">
            <Text variant="h6" color={{ light: 'errorLight', dark: 'errorDark' }} as="span">
              {t('Content Impact: ')}{' '}
            </Text>
            {t('Once your profile is set to NSFW, it will affect how your')} <br />{' '}
            {t('content is viewed and accessed by others in the community.')}
          </Text>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default EditProfilePage;
