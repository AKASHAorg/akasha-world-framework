import type { Meta, StoryObj } from '@storybook/react';
import Section, {
  DividerPosition,
  SectionProps,
} from '@akashaorg/design-system-core/lib/components/Section';

Section.displayName = 'Section';

const meta: Meta<SectionProps> = {
  title: 'DSCore/Blocks/Section',
  component: Section,
  argTypes: {
    title: { control: 'text' },
    titleVariant: { control: 'text' },
    showDivider: { control: 'boolean' },
    dividerPosition: { control: 'select', options: [DividerPosition.Top, DividerPosition.Bottom] },
  },
};

type Story = StoryObj<SectionProps>;

export const Default: Story = { args: { title: 'Content Block' } };

export const SectionWithoutDivider: Story = {
  args: { title: 'Section', showDivider: false },
};

export default meta;
