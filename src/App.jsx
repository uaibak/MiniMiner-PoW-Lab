import { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Benchmark from './pages/Benchmark';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer';
import Mine from './pages/Mine';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Validate from './pages/Validate';
import Wallets from './pages/Wallets';

const pages = {
  dashboard: Dashboard,
  wallets: Wallets,
  transactions: Transactions,
  mine: Mine,
  explorer: Explorer,
  validate: Validate,
  benchmark: Benchmark,
  settings: Settings,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const Page = pages[activePage] || Dashboard;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary key={activePage} onReset={() => setActivePage('dashboard')}>
            <Page onNavigate={setActivePage} />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
