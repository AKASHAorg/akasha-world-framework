import * as React from 'react';
import { RootComponentProps, RootExtensionProps } from '@akashaorg/typings/ui';
import { hasOwn } from './utils/has-own';
import type { TranslationPlugin } from '@akashaorg/app-translation';

const RootComponentPropsContext = React.createContext(null);
const DEFAULT_ROUTING_PLUGIN = '@akashaorg/app-routing';
const DEFAULT_TRANSLATION_PLUGIN = '@akashaorg/app-translation';
const DEFAULT_EDITOR_BLOCKS_PLUGIN = '@akashaorg/app-akasha-integration';

const RootComponentPropsProvider = ({
  children,
  ...props
}: RootComponentProps & { children: React.ReactNode }) => {
  return (
    <RootComponentPropsContext.Provider value={props}>
      {children}
    </RootComponentPropsContext.Provider>
  );
};

const useRootComponentProps = () => {
  const ctx = React.useContext<RootComponentProps | RootExtensionProps>(RootComponentPropsContext);
  const getRoutingPlugin = React.useCallback(
    (ns = DEFAULT_ROUTING_PLUGIN) => {
      if (hasOwn(ctx.plugins, ns)) {
        return ctx.plugins[ns].routing;
      }
      console.warn('Routing plugin not available yet');
      return {};
    },
    [ctx.plugins],
  );

  const getTranslationPlugin = React.useCallback(
    (ns = DEFAULT_TRANSLATION_PLUGIN): { i18n: typeof TranslationPlugin.i18n } => {
      if (hasOwn(ctx.plugins, ns)) {
        return ctx.plugins[ns].translation;
      }
      console.warn('Translation plugin not available yet!');
      return { i18n: null };
    },
    [ctx.plugins],
  );

  const getEditorBlocksPlugin = React.useCallback(() => {
    if (hasOwn(ctx.plugins, DEFAULT_EDITOR_BLOCKS_PLUGIN)) {
      return ctx.plugins[DEFAULT_EDITOR_BLOCKS_PLUGIN].editorBlocks;
    }
  }, [ctx.plugins]);

  return {
    getRoutingPlugin,
    getTranslationPlugin,
    getEditorBlocksPlugin,
    ...ctx,
  };
};

export { RootComponentPropsProvider, useRootComponentProps };
