import type { Meta, StoryObj } from '@storybook/react';

import Avatar, { AvatarProps } from '@akashaorg/design-system-core/lib/components/Avatar';

Avatar.displayName = 'Avatar';

const meta: Meta<AvatarProps> = {
  title: 'DSCore/Avatars/Avatar',
  component: Avatar,
  argTypes: {
    profileId: { crontrol: 'text' },
    active: { control: 'boolean' },
    faded: { control: 'boolean' },
  },
};

type Story = StoryObj<AvatarProps>;

export const Default: Story = {
  args: {
    profileId: 'did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493',
    avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
  },
};

export const ActiveAvatar: Story = {
  args: {
    profileId: 'did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493',
    avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
    active: true,
  },
};

export const FadedAvatar: Story = {
  args: {
    profileId: 'did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493',
    avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
    faded: true,
  },
};

export const NSFWAvatar: Story = {
  args: {
    profileId: 'did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493',
    avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
    size: 'xl',
    isNSFW: true,
  },
};

export const AvatarWithBorderColor: Story = {
  args: {
    profileId: 'did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493',
    avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
    border: 'sm',
    borderColor: 'darkerBlue',
  },
};

export const AvatarWithSpecifiedSize: Story = {
  args: {
    profileId: 'did:pkh:eip155:5:0x36c703c4d22af437dc883e2e0884e57404e16493',
    avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
    size: 'xl',
  },
};

export default meta;
