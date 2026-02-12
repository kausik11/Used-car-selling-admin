import { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../common/Modal';
import SelectField from '../common/SelectField';
import TextField from '../common/TextField';

const statusOptions = [
  { value: 'draft', label: 'draft' },
  { value: 'active', label: 'active' },
  { value: 'sold', label: 'sold' },
  { value: 'archived', label: 'archived' },
];

const visibilityOptions = [
  { value: 'public', label: 'public' },
  { value: 'private', label: 'private' },
  { value: 'hidden', label: 'hidden' },
];

function CarEditModal({ open, car, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: '',
    brand: '',
    model: '',
    city: '',
    kms_driven: '',
    status: 'active',
    visibility: 'public',
    price_amount: '',
    price_currency: 'INR',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!car) return;
    setForm({
      title: car.title || '',
      brand: car.brand || '',
      model: car.model || '',
      city: car.city || '',
      kms_driven: car.kms_driven ? String(car.kms_driven) : '',
      status: car.status || 'active',
      visibility: car.visibility || 'public',
      price_amount: car.price?.amount ? String(car.price.amount) : '',
      price_currency: car.price?.currency || 'INR',
    });
    setError('');
  }, [car]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!car?.car_id) return;

    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title,
        brand: form.brand,
        model: form.model,
        city: form.city,
        kms_driven: Number(form.kms_driven),
        status: form.status,
        visibility: form.visibility,
        price: {
          amount: Number(form.price_amount),
          currency: form.price_currency,
        },
      };

      await api.patch(`/cars/${car.car_id}`, payload);
      onUpdated();
      onClose();
    } catch (apiError) {
      const message = apiError.response?.data || { error: apiError.message };
      setError(typeof message === 'string' ? message : JSON.stringify(message, null, 2));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Edit Car" onClose={onClose} widthClass="max-w-3xl">
      <form className="space-y-4" onSubmit={handleSave}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" name="title" value={form.title} onChange={handleChange} required />
          <TextField label="Brand" name="brand" value={form.brand} onChange={handleChange} required />
          <TextField label="Model" name="model" value={form.model} onChange={handleChange} required />
          <TextField label="City" name="city" value={form.city} onChange={handleChange} required />
          <TextField label="KMs Driven" name="kms_driven" type="number" value={form.kms_driven} onChange={handleChange} required />
          <TextField
            label="Price Amount"
            name="price_amount"
            type="number"
            value={form.price_amount}
            onChange={handleChange}
            required
          />
          <TextField
            label="Price Currency"
            name="price_currency"
            value={form.price_currency}
            onChange={handleChange}
            required
          />
          <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={statusOptions} />
          <SelectField
            label="Visibility"
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            options={visibilityOptions}
          />
        </div>

        {error ? <pre className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</pre> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
}

export default CarEditModal;
