import zhTW from './zh-TW.json';
import en from './en.json';
import th from './th.json';

export type Language = 'zh-TW' | 'en' | 'th';

export const languages: Record<Language, { name: string; nativeName: string; flag: string }> = {
    'zh-TW': { name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
    'en': { name: 'English', nativeName: 'English', flag: '🇺🇸' },
    'th': { name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭' },
};

export const translations: Record<Language, typeof zhTW> = {
    'zh-TW': zhTW,
    'en': en,
    'th': th,
};

export function getTranslation(lang: Language) {
    return translations[lang] || translations['zh-TW'];
}

export function detectBrowserLanguage(): Language {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang.startsWith('zh')) return 'zh-TW';
    if (browserLang.startsWith('th')) return 'th';
    if (browserLang.startsWith('en')) return 'en';
    return 'zh-TW'; // Default to Traditional Chinese
}
