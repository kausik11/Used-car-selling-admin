import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from './api/client';
import { clearSession, isAdminRole, persistSession, readSession } from './auth/session';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

const THEME_STORAGE_KEY = 'admin_theme_preference';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'dark' ? 'dark' : 'light';
};

function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readSession());
  const [theme, setTheme] = useState(getInitialTheme);

  const clearAndRedirectToLogin = (message) => {
    clearSession();
    setSession(null);
    if (message) {
      toast.error(message);
    }
    navigate('/login', { replace: true });
  };

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

  const handleSessionUserUpdate = (updatedUser) => {
    setSession((current) => {
      if (!current?.token) return current;
      const nextSession = {
        token: current.token,
        user: {
          ...current.user,
          ...updatedUser,
        },
      };
      persistSession(nextSession);
      return nextSession;
    });
  };

  useEffect(() => {
    if (!session?.token) return;

    let active = true;

    const syncProfile = async () => {
      try {
        const response = await authApi.get('/profile');
        const profile = response?.data;

        if (!active) return;

        if (!profile || !isAdminRole(profile.role)) {
          clearAndRedirectToLogin('Access denied. Admin or administrator account required.');
          return;
        }

        const nextSession = {
          token: session.token,
          user: {
            id: profile._id || profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            role: profile.role,
            is_email_verified: profile.is_email_verified,
            is_phone_verified: profile.is_phone_verified,
            city: profile.city,
            address: profile.address,
            pin: profile.pin,
            budgetRange: profile.budgetRange,
            preferredBrand: profile.preferredBrand,
            fuelType: profile.fuelType,
            transmissionType: profile.transmissionType,
          },
        };

        persistSession(nextSession);
        setSession(nextSession);
      } catch (_error) {
        if (!active) return;
        clearAndRedirectToLogin('Session expired. Please login again.');
      }
    };

    syncProfile();

    return () => {
      active = false;
    };
  }, [session?.token]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage session={session} onLogin={handleLogin} />}
      />
      <Route element={<ProtectedRoute session={session} />}>
        <Route
          path="/"
          element={
            <DashboardPage
              session={session}
              onLogout={handleLogout}
              onSessionUserUpdate={handleSessionUserUpdate}
              theme={theme}
              onThemeChange={setTheme}
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
