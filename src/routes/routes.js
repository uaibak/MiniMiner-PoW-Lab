import {
  BarChart3,
  Blocks,
  Gauge,
  Home,
  Pickaxe,
  RefreshCcw,
  Send,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

export const routes = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Send },
  { id: 'mine', label: 'Mine', icon: Pickaxe },
  { id: 'explorer', label: 'Explorer', icon: Blocks },
  { id: 'validate', label: 'Validate', icon: ShieldCheck },
  { id: 'benchmark', label: 'Benchmark', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const utilityRoutes = [
  { id: 'reset', label: 'Reset', icon: RefreshCcw },
  { id: 'difficulty', label: 'Difficulty', icon: Gauge },
];
