import React, { SyntheticEvent, useEffect, useState } from 'react';
import * as z from 'zod';
import { Controller } from 'react-hook-form';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import TextField from '@akashaorg/design-system-core/lib/components/TextField';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import { apply, tw } from '@twind/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonType } from '../types/common.types';
import { Header, HeaderProps } from './Header';
import { Image } from '@akashaorg/typings/lib/ui';
import { AkashaAppApplicationType } from '@akashaorg/typings/lib/sdk/graphql-types-new';

export enum FieldName {
  name = 'name',
  displayName = 'displayName',
  logoImage = 'logoImage',
  coverImage = 'coverImage',
}

export type ExtensionEditStep1FormValues = {
  name?: string;
  displayName?: string;
  logoImage?: Image | File | null;
  coverImage?: Image | File | null;
};

export type ExtensionEditStep1FormProps = {
  header: Omit<HeaderProps, 'onLogoImageChange' | 'onCoverImageChange'>;
  extensionType: AkashaAppApplicationType;
  defaultValues?: ExtensionEditStep1FormValues;
  cancelButton: ButtonType;
  nextButton: {
    label: string;
    handleClick: (data: ExtensionEditStep1FormValues) => void;
  };
  handleCheckExtProp?: (
    propToValidate: FieldName.name | FieldName.displayName,
    fieldValue: string,
  ) => void;
  isDuplicateExtProp?: boolean;
  loading?: boolean;
  extensionIdLabel?: string;
  extensionDisplayNameLabel?: string;
};

const ExtensionEditStep1Form: React.FC<ExtensionEditStep1FormProps> = props => {
  const {
    header,
    extensionType,
    defaultValues = {
      name: '',
      displayName: '',
      sourceURL: '',
      logoImage: null,
      coverImage: null,
    },
    cancelButton,
    nextButton,
    handleCheckExtProp,
    isDuplicateExtProp,
    loading,
    extensionIdLabel,
    extensionDisplayNameLabel,
  } = props;

  const {
    control,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ExtensionEditStep1FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const isValid = !Object.keys(errors).length;

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();
    if (isValid) {
      nextButton.handleClick({
        ...formValues,
      });
    }
  };

  const [validatedField, setValidatedField] = useState<FieldName.name>();
  useEffect(() => {
    if (isDuplicateExtProp) {
      setError(validatedField, { message: `Extension ${validatedField} must be unique!` });
    } else {
      clearErrors(validatedField);
    }
  }, [isDuplicateExtProp, setError, clearErrors, validatedField]);

  return (
    <form onSubmit={onSave} className={tw(apply`h-full`)}>
      <Stack direction="column" spacing="gap-y-4">
        <Stack padding="px-4">
          <Header
            {...header}
            extensionType={extensionType}
            onLogoImageChange={logoImage => {
              setValue('logoImage', logoImage, { shouldDirty: true });
            }}
            onCoverImageChange={coverImage => {
              setValue('coverImage', coverImage, { shouldDirty: true });
            }}
          />
        </Stack>
        <Stack padding="px-4 pb-16" spacing="gap-y-4">
          <Controller
            control={control}
            name={FieldName.name}
            render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
              <TextField
                id={name}
                type="text"
                name={name}
                label={extensionIdLabel}
                placeholder="unique extension identifier"
                value={value}
                caption={error?.message}
                status={error?.message ? 'error' : null}
                onChange={onChange}
                onBlur={() => {
                  setValidatedField(FieldName.name);
                  handleCheckExtProp(FieldName.name, value);
                }}
                inputRef={ref}
                required={true}
              />
            )}
            defaultValue={defaultValues.name}
          />
          <Divider />
          <Controller
            control={control}
            name={FieldName.displayName}
            render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
              <TextField
                id={name}
                type="text"
                name={name}
                label={extensionDisplayNameLabel}
                placeholder="extension x"
                value={value}
                caption={error?.message}
                status={error?.message ? 'error' : null}
                onChange={onChange}
                inputRef={ref}
                required={true}
              />
            )}
            defaultValue={defaultValues.displayName}
          />
        </Stack>
        <Divider />

        <Stack direction="row" justify="end" spacing="gap-x-2" customStyle="px-4 pb-4">
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
            label={nextButton.label}
            disabled={!isValid || loading}
            onClick={onSave}
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default ExtensionEditStep1Form;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(6, { message: 'Must be at least 6 characters' })
    .max(48, { message: 'Must be maximum 48 characters' })
    .refine(
      value => /^[a-zA-Z0-9-_.]+$/.test(value),
      'ID should contain only alphabets, numbers or -_.',
    ),
  displayName: z
    .string()
    .trim()
    .min(4, { message: 'Must be at least 4 characters' })
    .max(24, { message: 'Must be maximum 24 characters' }),
  logoImage: z.any().optional(),
  coverImage: z.any().optional(),
});
