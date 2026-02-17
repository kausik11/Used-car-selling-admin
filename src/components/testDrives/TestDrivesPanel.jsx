import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const FIXED_HUB_LOCATION = '30/A, Dumdum, Station Road';
const TEST_DRIVE_SLOTS = [
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
  '19:00-20:00',
];
const STATUS_OPTIONS = ['booked', 'cancelled', 'completed'];

const initialForm = {
  car_id: '',
  customerName: '',
  customerPhone: '',
  hub_location: FIXED_HUB_LOCATION,
  date: '',
  time_slot: TEST_DRIVE_SLOTS[0],
  status: 'booked',
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const mapToEditForm = (item) => ({
  car_id: item?.car_id || '',
  customerName: item?.customerName || '',
  customerPhone: item?.customerPhone || '',
  hub_location: item?.hub_location || FIXED_HUB_LOCATION,
  date: toDateInput(item?.date),
  time_slot: item?.time_slot || TEST_DRIVE_SLOTS[0],
  status: item?.status || 'booked',
});

function TestDrivesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [createForm, setCreateForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [detailItem, setDetailItem] = useState(null);

  const [filterCarId, setFilterCarId] = useState('');
  const [filterCarSuggestions, setFilterCarSuggestions] = useState([]);
  const [filterCarSuggestionsLoading, setFilterCarSuggestionsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [carLookupId, setCarLookupId] = useState('');
  const [carLookupResult, setCarLookupResult] = useState(null);
  const [carLookupLoading, setCarLookupLoading] = useState(false);

  const [slotCarId, setSlotCarId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotResult, setSlotResult] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.error) return payload.error;
    return fallback || error?.message || 'Request failed';
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 50, sort: '-created_at' };
      if (filterCarId.trim()) params.car_id = filterCarId.trim();
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      const response = await api.get('/test-drives', { params });
      setItems(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load test drive bookings.'));
    } finally {
      setLoading(false);
    }
  };

  const loadCars = async () => {
    setCarsLoading(true);
    try {
      const response = await api.get('/cars', {
        params: {
          page: 1,
          limit: 200,
          sort: '-created_at',
          status: 'active',
          visibility: 'public',
        },
      });
      setCars(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load cars list.'));
    } finally {
      setCarsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    loadCars();
  }, []);

  useEffect(() => {
    const query = filterCarId.trim();
    if (!query) {
      setFilterCarSuggestions([]);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      setFilterCarSuggestionsLoading(true);
      try {
        const response = await api.get('/cars', {
          params: {
            q: query,
            page: 1,
            limit: 20,
            sort: '-created_at',
            status: 'active',
            visibility: 'public',
          },
        });
        setFilterCarSuggestions(response.data?.items || []);
      } catch (_error) {
        setFilterCarSuggestions([]);
      } finally {
        setFilterCarSuggestionsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filterCarId]);

  const handleFormChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      const payload = {
        car_id: createForm.car_id.trim(),
        customerName: createForm.customerName.trim(),
        customerPhone: createForm.customerPhone.trim(),
        hub_location: FIXED_HUB_LOCATION,
        date: createForm.date,
        time_slot: createForm.time_slot,
      };
      await api.post('/test-drives', payload);
      toast.success('Test drive booking created successfully.');
      setCreateOpen(false);
      setCreateForm(initialForm);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create test drive booking.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = async (item) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditingId(item?._id || '');
    try {
      const form = mapToEditForm(item);
      setEditForm(form);
      setDetailItem(item);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    try {
      const payload = {
        customerName: editForm.customerName.trim(),
        customerPhone: editForm.customerPhone.trim(),
        hub_location: FIXED_HUB_LOCATION,
        date: editForm.date,
        time_slot: editForm.time_slot,
        status: editForm.status,
      };
      await api.patch(`/test-drives/${editingId}`, payload);
      toast.success('Test drive booking updated successfully.');
      setEditOpen(false);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update test drive booking.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const bookingId = item?._id;
    if (!bookingId) return;
    const confirmed = window.confirm(`Delete booking for car ${item.car_id}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }
    try {
      await api.delete(`/test-drives/${bookingId}`);
      toast.success('Test drive booking deleted successfully.');
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete test drive booking.'));
    }
  };

  const handleLookupByCar = async () => {
    if (!carLookupId.trim()) {
      toast.warning('Enter car_id for lookup.');
      return;
    }
    setCarLookupLoading(true);
    setCarLookupResult(null);
    try {
      const response = await api.get(`/cars/${carLookupId.trim()}/test-drives`);
      setCarLookupResult(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch bookings by car.'));
    } finally {
      setCarLookupLoading(false);
    }
  };

  const handleLookupSlots = async () => {
    if (!slotCarId.trim() || !slotDate) {
      toast.warning('car_id and date are required for slots lookup.');
      return;
    }
    setSlotLoading(true);
    setSlotResult(null);
    try {
      const response = await api.get('/test-drives/slots', {
        params: {
          car_id: slotCarId.trim(),
          hub_location: FIXED_HUB_LOCATION,
          date: slotDate,
        },
      });
      setSlotResult(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch test drive slots.'));
    } finally {
      setSlotLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Test Drives</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Test Drive Bookings</h2>
        <p className="mt-2 text-sm text-slate-600">Manage test drive bookings and slot availability.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCreateOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            + Create Booking
          </button>
          <button type="button" onClick={loadItems} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <div className="relative">
            <input
              value={filterCarId}
              onChange={(e) => setFilterCarId(e.target.value)}
              placeholder="Filter by car_id or title"
              list="test-drive-car-suggestions"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {filterCarSuggestionsLoading ? (
              <span className="pointer-events-none absolute right-3 top-2 text-[11px] text-slate-400">Loading...</span>
            ) : null}
            <datalist id="test-drive-car-suggestions">
              {filterCarSuggestions.map((car) => (
                <option key={car.car_id} value={car.car_id}>
                  {car.title || `${car.brand || ''} ${car.model || ''}`}
                </option>
              ))}
            </datalist>
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button type="button" onClick={loadItems} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Apply Filter</button>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading test drive bookings...</p> : null}
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">No bookings found.</p> : null}

        {!loading && items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-base font-semibold text-slate-900">Car: {item.car_id}</h4>
                <p className="text-xs text-slate-600">Customer: {item.customerName || 'N/A'}</p>
                <p className="text-xs text-slate-600">Phone: {item.customerPhone || 'N/A'}</p>
                <p className="text-xs text-slate-600">Hub: {item.hub_location}</p>
                <p className="text-xs text-slate-600">Date: {toDateInput(item.date)}</p>
                <p className="text-xs text-slate-600">Slot: {item.time_slot}</p>
                <p className="mt-1 text-xs capitalize text-slate-700">Status: {item.status}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailItem(item);
                      setDetailOpen(true);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="rounded-lg bg-amber-500 px-2 py-2 text-xs font-semibold text-white hover:bg-amber-400"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">Bookings By Car</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={carLookupId} onChange={(e) => setCarLookupId(e.target.value)} placeholder="Enter car_id" className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button type="button" onClick={handleLookupByCar} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Fetch</button>
        </div>
        {carLookupLoading ? <p className="mt-3 text-sm text-slate-500">Loading by car...</p> : null}
        {carLookupResult?.items?.length > 0 ? (
          <div className="mt-3 space-y-2">
            {carLookupResult.items.map((item) => (
              <div key={item._id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
                {toDateInput(item.date)} | {item.time_slot} | {item.status}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">Slot Availability</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input value={slotCarId} onChange={(e) => setSlotCarId(e.target.value)} placeholder="car_id" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button type="button" onClick={handleLookupSlots} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Check Slots</button>
        </div>
        {slotLoading ? <p className="mt-3 text-sm text-slate-500">Loading slots...</p> : null}
        {slotResult?.slots?.length > 0 ? (
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {slotResult.slots.map((slot) => (
              <div key={slot.time_slot} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${slot.available ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-rose-300 bg-rose-50 text-rose-700'}`}>
                {slot.time_slot} - {slot.available ? 'Available' : 'Booked'}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <Modal open={createOpen} title="Create Test Drive Booking" onClose={() => setCreateOpen(false)} widthClass="max-w-3xl">
        <form onSubmit={handleCreate} className="grid gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Car</span>
            <select
              name="car_id"
              value={createForm.car_id}
              onChange={handleFormChange(setCreateForm)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">{carsLoading ? 'Loading cars...' : 'Select car'}</option>
              {cars.map((car) => (
                <option key={car.car_id} value={car.car_id}>
                  {car.title || `${car.brand || ''} ${car.model || ''}`} ({car.car_id})
                </option>
              ))}
            </select>
          </label>
          <input
            name="customerName"
            value={createForm.customerName}
            onChange={handleFormChange(setCreateForm)}
            placeholder="Customer Name"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="customerPhone"
            value={createForm.customerPhone}
            onChange={handleFormChange(setCreateForm)}
            placeholder="Customer Phone (10 digits)"
            pattern="[0-9]{10}"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input name="hub_location" value={FIXED_HUB_LOCATION} readOnly className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm" />
          <input type="date" name="date" value={createForm.date} onChange={handleFormChange(setCreateForm)} required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <select name="time_slot" value={createForm.time_slot} onChange={handleFormChange(setCreateForm)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {TEST_DRIVE_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit Test Drive Booking" onClose={() => setEditOpen(false)} widthClass="max-w-3xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading booking...</p>
        ) : (
          <form onSubmit={handleEdit} className="grid gap-3">
            <input name="car_id" value={editForm.car_id} readOnly className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm" />
            <input
              name="customerName"
              value={editForm.customerName}
              onChange={handleFormChange(setEditForm)}
              placeholder="Customer Name"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="customerPhone"
              value={editForm.customerPhone}
              onChange={handleFormChange(setEditForm)}
              placeholder="Customer Phone (10 digits)"
              pattern="[0-9]{10}"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input name="hub_location" value={FIXED_HUB_LOCATION} readOnly className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm" />
            <input type="date" name="date" value={editForm.date} onChange={handleFormChange(setEditForm)} required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <select name="time_slot" value={editForm.time_slot} onChange={handleFormChange(setEditForm)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {TEST_DRIVE_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <select name="status" value={editForm.status} onChange={handleFormChange(setEditForm)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={editSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                {editSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={detailOpen} title="Test Drive Booking Details" onClose={() => setDetailOpen(false)} widthClass="max-w-3xl">
        {detailItem ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-slate-700">Booking ID:</span> {detailItem._id}</p>
            <p><span className="font-semibold text-slate-700">Car ID:</span> {detailItem.car_id}</p>
            <p><span className="font-semibold text-slate-700">Customer Name:</span> {detailItem.customerName || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700">Customer Phone:</span> {detailItem.customerPhone || 'N/A'}</p>
            <p><span className="font-semibold text-slate-700">Hub:</span> {detailItem.hub_location}</p>
            <p><span className="font-semibold text-slate-700">Date:</span> {toDateInput(detailItem.date)}</p>
            <p><span className="font-semibold text-slate-700">Time Slot:</span> {detailItem.time_slot}</p>
            <p><span className="font-semibold text-slate-700">Status:</span> {detailItem.status}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No details available.</p>
        )}
      </Modal>
    </div>
  );
}

export default TestDrivesPanel;
