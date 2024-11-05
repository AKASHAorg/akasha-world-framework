import React, { SyntheticEvent, useEffect } from 'react';
import * as z from 'zod';
import { Controller, useWatch } from 'react-hook-form';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import TextField from '@akashaorg/design-system-core/lib/components/TextField';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import DropDown from '@akashaorg/design-system-core/lib/components/Dropdown';
import { apply, tw } from '@twind/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { ButtonType } from '../types/common.types';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export enum FieldName {
  extensionType = 'extensionType',
  extensionID = 'extensionID',
  extensionDisplayName = 'extensionDisplayName',
  extensionLicense = 'extensionLicense',
  extensionLicenseOther = 'extensionLicenseOther',
}

export enum Licenses {
  MIT = 'MIT',
  GPL = 'GNU General Public License',
  APACHE = 'Apache License 2.0',
  BSD = 'BSD',
  MPL = 'MPL 2.0',
  OTHER = 'Other',
}

type AppCreationFormValues = {
  extensionType: AkashaAppApplicationType;
  extensionID: string;
  extensionDisplayName: string;
  extensionLicense: Licenses | string;
  extensionLicenseOther: string;
};

export type AppCreationFormProps = {
  extensionNameFieldLabel?: string;
  extensionNamePlaceholderLabel?: string;
  extensionDisplayNameFieldLabel?: string;
  extensionDisplayNamePlaceholderLabel?: string;
  extensionTypeFieldLabel?: string;
  extensionLicenseFieldLabel?: string;
  extensionLicenseOtherPlaceholderLabel?: string;
  disclaimerLabel?: string;
  defaultValues?: AppCreationFormValues;
  handleCheckExtName?: (fieldValue: string) => void;
  isDuplicateExtName?: boolean;
  loading?: boolean;
  cancelButton: ButtonType;
  createButton: {
    label: string;
    loading?: boolean;
    handleClick: (data: AppCreationFormValues) => void;
  };
};

const AppCreationForm: React.FC<AppCreationFormProps> = ({
  defaultValues = {
    extensionType: AkashaAppApplicationType.App,
    extensionID: '',
    extensionDisplayName: '',
    extensionLicense: Licenses.MIT,
    extensionLicenseOther: '',
  },
  handleCheckExtName,
  isDuplicateExtName,
  loading,
  cancelButton,
  createButton,
  extensionDisplayNameFieldLabel,
  extensionDisplayNamePlaceholderLabel,
  extensionNameFieldLabel,
  extensionNamePlaceholderLabel,
  extensionLicenseFieldLabel,
  extensionLicenseOtherPlaceholderLabel,
  extensionTypeFieldLabel,
  disclaimerLabel,
}) => {
  const {
    control,
    getValues,
    setError,
    clearErrors,
    formState: { errors, dirtyFields },
  } = useForm<AppCreationFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const extensionLicenseValue = useWatch({ control, name: FieldName.extensionLicense });

  const extensionTypes = [
    AkashaAppApplicationType.App,
    AkashaAppApplicationType.Plugin,
    AkashaAppApplicationType.Widget,
  ];

  const extensionLicenses = [
    Licenses.MIT,
    Licenses.GPL,
    Licenses.APACHE,
    Licenses.BSD,
    Licenses.MPL,
    Licenses.OTHER,
  ];

  const isFormDirty =
    Object.keys(dirtyFields).includes(FieldName.extensionID) &&
    Object.keys(dirtyFields).includes(FieldName.extensionDisplayName);
  const isValid = !Object.keys(errors).length;

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();
    if (formValues.extensionLicense === Licenses.OTHER) {
      formValues.extensionLicense = formValues.extensionLicenseOther;
    }
    if (isValid && isFormDirty) {
      createButton.handleClick({
        ...formValues,
      });
    }
  };

  useEffect(() => {
    if (isDuplicateExtName) {
      setError('extensionID', { message: 'Extension ID must be unique!' });
    } else {
      clearErrors('extensionID');
    }
  }, [isDuplicateExtName, setError, clearErrors]);

  return (
    <form onSubmit={onSave} className={tw(apply`h-full`)}>
      <Stack direction="column" spacing="gap-y-4">
        <Stack padding="px-4 pb-3" spacing="gap-y-4">
          <Controller
            control={control}
            name={FieldName.extensionType}
            render={({ field: { name, value, onChange } }) => (
              <DropDown
                label={extensionTypeFieldLabel}
                name={name}
                selected={value}
                menuItems={extensionTypes}
                setSelected={onChange}
                required={true}
              />
            )}
          />
          <Divider />
          <Controller
            control={control}
            name={FieldName.extensionID}
            render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
              <TextField
                id={name}
                type="text"
                name={name}
                label={extensionNameFieldLabel}
                placeholder={extensionNamePlaceholderLabel}
                value={value}
                caption={error?.message}
                status={error?.message ? 'error' : null}
                onChange={onChange}
                onBlur={() => handleCheckExtName(value)}
                inputRef={ref}
                required={true}
              />
            )}
          />
          <Divider />
          <Controller
            control={control}
            name={FieldName.extensionDisplayName}
            render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
              <TextField
                id={name}
                type="text"
                name={name}
                label={extensionDisplayNameFieldLabel}
                placeholder={extensionDisplayNamePlaceholderLabel}
                value={value}
                caption={error?.message}
                status={error?.message ? 'error' : null}
                onChange={onChange}
                inputRef={ref}
                required={true}
              />
            )}
          />
          <Divider />
          <Controller
            control={control}
            name={FieldName.extensionLicense}
            render={({ field: { name, value, onChange } }) => (
              <>
                <DropDown
                  label={extensionLicenseFieldLabel}
                  name={name}
                  selected={value}
                  menuItems={extensionLicenses}
                  setSelected={onChange}
                  required={true}
                />
              </>
            )}
            defaultValue={extensionLicenses[0]}
          />
          {extensionLicenseValue === Licenses.OTHER && (
            <Controller
              control={control}
              name={FieldName.extensionLicenseOther}
              render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
                <TextField
                  id={name}
                  customStyle="mt-2"
                  value={value}
                  placeholder={extensionLicenseOtherPlaceholderLabel}
                  type={'text'}
                  caption={error?.message}
                  status={error?.message ? 'error' : null}
                  onChange={onChange}
                  inputRef={ref}
                  required={true}
                />
              )}
              defaultValue=""
            />
          )}

          <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
            {disclaimerLabel}
          </Text>
        </Stack>

        <Divider />

        <Stack direction="row" spacing="gap-x-2" customStyle="ml-auto mt-auto px-4">
          <Button
            variant="text"
            size="md"
            label={cancelButton.label}
            onClick={cancelButton.handleClick}
            disabled={cancelButton.disabled}
          />
          <Button
            variant="primary"
            size="md"
            label={createButton.label}
            loading={createButton.loading}
            disabled={!isFormDirty || !isValid || loading}
            onClick={onSave}
            type="submit"
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default AppCreationForm;

const schema = z.object({
  extensionID: z
    .string()
    .trim()
    .min(6, { message: 'Must be at least 6 characters' })
    .max(48, { message: 'Must be maximum 48 characters' })
    .refine(
      value => /^[a-zA-Z0-9-_.]+$/.test(value),
      'ID should contain only alphabets, numbers or -_.',
    ),
  extensionType: z.string(),
  extensionDisplayName: z
    .string()
    .trim()
    .min(4, { message: 'Must be at least 4 characters' })
    .max(24, { message: 'Must be maximum 24 characters' }),
  extensionLicense: z.string(),
  extensionLicenseOther: z.string().trim().min(3, { message: 'Must be at least 3 characters' }),
});
