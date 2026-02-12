const navItems = [
  { id: 'cars', label: 'Cars', icon: '🚗' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'faqs', label: 'FAQs', icon: '❓' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar({ active, onSelect }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <nav className="space-y-2 px-4">
        {navItems.map((item) => {
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-lg transition ${
                selected
                  ? 'bg-blue-50 text-slate-900 ring-1 ring-blue-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-sm">{item.icon}</span>
              <span className="text-[30px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
