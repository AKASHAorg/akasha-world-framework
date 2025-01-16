import { IAppConfig, IRootComponentProps, SupportedUILibs } from '@akashaorg/typings/lib/ui';

export type LoadingFunctionOptions = {
  logger: IRootComponentProps['logger'];
  /**
   * Called when the application failed to render due to an error
   */
  onRenderError?: (error: Error, props?: IRootComponentProps) => void;
  /**
   * Called whenever there is a script error.
   * Can also catch other unhandled errors.
   */
  onScriptError?: (error: Error) => void;
  /**
   * Called when there is an error in importing the module
   * or the imported module is not valid (ex: missing default export)
   */
  onModuleError?: (
    error: Error,
    extensionInfo: {
      name: IRootComponentProps['name'];
      domElement?: IRootComponentProps['domElement'];
    },
  ) => void;
};

export const createLoadingFunction = async (
  rootComponent: IAppConfig['rootComponent'],
  uiLib: SupportedUILibs = SupportedUILibs.react,
  options: LoadingFunctionOptions,
) => {
  if (uiLib === SupportedUILibs.react) {
    try {
      const { getLifecycles } = await import('./react');
      return getLifecycles(rootComponent, options);
    } catch (ex) {
      options.logger.error(ex);
      options.onScriptError?.(new Error('Failed to get lifecycle functions'));
    }
  }
};
