import DS from '@akashaproject/design-system';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import menuRoute, { MY_PROFILE, PROFILE_LIST } from '../../routes';
import MyProfilePage from './my-profile-page';
import ProfilePage from './profile-page';
import WidgetList from '../widgets';

const { Box, lightTheme, Grommet } = DS;

export interface IRoutesProps {
  activeWhen: { path: string };
}

const Routes: React.FC<IRoutesProps> = props => {
  const { activeWhen } = props;
  const { path } = activeWhen;
  const { t } = useTranslation();

  return (
    <Router>
      <Grommet theme={lightTheme}>
        <Box>
          <Switch>
            <Route path={menuRoute[PROFILE_LIST]} render={() => <>A list of profiles</>} />
            <Route
              path={menuRoute[MY_PROFILE]}
              component={MyProfilePage}
            />
            <Route
              path={`${path}/:profileId`}
              render={routeProps => <ProfilePage {...routeProps} {...props} />}
            />
            <Route render={() => <div>{t('Profile not found!')}</div>} />
          </Switch>
        </Box>
        <Box>
          <WidgetList />
        </Box>
      </Grommet>
    </Router>
  );
};

export default Routes;
