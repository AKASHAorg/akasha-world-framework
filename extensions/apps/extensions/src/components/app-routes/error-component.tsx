import React from 'react';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import { useTranslation } from 'react-i18next';

type ErrorComponentProps = {
  error: string;
};

const ErrorComponent: React.FC<ErrorComponentProps> = props => {
  const { error } = props;
  const { t } = useTranslation('app-extensions');
  return <ErrorLoader type="script-error" title={t('Error in extensions app')} details={error} />;
};

export const RouteErrorComponent = () => (
  <ErrorLoader
    type="script-error"
    title="Oops, this page returned an error :("
    details="There is an error somewhere in this page and we need to display this card to avoid other issues."
  />
);

export default ErrorComponent;
