import { routes } from '../routes/routes';

export default function Navbar({ activePage, onNavigate }) {
  return (
    <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:sticky lg:top-0 lg:mx-0 lg:h-screen lg:px-5 lg:py-6">
        <div>
          <p className="text-xl font-bold text-slate-950">MiniMiner PoW Lab</p>
          <p className="mt-1 text-sm text-slate-500">Educational blockchain simulator</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {routes.map((route) => {
            const Icon = route.icon;
            const active = activePage === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => onNavigate(route.id)}
                className={`flex min-w-fit items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  active
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
                title={route.label}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">
          This app simulates Proof-of-Work mining and does not mine real cryptocurrency.
        </div>
      </div>
    </aside>
  );
}
