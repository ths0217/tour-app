import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-white dark:bg-charcoal/80 flex items-center justify-center shadow-mag border border-black/5 dark:border-white/10"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.span
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        className="material-symbols-outlined text-[20px] text-charcoal dark:text-white"
      >
        {isDark ? 'dark_mode' : 'light_mode'}
      </motion.span>
    </motion.button>
  );
}

