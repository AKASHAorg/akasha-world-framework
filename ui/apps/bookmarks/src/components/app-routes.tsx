import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as React from 'react';
import DS from '@akashaorg/design-system';
import routes, { BOOKMARKS } from '../routes';
import { RootComponentProps } from '@akashaorg/ui-awf-typings';
import BookmarksPage from './bookmarks-page';

const { Helmet } = DS;

const AppRoutes = (props: RootComponentProps) => {
  return (
    <Router>
      <Helmet>
        <title>My Bookmarks | Ethereum World</title>
      </Helmet>
      <Routes>
        <Route path={routes[BOOKMARKS]} element={<BookmarksPage {...props} />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
