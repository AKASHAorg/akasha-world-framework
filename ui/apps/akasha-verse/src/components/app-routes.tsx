import React from 'react';
import ExplorePage from './pages/explore-page';
import InfoPage from './pages/info-page';
import MyAppsPage from './pages/my-apps-page';
import MyWidgetsPage from './pages/my-widgets-page';
import AppsPage from './pages/apps-page';
import MasterPage from './pages/master-page';
import routes, { EXPLORE, MY_APPS, MY_WIDGETS, INFO, APPS } from '../routes';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import { useGetLogin } from '@akashaorg/ui-awf-hooks';
import { RootComponentProps } from '@akashaorg/typings/ui';
import {
  useGetAppsQuery,
  useGetAppsReleasesQuery,
} from '@akashaorg/ui-awf-hooks/lib/generated/hooks-new';
import { hiddenIntegrations } from '../hidden-integrations';

const AppRoutes: React.FC<RootComponentProps> = props => {
  const { worldConfig, plugins, baseRouteName } = props;

  const loginQuery = useGetLogin();

  const isLoggedIn = React.useMemo(() => {
    return !!loginQuery.data?.id;
  }, [loginQuery.data]);

  const navigateTo = plugins['@akashaorg/app-routing']?.routing?.navigateTo;

  const defaultIntegrations = [].concat(
    worldConfig.defaultApps,
    worldConfig.defaultWidgets,
    [worldConfig.homepageApp],
    [worldConfig.layout],
  );

  const availableIntegrationsReq = useGetAllIntegrationsIds(isLoggedIn);

  const filteredIntegrations = React.useMemo(() => {
    return availableIntegrationsReq?.data?.filter(
      id => !hiddenIntegrations.some(hiddenInt => hiddenInt.id === id),
    );
  }, [availableIntegrationsReq?.data]);

  const integrationIdsNormalized = React.useMemo(() => {
    if (filteredIntegrations) {
      return filteredIntegrations.map(integrationId => {
        return { id: integrationId };
      });
    }
    return [];
  }, [filteredIntegrations]);

  const integrationsInfoReq = useGetLatestReleaseInfo(integrationIdsNormalized);

  const latestReleasesInfo = React.useMemo(() => {
    return integrationsInfoReq.data?.getLatestRelease;
  }, [integrationsInfoReq.data?.getLatestRelease]);

  const installableApps = React.useMemo(() => {
    return latestReleasesInfo?.filter(releaseInfo => {
      if (defaultIntegrations?.includes(releaseInfo.name)) {
        return;
      }
      return releaseInfo;
    });
  }, [defaultIntegrations, latestReleasesInfo]);

  const installedAppsReq = useGetAllInstalledApps(isLoggedIn);

  return (
    <Router basename={baseRouteName}>
      <MasterPage isLoggedIn={isLoggedIn} navigateTo={navigateTo} {...props}>
        <Routes>
          <Route
            path={routes[EXPLORE]}
            element={
              <ExplorePage
                installableApps={installableApps}
                installedAppsInfo={installedAppsReq.data}
                isFetching={integrationsInfoReq.isFetching}
                reqError={integrationsInfoReq.error}
                isUserLoggedIn={isLoggedIn}
                {...props}
              />
            }
          />
          <Route
            path={routes[MY_APPS]}
            element={
              <MyAppsPage
                latestReleasesInfo={latestReleasesInfo}
                defaultIntegrations={defaultIntegrations}
                installedAppsInfo={installedAppsReq.data}
                isFetching={integrationsInfoReq.isFetching}
                {...props}
              />
            }
          />
          <Route path={routes[APPS]} element={<AppsPage {...props} />} />
          <Route
            path={routes[MY_WIDGETS]}
            element={
              <MyWidgetsPage
                latestReleasesInfo={latestReleasesInfo}
                isFetching={integrationsInfoReq.isFetching}
                {...props}
              />
            }
          />
          <Route path={`${routes[INFO]}/:appId`} element={<InfoPage {...props} />} />
          <Route path="/" element={<Navigate to={routes[EXPLORE]} replace />} />
        </Routes>
      </MasterPage>
    </Router>
  );
};

export default AppRoutes;
