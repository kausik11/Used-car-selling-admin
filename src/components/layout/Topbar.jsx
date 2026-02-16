import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';
import Modal from '../common/Modal';

const emptyProfileForm = {
  name: '',
  phone: '',
  city: '',
  address: '',
  pin: '',
  budgetRange: '',
  preferredBrand: '',
  fuelType: '',
  transmissionType: '',
};

function Topbar({ onToggleSidebar, currentUser, onLogout, onSessionUserUpdate }) {
  const initial = String(currentUser?.name || 'A').trim().charAt(0).toUpperCase() || 'A';
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyProfileForm);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setForm({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      city: currentUser?.city || '',
      address: currentUser?.address || '',
      pin: currentUser?.pin || '',
      budgetRange: currentUser?.budgetRange || '',
      preferredBrand: currentUser?.preferredBrand || '',
      fuelType: currentUser?.fuelType || '',
      transmissionType: currentUser?.transmissionType || '',
    });
  }, [currentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleOpenEdit = () => {
    setProfileOpen(false);
    setEditOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userId = currentUser?.id || currentUser?._id;
    if (!userId) {
      toast.error('User id not found. Please login again.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone || null,
        city: form.city,
        address: form.address,
        pin: form.pin,
        budgetRange: form.budgetRange || null,
        preferredBrand: form.preferredBrand || null,
        fuelType: form.fuelType || null,
        transmissionType: form.transmissionType || null,
      };

      const response = await api.patch(`/users/${userId}`, payload);
      const updatedUser = response?.data?.user;

      if (updatedUser && onSessionUserUpdate) {
        onSessionUserUpdate({
          id: updatedUser._id || updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          is_email_verified: updatedUser.is_email_verified,
          is_phone_verified: updatedUser.is_phone_verified,
          city: updatedUser.city,
          address: updatedUser.address,
          pin: updatedUser.pin,
          budgetRange: updatedUser.budgetRange,
          preferredBrand: updatedUser.preferredBrand,
          fuelType: updatedUser.fuelType,
          transmissionType: updatedUser.transmissionType,
        });
      }

      toast.success('Profile updated successfully.');
      setEditOpen(false);
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error.message ||
        'Failed to update profile.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        {/* <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 lg:block"
        >
          Toggle Sidebar
        </button> */}
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-slate-400">Search</span>
          <input
            type="text"
            placeholder="Search cars, users, services"
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 font-semibold text-blue-700">{initial}</span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">{currentUser?.name || 'Admin user'}</p>
                <p className="text-xs text-slate-500">{currentUser?.role || 'admin'}</p>
              </div>
            </button>

            {profileOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">User Details</p>
                <div className="mt-2 space-y-2 text-sm">
                  <p>
                    <span className="font-semibold text-slate-700">Name:</span>{' '}
                    <span className="text-slate-900">{currentUser?.name || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Email:</span>{' '}
                    <span className="text-slate-900">{currentUser?.email || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Phone:</span>{' '}
                    <span className="text-slate-900">{currentUser?.phone || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Role:</span>{' '}
                    <span className="capitalize text-slate-900">{currentUser?.role || 'N/A'}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Edit Profile
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>

      <Modal open={editOpen} title="Update Profile" onClose={() => setEditOpen(false)} widthClass="max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Email:</span> {currentUser?.email || 'N/A'}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-800">Role:</span> {currentUser?.role || 'N/A'}
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">City</span>
            <input name="city" value={form.city} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">PIN</span>
            <input name="pin" value={form.pin} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
            <input name="address" value={form.address} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Budget Range</span>
            <input name="budgetRange" value={form.budgetRange} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Preferred Brand</span>
            <input name="preferredBrand" value={form.preferredBrand} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Fuel Type</span>
            <input name="fuelType" value={form.fuelType} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Transmission Type</span>
            <input name="transmissionType" value={form.transmissionType} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <div className="md:col-span-2 mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
}

export default Topbar;
