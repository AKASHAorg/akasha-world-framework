import React, { useMemo } from 'react';
import Card from '@akashaorg/design-system-core/lib/components/Card';
import Text, { TextProps } from '@akashaorg/design-system-core/lib/components/Text';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import ErrorIcon from './error-icon';
import InstallIcon from './install-icon';
import SuccessIcon from './success-icon';
import { getColorClasses } from '@akashaorg/design-system-core/lib/utils';
import { apply, tw } from '@twind/core';
import AppAvatar from '@akashaorg/design-system-core/lib/components/AppAvatar';
import {
  AkashaAppApplicationType,
  AppImageSource,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import AppIcon from '@akashaorg/design-system-core/lib/components/AppIcon';
import {
  Akasha,
  Walletconnect,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import IndicatorDots from '../IndicatorDots';

export type InstallAppProps = {
  title: string;
  appName: string;
  appAvatar?: AppImageSource;
  appType: AkashaAppApplicationType;
  publisherName?: string;
  publisherDID: string;
  progressInfo: string;
  status: 'in-progress' | 'error' | 'complete' | 'authorize-request';
  actions?: { label: string; onClick: () => void }[];
  successLabel: string;
};

const errorStyle = getColorClasses({ light: 'errorLight', dark: 'errorDark' }, '[&>*]:fill');
const errorAnimationStyle = `animate-ping absolute h-full w-full ${errorStyle} opacity-75`;

const installStyle = `animate-bounce ${getColorClasses(
  { light: 'secondaryLight', dark: 'secondaryDark' },
  '[&>*]:fill',
)}`;

const successStyle = getColorClasses('success', '[&>*]:fill');
const successAnimationStyle = `animate-ping absolute h-full w-full ${successStyle} opacity-75`;

const TruncateText = ({
  text,
  visibleCount,
  textProps,
}: {
  text: string;
  visibleCount: number;
  textProps: TextProps;
}) => {
  const [first, last] = useMemo(() => {
    return [text.slice(0, text.length - visibleCount), text.slice(text.length - visibleCount)];
  }, [text, visibleCount]);

  return (
    <Text {...textProps} customStyle={`${textProps.customStyle} flex`}>
      <span
        title={text}
        className="max-w-[20ch] md:max-w-[30ch] overflow-hidden truncate inline-block"
      >
        {first}
      </span>
      <span className="inline-block">{last}</span>
    </Text>
  );
};

const InstallApp = ({
  title,
  appName,
  appAvatar,
  appType,
  publisherName,
  publisherDID,
  progressInfo,
  status,
  actions = [],
  successLabel = 'Success',
}: InstallAppProps) => {
  return (
    <Card padding="p-6">
      <Stack align="center" direction="column" spacing="gap-y-8">
        <Text variant="h5">{title}</Text>
        <Stack
          direction="row"
          spacing="gap-x-4"
          padding={{ x: 8, y: 10 }}
          background={{ light: 'grey9', dark: 'grey3' }}
          customStyle="rounded-xl"
        >
          <AppAvatar appType={appType} avatar={appAvatar} width={4} height={4} />
          <Stack direction="column" justify="between">
            <Text variant="button-lg">{appName}</Text>
            <Stack>
              <Text variant="footnotes2">{publisherName}</Text>
              <TruncateText
                text={publisherDID}
                visibleCount={6}
                textProps={{
                  variant: 'footnotes2',
                  color: { light: 'secondaryLight', dark: 'secondaryDark' },
                }}
              />
            </Stack>
          </Stack>
        </Stack>
        <Stack direction="column" customStyle="max-w-xs">
          <Stack align="center" direction="column" spacing="gap-y-4">
            {status === 'authorize-request' && (
              <Stack direction="row" align="center" justify="center">
                <AppIcon
                  placeholderIcon={<Walletconnect />}
                  background={{ gradient: 'gradient-to-b', from: 'orange-50', to: 'orange-200' }}
                  radius={24}
                  size={{ width: 40, height: 40 }}
                  backgroundSize={40}
                  iconColor="self-color"
                />
                <IndicatorDots size="sm" />
                <AppIcon
                  placeholderIcon={<Akasha />}
                  solid={true}
                  background={{ gradient: 'gradient-to-b', from: 'blue-200', to: 'red-200' }}
                  radius={8}
                  size={{ width: 24, height: 24 }}
                  backgroundSize={40}
                  iconColor="black"
                />
              </Stack>
            )}
            {status === 'error' && (
              <div className={tw('relative')}>
                <ErrorIcon className={tw(apply`${errorAnimationStyle}`)} />
                <ErrorIcon className={tw(apply`${errorStyle}`)} />
              </div>
            )}
            {status === 'in-progress' && <InstallIcon className={installStyle} />}
            {status === 'complete' && (
              <Stack direction="row" spacing="gap-x-4" align="center">
                <div className={tw('relative')}>
                  <SuccessIcon className={tw(apply`${successAnimationStyle}`)} />
                  <SuccessIcon className={tw(apply`${successStyle}`)} />
                </div>
                <Text color="success" variant="button-lg">
                  {successLabel}
                </Text>
              </Stack>
            )}
            <Text
              align="center"
              variant="subtitle1"
              weight="light"
              color={{ light: 'grey4', dark: 'grey6' }}
            >
              {progressInfo}
            </Text>
          </Stack>
        </Stack>
        <Stack>
          {actions.map(action => (
            <Button
              key={action.label}
              label={action.label}
              onClick={action.onClick}
              variant="text"
              size="lg"
            />
          ))}
        </Stack>
      </Stack>
    </Card>
  );
};

export default InstallApp;
