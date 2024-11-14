import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Dropdown, { DropdownProps } from '@akashaorg/design-system-core/lib/components/Dropdown';

Dropdown.displayName = 'Dropdown';

const meta: Meta<DropdownProps> = {
  title: 'DSCore/Buttons/Dropdown',
  component: Dropdown,
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    placeholderLabel: { control: 'text' },
    selected: { control: 'object' },
    menuItems: { control: 'object' },
    setSelected: { action: 'selected set' },
  },
};

type Story = StoryObj<DropdownProps>;

const menuItems = ['Option 1', 'Option 2', 'Option 3'];

export const Default: Story = {
  args: {
    name: 'Dropdown',
    placeholderLabel: 'Select an option',
    menuItems: menuItems,
  },
};

const DropdownComponent = () => {
  const [selected, setSelected] = useState('');

  return (
    <Dropdown
      name="Dropdown"
      placeholderLabel="Select an option"
      menuItems={menuItems}
      selected={selected}
      setSelected={setSelected}
    />
  );
};

export const ControlledDropdown: Story = {
  render: () => <DropdownComponent />,
};

export const DropdownWithoutIcon: Story = {
  args: {
    name: 'Dropdown',
    menuItems: menuItems,
  },
};

export const DropdownWithLabel: Story = {
  args: {
    name: 'Dropdown',
    menuItems: menuItems,
    label: 'Select one',
  },
};

export const DropdownWithPlaceholderLabel: Story = {
  args: {
    name: 'Dropdown',
    menuItems: menuItems,
    placeholderLabel: 'Select an option',
  },
};

export default meta;
