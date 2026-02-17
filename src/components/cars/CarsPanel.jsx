import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';
import CarPreviewModal from './CarPreviewModal';
import CreateCarForm from './CreateCarForm';

function CarsPanel() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [selectedCar, setSelectedCar] = useState(null);
  const [editCarData, setEditCarData] = useState(null);
  const [previewCar, setPreviewCar] = useState(null);
  const [slugLookup, setSlugLookup] = useState({
    city: '',
    brand: '',
    model: '',
    car_slug: '',
    listing_ref: '',
  });
  const [slugLoading, setSlugLoading] = useState(false);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaCar, setMediaCar] = useState(null);
  const [mediaSubmitting, setMediaSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [reportFile, setReportFile] = useState(null);

  const getApiErrorMessage = (apiError, fallback) => {
    const payload = apiError?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    return fallback || apiError?.message || 'Request failed';
  };

  const loadCars = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/cars', { params: { page: 1, limit: 40, sort: '-created_at' } });
      setCars(response.data?.items || []);
    } catch (apiError) {
      const message = apiError.response?.data || { error: apiError.message };
      setError(typeof message === 'string' ? message : JSON.stringify(message, null, 2));
      toast.error(getApiErrorMessage(apiError, 'Failed to load cars.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const filteredCars = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cars;
    return cars.filter((car) => {
      const text = `${car.title || ''} ${car.brand || ''} ${car.model || ''} ${car.city || ''} ${car.car_id || ''}`.toLowerCase();
      return text.includes(term);
    });
  }, [cars, search]);

  const handlePreview = async (car) => {
    setPreviewOpen(true);
    setPreviewCar(null);

    try {
      const response = await api.get(`/cars/${car.car_id}`);
      setPreviewCar(response.data);
    } catch {
      setPreviewCar(car);
    }
  };

  const handleEdit = async (car) => {
    setSelectedCar(car);
    setEditOpen(true);
    setEditLoading(true);
    setEditCarData(null);

    try {
      const response = await api.get(`/cars/${car.car_id}`);
      setEditCarData(response.data);
    } catch (apiError) {
      const message = apiError.response?.data || { error: apiError.message };
      setError(typeof message === 'string' ? message : JSON.stringify(message, null, 2));
      toast.error(getApiErrorMessage(apiError, 'Failed to load car details.'));
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (car) => {
    const confirmed = window.confirm(`Delete car ${car.title || car.car_id}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/cars/${car.car_id}`);
      toast.success('Car deleted successfully.');
      await loadCars();
    } catch (apiError) {
      const message = apiError.response?.data || { error: apiError.message };
      setError(typeof message === 'string' ? message : JSON.stringify(message, null, 2));
      toast.error(getApiErrorMessage(apiError, 'Failed to delete car.'));
    }
  };

  const handleSlugLookupChange = (event) => {
    const { name, value } = event.target;
    setSlugLookup((current) => ({ ...current, [name]: value }));
  };

  const handleFetchBySlug = async () => {
    if (!slugLookup.city || !slugLookup.brand || !slugLookup.model || !slugLookup.car_slug || !slugLookup.listing_ref) {
      toast.error('city, brand, model, car_slug and listing_ref are required for slug lookup.');
      return;
    }

    setSlugLoading(true);
    try {
      const response = await api.get(
        `/buy-used-cars/${encodeURIComponent(slugLookup.city)}/${encodeURIComponent(slugLookup.brand)}/${encodeURIComponent(slugLookup.model)}/${encodeURIComponent(slugLookup.car_slug)}/${encodeURIComponent(slugLookup.listing_ref)}`,
      );
      setPreviewCar(response.data);
      setPreviewOpen(true);
      toast.success('Car loaded by slug route.');
    } catch (apiError) {
      toast.error(getApiErrorMessage(apiError, 'Failed to fetch car by slug.'));
    } finally {
      setSlugLoading(false);
    }
  };

  const openMediaUpload = (car) => {
    setMediaCar(car);
    setMediaFiles([]);
    setReportFile(null);
    setMediaOpen(true);
  };

  const handleMediaUpload = async (event) => {
    event.preventDefault();
    if (!mediaCar?.car_id) return;
    if (mediaFiles.length === 0 && !reportFile) {
      toast.error('Choose at least one image or an inspection report file.');
      return;
    }

    const formData = new FormData();
    mediaFiles.forEach((file, index) => {
      formData.append(`images_view_type_${index}`, 'gallery');
      formData.append(`images_gallery_category_${index}`, 'other');
      formData.append(`images_kind_${index}`, 'other');
      formData.append('images', file);
    });
    if (reportFile) {
      formData.append('inspection_report', reportFile);
    }

    setMediaSubmitting(true);
    try {
      await api.post(`/cars/${mediaCar.car_id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Media uploaded successfully.');
      setMediaOpen(false);
      loadCars();
    } catch (apiError) {
      toast.error(getApiErrorMessage(apiError, 'Failed to upload media.'));
    } finally {
      setMediaSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overview</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Car Admin Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Manage car listings with quick create, preview, edit and delete actions.</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-500"
          >
            + Create car
          </button>
          <button
            type="button"
            onClick={loadCars}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Refresh list
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Lookup By Slug Route</p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <input
              name="city"
              value={slugLookup.city}
              onChange={handleSlugLookupChange}
              placeholder="city"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="brand"
              value={slugLookup.brand}
              onChange={handleSlugLookupChange}
              placeholder="brand"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="model"
              value={slugLookup.model}
              onChange={handleSlugLookupChange}
              placeholder="model"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="car_slug"
              value={slugLookup.car_slug}
              onChange={handleSlugLookupChange}
              placeholder="car_slug"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="listing_ref"
              value={slugLookup.listing_ref}
              onChange={handleSlugLookupChange}
              placeholder="listing_ref"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleFetchBySlug}
            disabled={slugLoading}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {slugLoading ? 'Loading...' : 'Fetch by slug'}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-slate-900">Car Listings</h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, brand, model, city"
            className="w-full max-w-lg rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error ? <pre className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</pre> : null}

        {loading ? <p className="text-sm text-slate-500">Loading cars...</p> : null}

        {!loading && filteredCars.length === 0 ? (
          <p className="text-sm text-slate-500">No cars found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredCars.map((car) => (
              <article
                key={car.car_id}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <img
                  src={car.media?.images?.[0]?.url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7'}
                  alt={car.title || 'Car preview'}
                  className="h-44 w-full rounded-xl object-cover"
                />

                <div className="mt-3 flex flex-1 flex-col">
                  <div className="space-y-1">
                    <h4 className="line-clamp-1 text-base font-semibold text-slate-900">{car.title || 'Untitled car'}</h4>
                    <p className="line-clamp-1 text-sm text-slate-600">
                      {car.brand} {car.model} {car.variant || ''}
                    </p>
                    <p className="text-xs text-slate-500">
                      {car.city || 'N/A'} | {car.kms_driven || 0} km
                    </p>
                    <p className="pt-1 text-base font-bold text-slate-900">Rs {car.price?.amount || 0}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {car.status || 'draft'}
                    </span>
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      {car.visibility || 'public'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(car)}
                      className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-2 text-xs font-semibold text-sky-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-1 active:translate-y-[1px]"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(car)}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-1 active:translate-y-[1px]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(car)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-100 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-1 active:translate-y-[1px]"
                    >
                      Delete
                    </button>
                    {/* <button
                      type="button"
                      onClick={() => openMediaUpload(car)}
                      className="rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-blue-500"
                    >
                      Media
                    </button> */}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal open={createOpen} title="Create Car" onClose={() => setCreateOpen(false)}>
        <CreateCarForm
          compact
          mode="create"
          onCancel={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            loadCars();
          }}
        />
      </Modal>

      <Modal open={editOpen} title="Edit Car" onClose={() => setEditOpen(false)}>
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading car details...</p>
        ) : (
          <CreateCarForm
            compact
            mode="edit"
            carId={selectedCar?.car_id}
            initialData={editCarData}
            onCancel={() => setEditOpen(false)}
            onSuccess={() => {
              setEditOpen(false);
              loadCars();
            }}
          />
        )}
      </Modal>

      <CarPreviewModal open={previewOpen} car={previewCar} onClose={() => setPreviewOpen(false)} />

      <Modal open={mediaOpen} title={`Upload Media${mediaCar?.title ? ` - ${mediaCar.title}` : ''}`} onClose={() => setMediaOpen(false)} widthClass="max-w-2xl">
        <form onSubmit={handleMediaUpload} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Images (multiple)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setMediaFiles(Array.from(event.target.files || []))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Inspection report (optional)</span>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => setReportFile(event.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p>Selected images: {mediaFiles.length}</p>
            <p>Report: {reportFile?.name || 'none'}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMediaOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mediaSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mediaSubmitting ? 'Uploading...' : 'Upload Media'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CarsPanel;

