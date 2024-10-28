import React, { SyntheticEvent, useMemo } from 'react';
import * as z from 'zod';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { SocialLinks, SocialLinksProps } from './SocialLinks';
import { apply, tw } from '@twind/core';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { General, GeneralProps } from './General';
import {
  EditProfileFormValues,
  isFormExcludingAllExceptLinksDirty,
  isFormWithExceptionOfLinksDirty,
} from './types';
import { ButtonType } from '../types/common.types';
import { InputType, NSFW } from '../NSFW';
import { PublishProfileData } from '@akashaorg/typings/lib/ui';

const MIN_NAME_CHARACTERS = 3;

const MAX_NAME_CHARACTERS = 50;

type SocialLinkFormProps = Pick<
  SocialLinksProps,
  'linkLabel' | 'addNewLinkButtonLabel' | 'description'
>;

type GeneralFormProps = Pick<GeneralProps, 'header' | 'name' | 'bio'>;

export type EditProfileProps = {
  defaultValues?: PublishProfileData;
  cancelButton: ButtonType;
  saveButton: {
    label: string;
    loading?: boolean;
    handleClick: (formValues: PublishProfileData) => void;
  };
  customStyle?: string;
  nsfwFieldLabel?: string;
  nsfw?: InputType;
} & GeneralFormProps &
  SocialLinkFormProps;

const EditProfile: React.FC<EditProfileProps> = ({
  defaultValues = {
    avatar: null,
    coverImage: null,
    name: '',
    bio: '',
    nsfw: false,
    links: [],
  },
  cancelButton,
  saveButton,
  customStyle = '',
  nsfw,
  nsfwFieldLabel,
  header,
  name,
  bio,
  description,
  linkLabel,
  addNewLinkButtonLabel,
}) => {
  const { control, setValue, getValues, formState } = useForm<EditProfileFormValues>({
    defaultValues: {
      ...defaultValues,
      links: defaultValues.links.map(link => ({ id: crypto.randomUUID(), href: link })),
    },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  const { dirtyFields, errors } = formState;

  const links = useWatch({ name: 'links', control });

  const formExcludingAllExceptLinksDirty = useMemo(() => {
    return isFormExcludingAllExceptLinksDirty(dirtyFields.links, links, defaultValues.links.length);
  }, [defaultValues.links.length, links, dirtyFields.links]);

  //dirty check for links should be done different than all other fields as it requires more check than what react hook form library can do
  const isFormDirty =
    isFormWithExceptionOfLinksDirty(dirtyFields) || formExcludingAllExceptLinksDirty;

  const isValid = !Object.keys(errors).length;

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();

    if (isValid && isFormDirty) {
      saveButton.handleClick({
        ...formValues,
        links: formValues.links?.map(link => link.href)?.filter(link => link) || [],
      });
    }
  };

  return (
    <form data-testid="edit-profile" onSubmit={onSave} className={tw(apply`h-full ${customStyle}`)}>
      <Stack direction="column" spacing="gap-y-6">
        <General
          header={header}
          name={name}
          bio={bio}
          control={control}
          onAvatarChange={avatar => {
            setValue('avatar', avatar, { shouldDirty: true });
          }}
          onCoverImageChange={coverImage => {
            setValue('coverImage', coverImage, { shouldDirty: true });
          }}
        />
        <SocialLinks
          linkLabel={linkLabel}
          addNewLinkButtonLabel={addNewLinkButtonLabel}
          description={description}
          control={control}
        />
        <NSFW
          nsfw={nsfw}
          nsfwFieldLabel={nsfwFieldLabel}
          control={control}
          name={'nsfw'}
          disabled={nsfw.initialValue}
          defaultValue={nsfw.initialValue}
        />
        <Stack direction="row" spacing="gap-x-2" customStyle="ml-auto mt-auto">
          <Button
            variant="text"
            label={cancelButton.label}
            onClick={cancelButton.handleClick}
            disabled={cancelButton.disabled}
          />
          <Button
            variant="primary"
            label={saveButton.label}
            loading={saveButton.loading}
            disabled={isValid ? !isFormDirty : true}
            onClick={onSave}
            type="submit"
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default EditProfile;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_CHARACTERS, { message: `Must be at least ${MIN_NAME_CHARACTERS} characters` })
    .max(MAX_NAME_CHARACTERS, { message: `Must be maximum of ${MAX_NAME_CHARACTERS} characters` })
    .refine(
      value => /^[a-zA-Z0-9-_.]+$/.test(value),
      'Name should contain only alphabets, numbers or -_.',
    ),
  avatar: z.any().optional(),
  coverImage: z.any().optional(),
  ens: z.string().optional(),
  bio: z.string().optional(),
  nsfw: z.boolean().optional(),
  links: z
    .array(
      z.object({
        id: z.string(),
        href: z
          .string()
          .url({
            message: `Hmm this doesn't look like a URL 🤔`,
          })
          .or(z.literal('')),
      }),
    )
    .optional(),
});
