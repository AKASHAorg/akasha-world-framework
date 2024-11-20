import React from 'react';
import AppList from '@akashaorg/design-system-components/lib/components/AppList';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import ExtensionCard, {
  ExtensionCardProps,
} from '@akashaorg/design-system-core/lib/components/ExtensionCard';
import { ReactNode } from '@tanstack/react-router';

export type TExploreProps = {
  titleLabel: string;
  popularExtensions?: ExtensionCardProps[];
  popularExtensionsLabel: string;
  viewAllLabel: string;
  cta: {
    title: string;
    description: string;
    action: ReactNode;
  };
  onViewAllClick: () => void;
};

export const Explore: React.FC<TExploreProps> = props => {
  const {
    titleLabel,
    popularExtensions,
    popularExtensionsLabel,
    viewAllLabel,
    cta,
    onViewAllClick,
  } = props;

  return (
    <Stack spacing="gap-y-4" customStyle="mb-2">
      <Text variant="h5">{titleLabel}</Text>
      {popularExtensions?.length > 0 && (
        <ExtensionCard
          coverImageSrc={popularExtensions[0]?.coverImageSrc}
          displayName={popularExtensions[0]?.displayName}
          applicationType={popularExtensions[0]?.applicationType}
          author={popularExtensions[0]?.author}
          description={popularExtensions[0]?.description}
          featured={true}
          action={popularExtensions[0]?.action}
        />
      )}
      {popularExtensions?.length > 1 && (
        <Stack spacing="gap-y-4">
          <Stack direction="row" align="center" spacing="gap-x-2">
            <Text variant="h6">{popularExtensionsLabel}</Text>
            <Button
              variant="text"
              size="md"
              label={viewAllLabel}
              onClick={onViewAllClick}
              customStyle="ml-auto"
            />
          </Stack>
          <AppList apps={popularExtensions.slice(1)} onLoadMore={() => null} />
        </Stack>
      )}
      <Card padding="p-4">
        <Stack spacing="gap-y-3">
          <Text variant="h6">{cta.title}</Text>
          <Text variant="body2">{cta.description}</Text>
          {cta.action}
        </Stack>
      </Card>
    </Stack>
  );
};
