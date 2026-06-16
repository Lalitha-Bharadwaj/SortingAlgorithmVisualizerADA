import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="max-w-screen-xl mx-auto px-4 py-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
