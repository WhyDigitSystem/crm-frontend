import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from 'ui-component/Loadable';
import MainLayout from 'layout/MainLayout';
import MinimalLayout from 'layout/MinimalLayout';
import PrivateRoute from '../routes/PrivateRoute';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

const MainRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/',
      element: <AuthLogin3 />
    },
    {
      path: 'dashboard',
      element: <PrivateRoute><MainLayout /></PrivateRoute>,
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'utils',
      element: <PrivateRoute><MainLayout /></PrivateRoute>,
      children: [
        {
          path: 'util-typography',
          element: <UtilsTypography />
        },
        {
          path: 'util-color',
          element: <UtilsColor />
        },
        {
          path: 'util-shadow',
          element: <UtilsShadow />
        }
      ]
    },
    {
      path: 'icons',
      element: <PrivateRoute><MainLayout /></PrivateRoute>,
      children: [
        {
          path: 'tabler-icons',
          element: <UtilsTablerIcons />
        },
        {
          path: 'material-icons',
          element: <UtilsMaterialIcons />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <PrivateRoute><MainLayout /></PrivateRoute>,
      children: [
        {
          path: '',
          element: <SamplePage />
        }
      ]
    },
    {
      path: '*',
      element: <Navigate to="/" />
    }
  ]
};

export default MainRoutes;
