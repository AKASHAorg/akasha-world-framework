import { Extension } from '@akashaorg/typings/lib/ui';
import { DRAFT_EXTENSIONS } from '../../constants';

export const selectDraftExtensions = (
  authenticatedDID: string,
): { data: Extension[]; error: string } => {
  try {
    return {
      data: JSON.parse(localStorage.getItem(`${DRAFT_EXTENSIONS}-${authenticatedDID}`)) || [],
      error: null,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : error, data: null };
  }
};
