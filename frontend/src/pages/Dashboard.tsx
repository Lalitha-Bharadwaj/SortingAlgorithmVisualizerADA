import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, GitBranch, BarChart3, Zap, Play, TrendingUp } from 'lucide-react';
import { ALGORITHMS } from '../constants';

const QUICK_LINKS = [
  { to: '/visualizer',  label: 'Sort Visualizer',  icon: Play,      desc: 'Animate all sorting algorithms step-by-step' },
  { to: '/topological', label: 'Graph Visualizer', icon: GitBranch, desc: 'Interactive DAG topological sort' },
  { to: '/complexity',  label: 'Complexity Table', icon: BarChart3, desc: 'Compare Big-O complexities side by side' },
  { to: '/performance', label: 'Benchmarks',       icon: Zap,       desc: 'Run real performance comparisons' },
];

export default function Dashboard() {
  return (
    <div className="space-y-10 animate-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl card p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-purple">University Project</span>
            <span className="badge badge-blue">Ada + React</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="text-gradient">AdaSortLab</span>
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-lg max-w-xl mb-8 leading-relaxed">
            An interactive educational platform for visualizing and comparing sorting algorithms in real-time.
            Powered by an Ada backend with a modern React frontend.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/visualizer" className="btn-primary flex items-center gap-2">
              <Play size={15} /> Start Visualizing
            </Link>
            <Link to="/performance" className="btn-secondary flex items-center gap-2">
              <TrendingUp size={15} /> Run Benchmarks
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="section-title mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map(({ to, label, icon: Icon, desc }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={to}
                className="card p-5 flex flex-col gap-3 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 group h-full"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500/20 transition-colors">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{label}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] leading-relaxed">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-[rgb(var(--text-muted))] mt-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Algorithm Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Algorithms</h2>
          <span className="badge badge-blue">{ALGORITHMS.length} total</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALGORITHMS.map((algo, i) => (
            <motion.div
              key={algo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={algo.id === 'topological' ? '/topological' : `/visualizer?algo=${algo.id}`}
                className="card p-5 hover:border-[rgb(var(--text-muted))]/40 transition-all duration-200 group block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${algo.bgColor}`} />
                  <div className="flex gap-1">
                    {algo.stable && <span className="badge badge-green">Stable</span>}
                    {algo.inPlace && <span className="badge badge-blue">In-Place</span>}
                  </div>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-indigo-400 transition-colors">{algo.name}</h3>
                <p className="text-xs text-[rgb(var(--text-muted))] mb-4 leading-relaxed line-clamp-2">{algo.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-[rgb(var(--text-muted))] mb-0.5">Best</p>
                    <p className="font-mono font-medium text-green-400">{algo.bestCase}</p>
                  </div>
                  <div className="text-center border-x border-[rgb(var(--border))]">
                    <p className="text-[rgb(var(--text-muted))] mb-0.5">Avg</p>
                    <p className="font-mono font-medium text-yellow-400">{algo.averageCase}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[rgb(var(--text-muted))] mb-0.5">Worst</p>
                    <p className="font-mono font-medium text-red-400">{algo.worstCase}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="card p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Algorithms',    value: '7',     icon: Cpu },
            { label: 'Sorting Algos', value: '6',     icon: Play },
            { label: 'Graph Algos',   value: '1',     icon: GitBranch },
            { label: 'Ada Backend',   value: 'GNAT',  icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgb(var(--bg-secondary))] flex items-center justify-center text-indigo-400">
                <Icon size={15} />
              </div>
              <div>
                <p className="font-bold text-base">{value}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
