import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Tooltip from '@akashaorg/design-system-core/lib/components/Tooltip';
import Icon, { IconProps } from '@akashaorg/design-system-core/lib/components/Icon';
import {
  Akasha,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignTextCenter,
  AlignTextLeft,
  AlignTextRight,
  Antenna,
  BellAlert,
  Blocks,
  Bold,
  Caption,
  Discord,
  DidKey,
  Eth,
  Faq,
  Following,
  Github,
  IntegrationAppCTA,
  Info,
  Italic,
  LicenseAllRights,
  LicenseAttribution,
  LicenseNoDerivatives,
  LicenseNoRights,
  LicenseNonCommercial,
  LicenseShareAlike,
  LicenseSomeRights,
  LicenseWtfpl,
  ListBulleted,
  ListNumbered,
  Lock,
  Metamask,
  NoEth,
  Plugin,
  Profile,
  Shield,
  Solana,
  Telegram,
  TextIcon,
  Twitter,
  Underline,
  Vibes,
  Walletconnect,
  Widget,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

Icon.displayName = 'Icon';

const meta: Meta<IconProps> = {
  title: 'DSCore/Icons/Icon',
  component: Icon,
  argTypes: {
    color: { control: 'text' },
    icon: { control: 'object' },
    size: { control: 'text' },
    breakPointSize: { control: 'text' },
    accentColor: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hover: { control: 'boolean' },
    customStyle: { control: 'text' },
    hoverColor: { control: 'object' },
    solid: { control: 'boolean' },
    rotateAnimation: { control: 'boolean' },
  },
};

type Story = StoryObj<IconProps>;

export const Default: Story = { args: { icon: <Akasha />, solid: true } };

export const IconWithSize: Story = { args: { icon: <Akasha />, solid: true, size: 'xl' } };

const solidCustomIconsArr = [
  { icon: <Akasha />, name: 'Akasha' },
  { icon: <Antenna />, name: 'Antenna' },
  { icon: <Discord />, name: 'Discord' },
  { icon: <IntegrationAppCTA />, name: 'IntegrationAppCTA' },
  { icon: <Plugin />, name: 'Plugin' },
  { icon: <Telegram />, name: 'Telegram' },
  { icon: <TextIcon />, name: 'TextIcon' },
  { icon: <Twitter />, name: 'Twitter' },
  { icon: <Widget />, name: 'Widget' },
];

const outlineCustomIconsArr = [
  { icon: <AlignCenter />, name: 'AlignCenter' },
  { icon: <AlignLeft />, name: 'AlignLeft' },
  { icon: <AlignRight />, name: 'AlignRight' },
  { icon: <AlignTextCenter />, name: 'AlignTextCenter' },
  { icon: <AlignTextLeft />, name: 'AlignTextLeft' },
  { icon: <AlignTextRight />, name: 'AlignTextRight' },
  { icon: <BellAlert />, name: 'BellAlert' },
  { icon: <Blocks />, name: 'Blocks' },
  { icon: <Bold />, name: 'Bold' },
  { icon: <Caption />, name: 'Caption' },
  { icon: <DidKey />, name: 'DidKey' },
  { icon: <Eth />, name: 'Eth' },
  { icon: <Faq />, name: 'Faq' },
  { icon: <Following />, name: 'Following' },
  { icon: <Github />, name: 'Github' },
  { icon: <Info />, name: 'Info' },
  { icon: <Italic />, name: 'Italic' },
  { icon: <LicenseAllRights />, name: 'LicenseAllRights' },
  { icon: <LicenseAttribution />, name: 'LicenseAttribution' },
  { icon: <LicenseNoDerivatives />, name: 'LicenseNoDerivatives' },
  { icon: <LicenseNoRights />, name: 'LicenseNoRights' },
  { icon: <LicenseNonCommercial />, name: 'LicenseNonCommercial' },
  { icon: <LicenseShareAlike />, name: 'LicenseShareAlike' },
  { icon: <LicenseSomeRights />, name: 'LicenseSomeRights' },
  { icon: <LicenseWtfpl />, name: 'LicenseWtfpl' },
  { icon: <ListBulleted />, name: 'ListBulleted' },
  { icon: <ListNumbered />, name: 'ListNumbered' },
  { icon: <Lock />, name: 'Lock' },
  { icon: <Metamask />, name: 'Metamask' },
  { icon: <NoEth />, name: 'NoEth' },
  { icon: <Profile />, name: 'Profile' },
  { icon: <Shield />, name: 'Shield' },
  { icon: <Solana />, name: 'Solana' },
  { icon: <Squares2X2Icon />, name: 'App' },
  { icon: <Underline />, name: 'Underline' },
  { icon: <Vibes />, name: 'Vibes' },
  { icon: <Walletconnect />, name: 'Walletconnect' },
];

export const CustomIcons: Story = {
  render: () => (
    <Stack spacing="gap-y-4">
      <Stack direction="row" spacing="gap-3" customStyle="flex-wrap">
        <Text weight="bold">Solid:</Text>
        {solidCustomIconsArr.map(({ icon, name }, idx) => (
          <Tooltip key={name + idx} placement="top" content={name} trigger="hover">
            <Icon icon={icon} solid={true} />
          </Tooltip>
        ))}
      </Stack>
      <Stack direction="row" spacing="gap-3" customStyle="flex-wrap">
        <Text weight="bold">Outline:</Text>
        {outlineCustomIconsArr.map(({ icon, name }, idx) => (
          <Tooltip key={name + idx} placement="top" content={name} trigger="hover">
            <Icon icon={icon} />
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  ),
};

export default meta;
