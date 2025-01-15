import * as React from 'react';
import singleSpaReact from 'single-spa-react';
import ReactDOMClient from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { useRootComponentProps, withProviders } from '@akashaorg/ui-core-hooks';
import ErrorLoader from '@akashaorg/design-system-core/lib/components/ErrorLoader';

import {
  BlockInstanceMethods,
  ContentBlockModes,
  ContentBlockRootProps,
  IRootComponentProps,
} from '@akashaorg/typings/lib/ui';
import { SlateEditorBlock } from './slate-editor-block';
import { SlateReadonlyBlock } from './slate-readonly-block';

const SlateBlockExtension = (
  props: ContentBlockRootProps & { blockRef?: React.RefObject<BlockInstanceMethods> },
) => {
  const { getTranslationPlugin } = useRootComponentProps();
  return (
    <I18nextProvider i18n={getTranslationPlugin().i18n}>
      {props.blockInfo.mode === ContentBlockModes.EDIT && <SlateEditorBlock {...props} />}
      {props.blockInfo.mode === ContentBlockModes.READONLY && <SlateReadonlyBlock {...props} />}
    </I18nextProvider>
  );
};

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: withProviders<ContentBlockRootProps>(SlateBlockExtension),
  errorBoundary: (err, errorInfo, props: IRootComponentProps & ContentBlockRootProps) => {
    if (props.logger) {
      props.logger.error(`${JSON.stringify(errorInfo)}, ${errorInfo}`);
    }

    return <ErrorLoader type="script-error" title="Error in slate-block" details={err.message} />;
  },
});
