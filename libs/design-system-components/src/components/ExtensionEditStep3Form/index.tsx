import React, { SyntheticEvent, useMemo, useState } from 'react';
import * as z from 'zod';
import { Controller, useWatch } from 'react-hook-form';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import TextField from '@akashaorg/design-system-core/lib/components/TextField';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Spinner from '@akashaorg/design-system-core/lib/components/Spinner';
import Divider from '@akashaorg/design-system-core/lib/components/Divider';
import DropDown from '@akashaorg/design-system-core/lib/components/Dropdown';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import AutoComplete from '@akashaorg/design-system-core/lib/components/AutoComplete';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import StackedAvatar from '@akashaorg/design-system-core/lib/components/StackedAvatar';
import { apply, tw } from '@twind/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonType } from '../types/common.types';
import { Licenses } from '../AppCreationForm';
import { AkashaProfile, Image } from '@akashaorg/typings/lib/ui';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ApolloError } from '@apollo/client';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';

const MAX_TAGS = 4;

const MIN_TAG_CHARACTERS = 3;

export enum FieldName {
  license = 'license',
  licenseOther = 'licenseOther',
  keywords = 'keywords',
}

export type ExtensionEditStep3FormValues = {
  license?: string;
  licenseOther?: string;
  contactInfo?: string[];
  keywords?: string[];
};

export type ExtensionEditStep3FormProps = {
  licenseFieldLabel?: string;
  licenseOtherPlaceholderLabel?: string;
  collaboratorsFieldLabel?: string;
  collaboratorsDescriptionLabel?: string;
  moreLabel?: string;
  addLabel?: string;
  addAndEditLabel?: string;
  tagsLabel?: string;
  tagsDescriptionLabel?: string;
  addTagsPlaceholderLabel?: string;
  tagsAddedLabel?: string;
  noteLabel?: string;
  noteDescriptionLabel?: string;
  errorProfilesDataLabel?: string;
  defaultValues?: ExtensionEditStep3FormValues;
  contributorsProfiles?: AkashaProfile[];
  errorProfilesData?: ApolloError;
  loadingProfilesData?: boolean;
  cancelButton: ButtonType;
  nextButton: {
    label: string;
    handleClick: (data: ExtensionEditStep3FormValues) => void;
  };
  handleNavigateToContributorsPage?: (data: ExtensionEditStep3FormValues) => void;
  transformSource: (src: Image) => Image;
};

const ExtensionEditStep3Form: React.FC<ExtensionEditStep3FormProps> = props => {
  const {
    defaultValues = {
      license: '',
      licenseOther: '',
      contactInfo: [],
      keywords: [],
    },
    contributorsProfiles,
    loadingProfilesData,
    errorProfilesData,
    cancelButton,
    nextButton,
    handleNavigateToContributorsPage,
    transformSource,
    licenseFieldLabel,
    licenseOtherPlaceholderLabel,
    collaboratorsFieldLabel,
    collaboratorsDescriptionLabel,
    moreLabel,
    addLabel,
    addAndEditLabel,
    tagsLabel,
    addTagsPlaceholderLabel,
    tagsDescriptionLabel,
    tagsAddedLabel,
    noteLabel,
    noteDescriptionLabel,
    errorProfilesDataLabel,
  } = props;

  const {
    control,
    getValues,
    formState: { errors },
  } = useForm<Omit<ExtensionEditStep3FormValues, 'keywords'> & { keywords?: string | string[] }>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const licenses: Licenses | string[] = [
    Licenses.MIT,
    Licenses.GPL,
    Licenses.APACHE,
    Licenses.BSD,
    Licenses.MPL,
    Licenses.OTHER,
  ];

  const isValid = !Object.keys(errors).length;

  const licenseValue = useWatch({ control, name: FieldName.license });

  const [keywords, setKeywords] = useState(new Set(defaultValues.keywords));

  const maxTagsSelected = keywords.size >= MAX_TAGS;

  const contributorAvatars = useMemo(() => {
    if (contributorsProfiles?.length) {
      return contributorsProfiles
        .filter(contrib => !!contrib)
        .map(contrib => {
          return {
            ...contrib,
            avatar: transformSource(contrib.avatar?.default),
          };
        });
    }
  }, [contributorsProfiles, transformSource]);

  //@TODO: here it should be a list of available indexed keywords for extensions
  const availableKeywords = [];

  const onSave = (event: SyntheticEvent) => {
    event.preventDefault();
    const formValues = getValues();

    if (formValues.license === Licenses.OTHER) {
      formValues.license = formValues.licenseOther;
    }

    if (isValid) {
      nextButton.handleClick({
        ...formValues,
        keywords: [...keywords]?.filter(keyword => keyword),
      });
    }
  };

  const handleAddContributors = () => {
    const formValues = getValues();

    if (formValues.license === Licenses.OTHER) {
      formValues.license = formValues.licenseOther;
    }

    if (isValid) {
      handleNavigateToContributorsPage({
        ...formValues,
        keywords: [...keywords]?.filter(keyword => keyword),
      });
    }
  };

  return (
    <form onSubmit={onSave} className={tw(apply`h-full`)}>
      <Stack direction="column" spacing="gap-y-4">
        <Stack padding="px-4 pb-16" spacing="gap-y-4">
          <Controller
            control={control}
            name={FieldName.license}
            render={({ field: { name, value, onChange } }) => (
              <DropDown
                label={licenseFieldLabel}
                name={name}
                selected={value}
                menuItems={licenses}
                setSelected={onChange}
                required={true}
              />
            )}
            defaultValue={
              licenses.includes(defaultValues.license) ? defaultValues.license : Licenses.OTHER
            }
          />
          {licenseValue === Licenses.OTHER && (
            <Controller
              control={control}
              name={FieldName.licenseOther}
              render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
                <TextField
                  id={name}
                  customStyle="mt-2"
                  value={value}
                  placeholder={licenseOtherPlaceholderLabel}
                  type={'text'}
                  caption={error?.message}
                  status={error?.message ? 'error' : null}
                  onChange={onChange}
                  inputRef={ref}
                  required={true}
                />
              )}
              defaultValue={licenses.includes(defaultValues.license) ? '' : defaultValues.license}
            />
          )}
          <Divider />
          <Stack direction="column" spacing="gap-y-4">
            <Stack spacing="gap-y-1" direction="column">
              <Stack direction="row" spacing="gap-x-2" justify="between" align="center">
                <Text variant="h6">{collaboratorsFieldLabel}</Text>
                <Button
                  variant="text"
                  icon={<PlusIcon />}
                  iconDirection="left"
                  label={contributorsProfiles.length > 0 ? addAndEditLabel : addLabel}
                  onClick={handleAddContributors}
                />
              </Stack>
              <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
                {collaboratorsDescriptionLabel}
              </Text>
            </Stack>
            {loadingProfilesData && <Spinner />}
            {errorProfilesData && (
              <Stack>
                <ErrorLoader
                  type="script-error"
                  title={errorProfilesDataLabel}
                  details={errorProfilesData.message}
                />
              </Stack>
            )}
            {contributorAvatars?.length > 0 && (
              <Stack direction="row" spacing="gap-2" align="center">
                <StackedAvatar userData={contributorAvatars} maxAvatars={3} size="md" />
                <Stack align="center" justify="center">
                  <Text variant="body2" weight="bold">
                    {contributorsProfiles[0]?.name}
                  </Text>
                  {contributorsProfiles?.length > 1 && (
                    <Text
                      variant="footnotes2"
                      color={{ light: 'grey4', dark: 'grey6' }}
                      weight="light"
                    >{`+${contributorsProfiles?.length - 1} ${moreLabel}`}</Text>
                  )}
                </Stack>
              </Stack>
            )}
          </Stack>

          <Divider />

          <Stack direction="column" spacing="gap-2">
            <Text variant="h6">{tagsLabel}</Text>
            <Text variant="subtitle2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
              {tagsDescriptionLabel}
            </Text>
            <Controller
              control={control}
              name={FieldName.keywords}
              render={({ field: { value, onChange }, fieldState: { error } }) => {
                const errorMessage = error?.message ?? '';
                return (
                  <AutoComplete
                    value={typeof value === 'string' ? value : ''}
                    options={availableKeywords}
                    placeholder={addTagsPlaceholderLabel}
                    tags={keywords}
                    caption={errorMessage ? errorMessage : ''}
                    status={errorMessage ? 'error' : null}
                    separators={['Comma', 'Space', 'Enter']}
                    customStyle="grow mt-2"
                    onSelected={({ index }) => {
                      const newKeyWords = keywords.add(availableKeywords[index]);
                      onChange([...newKeyWords]);
                      setKeywords(newKeyWords);
                    }}
                    onChange={value => {
                      onChange(value);
                      if (Array.isArray(value)) {
                        if (!errorMessage) setKeywords(new Set(value));
                      }
                    }}
                    disabled={maxTagsSelected}
                    multiple
                  />
                );
              }}
            />

            <Text variant="subtitle2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
              {`${keywords.size}/${MAX_TAGS} ${tagsAddedLabel}`}
            </Text>
          </Stack>
          <Divider />
          <Stack direction="column" spacing="gap-2">
            <Stack direction="row" align="center" spacing="gap-x-1">
              <Icon
                icon={<ExclamationTriangleIcon />}
                size="sm"
                color={{ light: 'warningLight', dark: 'warningDark' }}
              />
              <Text variant="button-md">{noteLabel}</Text>
            </Stack>
            <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
              {noteDescriptionLabel}
            </Text>
          </Stack>
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

export default ExtensionEditStep3Form;

const schema = z.object({
  extensionLicense: z.string(),
  keywords: z
    .array(z.string())
    .optional()
    .or(
      z
        .string()
        .min(MIN_TAG_CHARACTERS, {
          message: `Tags must be at least ${MIN_TAG_CHARACTERS} characters long.`,
        })
        .or(z.literal('')),
    ),
});
