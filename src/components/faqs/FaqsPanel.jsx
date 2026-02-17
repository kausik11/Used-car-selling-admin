import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const FAQ_CATEGORIES = [
  'Buying',
  'Selling',
  'Post-Sale Support for Car Sellers',
  'Post-Sale Support for Car Buyers',
  'General',
];

const initialFaqForm = {
  category: FAQ_CATEGORIES[0],
  question: '',
  answer: '',
  link: '',
  imageFile: null,
};

const mapFaqToForm = (faq) => ({
  category: faq?.category || FAQ_CATEGORIES[0],
  question: faq?.question || '',
  answer: faq?.answer || '',
  link: faq?.link || '',
  imageFile: null,
});

function FaqsPanel() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoriesSummary, setCategoriesSummary] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(initialFaqForm);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState('');
  const [editForm, setEditForm] = useState(initialFaqForm);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFaq, setDetailFaq] = useState(null);

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    return fallback || error?.message || 'Request failed';
  };

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50, sort: '-created_at' };
      if (categoryFilter) params.category = categoryFilter;
      const response = await api.get('/faqs', { params });
      setFaqs(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load FAQs.'));
    } finally {
      setLoading(false);
    }
  };

  const loadFaqCategories = async () => {
    try {
      const response = await api.get('/faqs/categories');
      setCategoriesSummary(response.data?.items || []);
    } catch (_error) {
      setCategoriesSummary([]);
    }
  };

  useEffect(() => {
    loadFaqs();
    loadFaqCategories();
  }, []);

  const handleCreateChange = (event) => {
    const { name, value, type, files } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: type === 'file' ? files?.[0] || null : value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, type, files } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: type === 'file' ? files?.[0] || null : value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', createForm.category);
      formData.append('question', createForm.question);
      formData.append('answer', createForm.answer);
      formData.append('link', createForm.link || '');
      if (createForm.imageFile) {
        formData.append('image', createForm.imageFile);
      }

      await api.post('/faqs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('FAQ created successfully.');
      setCreateOpen(false);
      setCreateForm(initialFaqForm);
      loadFaqs();
      loadFaqCategories();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create FAQ.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = async (faqId) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditingFaqId(faqId);
    try {
      const response = await api.get(`/faqs/${faqId}`);
      setEditForm(mapFaqToForm(response.data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load FAQ details.'));
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    if (!editingFaqId) return;
    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', editForm.category);
      formData.append('question', editForm.question);
      formData.append('answer', editForm.answer);
      formData.append('link', editForm.link || '');
      if (editForm.imageFile) {
        formData.append('image', editForm.imageFile);
      }

      await api.patch(`/faqs/${editingFaqId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('FAQ updated successfully.');
      setEditOpen(false);
      loadFaqs();
      loadFaqCategories();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update FAQ.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDetail = async (faqId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailFaq(null);
    try {
      const response = await api.get(`/faqs/${faqId}`);
      setDetailFaq(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch FAQ details.'));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (faq) => {
    const faqId = faq?._id;
    if (!faqId) return;
    const confirmed = window.confirm(`Delete FAQ "${faq.question || faqId}"?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/faqs/${faqId}`);
      toast.success('FAQ deleted successfully.');
      loadFaqs();
      loadFaqCategories();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete FAQ.'));
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">FAQs</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">FAQs Management</h2>
        <p className="mt-2 text-sm text-slate-600">Create, update, delete and organize FAQ entries by category.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create FAQ
          </button>
          <button
            type="button"
            onClick={() => {
              loadFaqs();
              loadFaqCategories();
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {FAQ_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadFaqs}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500"
          >
            Apply Filter
          </button>
        </div>

        {categoriesSummary.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {categoriesSummary.map((item) => (
              <span key={item.category} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {item.category}: {item.count}
              </span>
            ))}
          </div>
        ) : null}

        {loading ? <p className="text-sm text-slate-500">Loading FAQs...</p> : null}
        {!loading && faqs.length === 0 ? <p className="text-sm text-slate-500">No FAQs found.</p> : null}

        {!loading && faqs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                    {faq.category}
                  </span>
                </div>
                <h4 className="line-clamp-2 text-base font-semibold text-slate-900">{faq.question}</h4>
                <p className="mt-2 line-clamp-4 text-sm text-slate-700">{faq.answer}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openDetail(faq._id)}
                    className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-2 text-xs font-semibold text-sky-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-1 active:translate-y-[1px]"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(faq._id)}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-1 active:translate-y-[1px]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-100 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-1 active:translate-y-[1px]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <Modal open={createOpen} title="Create FAQ" onClose={() => setCreateOpen(false)} widthClass="max-w-3xl">
        <form onSubmit={handleCreate} className="grid gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
            <select name="category" value={createForm.category} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {FAQ_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Question</span>
            <input name="question" required value={createForm.question} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Answer</span>
            <textarea name="answer" required rows={5} value={createForm.answer} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Link (optional)</span>
            <input name="link" value={createForm.link} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Image File (optional)</span>
            <input name="imageFile" type="file" accept="image/*" onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create FAQ'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit FAQ" onClose={() => setEditOpen(false)} widthClass="max-w-3xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading FAQ details...</p>
        ) : (
          <form onSubmit={handleEdit} className="grid gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
              <select name="category" value={editForm.category} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {FAQ_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Question</span>
              <input name="question" required value={editForm.question} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Answer</span>
              <textarea name="answer" required rows={5} value={editForm.answer} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Link (optional)</span>
              <input name="link" value={editForm.link} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Image File (optional)</span>
              <input name="imageFile" type="file" accept="image/*" onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            {faqs.find((item) => item._id === editingFaqId)?.image ? (
              <img
                src={faqs.find((item) => item._id === editingFaqId)?.image}
                alt="Current FAQ"
                className="h-48 w-full rounded-xl object-cover"
              />
            ) : null}
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

      <Modal open={detailOpen} title="FAQ Details" onClose={() => setDetailOpen(false)} widthClass="max-w-3xl">
        {detailLoading ? <p className="text-sm text-slate-500">Loading details...</p> : null}
        {!detailLoading && detailFaq ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold text-slate-700">Category:</span> {detailFaq.category}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Question:</span> {detailFaq.question}
            </p>
            <div>
              <p className="font-semibold text-slate-700">Answer:</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-800">{detailFaq.answer}</p>
            </div>
            {detailFaq.link ? (
              <p>
                <span className="font-semibold text-slate-700">Link:</span>{' '}
                <a href={detailFaq.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {detailFaq.link}
                </a>
              </p>
            ) : null}
            {detailFaq.image ? <img src={detailFaq.image} alt="FAQ visual" className="h-56 w-full rounded-xl object-cover" /> : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default FaqsPanel;

