import React from 'react';
import { PP } from '../../routes';
import { LEGAL_DOCS } from '@akashaorg/typings/lib/ui';
import { useLegalDoc } from '@akashaorg/ui-core-hooks';

import PageRenderer from './page-renderer';

const PrivacyPolicyPage: React.FC<unknown> = () => {
  const legalDocReq = useLegalDoc(LEGAL_DOCS.PRIVACY_POLICY);

  const legalDoc = legalDocReq.data;
  const error = legalDocReq.error as Error | null;

  return <PageRenderer doc={legalDoc} error={error} title={PP} />;
};

export default PrivacyPolicyPage;
