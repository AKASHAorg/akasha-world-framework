import React from 'react';
import { DG } from '../../routes';
import { LEGAL_DOCS } from '@akashaorg/typings/lib/ui';
import { useLegalDoc } from '@akashaorg/ui-core-hooks';

import PageRenderer from './page-renderer';

const DeveloperGuidelinesPage: React.FC<unknown> = () => {
  const legalDocReq = useLegalDoc(LEGAL_DOCS.APP_GUIDE);

  const legalDoc = legalDocReq.data;
  const error = legalDocReq.error as Error | null;

  return <PageRenderer doc={legalDoc} error={error} title={DG} />;
};

export default DeveloperGuidelinesPage;
