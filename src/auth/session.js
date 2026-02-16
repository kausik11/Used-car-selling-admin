const ADMIN_ROLES = ['admin', 'administrator'];

export const isAdminRole = (role) => ADMIN_ROLES.includes(String(role || '').toLowerCase());

export const readSession = () => {
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

export const persistSession = (session) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('admin_auth_token', session.token);
  window.localStorage.setItem('admin_auth_user', JSON.stringify(session.user));
};

export const clearSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('admin_auth_token');
  window.localStorage.removeItem('admin_auth_user');
};
