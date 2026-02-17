import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const initialCreateForm = {
  fullName: '',
  rating: '5',
  message: '',
  image: null,
};

const initialEditForm = {
  fullName: '',
  rating: '5',
  message: '',
  image: null,
};

const ACTION_BUTTON_BASE =
  'rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:translate-y-[1px]';
const ACTION_BUTTON_VIEW =
  `${ACTION_BUTTON_BASE} border border-sky-200 bg-sky-50 text-sky-700 shadow-sm hover:-translate-y-0.5 hover:bg-sky-100 hover:text-sky-800 focus:ring-sky-200`;
const ACTION_BUTTON_EDIT =
  `${ACTION_BUTTON_BASE} border border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:-translate-y-0.5 hover:bg-amber-100 hover:text-amber-800 focus:ring-amber-200`;
const ACTION_BUTTON_DELETE =
  `${ACTION_BUTTON_BASE} border border-rose-200 bg-rose-50 text-rose-700 shadow-sm hover:-translate-y-0.5 hover:bg-rose-100 hover:text-rose-800 focus:ring-rose-200`;

function TestimonialsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(initialEditForm);

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
      const response = await api.get('/testimonials');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load testimonials.'));
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
    const text = `${item?.fullName || ''} ${item?.message || ''}`.toLowerCase();
    return text.includes(term);
  });

  const handleCreateInput = (event) => {
    const { name, value, files, type } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: type === 'file' ? (files?.[0] || null) : value,
    }));
  };

  const handleEditInput = (event) => {
    const { name, value, files, type } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: type === 'file' ? (files?.[0] || null) : value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!createForm.image) {
      toast.error('User image is required.');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', createForm.fullName);
    formData.append('rating', createForm.rating);
    formData.append('message', createForm.message);
    formData.append('image', createForm.image);

    setCreateSubmitting(true);
    try {
      await api.post('/testimonials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Testimonial created successfully.');
      setCreateOpen(false);
      setCreateForm(initialCreateForm);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create testimonial.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openDetails = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailItem(null);
    try {
      const response = await api.get(`/testimonials/${id}`);
      setDetailItem(response.data || null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load testimonial details.'));
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
      const response = await api.get(`/testimonials/${id}`);
      const data = response.data || {};
      setEditForm({
        fullName: data.fullName || '',
        rating: data.rating ? String(data.rating) : '5',
        message: data.message || '',
        image: null,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load testimonial.'));
      setEditOpen(false);
      setEditingId('');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingId) return;

    const formData = new FormData();
    formData.append('fullName', editForm.fullName);
    formData.append('rating', editForm.rating);
    formData.append('message', editForm.message);
    if (editForm.image) {
      formData.append('image', editForm.image);
    }

    setEditSubmitting(true);
    try {
      await api.put(`/testimonials/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Testimonial updated successfully.');
      setEditOpen(false);
      setEditingId('');
      setEditForm(initialEditForm);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update testimonial.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const id = item?._id || item?.id;
    if (!id) return;

    const confirmed = window.confirm(`Delete testimonial by ${item?.fullName || id}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Testimonial deleted successfully.');
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete testimonial.'));
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Testimonials</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Testimonials Management</h2>
        <p className="mt-2 text-sm text-slate-600">Manage testimonials with create, list, details, update and delete.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create Testimonial
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
          <h3 className="text-2xl font-semibold text-slate-900">All Testimonials</h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or message"
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading testimonials...</p> : null}
        {!loading && filteredItems.length === 0 ? <p className="text-sm text-slate-500">No testimonials found.</p> : null}

        {!loading && filteredItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const id = item._id || item.id;
              return (
                <article key={id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.fullName || 'User'}
                      className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <h4 className="line-clamp-1 text-base font-semibold text-slate-900">{item.fullName}</h4>
                      <p className="text-xs text-amber-600">Rating: {item.rating}/5</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-4 text-xs text-slate-600">{item.message}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
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
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <Modal open={createOpen} title="Create Testimonial" onClose={() => setCreateOpen(false)} widthClass="max-w-3xl">
        <form onSubmit={handleCreate} className="grid gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
            <input
              name="fullName"
              required
              value={createForm.fullName}
              onChange={handleCreateInput}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Rating</span>
            <select
              name="rating"
              value={createForm.rating}
              onChange={handleCreateInput}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Message</span>
            <textarea
              name="message"
              required
              rows={4}
              value={createForm.message}
              onChange={handleCreateInput}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Image (file)</span>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              onChange={handleCreateInput}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700"
            />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={detailOpen} title="Testimonial Details" onClose={() => setDetailOpen(false)} widthClass="max-w-3xl">
        {detailLoading ? <p className="text-sm text-slate-500">Loading details...</p> : null}
        {!detailLoading && detailItem ? (
          <div className="space-y-3 text-sm">
            <img
              src={detailItem.imageUrl}
              alt={detailItem.fullName || 'User'}
              className="h-40 w-40 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <p><span className="font-semibold text-slate-700">Full Name:</span> {detailItem.fullName || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700">Rating:</span> {detailItem.rating || 'N/A'}/5</p>
            <div>
              <p className="font-semibold text-slate-700">Message:</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-800">{detailItem.message || 'N/A'}</p>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={editOpen} title="Edit Testimonial" onClose={() => setEditOpen(false)} widthClass="max-w-3xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading testimonial...</p>
        ) : (
          <form onSubmit={handleUpdate} className="grid gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
              <input
                name="fullName"
                required
                value={editForm.fullName}
                onChange={handleEditInput}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Rating</span>
              <select
                name="rating"
                value={editForm.rating}
                onChange={handleEditInput}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Message</span>
              <textarea
                name="message"
                required
                rows={4}
                value={editForm.message}
                onChange={handleEditInput}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Replace Image (optional)</span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleEditInput}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700"
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

export default TestimonialsPanel;
