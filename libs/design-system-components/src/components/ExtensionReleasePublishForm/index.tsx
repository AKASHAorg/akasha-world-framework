import React, { SyntheticEvent, useState } from 'react';
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
import Modal from '@akashaorg/design-system-core/lib/components/Modal';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export enum FieldName {
  versionNumber = 'versionNumber',
  description = 'description',
  sourceURL = 'sourceURL',
}

export type ExtensionReleasePublishValues = {
  versionNumber?: string;
  description?: string;
  sourceURL?: string;
};

export type ExtensionReleasePublishProps = {
  versionNumberLabel: string;
  descriptionFieldLabel: string;
  descriptionPlaceholderLabel: string;
  sourceURLFieldLabel: string;
  sourceURLPlaceholderLabel?: string;
  confirmationModalTitleLabel?: string;
  confirmationModalDescriptionLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  validationLabels: {
    version: string;
    descriptionMin: string;
    descriptionMax: string;
    sourceURL: string;
  };
  defaultValues?: ExtensionReleasePublishValues;
  cancelButton: ButtonType;
  nextButton: {
    label: string;
    handleClick: (data: ExtensionReleasePublishValues) => void;
  };
  loading?: boolean;
  requireVersionNumber?: boolean;
  requireDescription?: boolean;
  showModalFlow?: boolean;
};

const ExtensionReleasePublish: React.FC<ExtensionReleasePublishProps> = props => {
  const {
    defaultValues = {
      versionNumber: '',
      description: '',
      sourceURL: '',
    },
    validationLabels,
    cancelButton,
    nextButton,
    versionNumberLabel,
    descriptionFieldLabel,
    descriptionPlaceholderLabel,
    sourceURLFieldLabel,
    sourceURLPlaceholderLabel,
    loading,
    requireVersionNumber,
    requireDescription,
    confirmationModalTitleLabel,
    confirmationModalDescriptionLabel,
    confirmLabel,
    cancelLabel,
    showModalFlow,
  } = props;

  const schema = z.object({
    versionNumber: z
      .string()
      .refine(
        value =>
          /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(
            value ?? '',
          ),
        validationLabels.version,
      ),
    description: z
      .string()
      .trim()
      .min(10, { message: validationLabels.descriptionMin })
      .max(2000, { message: validationLabels.descriptionMax }),
    sourceURL: z.string().url({ message: validationLabels.sourceURL }),
  });

  const {
    control,
    getValues,
    formState: { errors, dirtyFields },
  } = useForm<ExtensionReleasePublishValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const isFormDirty = Object.keys(dirtyFields).includes(FieldName.sourceURL);

  const isValid = !Object.keys(errors).length;

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();
    if (isValid && isFormDirty) {
      nextButton.handleClick({
        ...formValues,
      });
    }
  };
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const onConfirmationModalClose = () => {
    setShowConfirmationModal(false);
  };

  const onConfirmationModalOpen = () => {
    setShowConfirmationModal(true);
  };

  const handleSave = ev => {
    onConfirmationModalClose();
    onSave(ev);
  };

  return (
    <>
      <form className={tw(apply`h-full`)}>
        <Stack direction="column" spacing="gap-y-4">
          <Stack padding="px-4 pb-16" spacing="gap-y-4">
            <Controller
              control={control}
              name={FieldName.versionNumber}
              render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
                <TextField
                  id={name}
                  type="text"
                  name={name}
                  label={versionNumberLabel}
                  placeholder="e.g. 1.0.0"
                  value={value}
                  caption={error?.message}
                  status={error?.message ? 'error' : null}
                  onChange={onChange}
                  inputRef={ref}
                  required={requireVersionNumber}
                />
              )}
              defaultValue={defaultValues.versionNumber}
            />
            <Divider />
            <Controller
              control={control}
              name={FieldName.description}
              render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
                <TextField
                  id={name}
                  name={name}
                  label={descriptionFieldLabel}
                  placeholder={descriptionPlaceholderLabel}
                  value={value}
                  onChange={onChange}
                  caption={error?.message}
                  status={error?.message ? 'error' : null}
                  inputRef={ref}
                  type="multiline"
                  maxLength={2000}
                  required={requireDescription}
                />
              )}
              defaultValue={defaultValues.description}
            />
            <Divider />
            <Controller
              control={control}
              name={FieldName.sourceURL}
              render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
                <TextField
                  id={name}
                  type="text"
                  name={name}
                  label={sourceURLFieldLabel}
                  placeholder={sourceURLPlaceholderLabel}
                  value={value}
                  caption={error?.message}
                  status={error?.message ? 'error' : null}
                  onChange={onChange}
                  inputRef={ref}
                  required={true}
                />
              )}
              defaultValue={defaultValues.sourceURL}
            />
          </Stack>
          <Divider />

          <Stack direction="row" justify="end" spacing="gap-x-2" customStyle="px-4 pb-4">
            <Button
              variant="text"
              label={cancelButton.label}
              onClick={cancelButton.handleClick}
              disabled={cancelButton.disabled}
            />
            <Button
              variant="primary"
              loading={loading}
              label={nextButton.label}
              disabled={!isValid || !isFormDirty}
              onClick={showModalFlow ? onConfirmationModalOpen : onSave}
            />
          </Stack>
        </Stack>
      </form>
      <Modal
        title={{ label: confirmationModalTitleLabel }}
        show={showConfirmationModal}
        onClose={onConfirmationModalClose}
        customStyle="max-w-[615px]"
        actions={[
          {
            variant: 'text',
            label: cancelLabel,
            onClick: onConfirmationModalClose,
          },
          {
            variant: 'primary',
            label: confirmLabel,
            onClick: handleSave,
          },
        ]}
      >
        <Text variant="body1">{confirmationModalDescriptionLabel}</Text>
      </Modal>
    </>
  );
};

export default ExtensionReleasePublish;
