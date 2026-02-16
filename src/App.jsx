import { useState } from 'react';
import CarsPanel from './components/cars/CarsPanel';
import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

const ADMIN_ROLES = ['admin', 'administrator'];

const isAdminRole = (role) => ADMIN_ROLES.includes(String(role || '').toLowerCase());

const readSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = window.localStorage.getItem('admin_auth_token');
  const userRaw = window.localStorage.getItem('admin_auth_user');

  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw);
    if (!isAdminRole(user?.role)) {
      return null;
    }
    return { token, user };
  } catch (_error) {
    return null;
  }
};

const persistSession = (session) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('admin_auth_token', session.token);
  window.localStorage.setItem('admin_auth_user', JSON.stringify(session.user));
};

const clearSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('admin_auth_token');
  window.localStorage.removeItem('admin_auth_user');
};

function App() {
  const [activePanel, setActivePanel] = useState('cars');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [session, setSession] = useState(() => readSession());

  const handleLogin = (nextSession) => {
    persistSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  if (!session || !isAdminRole(session.user?.role)) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#eef2f8]">
      <div className="mx-auto flex min-h-screen max-w-[1900px]">
        <Sidebar
          active={activePanel}
          onSelect={setActivePanel}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />

        <div className="flex flex-1 flex-col">
          <Topbar
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
            currentUser={session.user}
            onLogout={handleLogout}
          />
          <main className="p-4 md:p-6">
            {activePanel === 'cars' ? (
              <CarsPanel />
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-3xl font-semibold text-slate-900">{activePanel}</h2>
                <p className="mt-2 text-lg text-slate-500">This section is coming soon.</p>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

