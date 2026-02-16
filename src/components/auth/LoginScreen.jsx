import { useState } from 'react';
import { authApi } from '../../api/client';

const ADMIN_ROLES = ['admin', 'administrator'];

const isAdminRole = (role) => ADMIN_ROLES.includes(String(role || '').toLowerCase());

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await authApi.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token || !user) {
        throw new Error('Unexpected login response');
      }

      if (!isAdminRole(user.role)) {
        setPassword('');
        setError('Access denied. Only admin or administrator can use this panel.');
        return;
      }

      onLogin({ token, user });
    } catch (requestError) {
      const serverMessage = requestError?.response?.data?.error;
      setError(serverMessage || requestError.message || 'Unable to login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Used Car Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Only users with role admin or administrator can continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Signing in...' : 'Sign in to admin panel'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
