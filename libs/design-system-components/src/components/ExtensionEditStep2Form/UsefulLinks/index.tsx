import React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { LinkElement } from './link-element';
import { PlusIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { Controller, Control, useFieldArray } from 'react-hook-form';
import { ExtensionEditStep2FormValues } from '..';

export type UsefulLinksProps = {
  usefulLinksTitleLabel: string;
  addNewLinkButtonLabel: string;
  usefulLinksDescriptionLabel: string;
  linkElementLabel?: string;
  linkTitlePlaceholderLabel?: string;
  customStyle?: string;
  control: Control<ExtensionEditStep2FormValues>;
  onDeleteLink: () => void;
};

export const UsefulLinks: React.FC<UsefulLinksProps> = ({
  usefulLinksTitleLabel,
  addNewLinkButtonLabel,
  usefulLinksDescriptionLabel,
  linkElementLabel,
  linkTitlePlaceholderLabel,
  customStyle = '',
  control,
  onDeleteLink,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'links' });

  const onAddNew = () => {
    if (fields?.length < 10) {
      append({ href: '', label: '' });
    }
  };

  return (
    <Stack direction="column" spacing="gap-y-4" customStyle={customStyle}>
      <Stack spacing="gap-y-1" direction="column">
        <Stack direction="row" spacing="gap-x-2" justify="between" align="center">
          <Text variant="h6">{usefulLinksTitleLabel}</Text>
          <Button
            variant="text"
            icon={<PlusIcon />}
            iconDirection="left"
            label={addNewLinkButtonLabel}
            onClick={onAddNew}
          />
        </Stack>
        <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
          {usefulLinksDescriptionLabel}
        </Text>
      </Stack>
      {fields?.map((link, index) => {
        return (
          <Controller
            key={link.id}
            control={control}
            name={`links.${index}`}
            render={({ field: { value, onChange, ref }, fieldState: { error } }) => (
              <LinkElement
                linkElementLabel={linkElementLabel}
                linkTitlePlaceholder={linkTitlePlaceholderLabel}
                onDelete={() => {
                  remove(index);
                  onDeleteLink();
                }}
                value={{ ...value, _id: index + 1 }}
                onChange={onChange}
                error={error as unknown}
                inputRef={ref}
              />
            )}
            shouldUnregister={true}
            defaultValue={link}
          />
        );
      })}
    </Stack>
  );
};
