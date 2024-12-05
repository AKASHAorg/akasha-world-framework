import type { Meta, StoryObj } from '@storybook/react';
import InlineNotification, {
  InlineNotificationProps,
} from '@akashaorg/design-system-core/lib/components/InlineNotification';

InlineNotification.displayName = 'InlineNotification';

const meta: Meta<InlineNotificationProps> = {
  title: 'DSCore/Cards/InlineNotification',
  component: InlineNotification,
  argTypes: {
    titlte: { control: 'text' },
    message: { control: 'text' },
    type: { control: 'text' },
    button: { control: 'object' },
    background: { control: 'object' },
    customStyle: { control: 'text' },
  },
};

type Story = StoryObj<InlineNotificationProps>;

export const ErrorInlineNotification: Story = {
  args: {
    titlte: 'Error',
    message: 'A sample message...',
    type: 'error',
  },
};

export const WarningInlineNotification: Story = {
  args: {
    titlte: 'Warning',
    message: 'A sample message...',
    type: 'warning',
  },
};

export const SuccessInlineNotification: Story = {
  args: {
    titlte: 'Success',
    message: 'A sample message...',
    type: 'success',
  },
};

export const InfoInlineNotification: Story = {
  args: {
    titlte: 'Info',
    message: 'A sample message...',
    type: 'info',
  },
};

export const ErrorInlineNotificationWithButton: Story = {
  args: {
    titlte: 'Error',
    message: 'A sample message...',
    type: 'error',
    button: {
      label: 'Button',
      handleClick: () => ({}),
    },
  },
};

export default meta;
