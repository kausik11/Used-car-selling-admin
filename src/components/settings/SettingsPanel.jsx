function SettingsPanel({ theme, onThemeChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700 dark:bg-slate-900">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Choose your preferred theme for the admin panel.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80'
            }`}
          >
            <p className="text-sm font-semibold">Light Mode</p>
            <p className="mt-1 text-xs opacity-80">Bright interface with light backgrounds.</p>
          </button>

          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80'
            }`}
          >
            <p className="text-sm font-semibold">Dark Mode</p>
            <p className="mt-1 text-xs opacity-80">Reduced glare for low-light environments.</p>
          </button>
        </div>
      </div>
    </section>
  );
}

export default SettingsPanel;
