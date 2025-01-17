import React from 'react';
import Text from '@akashaorg/design-system-core/lib/components/Text';

export type NoItemFoundProps = {
  title: string;
};

export const NoItemFound: React.FC<NoItemFoundProps> = ({ title }) => (
  <Text variant="subtitle2">{title}</Text>
);
