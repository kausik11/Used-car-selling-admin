function Topbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-11 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 lg:block"
        >
          Toggle Sidebar
        </button>
        <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-slate-400">🔎</span>
          <input
            type="text"
            placeholder="Search cars, users, services"
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600">
            🌙
          </button>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600">
            🔔
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 font-semibold text-blue-700">K</span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">kausik saha</p>
              <p className="text-xs text-slate-500">admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
