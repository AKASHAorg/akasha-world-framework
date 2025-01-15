import * as React from 'react';
import { Extension } from './extension';
import { useRootComponentProps } from '@akashaorg/ui-core-hooks';

export const ModalExtension = () => {
  const { getModalFromParams } = useRootComponentProps();
  const getModalFromParamsRef = React.useRef(getModalFromParams);
  const [activeModal, setActiveModal] = React.useState<string>();

  React.useLayoutEffect(() => {
    const controller = new AbortController();
    window.addEventListener(
      'popstate',
      function () {
        const modal = getModalFromParamsRef.current(location);
        if (modal && modal.name) {
          setActiveModal(modal.name);
          return;
        }
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);

  return activeModal && <Extension name={activeModal} />;
};
