import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const STATUS_OPTIONS = ['pending', 'not received', 'done'];

const initialForm = {
  fullName: '',
  phoneNumber: '',
  email: '',
  budgetRange: '',
  preferredBrand: '',
  description: '',
  status: 'pending',
  adminComment: '',
};

const mapToForm = (item) => ({
  fullName: item?.fullName || '',
  phoneNumber: item?.phoneNumber || '',
  email: item?.email || '',
  budgetRange: item?.budgetRange || '',
  preferredBrand: item?.preferredBrand || '',
  description: item?.description || '',
  status: item?.status || 'pending',
  adminComment: item?.adminComment || '',
});

function CallbackRequestsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [createForm, setCreateForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [detailItem, setDetailItem] = useState(null);

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    return fallback || error?.message || 'Request failed';
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50, sort: '-createdAt' };
      if (statusFilter) params.status = statusFilter;
      if (emailFilter.trim()) params.email = emailFilter.trim();
      if (phoneFilter.trim()) params.phoneNumber = phoneFilter.trim();
      const response = await api.get('/callback-requests', { params });
      setItems(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load callback requests.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post('/callback-requests', createForm);
      toast.success('Callback request created successfully.');
      setCreateOpen(false);
      setCreateForm(initialForm);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create callback request.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = async (id) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditingId(id);
    try {
      const response = await api.get(`/callback-requests/${id}`);
      setEditForm(mapToForm(response.data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load callback request details.'));
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      await api.patch(`/callback-requests/${editingId}`, editForm);
      toast.success('Callback request updated successfully.');
      setEditOpen(false);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update callback request.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDetail = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailItem(null);
    try {
      const response = await api.get(`/callback-requests/${id}`);
      setDetailItem(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch callback request details.'));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const id = item?._id;
    if (!id) return;
    const confirmed = window.confirm(`Delete callback request from ${item.fullName}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }
    try {
      await api.delete(`/callback-requests/${id}`);
      toast.success('Callback request deleted successfully.');
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete callback request.'));
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Callback Requests</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Callback Requests Management</h2>
        <p className="mt-2 text-sm text-slate-600">Create, track and manage customer callback requests.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCreateOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            + Create Callback Request
          </button>
          <button type="button" onClick={loadItems} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <input value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} placeholder="Filter by email" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} placeholder="Filter by phone" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button type="button" onClick={loadItems} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Apply Filter
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading callback requests...</p> : null}
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">No callback requests found.</p> : null}

        {!loading && items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="line-clamp-1 text-base font-semibold text-slate-900">{item.fullName}</h4>
                <p className="text-xs text-slate-600">{item.email}</p>
                <p className="text-xs text-slate-600">{item.phoneNumber}</p>
                <p className="mt-1 text-xs text-slate-600">Brand: {item.preferredBrand || 'N/A'}</p>
                <p className="text-xs text-slate-600">Budget: {item.budgetRange || 'N/A'}</p>
                <p className="mt-1 text-xs capitalize text-slate-700">Status: {item.status}</p>
                <p className="mt-2 line-clamp-3 text-xs text-slate-600">{item.description || 'No description'}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => openDetail(item._id)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                    View
                  </button>
                  <button type="button" onClick={() => openEdit(item._id)} className="rounded-lg bg-amber-500 px-2 py-2 text-xs font-semibold text-white hover:bg-amber-400">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(item)} className="rounded-lg bg-rose-600 px-2 py-2 text-xs font-semibold text-white hover:bg-rose-500">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <Modal open={createOpen} title="Create Callback Request" onClose={() => setCreateOpen(false)} widthClass="max-w-3xl">
        <form onSubmit={handleCreate} className="grid gap-3">
          <input name="fullName" value={createForm.fullName} onChange={handleChange(setCreateForm)} placeholder="Full Name" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="phoneNumber" value={createForm.phoneNumber} onChange={handleChange(setCreateForm)} placeholder="Phone Number" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="email" type="email" value={createForm.email} onChange={handleChange(setCreateForm)} placeholder="Email" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="budgetRange" value={createForm.budgetRange} onChange={handleChange(setCreateForm)} placeholder="Budget Range" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input name="preferredBrand" value={createForm.preferredBrand} onChange={handleChange(setCreateForm)} placeholder="Preferred Brand" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <textarea name="description" value={createForm.description} onChange={handleChange(setCreateForm)} placeholder="Description" rows={4} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select name="status" value={createForm.status} onChange={handleChange(setCreateForm)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <textarea name="adminComment" value={createForm.adminComment} onChange={handleChange(setCreateForm)} placeholder="Admin Comment" rows={3} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit Callback Request" onClose={() => setEditOpen(false)} widthClass="max-w-3xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading callback request...</p>
        ) : (
          <form onSubmit={handleEdit} className="grid gap-3">
            <input name="fullName" value={editForm.fullName} onChange={handleChange(setEditForm)} placeholder="Full Name" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input name="phoneNumber" value={editForm.phoneNumber} onChange={handleChange(setEditForm)} placeholder="Phone Number" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input name="email" type="email" value={editForm.email} onChange={handleChange(setEditForm)} placeholder="Email" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input name="budgetRange" value={editForm.budgetRange} onChange={handleChange(setEditForm)} placeholder="Budget Range" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input name="preferredBrand" value={editForm.preferredBrand} onChange={handleChange(setEditForm)} placeholder="Preferred Brand" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <textarea name="description" value={editForm.description} onChange={handleChange(setEditForm)} placeholder="Description" rows={4} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <select name="status" value={editForm.status} onChange={handleChange(setEditForm)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <textarea name="adminComment" value={editForm.adminComment} onChange={handleChange(setEditForm)} placeholder="Admin Comment" rows={3} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={editSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                {editSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={detailOpen} title="Callback Request Details" onClose={() => setDetailOpen(false)} widthClass="max-w-3xl">
        {detailLoading ? <p className="text-sm text-slate-500">Loading details...</p> : null}
        {!detailLoading && detailItem ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-slate-700">Name:</span> {detailItem.fullName}</p>
            <p><span className="font-semibold text-slate-700">Phone:</span> {detailItem.phoneNumber}</p>
            <p><span className="font-semibold text-slate-700">Email:</span> {detailItem.email}</p>
            <p><span className="font-semibold text-slate-700">Budget Range:</span> {detailItem.budgetRange || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700">Preferred Brand:</span> {detailItem.preferredBrand || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700">Status:</span> {detailItem.status}</p>
            <div>
              <p className="font-semibold text-slate-700">Description:</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-800">{detailItem.description || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Admin Comment:</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-800">{detailItem.adminComment || 'N/A'}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default CallbackRequestsPanel;
