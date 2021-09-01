import DS from '@akashaproject/design-system';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import menuRoute, { MY_PROFILE, rootRoute } from '../../routes';
import ProfilePage from './profile-page';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import { useLoginState } from '@akashaproject/ui-awf-hooks';
import { useGetProfile } from '@akashaproject/ui-awf-hooks/lib/use-profile.new';
import { ModalNavigationOptions } from '@akashaproject/ui-awf-typings/lib/app-loader';

const { Box } = DS;

const Routes: React.FC<RootComponentProps> = props => {
  const [loginState] = useLoginState({});
  const loggedProfileQuery = useGetProfile(loginState.pubKey);

  const { t } = useTranslation();

  const showLoginModal = (redirectTo?: ModalNavigationOptions) => {
    props.navigateToModal({ name: 'login', redirectTo });
  };

  return (
    <Router>
      <Box>
        <Switch>
          <Route path={`${rootRoute}/list`} render={() => <>A list of profiles</>} />
          <Route path={[`${rootRoute}/:pubKey`, menuRoute[MY_PROFILE]]}>
            <ProfilePage
              {...props}
              loggedProfileData={loggedProfileQuery.data}
              showLoginModal={showLoginModal}
              loginState={loginState}
            />
          </Route>
          <Route render={() => <div>{t('Oops, Profile not found!')}</div>} />
        </Switch>
      </Box>
    </Router>
  );
};

export default Routes;
