import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-black/5 shadow-sm"
      >
        <span className="text-lg">{languages[language].flag}</span>
        <span className="text-[13px] font-medium text-charcoal">{languages[language].nativeName}</span>
        <span className="material-symbols-outlined text-stone text-[16px]">expand_more</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-white rounded-2xl z-50 overflow-hidden shadow-xl"
            >
              <div className="px-4 py-3 border-b border-black/5">
                <h3 className="text-[15px] font-bold text-charcoal text-center">選擇語言 / Language</h3>
              </div>
              <div className="p-2">
                {(Object.keys(languages) as Language[]).map((lang) => (
                  <motion.button
                    key={lang}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${language === lang
                        ? 'bg-charcoal text-white'
                        : 'hover:bg-stone/10 text-charcoal'
                      }`}
                  >
                    <span className="text-xl">{languages[lang].flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-medium">{languages[lang].nativeName}</p>
                      <p className={`text-[12px] ${language === lang ? 'text-white/70' : 'text-stone'}`}>
                        {languages[lang].name}
                      </p>
                    </div>
                    {language === lang && (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
