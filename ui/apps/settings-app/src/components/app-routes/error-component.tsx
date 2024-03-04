import React from 'react';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';
import { useTranslation } from 'react-i18next';

type ErrorComponentProps = {
  error: string;
};

const ErrorComponent: React.FC<ErrorComponentProps> = props => {
  const { error } = props;
  const { t } = useTranslation('app-settings');
  return <ErrorLoader type="script-error" title={t('Error in settings app')} details={error} />;
};

export default ErrorComponent;
