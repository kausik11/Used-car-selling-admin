import { useState } from 'react';
import CarsPanel from './components/cars/CarsPanel';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

function App() {
  const [activePanel, setActivePanel] = useState('cars');

  return (
    <div className="min-h-screen bg-[#eef2f8]">
      <div className="mx-auto flex min-h-screen max-w-[1900px]">
        <Sidebar active={activePanel} onSelect={setActivePanel} />

        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="p-4 md:p-6">
            {activePanel === 'cars' ? (
              <CarsPanel />
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-3xl font-semibold text-slate-900">{activePanel}</h2>
                <p className="mt-2 text-lg text-slate-500">This section is coming soon.</p>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
