import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DS from '@akashaorg/design-system';
import { useCheckModerator, useGetLogin } from '@akashaorg/ui-awf-hooks';
import { RootComponentProps } from '@akashaorg/typings/ui';

import {
  Dashboard,
  Overview,
  Moderators,
  ModeratorDetailPage,
  DismissModeratorPage,
  TransparencyLog,
  TransparencyLogItem,
  ModerationValue,
  EditCategoriesPage,
  EditContactInfoPage,
  EditMaxApplicantsPage,
  ResignRolePage,
  ResignConfirmationPage,
  BecomeModeratorPage,
} from '../pages';

import routes, {
  DASHBOARD,
  DISMISS_MODERATOR,
  EDIT_CATEGORIES,
  EDIT_CONTACT_INFO,
  EDIT_MAX_APPLICANTS,
  RESIGN_CONFIRMATION,
  RESIGN_ROLE,
  HISTORY,
  HISTORY_ITEM,
  HOME,
  MODERATION_VALUE,
  MODERATORS,
  VIEW_MODERATOR,
  BECOME_MODERATOR,
} from '../routes';

const { Box } = DS;

const AppRoutes: React.FC<RootComponentProps> = props => {
  const loginQuery = useGetLogin();

  const checkModeratorQuery = useCheckModerator(loginQuery.data?.pubKey);
  const checkModeratorResp = checkModeratorQuery.data;

  const isAuthorised = React.useMemo(() => checkModeratorResp === 200, [checkModeratorResp]);

  const isAdmin = false;

  const navigateTo = props.plugins['@akashaorg/app-routing']?.routing?.navigateTo;

  return (
    <Box>
      <Router basename={props.baseRouteName}>
        <Routes>
          <Route
            path={routes[HOME]}
            element={<Overview {...props} isAuthorised={isAuthorised} navigateTo={navigateTo} />}
          />

          <Route path={routes[MODERATION_VALUE]} element={<ModerationValue {...props} />} />

          <Route
            path={routes[DASHBOARD]}
            element={
              <Dashboard
                user={loginQuery.data?.pubKey}
                isAuthorised={isAuthorised}
                isAdmin={isAdmin}
                navigateTo={navigateTo}
              />
            }
          />

          <Route
            path={routes[EDIT_CATEGORIES]}
            element={<EditCategoriesPage user={loginQuery.data?.pubKey} navigateTo={navigateTo} />}
          />

          <Route
            path={routes[EDIT_CONTACT_INFO]}
            element={<EditContactInfoPage user={loginQuery.data?.pubKey} navigateTo={navigateTo} />}
          />

          <Route
            path={routes[EDIT_MAX_APPLICANTS]}
            element={
              <EditMaxApplicantsPage user={loginQuery.data?.pubKey} navigateTo={navigateTo} />
            }
          />

          <Route
            path={routes[RESIGN_ROLE]}
            element={
              <ResignRolePage
                user={loginQuery.data?.pubKey}
                isAdmin={isAdmin}
                navigateTo={navigateTo}
              />
            }
          />

          <Route
            path={routes[RESIGN_CONFIRMATION]}
            element={
              <ResignConfirmationPage user={loginQuery.data?.pubKey} navigateTo={navigateTo} />
            }
          />

          <Route path={routes[MODERATORS]} element={<Moderators navigateTo={navigateTo} />} />

          <Route
            path={routes[VIEW_MODERATOR]}
            element={<ModeratorDetailPage navigateTo={navigateTo} />}
          />

          <Route
            path={routes[DISMISS_MODERATOR]}
            element={<DismissModeratorPage navigateTo={navigateTo} />}
          />

          <Route
            path={routes[HISTORY]}
            element={<TransparencyLog user={loginQuery.data?.pubKey} navigateTo={navigateTo} />}
          />

          <Route path={routes[HISTORY_ITEM]} element={<TransparencyLogItem />} />

          <Route
            path={routes[BECOME_MODERATOR]}
            element={<BecomeModeratorPage user={loginQuery.data?.pubKey} navigateTo={navigateTo} />}
          />

          <Route path="/" element={<Navigate to={routes[HOME]} replace />} />
        </Routes>
      </Router>
    </Box>
  );
};

export default AppRoutes;
