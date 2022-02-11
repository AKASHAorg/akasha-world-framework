import React from 'react';
import DS from '@akashaproject/design-system';
import { I18nextProvider } from 'react-i18next';
import Routes from './routes';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';

const { Box } = DS;

const App = (props: RootComponentProps) => {
  return (
    <Box width="100vw">
      <I18nextProvider i18n={props.i18next}>
        <Routes {...props} />
      </I18nextProvider>
    </Box>
  );
};

export default App;
