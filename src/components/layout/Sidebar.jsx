import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi2';
import { FiSettings } from 'react-icons/fi';
import { LuCarFront, LuMessageSquareQuote } from 'react-icons/lu';
import { RiQuestionnaireLine } from 'react-icons/ri';
import { HiOutlineUsers } from 'react-icons/hi2';

const navItems = [
  { id: 'cars', label: 'Cars', Icon: LuCarFront },
  { id: 'users', label: 'Users', Icon: HiOutlineUsers },
  { id: 'reviews', label: 'Reviews', Icon: LuMessageSquareQuote },
  { id: 'faqs', label: 'FAQs', Icon: RiQuestionnaireLine },
  { id: 'settings', label: 'Settings', Icon: FiSettings },
];

function Sidebar({ active, onSelect, collapsed, onToggle }) {
  return (
    <aside
      className={`hidden shrink-0 border-r border-slate-200 bg-white transition-all duration-300 lg:block ${
        collapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-4' : 'justify-between px-5 py-6'}`}>
        {!collapsed ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Admin</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">Dashboard</h1>
          </div>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Admin</p>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <HiChevronDoubleRight className="h-4 w-4" /> : <HiChevronDoubleLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className={`space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
        {navItems.map((item) => {
          const selected = active === item.id;
          const Icon = item.Icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              title={item.label}
              className={`flex w-full items-center rounded-xl py-3 transition ${
                selected
                  ? 'bg-blue-50 text-slate-900 ring-1 ring-blue-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              } ${collapsed ? 'justify-center px-2' : 'gap-3 px-4 text-left'}`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-sm">
                <Icon className="h-5 w-5" />
              </span>
              {!collapsed ? <span className="text-sm font-medium leading-none">{item.label}</span> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
