import { useState } from 'react';
import CarsPanel from '../components/cars/CarsPanel';
import Sidebar from '../components/layout/Sidebar';
import LoveStoriesPanel from '../components/loveStories/LoveStoriesPanel';
import Topbar from '../components/layout/Topbar';
import ReviewsPanel from '../components/reviews/ReviewsPanel';
import UsersPanel from '../components/users/UsersPanel';

function DashboardPage({ session, onLogout, onSessionUserUpdate }) {
  const [activePanel, setActivePanel] = useState('cars');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200/60">
      <div className="mx-auto flex min-h-screen w-full max-w-[1900px]">
        <Sidebar
          active={activePanel}
          onSelect={setActivePanel}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
            currentUser={session.user}
            onLogout={onLogout}
            onSessionUserUpdate={onSessionUserUpdate}
          />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1420px]">
              {activePanel === 'cars' ? <CarsPanel /> : null}
              {activePanel === 'reviews' ? <ReviewsPanel /> : null}
              {activePanel === 'loveStories' ? <LoveStoriesPanel /> : null}
              {activePanel === 'users' ? <UsersPanel currentUser={session.user} onSessionUserUpdate={onSessionUserUpdate} /> : null}
              {!['cars', 'users', 'reviews', 'loveStories'].includes(activePanel) ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <h2 className="text-2xl font-semibold capitalize text-slate-900">{activePanel}</h2>
                  <p className="mt-2 text-sm text-slate-500">This section is coming soon.</p>
                </section>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
