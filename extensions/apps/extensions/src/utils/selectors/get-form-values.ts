import { FormData } from '../../components/pages/extension-edit-page';

export const selectFormValues = (extensionId: string) => {
  try {
    return {
      data: (JSON.parse(sessionStorage.getItem(extensionId)) satisfies FormData) || {},
      error: null,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : error, data: null };
  }
};
