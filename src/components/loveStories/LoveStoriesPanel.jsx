import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';
import 'react-quill-new/dist/quill.snow.css';

const initialStoryForm = {
  imageFile: null,
  title: '',
  description: '',
};

const mapStoryToForm = (story) => ({
  imageFile: null,
  title: story?.title || '',
  description: story?.description || '',
});

const toPlainText = (html = '') =>
  String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function LoveStoriesPanel() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(initialStoryForm);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState('');
  const [editForm, setEditForm] = useState(initialStoryForm);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailStory, setDetailStory] = useState(null);

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    return fallback || error?.message || 'Request failed';
  };

  const loadStories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/love-stories', {
        params: { page: 1, limit: 50, sort: '-created_at' },
      });
      setStories(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load love stories.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleCreateChange = (event) => {
    const { name, value, files, type } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: type === 'file' ? files?.[0] || null : value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, files, type } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: type === 'file' ? files?.[0] || null : value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      if (!createForm.imageFile) {
        toast.error('Please select an image file.');
        return;
      }
      if (!toPlainText(createForm.description)) {
        toast.error('Description is required.');
        return;
      }

      const formData = new FormData();
      formData.append('image', createForm.imageFile);
      formData.append('title', createForm.title);
      formData.append('description', createForm.description);

      await api.post('/love-stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Love story created successfully.');
      setCreateOpen(false);
      setCreateForm(initialStoryForm);
      loadStories();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create love story.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = async (storyId) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditingStoryId(storyId);
    try {
      const response = await api.get(`/love-stories/${storyId}`);
      setEditForm(mapStoryToForm(response.data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load love story details.'));
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    if (!editingStoryId) return;

    setEditSubmitting(true);
    try {
      if (!toPlainText(editForm.description)) {
        toast.error('Description is required.');
        return;
      }

      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      if (editForm.imageFile) {
        formData.append('image', editForm.imageFile);
      }

      await api.patch(`/love-stories/${editingStoryId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Love story updated successfully.');
      setEditOpen(false);
      loadStories();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update love story.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDetail = async (storyId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailStory(null);
    try {
      const response = await api.get(`/love-stories/${storyId}`);
      setDetailStory(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch love story details.'));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (story) => {
    const storyId = story?._id;
    if (!storyId) return;
    const confirmed = window.confirm(`Delete story "${story.title || storyId}"?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/love-stories/${storyId}`);
      toast.success('Love story deleted successfully.');
      loadStories();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete love story.'));
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Love Stories</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Love Stories Management</h2>
        <p className="mt-2 text-sm text-slate-600">Create, update, delete and manage customer love stories.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create Story
          </button>
          <button
            type="button"
            onClick={loadStories}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        {loading ? <p className="text-sm text-slate-500">Loading love stories...</p> : null}
        {!loading && stories.length === 0 ? <p className="text-sm text-slate-500">No stories found.</p> : null}

        {!loading && stories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <article key={story._id} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4">
                <img
                  src={story.image}
                  alt={story.title || 'Love story'}
                  className="h-40 w-full rounded-lg object-cover"
                />
                <h4 className="mt-3 line-clamp-1 text-base font-semibold text-slate-900">{story.title}</h4>
                <p className="mt-1 line-clamp-4 text-sm text-slate-700">{toPlainText(story.description)}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openDetail(story._id)}
                    className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-2 text-xs font-semibold text-sky-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-1 active:translate-y-[1px]"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(story._id)}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-1 active:translate-y-[1px]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(story)}
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

      <Modal open={createOpen} title="Create Love Story" onClose={() => setCreateOpen(false)} widthClass="max-w-3xl">
        <form onSubmit={handleCreate} className="grid gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Image File</span>
            <input name="imageFile" type="file" accept="image/*" required onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
            <input name="title" required value={createForm.title} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
            <div className="rounded-lg border border-slate-300 bg-white">
              <ReactQuill theme="snow" value={createForm.description} onChange={(value) => setCreateForm((current) => ({ ...current, description: value }))} />
            </div>
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit Love Story" onClose={() => setEditOpen(false)} widthClass="max-w-3xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading story details...</p>
        ) : (
          <form onSubmit={handleEdit} className="grid gap-3">
            {stories.find((item) => item._id === editingStoryId)?.image ? (
              <img
                src={stories.find((item) => item._id === editingStoryId)?.image}
                alt="Current story"
                className="h-48 w-full rounded-xl object-cover"
              />
            ) : null}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Image File (optional)</span>
              <input name="imageFile" type="file" accept="image/*" onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
              <input name="title" required value={editForm.title} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Description</span>
              <div className="rounded-lg border border-slate-300 bg-white">
                <ReactQuill theme="snow" value={editForm.description} onChange={(value) => setEditForm((current) => ({ ...current, description: value }))} />
              </div>
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

      <Modal open={detailOpen} title="Love Story Details" onClose={() => setDetailOpen(false)} widthClass="max-w-3xl">
        {detailLoading ? <p className="text-sm text-slate-500">Loading details...</p> : null}
        {!detailLoading && detailStory ? (
          <div className="space-y-3">
            <img src={detailStory.image} alt={detailStory.title || 'Love story'} className="h-56 w-full rounded-xl object-cover" />
            <h4 className="text-lg font-semibold text-slate-900">{detailStory.title}</h4>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: detailStory.description || '' }}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default LoveStoriesPanel;

