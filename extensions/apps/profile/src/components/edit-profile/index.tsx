import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import * as z from 'zod';
import { apply, tw } from '@twind/core';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublishProfileData } from '@akashaorg/typings/lib/ui';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import { InputType, NSFW } from '@akashaorg/design-system-components/lib/components/NSFW';
import UnsavedChangesModal from '@akashaorg/design-system-components/lib/components/UnsavedChangesModal';
import { ButtonType } from '@akashaorg/design-system-components/lib/components/types/common.types';
import { General, GeneralProps } from './General';
import { SocialLinks, SocialLinksProps } from './SocialLinks';
import { isFormExcludingAllExceptLinksDirty, isFormWithExceptionOfLinksDirty } from './utils';
import { EditProfileFormValues } from './types';

const MIN_NAME_CHARACTERS = 3;

const MAX_NAME_CHARACTERS = 50;

type SocialLinkFormProps = Pick<
  SocialLinksProps,
  'linkLabel' | 'addNewLinkButtonLabel' | 'description'
>;

type GeneralFormProps = Pick<GeneralProps, 'header' | 'name' | 'bio'>;

export type EditProfileProps = {
  defaultValues?: PublishProfileData;
  /**
   * modifying the handleClick to have an optional 'canSave' param.
   * This determines when the cancel button click handler should show the unsaved changes modal.
   */
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
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const { t } = useTranslation('app-profile');
  const { singleSpa, getCorePlugins } = useRootComponentProps();
  const {
    control,
    setValue,
    getValues,
    formState: { dirtyFields, errors },
  } = useForm<EditProfileFormValues>({
    defaultValues: {
      ...defaultValues,
      links: defaultValues.links.map(link => ({ id: crypto.randomUUID(), href: link })),
    },
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const links = useWatch({ name: 'links', control });

  const formExcludingAllExceptLinksDirty = useMemo(() => {
    return isFormExcludingAllExceptLinksDirty(dirtyFields.links, links, defaultValues.links.length);
  }, [defaultValues.links.length, links, dirtyFields.links]);

  //dirty check for links should be done different than all other fields as it requires more check than what react hook form library can do
  const isFormDirty =
    isFormWithExceptionOfLinksDirty(dirtyFields) || formExcludingAllExceptLinksDirty;

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();

    if (isFormValid && isFormDirty) {
      saveButton.handleClick({
        ...formValues,
        links: formValues.links?.map(link => link.href?.trim())?.filter(link => link) || [],
      });
      // reset state, to prevent re-triggering unsaved changes modal
      setIsDisabled(true);
    }
  };

  useEffect(() => {
    const isValid = !Object.keys(errors).length;
    const buttonDisabled = isValid ? !isFormDirty : true;
    setIsFormValid(isValid);
    setIsDisabled(buttonDisabled);
  }, [dirtyFields, errors, isFormDirty]);

  useEffect(() => {
    let navigationSubscribe: () => void;
    if (!isDisabled) {
      navigationSubscribe = getCorePlugins().routing.cancelNavigation(!isDisabled, url => {
        setNewUrl(url);
      });
    }

    return () => {
      if (typeof navigationSubscribe === 'function') {
        navigationSubscribe();
      }
    };
  }, [isDisabled]);

  const handleLeavePage = () => {
    // reset states
    setIsDisabled(true);
    setNewUrl(null);
    // navigate away from editor to the desired url using singleSpa.
    singleSpa.navigateToUrl(newUrl);
  };

  const handleModalClose = () => setNewUrl(null);

  return (
    <form data-testid="edit-profile" onSubmit={onSave} className={tw(apply`h-full ${customStyle}`)}>
      {!!newUrl && (
        <UnsavedChangesModal
          showModal={!!newUrl}
          cancelButtonLabel={t('Cancel')}
          leavePageButtonLabel={t('Leave page')}
          title={t('Unsaved changes')}
          description={t(
            "Are you sure you want to leave this page? The changes you've made will not be saved.",
          )}
          handleModalClose={handleModalClose}
          handleLeavePage={handleLeavePage}
        />
      )}
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
            disabled={isDisabled}
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
