import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const ACTION_BUTTON_BASE =
  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:translate-y-[1px]';
const ACTION_BUTTON_VIEW =
  `${ACTION_BUTTON_BASE} border border-sky-200 bg-sky-50 text-sky-700 shadow-sm hover:-translate-y-0.5 hover:bg-sky-100 hover:text-sky-800 focus:ring-sky-200`;
const ACTION_BUTTON_EDIT =
  `${ACTION_BUTTON_BASE} border border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:-translate-y-0.5 hover:bg-amber-100 hover:text-amber-800 focus:ring-amber-200`;
const ACTION_BUTTON_DELETE =
  `${ACTION_BUTTON_BASE} border border-rose-200 bg-rose-50 text-rose-700 shadow-sm hover:-translate-y-0.5 hover:bg-rose-100 hover:text-rose-800 focus:ring-rose-200`;

function NewslettersPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    if (payload?.message) return payload.message;
    return fallback || error?.message || 'Request failed';
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/newsletter');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load subscriptions.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return String(item?.email || '').toLowerCase().includes(term);
  });

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post('/newsletter', { email: createEmail.trim() });
      toast.success('Subscription created successfully.');
      setCreateOpen(false);
      setCreateEmail('');
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create subscription.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openDetails = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailItem(null);
    try {
      const response = await api.get(`/newsletter/${id}`);
      setDetailItem(response.data || null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load subscription details.'));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = async (id) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditingId(id);
    try {
      const response = await api.get(`/newsletter/${id}`);
      setEditEmail(response.data?.email || '');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load subscription.'));
      setEditOpen(false);
      setEditingId('');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      await api.put(`/newsletter/${editingId}`, { email: editEmail.trim() });
      toast.success('Subscription updated successfully.');
      setEditOpen(false);
      setEditingId('');
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update subscription.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const id = item?._id || item?.id;
    if (!id) return;
    const confirmed = window.confirm(`Delete subscription ${item?.email || id}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/newsletter/${id}`);
      toast.success('Subscription deleted successfully.');
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete subscription.'));
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Newsletter</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Newsletter Subscriptions</h2>
        <p className="mt-2 text-sm text-slate-600">Manage newsletter subscribers with create, list, view, update and delete.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create Subscription
          </button>
          <button
            type="button"
            onClick={loadItems}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-slate-900">All Subscriptions</h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email"
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading subscriptions...</p> : null}
        {!loading && filteredItems.length === 0 ? <p className="text-sm text-slate-500">No subscriptions found.</p> : null}

        {!loading && filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id} className="rounded-xl bg-slate-50 text-sm text-slate-700">
                      <td className="px-3 py-3 font-medium text-slate-900">{item.email}</td>
                      <td className="px-3 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</td>
                      <td className="px-3 py-3">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(id)}
                            className={ACTION_BUTTON_VIEW}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(id)}
                            className={ACTION_BUTTON_EDIT}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className={ACTION_BUTTON_DELETE}
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

      <Modal open={createOpen} title="Create Subscription" onClose={() => setCreateOpen(false)} widthClass="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              value={createEmail}
              onChange={(event) => setCreateEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={detailOpen} title="Subscription Details" onClose={() => setDetailOpen(false)} widthClass="max-w-lg">
        {detailLoading ? <p className="text-sm text-slate-500">Loading details...</p> : null}
        {!detailLoading && detailItem ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-slate-700">Email:</span> {detailItem.email || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700">Created:</span> {detailItem.createdAt ? new Date(detailItem.createdAt).toLocaleString() : 'N/A'}</p>
            <p><span className="font-semibold text-slate-700">Updated:</span> {detailItem.updatedAt ? new Date(detailItem.updatedAt).toLocaleString() : 'N/A'}</p>
          </div>
        ) : null}
      </Modal>

      <Modal open={editOpen} title="Edit Subscription" onClose={() => setEditOpen(false)} widthClass="max-w-lg">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading subscription...</p>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                required
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-2 flex justify-end gap-2">
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
    </div>
  );
}

export default NewslettersPanel;
