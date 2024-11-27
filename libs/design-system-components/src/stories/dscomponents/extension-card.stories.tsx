import React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import type { Meta, StoryObj } from '@storybook/react';
import ExtensionCard, { ExtensionCardProps } from '../../components/ExtensionCard';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';

const meta: Meta<ExtensionCardProps> = {
  title: 'DSComponents/Cards/ExtensionCard',
  component: ExtensionCard,
};

type Story = StoryObj<ExtensionCardProps>;

export const Default: Story = {
  args: {
    displayName: 'Supercarts',
    applicationType: AkashaAppApplicationType.App,
    extensionTypeLabel: 'App',
    author: {
      profileDID: 'did:pkh:eip155:11155111:0xc2ccre32856a8d50c748d50a5991312d986208a8',
      name: 'CoffeeLover',
      avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
      alternativeAvatars: [{ src: 'https://placebeard.it/360x360', height: 360, width: 360 }],
    },
    description:
      'Play with your friends in AKASHA World and enjoy a couple of puzzle games or drawing games or any kind of game!',
    action: <Button label="Install" variant="primary" />,
    coverImageSrc: 'https://placebeard.it/360x360',
  },
};

export const FeaturedExtensionCard: Story = {
  args: {
    displayName: 'Supercarts',
    applicationType: AkashaAppApplicationType.App,
    extensionTypeLabel: 'App',
    author: {
      profileDID: 'did:pkh:eip155:11155111:0xc2ccre32856a8d50c748d50a5991312d986208a8',
      name: 'CoffeeLover',
      avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
      alternativeAvatars: [{ src: 'https://placebeard.it/360x360', height: 360, width: 360 }],
    },
    featured: true,
    description:
      'Play with your friends in AKASHA World and enjoy a couple of puzzle games or drawing games or any kind of game!',
    action: <Button label="Install" variant="primary" />,
    coverImageSrc: 'https://placebeard.it/360x360',
  },
};

export const DefaultAppExtensionCard: Story = {
  args: {
    displayName: 'Supercarts',
    applicationType: AkashaAppApplicationType.App,
    extensionTypeLabel: 'App',
    author: {
      profileDID: 'did:pkh:eip155:11155111:0xc2ccre32856a8d50c748d50a5991312d986208a8',
      name: 'CoffeeLover',
      avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
      alternativeAvatars: [{ src: 'https://placebeard.it/360x360', height: 360, width: 360 }],
    },
    isDefaultWorldExtension: true,
    defaultLabel: 'Default',
    description:
      'Play with your friends in AKASHA World and enjoy a couple of puzzle games or drawing games or any kind of game!',
    action: <Button label="Install" variant="primary" />,
    coverImageSrc: 'https://placebeard.it/360x360',
  },
};

export const NSFWExtensionCard: Story = {
  args: {
    displayName: 'Supercarts',
    applicationType: AkashaAppApplicationType.App,
    extensionTypeLabel: 'App',
    author: {
      profileDID: 'did:pkh:eip155:11155111:0xc2ccre32856a8d50c748d50a5991312d986208a8',
      name: 'CoffeeLover',
      nsfw: true,
      avatar: { src: 'https://placebeard.it/360x360', height: 360, width: 360 },
      alternativeAvatars: [{ src: 'https://placebeard.it/360x360', height: 360, width: 360 }],
    },
    nsfw: true,
    nsfwLabel: 'NSFW',
    description:
      'Play with your friends in AKASHA World and enjoy a couple of puzzle games or drawing games or any kind of game!',
    action: <Button label="Install" variant="primary" />,
    coverImageSrc: 'https://placebeard.it/360x360',
  },
};

export default meta;
