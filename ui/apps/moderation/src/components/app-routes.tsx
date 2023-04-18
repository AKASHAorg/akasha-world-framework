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
} from '../pages';

import routes, {
  DASHBOARD,
  DISMISS_MODERATOR,
  HISTORY,
  HISTORY_ITEM,
  HOME,
  MODERATION_VALUE,
  MODERATORS,
  VIEW_MODERATOR,
} from '../routes';

const { Box } = DS;

const AppRoutes: React.FC<RootComponentProps> = props => {
  const { layoutConfig } = props;

  const loginQuery = useGetLogin();

  const checkModeratorQuery = useCheckModerator(loginQuery.data?.pubKey);
  const checkModeratorResp = checkModeratorQuery.data;

  const isAuthorised = React.useMemo(() => checkModeratorResp === 200, [checkModeratorResp]);

  return (
    <Box>
      <Router basename={props.baseRouteName}>
        <Routes>
          <Route path={routes[HOME]} element={<Overview {...props} />} />

          <Route path={routes[MODERATION_VALUE]} element={<ModerationValue {...props} />} />

          <Route
            path={routes[DASHBOARD]}
            element={
              <Dashboard
                {...props}
                user={loginQuery.data?.pubKey}
                isAuthorised={isAuthorised}
                slotId={layoutConfig.modalSlotId}
              />
            }
          />

          <Route
            path={routes[MODERATORS]}
            element={
              <Moderators
                navigateTo={props.plugins['@akashaorg/app-routing']?.routing?.navigateTo}
              />
            }
          />

          <Route
            path={routes[VIEW_MODERATOR]}
            element={
              <ModeratorDetailPage
                navigateTo={props.plugins['@akashaorg/app-routing']?.routing?.navigateTo}
              />
            }
          />

          <Route
            path={routes[DISMISS_MODERATOR]}
            element={
              <DismissModeratorPage
                navigateTo={props.plugins['@akashaorg/app-routing']?.routing?.navigateTo}
              />
            }
          />

          <Route
            path={routes[HISTORY]}
            element={
              <TransparencyLog
                user={loginQuery.data?.pubKey}
                navigateTo={props.plugins['@akashaorg/app-routing']?.routing?.navigateTo}
              />
            }
          />

          <Route path={routes[HISTORY_ITEM]} element={<TransparencyLogItem />} />

          <Route path="/" element={<Navigate to={routes[HOME]} replace />} />
        </Routes>
      </Router>
    </Box>
  );
};

export default AppRoutes;
