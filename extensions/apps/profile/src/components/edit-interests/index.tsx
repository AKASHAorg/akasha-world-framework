import React, { useCallback, useEffect, useState } from 'react';
import { apply, tw } from '@twind/core';
import { useTranslation } from 'react-i18next';
import { ProfileLabeled } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import AutoComplete from '@akashaorg/design-system-core/lib/components/AutoComplete';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import {
  CheckIcon,
  XMarkIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import Pill from '@akashaorg/design-system-core/lib/components/Pill';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import { ButtonType } from '@akashaorg/design-system-components/lib/components/types/common.types';
import UnsavedChangesModal from '@akashaorg/design-system-components/lib/components/UnsavedChangesModal';
import { useRootComponentProps } from '@akashaorg/ui-awf-hooks';

export type EditInterestsProps = {
  title: string;
  subTitle: string;
  description: string;
  moreInterestTitle: string;
  moreInterestDescription: string;
  moreInterestPlaceholder: string;
  myInterests: ProfileLabeled[];
  interests: ProfileLabeled[];
  labelType: string;
  maxInterestsErrorMessage: string;
  cancelButton: ButtonType;
  saveButton: {
    label: string;
    loading?: boolean;
    handleClick: (interests: ProfileLabeled[]) => void;
  };
  maxInterests: number;
  customStyle?: string;
  onFormDirty?: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Component used in the profile app to allow the user to select topics of interest
 * @param interests - array of available interests used for the autocomplete input
 * @param myInterests - list of user's already selected interests
 * @param maxInterests - limit of how many topics a user can choose
 * @param customStyle - the wrapper form can be customised through this
 */
const EditInterests: React.FC<EditInterestsProps> = ({
  title,
  subTitle,
  description,
  moreInterestTitle,
  moreInterestDescription,
  moreInterestPlaceholder,
  myInterests,
  interests,
  labelType,
  maxInterestsErrorMessage,
  cancelButton,
  saveButton,
  maxInterests,
  customStyle = '',
  onFormDirty,
}) => {
  const [query, setQuery] = useState('');
  const [myActiveInterests, setMyActiveInterests] = useState(new Set(myInterests));
  const [allMyInterests, setAllMyInterests] = useState(new Set(myInterests));
  const [tags, setTags] = useState(new Set<string>());
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const { t } = useTranslation('app-profile');
  const { singleSpa, cancelNavigation } = useRootComponentProps();

  useEffect(() => {
    setMyActiveInterests(new Set(myInterests));
    setAllMyInterests(new Set(myInterests));
  }, [myInterests]);

  const updateMyActiveInterests = (interest: ProfileLabeled, remove?: boolean) => {
    const newMyActiveInterests = new Set(myActiveInterests);
    if (remove) {
      newMyActiveInterests.delete(interest);
      setMyActiveInterests(newMyActiveInterests);
      return;
    }
    setMyActiveInterests(newMyActiveInterests.add(interest));
  };

  const updateAllMyInterests = (interest: ProfileLabeled) => {
    setAllMyInterests(new Set(allMyInterests).add(interest));
  };

  const onSave = (interests: ProfileLabeled[]) => {
    saveButton.handleClick(interests);
    setTags(null);
    setQuery('');
  };

  const tagsSize = tags?.size || 0;

  const isFormDirty =
    allMyInterests.size !== myInterests.length ||
    myActiveInterests.size !== myInterests.length ||
    tagsSize > 0 ||
    !!query;

  useEffect(() => {
    setIsDisabled(!isFormDirty);
    if (onFormDirty) onFormDirty(isFormDirty);
  }, [isFormDirty, onFormDirty]);

  const findInterest = useCallback(
    (value: string) => {
      return [...allMyInterests].find(
        interest => interest.value.toLowerCase() === value.toLocaleLowerCase(),
      );
    },
    [allMyInterests],
  );

  const getNewInterest = useCallback(() => {
    if (query) {
      const foundInterest = findInterest(query);
      if (!foundInterest) {
        return { value: query, labelType };
      }
    }
    return null;
  }, [query, labelType, findInterest]);

  const maximumInterestsSelected = myActiveInterests.size + tagsSize >= maxInterests;

  useEffect(() => {
    let navigationUnsubscribe: () => void;
    if (!isDisabled) {
      navigationUnsubscribe = cancelNavigation(!isDisabled, url => {
        setNewUrl(url);
      });
    }

    return () => {
      if (typeof navigationUnsubscribe === 'function') {
        navigationUnsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <form className={tw(apply`h-full ${customStyle}`)}>
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
      <Stack direction="column" justify="between" spacing="gap-y-11" customStyle="h-full">
        <Stack direction="column">
          <Stack direction="row" align="center" spacing="gap-x-1">
            <Text variant="h6">{title}</Text>
            <Text variant="footnotes2" color="grey7">
              {subTitle}
            </Text>
          </Stack>
          <Text variant="subtitle2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
            {description}
          </Text>
          <Stack direction="row" spacing="gap-2" customStyle="flex-wrap mt-2">
            {[...allMyInterests].map((interest, index) => (
              <Pill
                key={`${index}-${interest.value}`}
                label={interest.value}
                icon={myActiveInterests.has(interest) ? <CheckIcon /> : null}
                iconDirection="right"
                active={myActiveInterests.has(interest)}
                hover={
                  myActiveInterests.has(interest) ? { icon: <XMarkIcon />, active: false } : null
                }
                onPillClick={active => {
                  if (active) {
                    updateMyActiveInterests(interest);
                    return;
                  }
                  updateMyActiveInterests(interest, true);
                }}
                type="action"
              />
            ))}
          </Stack>
        </Stack>
        <Stack direction="column">
          <Text variant="h6">{moreInterestTitle}</Text>
          <Text variant="subtitle2" color={{ light: 'grey4', dark: 'grey6' }} weight="light">
            {moreInterestDescription}
          </Text>
          <AutoComplete
            value={query}
            options={interests.map(interest => interest.value)}
            placeholder={moreInterestPlaceholder}
            tags={tags}
            separators={['Comma', 'Space', 'Enter']}
            customStyle="grow mt-2"
            caption={maximumInterestsSelected ? maxInterestsErrorMessage : null}
            status={maximumInterestsSelected ? 'error' : null}
            onSelected={({ index }) => {
              updateMyActiveInterests(interests[index]);
              updateAllMyInterests(interests[index]);
              setQuery('');
            }}
            onChange={value => {
              if (typeof value === 'string') {
                setQuery(value);
                return;
              }
              setTags(new Set(value));
            }}
            disabled={maximumInterestsSelected}
            multiple
          />
        </Stack>
        <Stack direction="row" spacing="gap-x-2" customStyle="ml-auto mt-auto">
          <Button
            variant="text"
            label={cancelButton.label}
            onClick={cancelButton.handleClick}
            disabled={cancelButton.disabled}
          />
          <Button
            variant="primary"
            loading={saveButton.loading}
            label={saveButton.label}
            onClick={event => {
              event.preventDefault();
              const newInterest = getNewInterest();
              const newTags = tags
                ? [...tags]
                    .filter(tag => !findInterest(tag))
                    .map(tag => ({ value: tag, labelType }))
                : [];
              onSave(
                newInterest
                  ? [...myActiveInterests, ...newTags, newInterest]
                  : [...myActiveInterests, ...newTags],
              );
            }}
            disabled={!isFormDirty}
            type="submit"
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default EditInterests;
