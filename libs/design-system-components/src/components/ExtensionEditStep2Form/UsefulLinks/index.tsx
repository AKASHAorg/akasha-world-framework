import React, { useState } from 'react';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { LinkElement } from './link-element';
import { PlusIcon } from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import { AppLinkSource } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { Controller, Control } from 'react-hook-form';
import { ExtensionEditStep2FormValues } from '..';

export type UsefulLinksProps = {
  usefulLinksTitleLabel: string;
  addNewLinkButtonLabel: string;
  usefulLinksDescriptionLabel: string;
  linkElementLabel?: string;
  linkTitlePlaceholderLabel?: string;
  customStyle?: string;
  control: Control<ExtensionEditStep2FormValues>;
  usefulLinks: (AppLinkSource & { _id?: number })[];
  onDeleteLink: () => void;
};

export const UsefulLinks: React.FC<UsefulLinksProps> = ({
  usefulLinksTitleLabel,
  addNewLinkButtonLabel,
  usefulLinksDescriptionLabel,
  linkElementLabel,
  linkTitlePlaceholderLabel,
  usefulLinks,
  customStyle = '',
  control,
  onDeleteLink,
}) => {
  const [links, setLinks] = useState(
    !usefulLinks || usefulLinks?.length === 0 ? [{ _id: 1, href: '', label: '' }] : usefulLinks,
  );

  const onAddNew = () => {
    if (links?.length < 10) {
      setLinks(prev => {
        return [...prev, { _id: prev?.length + 1, href: '', label: '' }];
      });
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
      {links?.map((link, index) => {
        return (
          <Controller
            key={link._id}
            control={control}
            name={`links.${index}`}
            render={({ field: { value, onChange } }) => (
              <LinkElement
                linkElementLabel={linkElementLabel}
                linkTitlePlaceholder={linkTitlePlaceholderLabel}
                onDelete={() => {
                  setLinks(links.filter(_link => _link._id !== link._id));
                  onDeleteLink();
                }}
                value={value}
                onChange={onChange}
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