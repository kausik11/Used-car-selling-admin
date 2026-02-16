import { Navigate } from 'react-router-dom';
import LoginScreen from '../components/auth/LoginScreen';
import { isAdminRole } from '../auth/session';

function LoginPage({ session, onLogin }) {
  if (session && isAdminRole(session.user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <LoginScreen onLogin={onLogin} />;
}

export default LoginPage;
