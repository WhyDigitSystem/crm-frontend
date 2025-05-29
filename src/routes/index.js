import { useRoutes } from 'react-router-dom';

// routes
import AdminRoute from './AdminRoute';
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import FinanceRoute from './FinanceRoute';
// import OpsRoute from './OpsRoute';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([MainRoutes, AuthenticationRoutes, FinanceRoute, AdminRoute]);
}
