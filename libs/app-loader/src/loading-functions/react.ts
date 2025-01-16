import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import { IAppConfig, IRootComponentProps } from '@akashaorg/typings/lib/ui';
import { LoadingFunctionOptions } from './index';

export const getLifecycles = (
  rootComponent: IAppConfig['rootComponent'],
  { onRenderError, onModuleError }: LoadingFunctionOptions,
) => {
  const lifecycles = singleSpaReact({
    React,
    ReactDOMClient,
    loadRootComponent: async (props: IRootComponentProps) => {
      const componentImport = rootComponent();
      try {
        const mod = await componentImport;
        if (!mod.default) {
          onModuleError(new Error('Component must have default export'), {
            name: props.name,
            domElement: props.domElement,
          });
          return null;
        }
        return mod.default;
      } catch (ex) {
        onModuleError(new Error('Failed to import module'), {
          name: props.name,
          domElement: props.domElement,
        });
      }
    },
    errorBoundary: (error, _errorInfo, props: IRootComponentProps) => {
      onRenderError?.(error, props);
      return null;
    },
  });

  return {
    bootstrap: lifecycles.bootstrap,
    mount: lifecycles.mount,
    unmount: lifecycles.unmount,
    update: lifecycles.update,
  };
};
