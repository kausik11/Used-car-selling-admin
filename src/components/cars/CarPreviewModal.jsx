import Modal from '../common/Modal';

function CarPreviewModal({ open, car, onClose }) {
  return (
    <Modal open={open} title="Car Preview" onClose={onClose} widthClass="max-w-4xl">
      {car ? (
        <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(car, null, 2)}</pre>
      ) : (
        <p className="text-sm text-slate-500">Loading...</p>
      )}
    </Modal>
  );
}

export default CarPreviewModal;
