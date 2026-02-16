import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const createInitialUserForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  city: '',
  address: '',
  pin: '',
  role: 'normaluser',
  is_email_verified: false,
  is_phone_verified: false,
};

const createEditForm = (user) => ({
  name: user?.name || '',
  phone: user?.phone || '',
  city: user?.city || '',
  address: user?.address || '',
  pin: user?.pin || '',
  budgetRange: user?.budgetRange || '',
  preferredBrand: user?.preferredBrand || '',
  fuelType: user?.fuelType || '',
  transmissionType: user?.transmissionType || '',
  role: user?.role || 'normaluser',
  is_email_verified: Boolean(user?.is_email_verified),
  is_phone_verified: Boolean(user?.is_phone_verified),
  password: '',
});

function UsersPanel({ currentUser, onSessionUserUpdate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(createInitialUserForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(createEditForm(null));

  const [recentOpen, setRecentOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentUserName, setRecentUserName] = useState('');

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    return fallback || error?.message || 'Request failed';
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const text = `${user.name || ''} ${user.email || ''} ${user.phone || ''} ${user.role || ''}`.toLowerCase();
    return text.includes(term);
  });

  const handleCreateChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetCreateForm = () => {
    setCreateForm(createInitialUserForm);
  };

  const openEdit = async (userId) => {
    setEditLoading(true);
    setEditOpen(true);
    try {
      const response = await api.get(`/users/${userId}`);
      setEditingUser(response.data);
      setEditForm(createEditForm(response.data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load user details.'));
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const openRecentViews = async (user) => {
    setRecentOpen(true);
    setRecentUserName(user?.name || 'User');
    setRecentItems([]);
    setRecentLoading(true);
    try {
      const response = await api.get(`/users/${user._id || user.id}/recent-car-views`, {
        params: { limit: 20 },
      });
      setRecentItems(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load recent viewed cars.'));
    } finally {
      setRecentLoading(false);
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post('/users', createForm);
      toast.success('User created successfully.');
      setCreateOpen(false);
      resetCreateForm();
      loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create user.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingUser?._id && !editingUser?.id) return;
    setEditSubmitting(true);
    try {
      const payload = {
        ...editForm,
        phone: editForm.phone || null,
        budgetRange: editForm.budgetRange || null,
        preferredBrand: editForm.preferredBrand || null,
        fuelType: editForm.fuelType || null,
        transmissionType: editForm.transmissionType || null,
      };
      if (!payload.password) {
        delete payload.password;
      }

      const userId = editingUser._id || editingUser.id;
      const response = await api.patch(`/users/${userId}`, payload);
      const updatedUser = response?.data?.user;

      toast.success('User updated successfully.');
      setEditOpen(false);
      loadUsers();

      if ((currentUser?.id || currentUser?._id) === userId && updatedUser && onSessionUserUpdate) {
        onSessionUserUpdate({
          id: updatedUser._id || updatedUser.id,
          ...updatedUser,
        });
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update user.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    const confirmed = window.confirm(`Delete user ${user?.name || userId}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully.');
      loadUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete user.'));
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Users</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">User Management</h2>
        <p className="mt-2 text-sm text-slate-600">Manage users with create, list, details, update, delete and recent viewed cars.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create User
          </button>
          <button
            type="button"
            onClick={loadUsers}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-slate-900">All Users</h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone, role"
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading users...</p> : null}
        {!loading && filteredUsers.length === 0 ? <p className="text-sm text-slate-500">No users found.</p> : null}

        {!loading && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userId = user._id || user.id;
                  return (
                    <tr key={userId} className="rounded-xl bg-slate-50 text-sm text-slate-700">
                      <td className="px-3 py-3 font-medium text-slate-900">{user.name || 'N/A'}</td>
                      <td className="px-3 py-3">{user.email || 'N/A'}</td>
                      <td className="px-3 py-3">{user.phone || 'N/A'}</td>
                      <td className="px-3 py-3 capitalize">{user.role || 'N/A'}</td>
                      <td className="px-3 py-3">{user.city || 'N/A'}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(userId)}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openRecentViews(user)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Recent Views
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <Modal open={createOpen} title="Create User" onClose={() => setCreateOpen(false)} widthClass="max-w-4xl">
        <form onSubmit={handleCreateSubmit} className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
            <input name="name" required value={createForm.name} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input name="email" type="email" required value={createForm.email} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
            <input name="phone" value={createForm.phone} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input name="password" type="password" required value={createForm.password} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">City</span>
            <input name="city" required value={createForm.city} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">PIN</span>
            <input name="pin" required value={createForm.pin} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
            <input name="address" required value={createForm.address} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
            <select name="role" value={createForm.role} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="normaluser">normaluser</option>
              <option value="admin">admin</option>
              <option value="administrator">administrator</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
            <input type="checkbox" name="is_email_verified" checked={createForm.is_email_verified} onChange={handleCreateChange} />
            Email verified
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="is_phone_verified" checked={createForm.is_phone_verified} onChange={handleCreateChange} />
            Phone verified
          </label>

          <div className="md:col-span-2 mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit User" onClose={() => setEditOpen(false)} widthClass="max-w-4xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading user details...</p>
        ) : (
          <form onSubmit={handleEditSubmit} className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Email:</span> {editingUser?.email || 'N/A'}
              </p>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
              <input name="name" required value={editForm.name} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
              <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">City</span>
              <input name="city" value={editForm.city} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">PIN</span>
              <input name="pin" value={editForm.pin} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
              <input name="address" value={editForm.address} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Budget Range</span>
              <input name="budgetRange" value={editForm.budgetRange} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Preferred Brand</span>
              <input name="preferredBrand" value={editForm.preferredBrand} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Fuel Type</span>
              <input name="fuelType" value={editForm.fuelType} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Transmission Type</span>
              <input name="transmissionType" value={editForm.transmissionType} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Role</span>
              <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="normaluser">normaluser</option>
                <option value="admin">admin</option>
                <option value="administrator">administrator</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">New Password (optional)</span>
              <input name="password" type="password" value={editForm.password} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="is_email_verified" checked={editForm.is_email_verified} onChange={handleEditChange} />
              Email verified
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="is_phone_verified" checked={editForm.is_phone_verified} onChange={handleEditChange} />
              Phone verified
            </label>

            <div className="md:col-span-2 mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button type="submit" disabled={editSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                {editSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={recentOpen} title={`Recent Car Views - ${recentUserName}`} onClose={() => setRecentOpen(false)} widthClass="max-w-4xl">
        {recentLoading ? <p className="text-sm text-slate-500">Loading recent views...</p> : null}
        {!recentLoading && recentItems.length === 0 ? <p className="text-sm text-slate-500">No recent viewed cars found.</p> : null}
        {!recentLoading && recentItems.length > 0 ? (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <article key={`${item.car_id}-${item.viewed_at}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.title || `${item.brand} ${item.model}`}</p>
                <p className="text-xs text-slate-600">
                  {item.brand} {item.model} {item.variant || ''} | {item.city || 'N/A'}
                </p>
                <p className="text-xs text-slate-500">Viewed at: {new Date(item.viewed_at).toLocaleString()}</p>
              </article>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default UsersPanel;
