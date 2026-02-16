import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const initialReviewForm = {
  reviewer_name: '',
  review_date: '',
  city: '',
  review_text: '',
  rating: 5,
};

const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const mapReviewToForm = (review) => ({
  reviewer_name: review?.reviewer_name || '',
  review_date: toInputDate(review?.review_date),
  city: review?.city || '',
  review_text: review?.review_text || '',
  rating: Number(review?.rating || 5),
});

function ReviewsPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cityFilter, setCityFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(initialReviewForm);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState('');
  const [editForm, setEditForm] = useState(initialReviewForm);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailReview, setDetailReview] = useState(null);

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    return fallback || error?.message || 'Request failed';
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50, sort: '-review_date' };
      if (cityFilter.trim()) params.city = cityFilter.trim();
      if (ratingFilter) params.rating = ratingFilter;
      const response = await api.get('/reviews', { params });
      setReviews(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load reviews.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((current) => ({
      ...current,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post('/reviews', createForm);
      toast.success('Review created successfully.');
      setCreateOpen(false);
      setCreateForm(initialReviewForm);
      loadReviews();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create review.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = async (reviewId) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditingReviewId(reviewId);
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      setEditForm(mapReviewToForm(response.data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load review details.'));
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    if (!editingReviewId) return;

    setEditSubmitting(true);
    try {
      await api.patch(`/reviews/${editingReviewId}`, editForm);
      toast.success('Review updated successfully.');
      setEditOpen(false);
      loadReviews();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update review.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDetail = async (reviewId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailReview(null);
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      setDetailReview(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch review details.'));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (review) => {
    const reviewId = review?._id;
    if (!reviewId) return;
    const confirmed = window.confirm(`Delete review by ${review.reviewer_name || reviewId}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully.');
      loadReviews();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete review.'));
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reviews</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Reviews Management</h2>
        <p className="mt-2 text-sm text-slate-600">Create, edit, delete and review customer testimonials.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            + Create Review
          </button>
          <button
            type="button"
            onClick={loadReviews}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">City</label>
            <input
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              placeholder="Filter city"
              className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Rating</label>
            <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <button
            type="button"
            onClick={loadReviews}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Apply Filter
          </button>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading reviews...</p> : null}
        {!loading && reviews.length === 0 ? <p className="text-sm text-slate-500">No reviews found.</p> : null}

        {!loading && reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="line-clamp-1 text-base font-semibold text-slate-900">{review.reviewer_name}</h4>
                  <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{review.rating}/5</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {review.city} | {toInputDate(review.review_date)}
                </p>
                <p className="mt-2 line-clamp-4 text-sm text-slate-700">{review.review_text}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => openDetail(review._id)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(review._id)}
                    className="rounded-lg bg-amber-500 px-2 py-2 text-xs font-semibold text-white hover:bg-amber-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(review)}
                    className="rounded-lg bg-rose-600 px-2 py-2 text-xs font-semibold text-white hover:bg-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <Modal open={createOpen} title="Create Review" onClose={() => setCreateOpen(false)} widthClass="max-w-3xl">
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Reviewer Name</span>
            <input name="reviewer_name" required value={createForm.reviewer_name} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">City</span>
            <input name="city" required value={createForm.city} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Review Date</span>
            <input name="review_date" type="date" required value={createForm.review_date} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Rating</span>
            <select name="rating" value={createForm.rating} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Review Text</span>
            <textarea name="review_text" required rows={5} value={createForm.review_text} onChange={handleCreateChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="md:col-span-2 mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create Review'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit Review" onClose={() => setEditOpen(false)} widthClass="max-w-3xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading review details...</p>
        ) : (
          <form onSubmit={handleEdit} className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Reviewer Name</span>
              <input name="reviewer_name" required value={editForm.reviewer_name} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">City</span>
              <input name="city" required value={editForm.city} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Review Date</span>
              <input name="review_date" type="date" required value={editForm.review_date} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Rating</span>
              <select name="rating" value={editForm.rating} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Review Text</span>
              <textarea name="review_text" required rows={5} value={editForm.review_text} onChange={handleEditChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
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

      <Modal open={detailOpen} title="Review Details" onClose={() => setDetailOpen(false)} widthClass="max-w-3xl">
        {detailLoading ? <p className="text-sm text-slate-500">Loading details...</p> : null}
        {!detailLoading && detailReview ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold text-slate-700">Reviewer:</span> {detailReview.reviewer_name}
            </p>
            <p>
              <span className="font-semibold text-slate-700">City:</span> {detailReview.city}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Date:</span> {toInputDate(detailReview.review_date)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Rating:</span> {detailReview.rating}/5
            </p>
            <div>
              <p className="font-semibold text-slate-700">Review:</p>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-800">{detailReview.review_text}</p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default ReviewsPanel;
