import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en' | 'ja' | 'th';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  zh: {
    // Navigation
    home: '首頁',
    itinerary: '行程',
    wallet: '錢包',
    checklist: '待辦',
    explore: '探索',
    
    // Home
    goodMorning: '早安',
    goodAfternoon: '午安',
    goodEvening: '晚安',
    budget: '預算',
    remaining: '剩餘',
    spent: '已花',
    nextEvent: '下一站',
    travelCompanions: '旅伴',
    destinations: '推薦景點',
    trending: '小紅書爆紅行程',
    
    // Actions
    add: '加入',
    added: '已加',
    navigate: '導航',
    share: '分享',
    close: '關閉',
    save: '儲存',
    cancel: '取消',
    edit: '編輯',
    delete: '刪除',
    
    // Itinerary
    searchPlaceholder: '搜尋行程...',
    noResults: '找不到行程',
    tryOther: '試試其他關鍵字',
    startPlanning: '開始規劃你的冒險',
    addFirst: '點擊右上角 + 新增行程',
    
    // Wallet
    passes: '票卡',
    expenses: '預算',
    settle: '結算',
    addExpense: '新增支出',
    groupBudget: '團體預算',
    personalBudget: '個人預算',
    
    // Currency
    currencyConverter: '匯率計算機',
    inputAmount: '輸入金額',
    result: '換算結果',
    
    // AI
    aiSuggestions: 'AI 行程建議',
    basedOnWeather: '根據天氣',
    basedOnLocation: '根據位置',
    basedOnTime: '根據時間',
    basedOnPreference: '根據喜好',
    
    // Voice
    voiceGuidance: '語音導覽',
    play: '播放導覽',
    stop: '停止播放',
  },
  en: {
    // Navigation
    home: 'Home',
    itinerary: 'Itinerary',
    wallet: 'Wallet',
    checklist: 'Checklist',
    explore: 'Explore',
    
    // Home
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    budget: 'Budget',
    remaining: 'Remaining',
    spent: 'Spent',
    nextEvent: 'Next Stop',
    travelCompanions: 'Travel Companions',
    destinations: 'Destinations',
    trending: 'Trending Itineraries',
    
    // Actions
    add: 'Add',
    added: 'Added',
    navigate: 'Navigate',
    share: 'Share',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    
    // Itinerary
    searchPlaceholder: 'Search itinerary...',
    noResults: 'No results found',
    tryOther: 'Try other keywords',
    startPlanning: 'Start planning your adventure',
    addFirst: 'Tap + to add your first activity',
    
    // Wallet
    passes: 'Passes',
    expenses: 'Expenses',
    settle: 'Settle',
    addExpense: 'Add Expense',
    groupBudget: 'Group Budget',
    personalBudget: 'Personal Budget',
    
    // Currency
    currencyConverter: 'Currency Converter',
    inputAmount: 'Enter Amount',
    result: 'Result',
    
    // AI
    aiSuggestions: 'AI Suggestions',
    basedOnWeather: 'Based on Weather',
    basedOnLocation: 'Based on Location',
    basedOnTime: 'Based on Time',
    basedOnPreference: 'Based on Preference',
    
    // Voice
    voiceGuidance: 'Voice Guidance',
    play: 'Play Guide',
    stop: 'Stop Playing',
  },
  ja: {
    // Navigation
    home: 'ホーム',
    itinerary: '旅程',
    wallet: '財布',
    checklist: 'チェック',
    explore: '探索',
    
    // Home
    goodMorning: 'おはよう',
    goodAfternoon: 'こんにちは',
    goodEvening: 'こんばんは',
    budget: '予算',
    remaining: '残り',
    spent: '使用済み',
    nextEvent: '次の目的地',
    travelCompanions: '旅行仲間',
    destinations: 'おすすめスポット',
    trending: '人気のプラン',
    
    // Actions
    add: '追加',
    added: '追加済み',
    navigate: 'ナビ',
    share: '共有',
    close: '閉じる',
    save: '保存',
    cancel: 'キャンセル',
    edit: '編集',
    delete: '削除',
    
    // Itinerary
    searchPlaceholder: '旅程を検索...',
    noResults: '結果なし',
    tryOther: '他のキーワードを試す',
    startPlanning: '冒険を計画しよう',
    addFirst: '+をタップして追加',
    
    // Wallet
    passes: 'パス',
    expenses: '支出',
    settle: '精算',
    addExpense: '支出を追加',
    groupBudget: 'グループ予算',
    personalBudget: '個人予算',
    
    // Currency
    currencyConverter: '為替計算機',
    inputAmount: '金額を入力',
    result: '結果',
    
    // AI
    aiSuggestions: 'AI提案',
    basedOnWeather: '天気に基づく',
    basedOnLocation: '場所に基づく',
    basedOnTime: '時間に基づく',
    basedOnPreference: '好みに基づく',
    
    // Voice
    voiceGuidance: '音声ガイド',
    play: '再生',
    stop: '停止',
  },
  th: {
    // Navigation
    home: 'หน้าแรก',
    itinerary: 'กำหนดการ',
    wallet: 'กระเป๋าเงิน',
    checklist: 'รายการ',
    explore: 'สำรวจ',
    
    // Home
    goodMorning: 'สวัสดีตอนเช้า',
    goodAfternoon: 'สวัสดีตอนบ่าย',
    goodEvening: 'สวัสดีตอนเย็น',
    budget: 'งบประมาณ',
    remaining: 'เหลือ',
    spent: 'ใช้ไปแล้ว',
    nextEvent: 'จุดหมายถัดไป',
    travelCompanions: 'เพื่อนเดินทาง',
    destinations: 'สถานที่แนะนำ',
    trending: 'เทรนด์ยอดนิยม',
    
    // Actions
    add: 'เพิ่ม',
    added: 'เพิ่มแล้ว',
    navigate: 'นำทาง',
    share: 'แชร์',
    close: 'ปิด',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    edit: 'แก้ไข',
    delete: 'ลบ',
    
    // Other keys...
    searchPlaceholder: 'ค้นหา...',
    noResults: 'ไม่พบผลลัพธ์',
    currencyConverter: 'แปลงสกุลเงิน',
    aiSuggestions: 'AI แนะนำ',
    voiceGuidance: 'คำแนะนำเสียง',
    play: 'เล่น',
    stop: 'หยุด',
  },
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'zh', name: '繁體中文', flag: '🇹🇼' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('app_lang') as Language) || 'zh';
    }
    return 'zh';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations.zh[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export default I18nContext;
