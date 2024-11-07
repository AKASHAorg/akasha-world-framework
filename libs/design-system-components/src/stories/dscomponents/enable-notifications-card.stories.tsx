import type { Meta, StoryObj } from '@storybook/react';
import NotificationSettingsCard, {
  NotificationSettingsCardProps,
} from '../../components/NotificationSettingsCard';

const meta: Meta<NotificationSettingsCardProps> = {
  title: 'DSComponents/Cards/NotificationSettingsCard',
  component: NotificationSettingsCard,
};

type Story = StoryObj<NotificationSettingsCardProps>;

export const Default: Story = {
  args: {
    title: 'Turn on in-app notifications',
    text: 'Receive personalised updates and community news.',
    handleButtonClick: () => ({}),
  },
};

export default meta;
