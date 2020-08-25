import * as React from 'react';
import DS from '@akashaproject/design-system';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { default as subRoutes, ENS_EDIT_PAGE, SETTINGS_PAGE, rootRoute } from '../../routes';
import EnsEditPage from './ens-edit-page';
import EnsSettingsPage from './ens-settings-page';
import { ActionMapper, StateMapper } from 'easy-peasy';
import { getProfileStore, ProfileStateModel } from '../../state/profile-state';
import { RootComponentProps } from '@akashaproject/ui-awf-typings';
import { useTranslation } from 'react-i18next';

const { useGlobalLogin, LoginModal } = DS;

const Routes: React.FC<RootComponentProps> = props => {
  const { sdkModules, globalChannel, logger, layout } = props;
  const { t } = useTranslation();
  const [loginModalState, setLoginModalState] = React.useState({
    showLoginModal: false,
  });
  const Profile = getProfileStore(sdkModules, globalChannel, logger);
  const token = Profile.useStoreState((s: StateMapper<ProfileStateModel, ''>) => s.token);
  const authorize = Profile.useStoreActions(
    (act: ActionMapper<ProfileStateModel, ''>) => act.authorize,
  );
  const onLoginSuccess = Profile.useStoreActions(
    (act: ActionMapper<ProfileStateModel, '1'>) => act.handleLoginSuccess,
  );

  const onLoginError = Profile.useStoreActions(
    (actions: ActionMapper<ProfileStateModel, ''>) => actions.handleLoginError,
  );
  useGlobalLogin(globalChannel, onLoginSuccess, onLoginError);
  React.useEffect(() => {
    if (token) {
      setTimeout(() => {
        setLoginModalState({
          showLoginModal: false,
        });
      }, 500);
    }
  }, [token]);
  const handleLoginModalShow = () => {
    setLoginModalState({
      showLoginModal: true,
    });
  };
  const handleModalClose = () => {
    setLoginModalState({
      showLoginModal: false,
    });
  };
  const handleLogin = (providerId: number) => {
    console.log('authorizing!!', providerId);
    authorize(providerId);
  };
  const handleTutorialLinkClick = () => {
    /**
     * @TODO: we should do something here
     */
  };

  return (
    <>
      <Router>
        <Switch>
          <Route path={subRoutes[ENS_EDIT_PAGE]}>
            <EnsEditPage
              sdkModules={sdkModules}
              globalChannel={globalChannel}
              logger={logger}
              onLoginModalShow={handleLoginModalShow}
            />
          </Route>
          <Route path={subRoutes[SETTINGS_PAGE]}>
            <EnsSettingsPage
              sdkModules={sdkModules}
              globalChannel={globalChannel}
              logger={logger}
            />
          </Route>
          {/* Make the edit page default landing page for this app
                          404 routes gets redirected to this page also */}
          <Redirect push={true} from={rootRoute} to={subRoutes[ENS_EDIT_PAGE]} exact={true} />
        </Switch>
      </Router>
      <LoginModal
        slotId={layout.modalSlotId}
        onLogin={handleLogin}
        onModalClose={handleModalClose}
        showModal={loginModalState.showLoginModal}
        tutorialLinkLabel={t('See Video Tutorial')}
        onTutorialLinkClick={handleTutorialLinkClick}
        metamaskModalHeadline={`${t('Just a few more steps! We are almost there')}...`}
        metamaskModalMessage={t('Approve the message in your Web3 wallet to continue')}
        helpText={t('What is a wallet? How do i get an Ethereum address?')}
      />
    </>
  );
};

export default Routes;
