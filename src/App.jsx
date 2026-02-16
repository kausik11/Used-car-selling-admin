import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearSession, persistSession, readSession } from './auth/session';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readSession());

  const handleLogin = (nextSession) => {
    persistSession(nextSession);
    setSession(nextSession);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    toast.warning('You have been logged out.');
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage session={session} onLogin={handleLogin} />}
      />
      <Route element={<ProtectedRoute session={session} />}>
        <Route path="/" element={<DashboardPage session={session} onLogout={handleLogout} />} />
      </Route>
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
