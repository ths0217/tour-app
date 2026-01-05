import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScheduleItem } from '../types';

interface VoiceGuidanceProps {
  currentItem?: ScheduleItem;
  isEnabled: boolean;
  onToggle: () => void;
}

// Attraction info for voice guidance
const attractionInfo: Record<string, { zh: string; en: string }> = {
  'Wat Arun': {
    zh: '鄭王廟，又稱黎明寺，是曼谷最著名的地標之一。建於19世紀，以其獨特的高棉式塔尖和精美的陶瓷裝飾聞名。最佳參觀時間是清晨或黃昏，可以欣賞到美麗的日出或日落。',
    en: 'Wat Arun, the Temple of Dawn, is one of Bangkok\'s most iconic landmarks. Built in the 19th century, it\'s famous for its unique Khmer-style spire decorated with colorful porcelain.'
  },
  'Grand Palace': {
    zh: '大皇宮建於1782年，是泰國國王的官方住所，也是曼谷最壯觀的建築群。宮殿內有著名的玉佛寺，供奉著翡翠佛像。參觀時請穿著得體，需過膝長褲和有袖上衣。',
    en: 'The Grand Palace, built in 1782, is the official residence of the Thai King and Bangkok\'s most spectacular landmark. It houses the famous Temple of the Emerald Buddha.'
  },
  'ICONSIAM': {
    zh: 'ICONSIAM 是曼谷最新的奢華購物中心，位於湄南河畔。這裡有室內水上市場 Sook Siam，可以體驗泰國各地的美食和文化。推薦到頂樓的 ICONCRAFT 購買設計師商品。',
    en: 'ICONSIAM is Bangkok\'s newest luxury shopping complex on the Chao Phraya River. Don\'t miss Sook Siam, the indoor floating market featuring food and culture from all over Thailand.'
  },
  'Jodd Fairs': {
    zh: '喬德夜市是曼谷最火的夜市，以超大份火山排骨聞名。每晚表演時間約7點至9點，記得提早到場佔位。推薦必吃：火山排骨、芒果糯米飯、椰子冰淇淋。',
    en: 'Jodd Fairs is Bangkok\'s hottest night market, famous for its massive volcano ribs. The fire show runs from 7-9 PM. Must-try: volcano ribs, mango sticky rice, coconut ice cream.'
  },
  'default': {
    zh: '這是您行程中的一個景點。點擊導航按鈕可以開啟 Google Maps 前往目的地。祝您旅途愉快！',
    en: 'This is a destination on your itinerary. Tap the navigation button to open Google Maps for directions. Enjoy your trip!'
  }
};

export default function VoiceGuidance({ currentItem, isEnabled, onToggle }: VoiceGuidanceProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const getInfo = (location?: string): string => {
    if (!location) return attractionInfo.default[lang];
    
    for (const key of Object.keys(attractionInfo)) {
      if (location.toLowerCase().includes(key.toLowerCase())) {
        return attractionInfo[key][lang];
      }
    }
    return attractionInfo.default[lang];
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'zh' ? 'zh-TW' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!currentItem) return null;

  const info = getInfo(currentItem.location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-charcoal rounded-[16px] p-4 shadow-mag"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[20px]">🎧</span>
          <span className="text-[14px] font-semibold text-charcoal dark:text-white">語音導覽</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex rounded-pill bg-stone/10 dark:bg-white/10 p-0.5">
            <button
              onClick={() => setLang('zh')}
              className={`px-2 py-1 rounded-pill text-[10px] font-medium transition-all ${
                lang === 'zh' ? 'bg-charcoal text-white dark:bg-white dark:text-charcoal' : 'text-stone'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-pill text-[10px] font-medium transition-all ${
                lang === 'en' ? 'bg-charcoal text-white dark:bg-white dark:text-charcoal' : 'text-stone'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Current Location */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-black/5 dark:border-white/10">
        <span className="material-symbols-outlined text-red-xhs text-[16px]">location_on</span>
        <span className="text-[12px] text-charcoal dark:text-white font-medium">{currentItem.title}</span>
      </div>

      {/* Info Text */}
      <p className="text-[12px] text-stone leading-relaxed mb-4 line-clamp-3">
        {info}
      </p>

      {/* Controls */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => isSpeaking ? stop() : speak(info)}
          className={`flex-1 py-2.5 rounded-mag text-[12px] font-semibold flex items-center justify-center gap-2 ${
            isSpeaking 
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-red-xhs text-white'
          }`}
        >
          <span className={`material-symbols-outlined text-[16px] ${isSpeaking ? 'animate-pulse' : ''}`}>
            {isSpeaking ? 'stop' : 'volume_up'}
          </span>
          {isSpeaking ? '停止播放' : '播放導覽'}
        </motion.button>
      </div>
    </motion.div>
  );
}
