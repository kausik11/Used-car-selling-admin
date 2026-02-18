import { useState } from 'react';
import CarsPanel from '../components/cars/CarsPanel';
import FaqsPanel from '../components/faqs/FaqsPanel';
import Sidebar from '../components/layout/Sidebar';
import LoveStoriesPanel from '../components/loveStories/LoveStoriesPanel';
import SellCarsPanel from '../components/sellCars/SellCarsPanel';
import TestDrivesPanel from '../components/testDrives/TestDrivesPanel';
import CallbackRequestsPanel from '../components/callbackRequests/CallbackRequestsPanel';
import NewslettersPanel from '../components/newsletter/NewslettersPanel';
import Topbar from '../components/layout/Topbar';
import ReviewsPanel from '../components/reviews/ReviewsPanel';
import TestimonialsPanel from '../components/testimonials/TestimonialsPanel';
import UsersPanel from '../components/users/UsersPanel';
import SettingsPanel from '../components/settings/SettingsPanel';

function DashboardPage({ session, onLogout, onSessionUserUpdate, theme, onThemeChange }) {
  const [activePanel, setActivePanel] = useState('cars');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200/60 dark:from-slate-950 dark:to-slate-900">
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
              {activePanel === 'sellCars' ? <SellCarsPanel /> : null}
              {activePanel === 'testDrives' ? <TestDrivesPanel /> : null}
              {activePanel === 'faqs' ? <FaqsPanel /> : null}
              {activePanel === 'reviews' ? <ReviewsPanel /> : null}
              {activePanel === 'testimonials' ? <TestimonialsPanel /> : null}
              {activePanel === 'loveStories' ? <LoveStoriesPanel /> : null}
              {activePanel === 'callbackRequests' ? <CallbackRequestsPanel /> : null}
              {activePanel === 'newsletter' ? <NewslettersPanel /> : null}
              {activePanel === 'users' ? <UsersPanel currentUser={session.user} onSessionUserUpdate={onSessionUserUpdate} /> : null}
              {activePanel === 'settings' ? <SettingsPanel theme={theme} onThemeChange={onThemeChange} /> : null}
              {!['cars', 'sellCars', 'testDrives', 'users', 'reviews', 'testimonials', 'loveStories', 'faqs', 'callbackRequests', 'newsletter', 'settings'].includes(activePanel) ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-2xl font-semibold capitalize text-slate-900 dark:text-slate-100">{activePanel}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This section is coming soon.</p>
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
