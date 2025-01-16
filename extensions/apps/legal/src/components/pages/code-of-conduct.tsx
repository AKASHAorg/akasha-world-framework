import React from 'react';
import { COC } from '../../routes';
import { LEGAL_DOCS } from '@akashaorg/typings/lib/ui';
import { useLegalDoc } from '@akashaorg/ui-core-hooks';

import PageRenderer from './page-renderer';

const CodeOfConductPage: React.FC<unknown> = () => {
  const legalDocReq = useLegalDoc(LEGAL_DOCS.CODE_OF_CONDUCT);

  const legalDoc = legalDocReq.data;
  const error = legalDocReq.error as Error | null;

  return <PageRenderer doc={legalDoc} error={error} title={COC} />;
};

export default CodeOfConductPage;
