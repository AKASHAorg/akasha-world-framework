import type { Meta, StoryObj } from '@storybook/react';
import ExtensionIcon, {
  ExtensionIconProps,
} from '@akashaorg/design-system-core/lib/components/ExtensionIcon';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';

ExtensionIcon.displayName = 'ExtensionIcon';

const meta: Meta<ExtensionIconProps> = {
  title: 'DSCore/Icons/ExtensionIcon',
  component: ExtensionIcon,
};

type Story = StoryObj<ExtensionIconProps>;

export const Plugin: Story = { args: { type: AkashaAppApplicationType.Plugin } };

export const App: Story = { args: { type: AkashaAppApplicationType.App } };

export const Widget: Story = { args: { type: AkashaAppApplicationType.Widget } };

export default meta;
