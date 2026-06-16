import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Play, GitBranch, BarChart3, Zap, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const NAV_ITEMS = [
  { path: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/visualizer',  label: 'Visualizer',  icon: Play },
  { path: '/topological', label: 'Topological', icon: GitBranch },
  { path: '/complexity',  label: 'Complexity',  icon: BarChart3 },
  { path: '/performance', label: 'Performance', icon: Zap },
];

export function Navbar() {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-primary))]/80 glass">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-base">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">A</div>
          <span className="text-gradient hidden sm:block">AdaSortLab</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link relative ${active ? 'active' : ''}`}
              >
                <Icon size={15} />
                <span className="hidden md:block">{label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-[rgb(var(--bg-secondary))] rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="btn-icon"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
