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
import { Header, HeaderProps } from '../ExtensionEditStep1Form/Header/index';
import { UsefulLinks } from '../ExtensionEditStep2Form/UsefulLinks';
import { Gallery, GalleryProps } from '../ExtensionEditStep2Form/Gallery';
import { Image } from '@akashaorg/typings/lib/ui';
import {
  AkashaAppApplicationType,
  AppImageSource,
  AppLinkSource,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import Accordion from '@akashaorg/design-system-core/lib/components/Accordion';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export enum FieldName {
  logoImage = 'logoImage',
  coverImage = 'coverImage',
  description = 'description',
  gallery = 'gallery',
  links = 'links',
}

export type ExtensionEditPublishedFormValues = {
  logoImage?: Image | File | null;
  coverImage?: Image | File | null;
  description?: string;
  gallery?: AppImageSource[];
  links?: (AppLinkSource & { _id?: number })[];
};

export type ExtensionEditPublishedFormProps = {
  header: Omit<HeaderProps, 'onLogoImageChange' | 'onCoverImageChange'>;
  defaultValues?: ExtensionEditPublishedFormValues;
  displayOnlyValues?: {
    name: string;
    displayName: string;
    license: string;
    applicationType: AkashaAppApplicationType;
    nsfw: boolean;
  };
  cancelButton: ButtonType;
  nextButton: {
    label: string;
    handleClick: (data: ExtensionEditPublishedFormValues) => void;
  };
  loading?: boolean;
  extensionInformationLabel?: string;
  extensionInformationDescriptionLabel?: string;
  extensionIdLabel?: string;
  extensionDisplayNameLabel?: string;
  extensionLicenseLabel?: string;
  descriptionFieldLabel?: string;
  descriptionPlaceholderLabel?: string;
  usefulLinksFieldLabel?: string;
  usefulLinksDescriptionLabel?: string;
  linkTitleLabel?: string;
  linkPlaceholderLabel?: string;
  handleManageGalleryClick?: (formData: ExtensionEditPublishedFormValues) => void;
} & Omit<GalleryProps, 'handleMediaClick'>;

const ExtensionEditPublishedForm: React.FC<ExtensionEditPublishedFormProps> = props => {
  const {
    header,
    defaultValues,
    displayOnlyValues,
    cancelButton,
    nextButton,
    loading,
    extensionInformationLabel,
    extensionInformationDescriptionLabel,
    extensionIdLabel,
    extensionDisplayNameLabel,
    extensionLicenseLabel,
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
    handleManageGalleryClick,
  } = props;

  const {
    control,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<ExtensionEditPublishedFormValues>({
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

  const [showAccordion, setShowAccordion] = useState(false);

  const handleToggleAccordion = () => {
    setShowAccordion(!showAccordion);
  };

  return (
    <form onSubmit={onSave} className={tw(apply`h-full`)}>
      <Stack direction="column" spacing="gap-y-4">
        <Stack padding="p-4">
          <Header
            {...header}
            extensionType={displayOnlyValues.applicationType}
            nsfw={displayOnlyValues.nsfw}
            onLogoImageChange={logoImage => {
              setValue('logoImage', logoImage, { shouldDirty: true });
            }}
            onCoverImageChange={coverImage => {
              setValue('coverImage', coverImage, { shouldDirty: true });
            }}
          />
          <Divider />
        </Stack>

        <Stack padding="px-4 pb-16" spacing="gap-y-4">
          <Accordion
            accordionId={extensionInformationLabel}
            open={showAccordion}
            titleNode={
              <Text variant="h6" weight="bold">
                {extensionInformationLabel}
              </Text>
            }
            contentNode={
              <Stack>
                <Text variant="footnotes2" color={{ light: 'grey4', dark: 'grey6' }}>
                  {extensionInformationDescriptionLabel}
                </Text>
                <Stack spacing="gap-y-4" padding={'pt-4'}>
                  <Stack spacing="gap-y-2">
                    <Text variant="h6" weight="bold">
                      {extensionIdLabel}
                    </Text>
                    <Text variant="body2">{displayOnlyValues?.name}</Text>
                  </Stack>
                  <Divider />
                  <Stack spacing="gap-y-2">
                    <Text variant="h6" weight="bold">
                      {extensionDisplayNameLabel}
                    </Text>
                    <Text variant="body2">{displayOnlyValues?.displayName}</Text>
                  </Stack>
                  <Divider />
                  <Stack spacing="gap-y-2">
                    <Text variant="h6" weight="bold">
                      {extensionLicenseLabel}
                    </Text>
                    <Text variant="body2">{displayOnlyValues?.license}</Text>
                  </Stack>
                </Stack>
              </Stack>
            }
            handleClick={handleToggleAccordion}
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
            handleMediaClick={() => handleManageGalleryClick(getValues())}
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
            loading={loading}
            disabled={!isValid || loading}
            onClick={onSave}
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default ExtensionEditPublishedForm;

const schema = z.object({
  logoImage: z.any().optional(),
  coverImage: z.any().optional(),
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
