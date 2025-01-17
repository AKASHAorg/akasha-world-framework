import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CopyToClipboard, {
  CopyToClipboardProps,
} from '@akashaorg/design-system-core/lib/components/CopyToClipboard';
import Text from '@akashaorg/design-system-core/lib/components/Text';

CopyToClipboard.displayName = 'CopyToClipboard';

const meta: Meta = {
  title: 'DSCore/CopyToClipboard/CopyToClipboard',
  component: CopyToClipboard,
  argTypes: {
    stringToBeCopied: { control: 'text' },
    copyText: { control: 'text' },
    copiedText: { control: 'text' },
  },
};

type Story = StoryObj<CopyToClipboardProps>;

export const Default: Story = {
  args: {
    stringToBeCopied: 'Content to be copied',
    copyText: 'Copy to clipboard',
    copiedText: 'Copied',
    children: <Text>Content to be copied</Text>,
  },
};

export default meta;
