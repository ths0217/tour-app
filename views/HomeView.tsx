import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem, User } from '../types';

const familyMembersData = [
  { id: 'vickly', name: 'Vickly', role: '我', image: '/avatars/me.jpg' },
  { id: 'sherry', name: 'Sherry', role: '姊姊', image: '/avatars/sister.jpg' },
  { id: 'alex', name: 'Alexsander', role: '哥哥', image: '/avatars/brother.jpg' },
  { id: 'jenny', name: 'Jenny', role: '媽媽', image: '/avatars/mother.jpg' },
];

const quickActions = [
  { id: 'taxi', icon: 'local_taxi', label: '叫車', gradient: 'from-green-400 to-emerald-500' },
  { id: 'rate', icon: 'currency_exchange', label: '匯率', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'translate', icon: 'translate', label: '翻譯', gradient: 'from-orange-400 to-amber-500' },
  { id: 'sos', icon: 'sos', label: '緊急', gradient: 'from-red-400 to-rose-500' },
];

const destinations = [
  { id: 1, name: '鄭王廟', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400', badge: '必訪' },
  { id: 2, name: 'IconSiam', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400', badge: '購物' },
  { id: 3, name: 'Jodd Fairs', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400', badge: '夜市' },
  { id: 4, name: '大皇宮', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400', badge: '文化' },
];

interface HomeViewProps {
  user: User | null;
  budget?: { total: number; remaining: number; spent: number };
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  onLogout?: () => void;
}

export default function HomeView({ user, budget, schedule, onLogout }: HomeViewProps) {
  const [weather, setWeather] = useState({ temp: '--', label: '載入中', icon: 'cloud' });
  const [likedDestinations, setLikedDestinations] = useState<Set<number>>(new Set());

  const safeBudget = budget || { total: 50000, remaining: 38500, spent: 11500 };
  const spentPercent = (safeBudget.spent / safeBudget.total) * 100;

  // Fetch Bangkok weather
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=13.7563&longitude=100.5018&current_weather=true&timezone=Asia%2FBangkok')
      .then(r => r.json())
      .then(data => {
        const { temperature } = data?.current_weather || {};
        setWeather({ temp: `${Math.round(temperature)}°`, label: '曼谷', icon: 'sunny' });
      })
      .catch(() => setWeather({ temp: '33°', label: '曼谷', icon: 'sunny' }));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  const toggleLike = (id: number) => {
    setLikedDestinations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const companions = familyMembersData.filter(m => m.id !== user?.id);

  // Next event
  const sortedSchedule = [...schedule].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
  const nextEvent = sortedSchedule.find(e => !e.completed);

  return (
    <div className="min-h-full pb-safe">
      {/* Hero Header */}
      <div className="px-5 pt-6 pb-4 safe-top">
        <div className="flex justify-between items-start">
          <div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-mag-caption text-stone"
            >
              {weather.temp} {weather.label} ☀️
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-mag-hero text-charcoal mt-1"
            >
              {getGreeting()}，<br/>{user?.name || '旅人'}
            </motion.h1>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onLogout}
            className="relative"
          >
            <div 
              className="w-14 h-14 rounded-full bg-cover bg-center shadow-mag ring-2 ring-white"
              style={{ backgroundImage: `url('${user?.image || '/avatars/me.jpg'}')` }}
            />
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-red-xhs rounded-pill text-[10px] text-white font-semibold">
              切換
            </div>
          </motion.button>
        </div>
      </div>

      {/* Budget Card - Magazine Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mb-6 p-5 bg-white rounded-mag-lg shadow-mag overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pastel-mint to-transparent rounded-bl-full opacity-50" />
        
        <p className="text-mag-caption text-stone mb-1">個人剩餘預算</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[36px] font-bold text-charcoal leading-none">฿{Math.round(safeBudget.remaining).toLocaleString()}</span>
          <span className="text-mag-caption text-stone">/ ฿{Math.round(safeBudget.total).toLocaleString()}</span>
        </div>
        
        <div className="h-2 bg-stone/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${spentPercent}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
          />
        </div>
        <p className="text-mag-badge text-stone mt-2">已使用 {Math.round(spentPercent)}%</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (action.id === 'taxi') window.open('https://www.grab.com/th/', '_blank');
                else if (action.id === 'rate') window.open('https://www.google.com/finance/quote/THB-TWD', '_blank');
                else if (action.id === 'translate') window.open('https://translate.google.com/?sl=auto&tl=th', '_blank');
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-14 h-14 rounded-mag flex items-center justify-center bg-gradient-to-br ${action.gradient} shadow-mag`}>
                <span className="material-symbols-outlined text-white text-[24px]">{action.icon}</span>
              </div>
              <span className="text-mag-badge text-charcoal">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Next Event */}
      {nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-4 mb-6 p-4 bg-white rounded-mag shadow-mag"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="px-3 py-1 rounded-pill text-mag-time font-mono bg-red-xhs text-white">NEXT</span>
            <span className="text-mag-time font-mono text-stone">{nextEvent.time}</span>
          </div>
          <h3 className="text-mag-title text-charcoal mb-1">{nextEvent.title}</h3>
          {nextEvent.location && (
            <p className="text-mag-caption text-stone flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {nextEvent.location}
            </p>
          )}
        </motion.div>
      )}

      {/* Travel Companions */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-mag-title text-charcoal">旅伴狀態</h2>
        </div>
        <div className="flex gap-4">
          {companions.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover shadow-mag ring-2 ring-white"
                />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <span className="text-mag-badge text-charcoal">{member.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Destinations Grid - Magazine Masonry */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-mag-title text-charcoal">推薦景點</h2>
          <button className="text-mag-caption text-red-xhs font-medium">查看全部</button>
        </div>
        
        <div className="masonry">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              className="masonry-item"
            >
              <div className={`relative rounded-mag overflow-hidden shadow-mag ${i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 img-overlay" />
                
                {/* Badge */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-pill text-mag-badge bg-white/90 text-charcoal border border-black/5">
                  {dest.badge}
                </span>
                
                {/* Heart */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); toggleLike(dest.id); }}
                  whileTap={{ scale: 1.4 }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                >
                  <span className={`material-symbols-${likedDestinations.has(dest.id) ? 'filled' : 'outlined'} text-[18px] ${likedDestinations.has(dest.id) ? 'text-red-xhs' : 'text-stone'}`}>
                    favorite
                  </span>
                </motion.button>
                
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-mag-title font-semibold drop-shadow-lg">{dest.name}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}