import React from 'react';

import TextField from './index';

export default {
  title: 'Fields/TextField',
  component: TextField,
};

const Template = args => {
  const [value, setValue] = React.useState(args.value || '');
  return <TextField {...args} value={value} onChange={e => setValue(e.currentTarget.value)} />;
};

export const DefaultField = Template.bind({});
DefaultField.args = {};

export const DefaultCaptionWithLabelField = Template.bind({});
DefaultCaptionWithLabelField.args = {
  label: 'Label',
  caption: 'Default Caption',
};

export const WarningCaptionField = Template.bind({});
WarningCaptionField.args = {
  label: 'Label',
  caption: 'Warning Caption',
  status: 'warning',
};

export const ErorrCaptionField = Template.bind({});
ErorrCaptionField.args = {
  label: 'Label',
  caption: 'Error Caption',
  status: 'error',
};

export const SuccessCaptionField = Template.bind({});
SuccessCaptionField.args = {
  label: 'Label',
  caption: 'Success Caption',
  status: 'success',
};

export const DisabledField = Template.bind({});
DisabledField.args = {
  label: 'Label',
  value: 'Example input',
  disabled: true,
};

export const DefaultCaptionWithIconField = Template.bind({});
DefaultCaptionWithIconField.args = {
  label: 'Label',
  caption: 'Default Caption',
  value: 'Example input',
  iconLeft: 'CheckCircleIcon',
  iconRight: 'CheckCircleIcon',
};

export const WarningCaptionWithIconField = Template.bind({});
WarningCaptionWithIconField.args = {
  label: 'Label',
  caption: 'Default Caption',
  value: 'Example input',
  status: 'warning',
  iconLeft: 'CheckCircleIcon',
  iconRight: 'CheckCircleIcon',
};

export const ErrorCaptionWithIconField = Template.bind({});
ErrorCaptionWithIconField.args = {
  label: 'Label',
  caption: 'Default Caption',
  value: 'Example input',
  status: 'error',
  iconLeft: 'CheckCircleIcon',
  iconRight: 'CheckCircleIcon',
};

export const SuccessCaptionWithIconField = Template.bind({});
SuccessCaptionWithIconField.args = {
  label: 'Label',
  caption: 'Default Caption',
  value: 'Example input',
  status: 'success',
  iconLeft: 'CheckCircleIcon',
  iconRight: 'CheckCircleIcon',
};

export const DisabledWithIconField = Template.bind({});
DisabledWithIconField.args = {
  label: 'Label',
  value: 'Example input',
  disabled: true,
  iconLeft: 'CheckCircleIcon',
  iconRight: 'CheckCircleIcon',
};
