import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircleIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import TextField from '@akashaorg/design-system-core/lib/components/TextField';
import { TextFieldProps } from '@akashaorg/design-system-core/lib/components/TextField/types';

TextField.displayName = 'TextField';

const meta: Meta = {
  title: 'DSCore/Fields/TextField',
  component: TextField,
  argTypes: {
    label: { control: 'text' },
    caption: { control: 'text' },
    placeholder: { control: 'text' },
    type: { control: 'select', options: ['text', 'multiline'] },
    status: { control: 'select', options: ['success', 'warning', 'error'] },
    disabled: { control: 'boolean' },
    onChange: { action: 'change handler' },
  },
};

type Story = StoryObj<TextFieldProps>;

export const Default: Story = {
  args: { type: 'text' },
};

export const TextFieldWithLeftIcon: Story = {
  args: { type: 'text', iconLeft: <CheckCircleIcon /> },
};

export const TextFieldWithRightIcon: Story = {
  args: { type: 'text', iconRight: <CheckCircleIcon /> },
};

export const TextFieldWithBothIcons: Story = {
  args: { type: 'text', iconRight: <CheckCircleIcon />, iconLeft: <CheckCircleIcon /> },
};

export const TextFieldMultiline: Story = {
  args: { type: 'multiline' },
};

export const TextFieldWithLabel: Story = {
  args: { type: 'text', label: 'Label' },
};

export const RequiredTextFieldWithLabel: Story = {
  args: { type: 'text', label: 'Label', required: true },
};

export const TextFieldWithCaption: Story = {
  args: { type: 'text', caption: 'Default caption' },
};

export const TextFieldWithPlaceholder: Story = {
  args: { type: 'text', placeholder: 'Example input' },
};

export const TextFieldSuccess: Story = {
  args: { type: 'text', status: 'success', caption: 'Example caption' },
};

export const TextFieldSuccessWithIcon: Story = {
  args: {
    type: 'text',
    status: 'success',
    caption: 'Example caption',
    iconRight: <CheckCircleIcon />,
  },
};

export const TextFieldWarning: Story = {
  args: { type: 'text', status: 'warning', caption: 'Example caption' },
};

export const TextFieldWarningWithIcon: Story = {
  args: {
    type: 'text',
    status: 'warning',
    caption: 'Example caption',
    iconRight: <CheckCircleIcon />,
  },
};

export const TextFieldError: Story = {
  args: { type: 'text', status: 'error', caption: 'Example caption' },
};

export const TextFieldErrorWithIcon: Story = {
  args: {
    type: 'text',
    status: 'error',
    caption: 'Example caption',
    iconRight: <CheckCircleIcon />,
  },
};

export const ReadOnlyTextField: Story = {
  args: {
    type: 'text',
    value: 'this text field is read only and cannot be interacted with',
    readOnly: true,
  },
};

export const TextFieldDisabled: Story = {
  args: {
    type: 'text',
    value: 'this text field is disabled and cannot be interacted with',
    disabled: true,
  },
};

export default meta;
