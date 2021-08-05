import { useQuery } from 'react-query';
import { lastValueFrom } from 'rxjs';
import getSDK from '@akashaproject/awf-sdk';
import { LEGAL_DOCS } from '@akashaproject/ui-awf-typings';
import { logError } from './utils/error-handler';

export const LEGAL_KEY = 'Legal';

const getLegalDoc = async docName => {
  const sdk = getSDK();
  try {
    const res = await lastValueFrom(sdk.services.common.ipfs.getLegalDoc(docName));
    return res.data;
  } catch (error) {
    logError('useLegal.getLegaDoc', error);
  }
};

export function useLegalDoc(docName: LEGAL_DOCS) {
  return useQuery([LEGAL_KEY, docName], () => getLegalDoc(docName), {
    enabled: !!docName,
    keepPreviousData: true,
  });
}
