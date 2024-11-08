import React, { SyntheticEvent } from 'react';
import * as z from 'zod';
import { Controller } from 'react-hook-form';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import TextField from '@akashaorg/design-system-core/lib/components/TextField';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import { apply, tw } from '@twind/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppImageSource, AppLinkSource } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { ButtonType } from '../types/common.types';
import { NSFW } from '../NSFW';
import { UsefulLinks } from './UsefulLinks';
import { Gallery, GalleryProps } from './Gallery';

export enum FieldName {
  nsfw = 'nsfw',
  description = 'description',
  gallery = 'gallery',
  links = 'links',
}

export type ExtensionEditStep2FormValues = {
  nsfw?: boolean;
  description?: string;
  gallery?: AppImageSource[];
  links?: (AppLinkSource & { _id?: number })[];
};

export type ExtensionEditStep2FormProps = {
  nsfwFieldLabel?: string;
  nsfwDescriptionLabel?: string;
  descriptionFieldLabel?: string;
  descriptionPlaceholderLabel?: string;
  usefulLinksFieldLabel?: string;
  usefulLinksDescriptionLabel?: string;
  linkTitleLabel?: string;
  linkPlaceholderLabel?: string;
  defaultValues?: ExtensionEditStep2FormValues;
  cancelButton: ButtonType;
  nextButton: {
    label: string;
    handleClick: (data: ExtensionEditStep2FormValues) => void;
  };
} & GalleryProps;

const ExtensionEditStep2Form: React.FC<ExtensionEditStep2FormProps> = props => {
  const {
    defaultValues,
    cancelButton,
    nextButton,
    nsfwFieldLabel,
    nsfwDescriptionLabel,
    descriptionFieldLabel,
    descriptionPlaceholderLabel,
    galleryFieldLabel,
    galleryDescriptionLabel,
    usefulLinksFieldLabel,
    usefulLinksDescriptionLabel,
    linkTitleLabel,
    linkPlaceholderLabel,
    addLabel,
    updateGalleryLabel,
    imagesUploadedLabel,
    images,
    maxGalleryImages,
    handleMediaClick,
  } = props;

  const {
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<ExtensionEditStep2FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const isValid = !Object.keys(errors)?.length;

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();
    if (isValid) {
      nextButton.handleClick({
        ...formValues,
        links: formValues.links
          ?.map(link => {
            if (link.href && link.label) {
              return {
                href: link.href,
                label: link.label,
              };
            }
            return null;
          })
          .filter(link => link),
      });
    }
  };

  return (
    <form onSubmit={onSave} className={tw(apply`h-full`)}>
      <Stack direction="column" spacing="gap-y-4">
        <Stack padding="px-4 pb-16" spacing="gap-y-4">
          <NSFW
            control={control}
            name={'nsfw'}
            nsfw={{ label: nsfwDescriptionLabel, initialValue: defaultValues.nsfw }}
            nsfwFieldLabel={nsfwFieldLabel}
            defaultValue={defaultValues.nsfw}
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
              />
            )}
            defaultValue={defaultValues.description}
          />
          <Divider />

          <Gallery
            galleryFieldLabel={galleryFieldLabel}
            galleryDescriptionLabel={galleryDescriptionLabel}
            addLabel={addLabel}
            updateGalleryLabel={updateGalleryLabel}
            imagesUploadedLabel={imagesUploadedLabel}
            images={images}
            maxGalleryImages={maxGalleryImages}
            handleMediaClick={handleMediaClick}
          />
          <Divider />

          <UsefulLinks
            usefulLinksTitleLabel={usefulLinksFieldLabel}
            usefulLinksDescriptionLabel={usefulLinksDescriptionLabel}
            linkElementLabel={linkTitleLabel}
            linkTitlePlaceholderLabel={linkPlaceholderLabel}
            addNewLinkButtonLabel={addLabel}
            control={control}
            onDeleteLink={async () => {
              await trigger();
            }}
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
            disabled={!isValid}
            onClick={onSave}
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default ExtensionEditStep2Form;

const schema = z.object({
  description: z
    .union([
      z
        .string()
        .trim()
        .min(30, { message: 'Must be at least 30 characters' })
        .max(2000, { message: 'Must be less than 2000 characters' }),
      z.string().length(0),
    ])
    .optional()
    .transform(e => (e === '' ? undefined : e)),
  nsfw: z.boolean().optional(),
  links: z
    .array(
      z.object({
        label: z
          .string()
          .trim()
          .min(4, { message: 'Must be at least 4 characters' })
          .max(24, { message: 'Must be less than 24 characters' }),
        href: z.string().url({ message: 'Must be URL' }),
      }),
    )
    .max(10, { message: 'Maximum 10 links' }),
});
