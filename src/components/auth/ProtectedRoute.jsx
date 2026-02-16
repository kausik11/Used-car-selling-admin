import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAdminRole } from '../../auth/session';

function ProtectedRoute({ session }) {
  const location = useLocation();
  const isAllowed = Boolean(session?.token) && isAdminRole(session?.user?.role);

  if (!isAllowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
