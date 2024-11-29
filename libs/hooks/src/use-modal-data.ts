import { useEffect, useState, useRef } from 'react';
import { useRootComponentProps } from './use-root-props';

export type theme = 'Light-Theme' | 'Dark-Theme';

/**
 * Hook to handle the data supplied to the modal extension.
 * @returns { modalData } - Object containing the params passed in the url
 * @example useModalData hook
 * ```typescript
 * const { modalData } = useModalData();
 * ```
 **/
export const useModalData = () => {
  const { getModalFromParams } = useRootComponentProps();
  const getModalData = useRef(getModalFromParams);
  const [modalData, setModalData] = useState(() => getModalFromParams(window.location));

  useEffect(() => {
    const onLocationChange = () => {
      setModalData(getModalData.current(window.location));
    };
    window.addEventListener('single-spa:before-routing-event', onLocationChange);
    return () => window.removeEventListener('single-spa:before-routing-event', onLocationChange);
  }, []);

  return { modalData };
};
