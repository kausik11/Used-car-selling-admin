function CheckboxField({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
      />
      <span>{label}</span>
    </label>
  );
}

export default CheckboxField;
