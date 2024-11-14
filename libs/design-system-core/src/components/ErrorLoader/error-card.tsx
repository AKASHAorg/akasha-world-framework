import React from 'react';
import { tw } from '@twind/core';
import Image from '../Image';
import Stack from '../Stack';
import Text from '../Text';
import { ErrorLoaderProps } from '.';

const ErrorCard: React.FC<
  React.PropsWithChildren<ErrorLoaderProps & { imageSrc: string }>
> = props => {
  const { children, imageSrc, title, details, imageBoxStyle = 'w-48 h-48' } = props;

  return (
    <Stack spacing="gap-y-4" align="center">
      <Image
        src={imageSrc}
        loading="lazy"
        decoding="async"
        alt="error-card"
        className={tw(imageBoxStyle)}
      />

      <Stack spacing="gap-y-1" align="center">
        {typeof title === 'object' ? (
          <>{title}</>
        ) : (
          <Text variant="h5" align="center" selectable={false}>
            {title}
          </Text>
        )}
        {details && (
          <>
            {typeof details === 'object' ? (
              <>{details}</>
            ) : (
              <Text variant="body2" selectable={false}>
                {details}
              </Text>
            )}
          </>
        )}
      </Stack>
      {children}
    </Stack>
  );
};

export default ErrorCard;
