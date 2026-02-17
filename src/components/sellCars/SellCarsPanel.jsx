import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'];
const TRANSMISSIONS = ['manual', 'automatic', 'amt', 'cvt', 'dct'];
const OWNERS = ['first', 'second', 'third', 'fourth_plus'];
const CONDITIONS = ['excellent', 'good', 'average', 'needs_work'];
const STATUSES = ['pending', 'approved', 'rejected', 'sold'];

const initialForm = {
  brand: '',
  model: '',
  variant: '',
  year: '',
  fuelType: 'petrol',
  transmission: 'manual',
  kmDriven: '',
  owner: 'first',
  city: '',
  state: '',
  condition: 'good',
  accidentHistory: false,
  expectedPrice: '',
  negotiable: true,
  status: 'pending',
  adminStatement: '',
  sellerFullName: '',
  sellerEmail: '',
  sellerPhoneNumber: '',
  sellerPhoneVerified: false,
  front: null,
  back: null,
  interior: null,
  odometer: null,
};

const mapToEditForm = (item) => ({
  brand: item?.brand || '',
  model: item?.model || '',
  variant: item?.variant || '',
  year: item?.year || '',
  fuelType: item?.fuelType || 'petrol',
  transmission: item?.transmission || 'manual',
  kmDriven: item?.kmDriven || '',
  owner: item?.owner || 'first',
  city: item?.city || '',
  state: item?.state || '',
  condition: item?.condition || 'good',
  accidentHistory: Boolean(item?.accidentHistory),
  expectedPrice: item?.expectedPrice || '',
  negotiable: Boolean(item?.negotiable),
  status: item?.status || 'pending',
  adminStatement: item?.adminStatement || '',
  sellerFullName: item?.seller?.fullName || '',
  sellerEmail: item?.seller?.email || '',
  sellerPhoneNumber: item?.seller?.phoneNumber || '',
  sellerPhoneVerified: Boolean(item?.seller?.phoneVerified),
  front: null,
  back: null,
  interior: null,
  odometer: null,
});

function SellCarsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [createForm, setCreateForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [detailItem, setDetailItem] = useState(null);

  const getErrorMessage = (error, fallback) => {
    const payload = error?.response?.data;
    if (typeof payload === 'string') return payload;
    if (payload?.message) return payload.message;
    if (payload?.error) return payload.error;
    return fallback || error?.message || 'Request failed';
  };

  const buildFormData = (form, includeRequiredImages) => {
    const formData = new FormData();
    formData.append('brand', form.brand);
    formData.append('model', form.model);
    formData.append('variant', form.variant);
    formData.append('year', String(form.year));
    formData.append('fuelType', form.fuelType);
    formData.append('transmission', form.transmission);
    formData.append('kmDriven', String(form.kmDriven));
    formData.append('owner', form.owner);
    formData.append('city', form.city);
    formData.append('state', form.state);
    formData.append('condition', form.condition);
    formData.append('accidentHistory', String(form.accidentHistory));
    formData.append('expectedPrice', String(form.expectedPrice));
    formData.append('negotiable', String(form.negotiable));
    formData.append('status', form.status);
    formData.append('adminStatement', form.adminStatement || '');
    formData.append('seller.fullName', form.sellerFullName);
    formData.append('seller.email', form.sellerEmail || '');
    formData.append('seller.phoneNumber', form.sellerPhoneNumber);
    formData.append('seller.phoneVerified', String(form.sellerPhoneVerified));

    ['front', 'back', 'interior', 'odometer'].forEach((field) => {
      const file = form[field];
      if (file) {
        formData.append(field, file);
      } else if (includeRequiredImages) {
        throw new Error(`Please upload ${field} image.`);
      }
    });

    return formData;
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sell-cars', {
        params: { page: 1, limit: 50, sort: '-createdAt' },
      });
      setItems(response.data?.items || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load sell car requests.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleFormChange = (setter) => (event) => {
    const { name, value, type, checked, files } = event.target;
    setter((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    try {
      const formData = buildFormData(createForm, true);
      await api.post('/sell-cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Sell car request created successfully.');
      setCreateOpen(false);
      setCreateForm(initialForm);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create sell car request.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEdit = async (id) => {
    setEditOpen(true);
    setEditLoading(true);
    setEditingId(id);
    try {
      const response = await api.get(`/sell-cars/${id}`);
      setEditForm(mapToEditForm(response.data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load sell car details.'));
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
      const formData = buildFormData(editForm, false);
      await api.patch(`/sell-cars/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Sell car request updated successfully.');
      setEditOpen(false);
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update sell car request.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const openDetail = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailItem(null);
    try {
      const response = await api.get(`/sell-cars/${id}`);
      setDetailItem(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load details.'));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const id = item?._id;
    if (!id) return;
    const confirmed = window.confirm(`Delete sell car request for ${item.brand} ${item.model}?`);
    if (!confirmed) {
      toast.warning('Delete canceled.');
      return;
    }

    try {
      await api.delete(`/sell-cars/${id}`);
      toast.success('Sell car request deleted successfully.');
      loadItems();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete sell car request.'));
    }
  };

  const renderForm = (form, onChange) => (
    <div className="grid gap-3 md:grid-cols-2">
      <input name="brand" value={form.brand} onChange={onChange} placeholder="Brand" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="model" value={form.model} onChange={onChange} placeholder="Model" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="variant" value={form.variant} onChange={onChange} placeholder="Variant" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="year" type="number" value={form.year} onChange={onChange} placeholder="Year" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />

      <select name="fuelType" value={form.fuelType} onChange={onChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {FUEL_TYPES.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <select name="transmission" value={form.transmission} onChange={onChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {TRANSMISSIONS.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <input name="kmDriven" type="number" value={form.kmDriven} onChange={onChange} placeholder="KM Driven" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <select name="owner" value={form.owner} onChange={onChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {OWNERS.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <input name="city" value={form.city} onChange={onChange} placeholder="City" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="state" value={form.state} onChange={onChange} placeholder="State" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <select name="condition" value={form.condition} onChange={onChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {CONDITIONS.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <input name="expectedPrice" type="number" value={form.expectedPrice} onChange={onChange} placeholder="Expected Price" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <select name="status" value={form.status} onChange={onChange} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {STATUSES.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      <input name="sellerFullName" value={form.sellerFullName} onChange={onChange} placeholder="Seller Full Name" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="sellerEmail" type="email" value={form.sellerEmail} onChange={onChange} placeholder="Seller Email (optional)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input name="sellerPhoneNumber" value={form.sellerPhoneNumber} onChange={onChange} placeholder="Seller Phone (10 digits)" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <textarea name="adminStatement" value={form.adminStatement} onChange={onChange} placeholder="Admin statement" rows={3} className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="accidentHistory" checked={form.accidentHistory} onChange={onChange} />
        Accident history
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="negotiable" checked={form.negotiable} onChange={onChange} />
        Negotiable
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="sellerPhoneVerified" checked={form.sellerPhoneVerified} onChange={onChange} />
        Seller phone verified
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Front Image</span>
        <input type="file" name="front" accept="image/*" onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Back Image</span>
        <input type="file" name="back" accept="image/*" onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Interior Image</span>
        <input type="file" name="interior" accept="image/*" onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Odometer Image</span>
        <input type="file" name="odometer" accept="image/*" onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
    </div>
  );

  return (
    <div className="space-y-5 text-sm">
      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sell Cars</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-900">Sell Car Requests</h2>
        <p className="mt-2 text-sm text-slate-600">Manage sell-car submissions with Cloudinary image uploads.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCreateOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            + Create Sell Car
          </button>
          <button type="button" onClick={loadItems} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        {loading ? <p className="text-sm text-slate-500">Loading sell car requests...</p> : null}
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">No sell car records found.</p> : null}

        {!loading && items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <img src={item.images?.front} alt={`${item.brand} ${item.model}`} className="h-40 w-full rounded-lg object-cover" />
                <h4 className="mt-3 line-clamp-1 text-base font-semibold text-slate-900">{item.title || `${item.brand} ${item.model} ${item.variant}`}</h4>
                <p className="text-xs text-slate-600">{item.brand} {item.model} {item.variant}</p>
                <p className="text-xs text-slate-600">{item.city}, {item.state} | {item.year} | {item.kmDriven} km</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Rs {item.expectedPrice}</p>
                <p className="text-xs capitalize text-slate-600">Status: {item.status}</p>
                <p className="mt-1 text-xs text-slate-500">Seller: {item.seller?.fullName} ({item.seller?.phoneNumber})</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => openDetail(item._id)} className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-2 text-xs font-semibold text-sky-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-1 active:translate-y-[1px]">
                    View
                  </button>
                  <button type="button" onClick={() => openEdit(item._id)} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-1 active:translate-y-[1px]">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(item)} className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-100 hover:text-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-1 active:translate-y-[1px]">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <Modal open={createOpen} title="Create Sell Car Request" onClose={() => setCreateOpen(false)} widthClass="max-w-5xl">
        <form onSubmit={handleCreate} className="space-y-4">
          {renderForm(createForm, handleFormChange(setCreateForm))}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {createSubmitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title="Edit Sell Car Request" onClose={() => setEditOpen(false)} widthClass="max-w-5xl">
        {editLoading ? (
          <p className="text-sm text-slate-500">Loading record details...</p>
        ) : (
          <form onSubmit={handleEdit} className="space-y-4">
            {renderForm(editForm, handleFormChange(setEditForm))}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={editSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                {editSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={detailOpen} title="Sell Car Details" onClose={() => setDetailOpen(false)} widthClass="max-w-5xl">
        {detailLoading ? <p className="text-sm text-slate-500">Loading details...</p> : null}
        {!detailLoading && detailItem ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {['front', 'back', 'interior', 'odometer'].map((field) => (
                <img key={field} src={detailItem.images?.[field]} alt={field} className="h-40 w-full rounded-xl object-cover" />
              ))}
            </div>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p><span className="font-semibold text-slate-700">Title:</span> {detailItem.title || 'N/A'}</p>
              <p><span className="font-semibold text-slate-700">Car:</span> {detailItem.brand} {detailItem.model} {detailItem.variant}</p>
              <p><span className="font-semibold text-slate-700">Year:</span> {detailItem.year}</p>
              <p><span className="font-semibold text-slate-700">Fuel/Transmission:</span> {detailItem.fuelType} / {detailItem.transmission}</p>
              <p><span className="font-semibold text-slate-700">KM Driven:</span> {detailItem.kmDriven}</p>
              <p><span className="font-semibold text-slate-700">Owner:</span> {detailItem.owner}</p>
              <p><span className="font-semibold text-slate-700">Condition:</span> {detailItem.condition}</p>
              <p><span className="font-semibold text-slate-700">Location:</span> {detailItem.city}, {detailItem.state}</p>
              <p><span className="font-semibold text-slate-700">Expected Price:</span> Rs {detailItem.expectedPrice}</p>
              <p><span className="font-semibold text-slate-700">Status:</span> {detailItem.status}</p>
              <p><span className="font-semibold text-slate-700">Negotiable:</span> {detailItem.negotiable ? 'Yes' : 'No'}</p>
              <p><span className="font-semibold text-slate-700">Accident:</span> {detailItem.accidentHistory ? 'Yes' : 'No'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p><span className="font-semibold text-slate-700">Seller:</span> {detailItem.seller?.fullName}</p>
              <p><span className="font-semibold text-slate-700">Email:</span> {detailItem.seller?.email || 'N/A'}</p>
              <p><span className="font-semibold text-slate-700">Phone:</span> {detailItem.seller?.phoneNumber}</p>
              <p><span className="font-semibold text-slate-700">Phone Verified:</span> {detailItem.seller?.phoneVerified ? 'Yes' : 'No'}</p>
            </div>
            {detailItem.adminStatement ? (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-700">Admin Statement</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-800">{detailItem.adminStatement}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default SellCarsPanel;

