import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, languages, getTranslation, detectBrowserLanguage } from '../i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: ReturnType<typeof getTranslation>;
    languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'tourapp_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        // Try to get from localStorage first
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'zh-TW' || saved === 'en' || saved === 'th')) {
            return saved as Language;
        }
        // Otherwise detect from browser
        return detectBrowserLanguage();
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    useEffect(() => {
        // Update HTML lang attribute
        document.documentElement.lang = language;
    }, [language]);

    const t = getTranslation(language);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
