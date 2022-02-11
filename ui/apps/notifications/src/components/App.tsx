import React, { PureComponent } from 'react';
import DS from '@akashaproject/design-system';
import { I18nextProvider } from 'react-i18next';
import NotificationsPage from './notifications-page';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';

const { Box } = DS;

// @TODO: convert to function component

class App extends PureComponent<RootComponentProps> {
  public state: { hasErrors: boolean };

  constructor(props) {
    super(props);
    this.state = {
      hasErrors: false,
    };
  }

  public componentDidCatch(err: Error) {
    this.setState({
      hasErrors: true,
    });
    const { logger } = this.props;
    logger.error(`${JSON.stringify(err)}`);
  }
  public render() {
    if (this.state.hasErrors) {
      return <div>Oh no, something went wrong in {'notifications-plugin'}</div>;
    }

    return (
      <Box width="100vw">
        <I18nextProvider i18n={this.props.i18next}>
          <NotificationsPage {...this.props} />
        </I18nextProvider>
      </Box>
    );
  }
}

export default App;
