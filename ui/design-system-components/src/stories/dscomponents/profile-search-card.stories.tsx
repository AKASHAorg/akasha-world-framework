import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { profileData } from '@akashaorg/design-system-core/lib/utils';

import ProfileSearchCard, { ProfileSearchCardProps } from '../../components/ProfileSearchCard';

const meta: Meta<ProfileSearchCardProps> = {
  title: 'DSComponents/Cards/ProfileSearchCard',
  component: ProfileSearchCard,
};

export default meta;
type Story = StoryObj<ProfileSearchCardProps>;

export const BaseProfileSearchCard: Story = {
  render: () => (
    <ProfileSearchCard
      followLabel="follow"
      followingLabel="following"
      unfollowLabel="unfollow"
      profileAnchorLink="/profile"
      isFollowing={false}
      profileData={profileData}
      handleFollow={() => ({})}
      handleUnfollow={() => ({})}
    />
  ),
};