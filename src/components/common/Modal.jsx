function Modal({ open, title, children, onClose, widthClass = 'max-w-5xl' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 p-3 md:p-8" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`mx-auto max-h-[92vh] w-full ${widthClass} overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(92vh-61px)] overflow-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
