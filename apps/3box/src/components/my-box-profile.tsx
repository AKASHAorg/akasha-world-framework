import * as React from 'react';
import { useBoxProfile } from '../state';
import DS from '@akashaproject/design-system';
import { useTranslation } from 'react-i18next';
import { IBoxData } from '@akashaproject/design-system/lib/components/Cards/form-cards/box-form-card';
import ErrorInfoCard from './error-info-card';
import * as H from 'history';
import { match } from 'react-router-dom';

const { BoxFormCard, Box } = DS;

export interface IMyBoxProfileProps {
  history: H.History;
  location: H.Location;
  match: match;
  channelUtils: any;
  sdkModules: any;
}

const MyBoxProfile: React.FC<any> = ({ sdkModules, channelUtils }) => {
  const [state, actions] = useBoxProfile(sdkModules, channelUtils);
  const { t } = useTranslation();

  React.useEffect(() => {
    let subs: any;
    const onMount = async () => {
      subs = await actions.fetchCurrent();
    };
    onMount();
    return () => {
      if (subs) {
        subs.unsubscribe();
      }
    };
  }, []);

  const onFormSubmit = (data: IBoxData) => {
    const { /* providerName, */ avatar, coverImage, name, description } = data;
    actions.updateProfileData({
      name,
      description,
      image: avatar,
      coverPhoto: coverImage,
      ethAddress: state.data.ethAddress,
    });
  };
  return (
    <Box fill={true} flex={true} pad={{ top: '1em' }} align="center">
      <ErrorInfoCard errors={state.data.errors}>
        <>
          {!state.data.openBoxConsent && <Box>waiting for signatures</Box>}
          <BoxFormCard
            titleLabel={t('Ethereum Address')}
            avatarLabel={t('Avatar')}
            nameLabel={t('Name')}
            coverImageLabel={t('Cover Image')}
            descriptionLabel={t('Description')}
            uploadLabel={t('Upload')}
            urlLabel={t('By url')}
            cancelLabel={t('Cancel')}
            saveLabel={t('Save')}
            deleteLabel={t('Delete')}
            nameFieldPlaceholder={t('Type your name here')}
            descriptionFieldPlaceholder={t('Add a description about you here')}
            ethAddress={state.data.ethAddress || ''}
            providerData={{
              providerName: '3Box',
              avatar: state.data.profileData.image,
              coverImage: state.data.profileData.coverPhoto,
              name: state.data.profileData.name,
              description: state.data.profileData.description,
            }}
            handleSubmit={onFormSubmit}
          />
        </>
      </ErrorInfoCard>
    </Box>
  );
};

export default MyBoxProfile;
