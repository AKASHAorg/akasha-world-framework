import * as React from 'react';
import { useGetAppsByPublisherDidQuery } from './generated/apollo';
import { Extension } from '@akashaorg/typings/lib/ui';
import { selectAkashaApp } from './selectors/get-apps-by-publisher-did-query';

/**
 * Hook to validate uniqness of a an extensions name or displayName before publishing it.
 * @param authenticatedDID - the DID of the logged in user
 * @param draftExtensions - list of local extensions
 * @param extensionId - id of the extension to be validated, if extension was created locally already
 * @returns { loading, error, handleCheckExtProp, isDuplicateExtProp  } - Object containing
 * loading and error state for the app data hook, a trigger for the check and the validation result
 * @example useValidateUniqueExtensionProp hook
 * ```typescript
 * const { loading, error, handleCheckExtProp, isDuplicateExtProp } = useMentions(draftExtensions, extensionData, 'name');
 * ```
 **/
const useValidateUniqueExtensionProp = (
  authenticatedDID: string,
  draftExtensions: Extension[],
  extensionId?: string,
) => {
  const [currentExtProp, setCurrentExtProp] = React.useState('');
  const [propToValidate, setPropToValidate] = React.useState('');

  const filters = React.useMemo(() => {
    switch (propToValidate) {
      case 'name':
        return { where: { name: { equalTo: currentExtProp } } };
      default:
        return {};
    }
  }, [propToValidate, currentExtProp]);

  const {
    data: appInfo,
    loading,
    error,
  } = useGetAppsByPublisherDidQuery({
    variables: {
      id: authenticatedDID,
      first: 1,
      filters: filters,
    },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    skip: !currentExtProp || !propToValidate || !authenticatedDID,
  });

  const handleCheckExtProp = (propToValidate: 'name', fieldValue: string) => {
    setCurrentExtProp(fieldValue);
    setPropToValidate(propToValidate);
  };

  const isDuplicateLocalExtProp = React.useMemo(
    () =>
      !!draftExtensions.find(ext => {
        if (extensionId) {
          return ext.name === currentExtProp && ext.id !== extensionId;
        } else {
          return ext.name === currentExtProp;
        }
      }),
    [draftExtensions, currentExtProp, extensionId],
  );

  const isDuplicatePublishedExtProp = React.useMemo(() => !!selectAkashaApp(appInfo), [appInfo]);

  const isDuplicateExtProp = isDuplicateLocalExtProp || isDuplicatePublishedExtProp;

  return { loading, error, handleCheckExtProp, isDuplicateExtProp };
};

export { useValidateUniqueExtensionProp };
