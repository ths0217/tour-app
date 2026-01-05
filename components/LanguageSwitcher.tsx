import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../contexts/I18nContext';

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === lang);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-mag bg-white dark:bg-charcoal/80 shadow-mag border border-black/5 dark:border-white/10"
      >
        <span className="text-[14px]">{currentLang?.flag}</span>
        <span className="text-[12px] font-medium text-charcoal dark:text-white">{currentLang?.code.toUpperCase()}</span>
        <span className={`material-symbols-outlined text-stone text-[14px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 bg-white dark:bg-charcoal rounded-mag shadow-mag border border-black/5 dark:border-white/10 overflow-hidden z-50 min-w-[140px]"
            >
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setIsOpen(false); }}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-stone/5 dark:hover:bg-white/5 transition-colors ${
                    lang === l.code ? 'bg-red-xhs/10' : ''
                  }`}
                >
                  <span className="text-[16px]">{l.flag}</span>
                  <span className={`text-[13px] ${lang === l.code ? 'text-red-xhs font-semibold' : 'text-charcoal dark:text-white'}`}>
                    {l.name}
                  </span>
                  {lang === l.code && (
                    <span className="material-symbols-outlined text-red-xhs text-[16px] ml-auto">check</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
