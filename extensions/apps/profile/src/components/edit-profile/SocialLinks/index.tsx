import React from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { SocialLink } from './social-link';
import { PlusIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { Controller, Control, useFieldArray } from 'react-hook-form';
import { EditProfileFormValues } from '../types';

export type SocialLinksProps = {
  linkLabel: string;
  addNewLinkButtonLabel: string;
  control: Control<EditProfileFormValues>;
  description: string;
  customStyle?: string;
};

export const SocialLinks: React.FC<SocialLinksProps> = ({
  linkLabel,
  addNewLinkButtonLabel,
  description,
  control,
  customStyle = '',
}) => {
  const { fields, append, remove } = useFieldArray({ name: 'links', control });

  const onAddNew = () => {
    append({ id: crypto.randomUUID(), href: '' });
  };

  return (
    <Stack direction="column" spacing="gap-y-4" customStyle={customStyle}>
      <Stack spacing="gap-y-1" direction="column">
        <Stack direction="row" spacing="gap-x-2" justify="between" align="center">
          <Text variant="h6">{linkLabel}</Text>
          <Button
            variant="text"
            icon={<PlusIcon />}
            iconDirection="left"
            label={addNewLinkButtonLabel}
            onClick={onAddNew}
          />
        </Stack>
        <Text variant="body2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
          {description}
        </Text>
      </Stack>
      {fields.map((link, index) => {
        const defaultValue = link.href ? { defaultValue: link.href } : {};
        return (
          <Controller
            key={link.id}
            control={control}
            name={`links.${index}.href`}
            render={({ field: { name, value, onChange, ref }, fieldState: { error } }) => (
              <SocialLink
                type="text"
                onDelete={() => {
                  const foundIndex = fields.findIndex(field => field.id === link.id);
                  if (foundIndex !== -1) remove(foundIndex);
                }}
                aria-label={`link.${index}`}
                name={name}
                value={value || ''}
                caption={error?.message}
                status={error?.message ? 'error' : null}
                onChange={onChange}
                inputRef={ref}
              />
            )}
            {...defaultValue}
            shouldUnregister={true}
          />
        );
      })}
    </Stack>
  );
};
