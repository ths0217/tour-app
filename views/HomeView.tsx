import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem, User } from '../types';

const familyMembersData = [
  { id: 'vickly', name: 'Vickly', role: '我', image: '/avatars/me.jpg', bat: 80 },
  { id: 'sherry', name: 'Sherry', role: '姊姊', image: '/avatars/sister.jpg', bat: 45 },
  { id: 'alex', name: 'Alexsander', role: '哥哥', image: '/avatars/brother.jpg', bat: 92 },
  { id: 'jenny', name: 'Jenny', role: '媽媽', image: '/avatars/mother.jpg', bat: 78 },
];

const quickActions = [
  { id: 'taxi', icon: 'local_taxi', label: '叫車', color: 'bg-ios-green/10', iconColor: 'text-ios-green' },
  { id: 'rate', icon: 'currency_exchange', label: '匯率', color: 'bg-ios-blue/10', iconColor: 'text-ios-blue' },
  { id: 'translate', icon: 'translate', label: '翻譯', color: 'bg-ios-orange/10', iconColor: 'text-ios-orange' },
  { id: 'sos', icon: 'sos', label: '緊急', color: 'bg-ios-red/10', iconColor: 'text-ios-red' },
];

const defaultMemories = [
  'https://images.unsplash.com/photo-1542259681-d2547b74288c?q=80&w=400',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=400',
  'https://images.unsplash.com/photo-1621251804470-43f5509935d2?q=80&w=400',
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?q=80&w=400',
];

// iOS Spring Physics
const springTransition = { type: "spring", stiffness: 400, damping: 30 };

interface HomeViewProps {
  user: User | null;
  budget?: { total: number; remaining: number; spent: number };
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  onLogout?: () => void;
}

export default function HomeView({ user, budget, schedule, setSchedule, onLogout }: HomeViewProps) {
  const [weather, setWeather] = useState({ temp: '--', label: '載入中', icon: 'cloud' });
  const [memories] = useState(defaultMemories);

  const safeBudget = budget || { total: 12500, remaining: 9000, spent: 3500 };
  const percentSpent = safeBudget.total > 0 ? (safeBudget.spent / safeBudget.total) * 100 : 0;

  // Real Bangkok Weather
  useEffect(() => {
    const weatherCodeMap: Record<number, { label: string; icon: string }> = {
      0: { label: '晴朗', icon: 'sunny' },
      1: { label: '少雲', icon: 'partly_cloudy_day' },
      2: { label: '多雲', icon: 'cloud' },
      3: { label: '陰天', icon: 'cloud' },
      45: { label: '霧', icon: 'foggy' },
      51: { label: '細雨', icon: 'water_drop' },
      61: { label: '陣雨', icon: 'rainy' },
      80: { label: '短暫雨', icon: 'rainy' },
      95: { label: '雷雨', icon: 'thunderstorm' },
    };

    fetch('https://api.open-meteo.com/v1/forecast?latitude=13.7563&longitude=100.5018&current_weather=true&timezone=Asia%2FBangkok')
      .then(r => r.json())
      .then(data => {
        const { temperature, weathercode } = data?.current_weather || {};
        const info = weatherCodeMap[weathercode] || { label: '晴朗', icon: 'sunny' };
        setWeather({ temp: `${Math.round(temperature)}°`, label: info.label, icon: info.icon });
      })
      .catch(() => setWeather({ temp: '33°', label: '晴朗', icon: 'sunny' }));
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  // Find next event
  const sortedSchedule = [...schedule].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
  const nextEvent = sortedSchedule.find(e => !e.completed);

  // Filter companions (exclude current user)
  const companions = familyMembersData.filter(m => m.id !== user?.id);

  const handleAction = (id: string) => {
    if (id === 'taxi') window.open('https://www.grab.com/th/transport/', '_blank');
    else if (id === 'rate') window.open('https://www.google.com/finance/quote/THB-TWD', '_blank');
    else if (id === 'translate') window.open('https://translate.google.com/?sl=auto&tl=th', '_blank');
    else if (id === 'sos') window.open('tel:1155', '_self'); // Thailand Tourist Police
  };

  return (
    <div className="min-h-full bg-ios-groupedBg px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-ios-largeTitle font-bold text-ios-label tracking-tight"
          >
            {getGreeting()}，
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-ios-title2 font-bold text-ios-label"
          >
            {user?.name || '旅人'}
          </motion.p>
        </div>
        
        {/* Avatar */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onLogout}
          className="relative"
          title="點擊切換身份"
        >
          <div 
            className="w-14 h-14 rounded-full bg-cover bg-center shadow-ios ring-2 ring-white"
            style={{ backgroundImage: `url('${user?.image || '/avatars/me.jpg'}')` }}
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-ios-green rounded-full border-2 border-white" />
        </motion.button>
      </div>

      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-ios-blue to-ios-indigo rounded-ios-lg p-4 mb-4 shadow-ios"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">{weather.icon}</span>
            </div>
            <div>
              <p className="text-white/80 text-ios-caption1">曼谷即時天氣</p>
              <p className="text-white text-ios-title2 font-bold">{weather.temp} {weather.label}</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white/60 text-[20px]">chevron_right</span>
        </div>
      </motion.div>

      {/* Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-ios-lg p-4 mb-4 shadow-ios"
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-ios-footnote text-ios-secondaryLabel">個人剩餘預算</p>
          <div className="w-8 h-8 rounded-ios-sm bg-ios-green/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-ios-green text-[18px]">account_balance_wallet</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-ios-largeTitle font-bold text-ios-label">฿{Math.round(safeBudget.remaining).toLocaleString()}</span>
          <span className="text-ios-footnote text-ios-tertiaryLabel">/ ฿{Math.round(safeBudget.total).toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-ios-gray5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentSpent, 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${percentSpent > 80 ? 'bg-ios-red' : percentSpent > 50 ? 'bg-ios-orange' : 'bg-ios-green'}`}
          />
        </div>
        <p className="text-ios-caption2 text-ios-tertiaryLabel mt-2">已使用 {Math.round(percentSpent)}%</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-4 gap-3 mb-6"
      >
        {quickActions.map((action, i) => (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleAction(action.id)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-ios shadow-ios-sm"
          >
            <div className={`w-11 h-11 rounded-ios-sm ${action.color} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${action.iconColor} text-[22px]`}>{action.icon}</span>
            </div>
            <span className="text-ios-caption1 text-ios-label font-medium">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Next Event Card */}
      {nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-ios-lg p-4 mb-4 shadow-ios"
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-ios-footnote text-ios-secondaryLabel font-medium">下一個行程</p>
            <span className="text-ios-footnote text-ios-blue font-medium">{nextEvent.time}</span>
          </div>
          <h3 className="text-ios-headline font-semibold text-ios-label mb-1">{nextEvent.title}</h3>
          {nextEvent.location && (
            <div className="flex items-center gap-1 text-ios-caption1 text-ios-tertiaryLabel">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {nextEvent.location}
            </div>
          )}
          {nextEvent.travelTime && (
            <p className="text-ios-caption1 text-ios-blue mt-2">{nextEvent.travelTime} {nextEvent.travelTip}</p>
          )}
        </motion.div>
      )}

      {/* Companions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-ios-headline font-semibold text-ios-label">旅伴狀態</h2>
          <button className="text-ios-footnote text-ios-blue font-medium">查看全部</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {companions.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex flex-col items-center gap-2 min-w-[60px]"
            >
              <div className="relative">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-ios-sm"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-ios-sm">
                  <span className={`text-[10px] font-bold ${member.bat > 50 ? 'text-ios-green' : 'text-ios-orange'}`}>
                    {member.bat}
                  </span>
                </div>
              </div>
              <span className="text-ios-caption2 text-ios-secondaryLabel">{member.name}</span>
            </motion.div>
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-2 min-w-[60px]"
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-ios-gray3 flex items-center justify-center">
              <span className="material-symbols-outlined text-ios-gray text-[24px]">add</span>
            </div>
            <span className="text-ios-caption2 text-ios-tertiaryLabel">新增</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Memories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-ios-headline font-semibold text-ios-label">今日回憶</h2>
          <button className="text-ios-footnote text-ios-blue font-medium">查看全部</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
          {memories.slice(0, 4).map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="shrink-0 w-28 h-36 rounded-ios-md overflow-hidden shadow-ios"
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="shrink-0 w-28 h-36 rounded-ios-md border-2 border-dashed border-ios-gray3 flex flex-col items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-ios-gray text-[28px]">add_photo_alternate</span>
            <span className="text-ios-caption2 text-ios-tertiaryLabel">新增照片</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}