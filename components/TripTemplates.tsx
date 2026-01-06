import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

interface TripTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (items: Omit<ScheduleItem, 'id'>[]) => void;
}

interface Template {
  id: string;
  name: string;
  desc: string;
  duration: string;
  image: string;
  tags: string[];
  items: Omit<ScheduleItem, 'id'>[];
}

const templates: Template[] = [
  {
    id: 'culture',
    name: '經典文化之旅',
    desc: '大皇宮、臥佛寺、鄭王廟一日遊',
    duration: '1天',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400',
    tags: ['寺廟', '歷史', '拍照'],
    items: [
      { date: '', time: '08:00', title: '大皇宮 Grand Palace', type: 'attraction', location: 'Grand Palace', desc: '曼谷必訪皇宮', completed: false, estimatedCost: 500 },
      { date: '', time: '10:30', title: '玉佛寺', type: 'camera', location: 'Wat Phra Kaew', desc: '泰國最神聖的寺廟', completed: false },
      { date: '', time: '12:00', title: 'Tha Tien 午餐', type: 'restaurant', location: 'Tha Tien Pier', desc: '河畔當地小吃', completed: false, estimatedCost: 300 },
      { date: '', time: '13:30', title: '臥佛寺 Wat Pho', type: 'attraction', location: 'Wat Pho', desc: '世界最大臥佛', completed: false, estimatedCost: 200 },
      { date: '', time: '15:30', title: '鄭王廟 Wat Arun', type: 'camera', location: 'Wat Arun', desc: '搭船過河，黃昏最美', completed: false, estimatedCost: 100 },
    ]
  },
  {
    id: 'foodie',
    name: '米其林美食之旅',
    desc: '街頭小吃到高級餐廳',
    duration: '1天',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
    tags: ['美食', '米其林', '打卡'],
    items: [
      { date: '', time: '09:00', title: 'Or Tor Kor 市場', type: 'restaurant', location: 'Or Tor Kor Market', desc: 'CNN 評選全球最佳鮮食市場', completed: false, estimatedCost: 500 },
      { date: '', time: '11:30', title: 'Raan Jay Fai', type: 'restaurant', location: 'Mahachai Rd', desc: '米其林一星街頭美食', completed: false, estimatedCost: 1500, notes: '需預約！' },
      { date: '', time: '14:00', title: 'After You', type: 'coffee', location: 'Siam Square', desc: '蜜糖吐司名店', completed: false, estimatedCost: 400 },
      { date: '', time: '18:30', title: 'Jodd Fairs 火山排骨', type: 'restaurant', location: 'Jodd Fairs', desc: '超人氣夜市美食', completed: false, estimatedCost: 600 },
    ]
  },
  {
    id: 'shopping',
    name: '購物狂歡日',
    desc: 'Platinum、Terminal 21、夜市',
    duration: '1天',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
    tags: ['購物', '夜市', '伴手禮'],
    items: [
      { date: '', time: '10:00', title: 'Platinum Mall', type: 'shopping_bag', location: 'Platinum Fashion Mall', desc: '批發價服飾', completed: false, estimatedCost: 3000 },
      { date: '', time: '14:00', title: 'Terminal 21', type: 'shopping_bag', location: 'Terminal 21 Asok', desc: '機場主題百貨', completed: false, estimatedCost: 2000 },
      { date: '', time: '17:00', title: 'ICONSIAM', type: 'shopping_bag', location: 'ICONSIAM', desc: '奢華河濱商場', completed: false, estimatedCost: 5000 },
    ]
  },
  {
    id: 'relax',
    name: 'SPA 放鬆日',
    desc: '按摩、溫泉、咖啡廳',
    duration: '1天',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    tags: ['SPA', '放鬆', '慢活'],
    items: [
      { date: '', time: '10:00', title: 'Health Land Spa', type: 'spa', location: 'Health Land', desc: '2小時泰式按摩', completed: false, estimatedCost: 800 },
      { date: '', time: '14:30', title: "Let's Relax Onsen", type: 'spa', location: "Let's Relax", desc: '日式溫泉體驗', completed: false, estimatedCost: 1200 },
      { date: '', time: '17:00', title: 'Rooftop Bar', type: 'restaurant', location: 'Sukhumvit', desc: '高空酒吧看夜景', completed: false, estimatedCost: 800 },
    ]
  },
];

export default function TripTemplates({ isOpen, onClose, onApplyTemplate }: TripTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [targetDate, setTargetDate] = useState('2025-01-28');

  const handleApply = () => {
    if (!selectedTemplate) return;
    const items = selectedTemplate.items.map(item => ({ ...item, date: targetDate }));
    onApplyTemplate(items);
    onClose();
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
                  <span className="text-[24px]">📋</span>
                  <h2 className="text-[18px] font-bold text-charcoal dark:text-white">行程範本</h2>
                </div>
                <button onClick={onClose} className="text-stone text-[14px]">關閉</button>
              </div>
              <p className="text-[12px] text-stone mt-1">一鍵套用熱門行程</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-safe">
              {!selectedTemplate ? (
                <div className="py-4 space-y-3">
                  {templates.map((template) => (
                    <motion.button
                      key={template.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template)}
                      className="w-full bg-white dark:bg-black/20 rounded-[16px] overflow-hidden shadow-sm text-left"
                    >
                      <div className="flex gap-3 p-3">
                        <img src={template.image} alt={template.name} className="w-20 h-20 object-cover rounded-mag flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-charcoal dark:text-white">{template.name}</h3>
                          <p className="text-[11px] text-stone mt-0.5 line-clamp-2">{template.desc}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-pill bg-stone/10 text-stone">{template.duration}</span>
                            {template.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-pill bg-red-xhs/10 text-red-xhs">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-stone text-[20px] self-center">chevron_right</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="py-4">
                  <button onClick={() => setSelectedTemplate(null)} className="flex items-center gap-1 text-stone text-[13px] mb-4">
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    返回
                  </button>

                  <div className="bg-white dark:bg-black/20 rounded-[16px] overflow-hidden mb-4">
                    <img src={selectedTemplate.image} alt={selectedTemplate.name} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <h3 className="text-[16px] font-bold text-charcoal dark:text-white">{selectedTemplate.name}</h3>
                      <p className="text-[12px] text-stone mt-1">{selectedTemplate.desc}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-black/20 rounded-mag p-4 mb-4">
                    <label className="text-[12px] text-stone block mb-2">套用到日期</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-mag border border-black/10 dark:border-white/10 bg-transparent text-charcoal dark:text-white text-[14px]"
                    />
                  </div>

                  <div className="bg-white dark:bg-black/20 rounded-mag p-4 mb-4">
                    <p className="text-[12px] font-semibold text-charcoal dark:text-white mb-3">包含 {selectedTemplate.items.length} 個行程</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedTemplate.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-stone w-12">{item.time}</span>
                          <span className="text-[12px] text-charcoal dark:text-white">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleApply} className="w-full py-3.5 bg-red-xhs text-white rounded-mag text-[14px] font-semibold">
                    套用此範本
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
