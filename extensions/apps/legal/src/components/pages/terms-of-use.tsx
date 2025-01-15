import React from 'react';
import { TOU } from '../../routes';
import { useLegalDoc } from '@akashaorg/ui-core-hooks';
import { LEGAL_DOCS } from '@akashaorg/typings/lib/ui';

import PageRenderer from './page-renderer';

const TermsOfUsePage: React.FC<unknown> = () => {
  const legalDocReq = useLegalDoc(LEGAL_DOCS.TERMS_OF_USE);

  const legalDoc = legalDocReq.data;
  const error = legalDocReq.error as Error | null;

  return <PageRenderer doc={legalDoc} error={error} title={TOU} />;
};

export default TermsOfUsePage;
