import { useEffect, useMemo, useState } from 'react';
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

  const loadCars = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/cars', { params: { page: 1, limit: 40, sort: '-created_at' } });
      setCars(response.data?.items || []);
    } catch (apiError) {
      const message = apiError.response?.data || { error: apiError.message };
      setError(typeof message === 'string' ? message : JSON.stringify(message, null, 2));
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
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (car) => {
    const confirmed = window.confirm(`Delete car ${car.title || car.car_id}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/cars/${car.car_id}`);
      await loadCars();
    } catch (apiError) {
      const message = apiError.response?.data || { error: apiError.message };
      setError(typeof message === 'string' ? message : JSON.stringify(message, null, 2));
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Overview</p>
        <h2 className="mt-1 text-5xl font-bold text-slate-900">Car Admin Dashboard</h2>
        <p className="mt-2 text-xl text-slate-600">Manage car listings with quick create, preview, edit and delete actions.</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-blue-600 px-6 py-3 text-xl font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-500"
          >
            + Create car
          </button>
          <button
            type="button"
            onClick={loadCars}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-xl font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Refresh list
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-4xl font-semibold text-slate-900">Car Listings</h3>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, brand, model, city"
            className="w-full max-w-lg rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error ? <pre className="mb-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</pre> : null}

        {loading ? <p className="text-lg text-slate-500">Loading cars...</p> : null}

        {!loading && filteredCars.length === 0 ? (
          <p className="text-lg text-slate-500">No cars found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCars.map((car) => (
              <article key={car.car_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <img
                  src={car.media?.images?.[0]?.url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7'}
                  alt={car.title || 'Car preview'}
                  className="h-40 w-full rounded-xl object-cover"
                />

                <div className="mt-3 space-y-1">
                  <h4 className="line-clamp-1 text-2xl font-semibold text-slate-900">{car.title || 'Untitled car'}</h4>
                  <p className="text-lg text-slate-600">
                    {car.brand} {car.model} {car.variant || ''}
                  </p>
                  <p className="text-base text-slate-500">
                    {car.city || 'N/A'} • {car.kms_driven || 0} km
                  </p>
                  <p className="text-xl font-bold text-slate-900">₹ {car.price?.amount || 0}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{car.status || 'draft'}</span>
                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{car.visibility || 'public'}</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(car)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(car)}
                    className="rounded-lg bg-amber-500 px-2 py-2 text-sm font-semibold text-white hover:bg-amber-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(car)}
                    className="rounded-lg bg-rose-600 px-2 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                  >
                    Delete
                  </button>
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
    </div>
  );
}

export default CarsPanel;
