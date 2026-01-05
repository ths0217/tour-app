import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

interface AISuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem[];
  onAddSuggestion: (item: Omit<ScheduleItem, 'id'>) => void;
}

// Smart AI suggestions based on context
const aiSuggestions = [
  {
    id: 'ai1',
    category: '根據天氣',
    icon: 'sunny',
    title: '下午茶避暑',
    suggestion: '天氣炎熱，建議安排室內咖啡廳休息',
    items: [
      { title: 'Blue Whale Café', time: '15:00', type: 'coffee', location: 'Wat Pak Nam', desc: '網美打卡藍鯨咖啡廳' },
      { title: 'After You Dessert', time: '15:30', type: 'restaurant', location: 'Siam Paragon', desc: '必吃蜜糖吐司' },
    ]
  },
  {
    id: 'ai2', 
    category: '根據位置',
    icon: 'location_on',
    title: '順路推薦',
    suggestion: '你明天在鄭王廟附近，可以順便去...',
    items: [
      { title: '臥佛寺 Wat Pho', time: '14:00', type: 'attraction', location: 'Wat Pho', desc: '世界最大臥佛像' },
      { title: '大皇宮', time: '10:00', type: 'attraction', location: 'Grand Palace', desc: '曼谷必訪皇宮' },
    ]
  },
  {
    id: 'ai3',
    category: '根據時間',
    icon: 'schedule',
    title: '填補空檔',
    suggestion: '1/29 下午有 3 小時空檔，建議...',
    items: [
      { title: "Let's Relax Spa", time: '14:00', type: 'spa', location: 'Sukhumvit', desc: '2小時全身按摩' },
      { title: '安帕瓦水上市場', time: '14:00', type: 'shopping_bag', location: 'Amphawa', desc: '當地水上市場' },
    ]
  },
  {
    id: 'ai4',
    category: '根據喜好',
    icon: 'favorite',
    title: '美食推薦',
    suggestion: '你似乎喜歡泰式料理，試試這些...',
    items: [
      { title: 'Raan Jay Fai', time: '18:00', type: 'restaurant', location: 'Mahachai Rd', desc: '米其林街頭美食' },
      { title: 'Thipsamai', time: '19:00', type: 'restaurant', location: 'Phraeng Phuthon', desc: '泰國最有名 Pad Thai' },
    ]
  },
  {
    id: 'ai5',
    category: '熱門推薦',
    icon: 'trending_up',
    title: '2025 必去',
    suggestion: '小紅書爆紅景點，現在很火...',
    items: [
      { title: 'Mahanakhon SkyWalk', time: '17:00', type: 'attraction', location: 'King Power', desc: '314m 高空玻璃棧道' },
      { title: 'Jodd Fairs Dan Neramit', time: '19:00', type: 'restaurant', location: 'Rama 9', desc: '火山排骨必吃' },
    ]
  }
];

export default function AISuggestions({ isOpen, onClose, schedule, onAddSuggestion }: AISuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const handleAdd = (item: typeof aiSuggestions[0]['items'][0]) => {
    const key = `${item.title}-${item.time}`;
    if (addedItems.has(key)) return;
    
    onAddSuggestion({
      title: item.title,
      time: item.time,
      date: '2025-01-29', // Default to Day 3
      type: item.type,
      location: item.location,
      desc: item.desc,
      completed: false,
    });
    
    setAddedItems(prev => new Set([...prev, key]));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-charcoal rounded-t-[24px] z-50 max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
            </div>
            
            <div className="px-5 pb-2 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[24px]">🤖</span>
                  <h2 className="text-[18px] font-bold text-charcoal dark:text-white">AI 行程建議</h2>
                </div>
                <button onClick={onClose} className="text-stone text-[14px]">關閉</button>
              </div>
              <p className="text-[12px] text-stone mt-1">根據您的行程智慧推薦</p>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto px-5 pb-safe">
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-black/20 rounded-[16px] overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => setSelectedCategory(
                        selectedCategory === suggestion.id ? null : suggestion.id
                      )}
                      className="w-full p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[20px]">{suggestion.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-pill bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                            {suggestion.category}
                          </span>
                        </div>
                        <p className="text-[14px] font-semibold text-charcoal dark:text-white mt-1">{suggestion.title}</p>
                        <p className="text-[11px] text-stone mt-0.5">{suggestion.suggestion}</p>
                      </div>
                      <span className={`material-symbols-outlined text-stone text-[20px] transition-transform ${
                        selectedCategory === suggestion.id ? 'rotate-180' : ''
                      }`}>
                        expand_more
                      </span>
                    </button>

                    {/* Expanded Items */}
                    <AnimatePresence>
                      {selectedCategory === suggestion.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-black/5 dark:border-white/10"
                        >
                          <div className="p-3 space-y-2">
                            {suggestion.items.map((item, idx) => {
                              const key = `${item.title}-${item.time}`;
                              const isAdded = addedItems.has(key);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-3 bg-stone/5 dark:bg-white/5 rounded-mag"
                                >
                                  <div className="flex-1">
                                    <p className="text-[13px] font-medium text-charcoal dark:text-white">{item.title}</p>
                                    <p className="text-[11px] text-stone">{item.time} · {item.location}</p>
                                  </div>
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAdd(item)}
                                    disabled={isAdded}
                                    className={`px-3 py-1.5 rounded-pill text-[11px] font-medium ${
                                      isAdded
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-xhs text-white'
                                    }`}
                                  >
                                    {isAdded ? '✓ 已加' : '+ 加入'}
                                  </motion.button>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              
              {/* AI Tip */}
              <div className="mt-6 mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-[16px]">
                <p className="text-[11px] text-purple-700 dark:text-purple-300 text-center">
                  💡 建議會根據天氣、位置、時間和您的喜好智慧調整
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
