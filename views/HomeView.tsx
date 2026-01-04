import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScheduleItem, User } from '../types';

const familyMembers = [
  { id: 'vickly', name: 'Vickly', role: '我', image: '/avatars/me.jpg' },
  { id: 'sherry', name: 'Sherry', role: '姊姊', image: '/avatars/sister.jpg' },
  { id: 'alex', name: 'Alexsander', role: '哥哥', image: '/avatars/brother.jpg' },
  { id: 'jenny', name: 'Jenny', role: '媽媽', image: '/avatars/mother.jpg' },
];

const quickActions = [
  { id: 'taxi', icon: 'local_taxi', label: '叫車', color: 'bg-ios-green' },
  { id: 'rate', icon: 'currency_exchange', label: '匯率', color: 'bg-ios-blue' },
  { id: 'translate', icon: 'translate', label: '翻譯', color: 'bg-ios-orange' },
  { id: 'sos', icon: 'sos', label: '緊急', color: 'bg-ios-red' },
];

interface HomeViewProps {
  user: User | null;
  budget?: { total: number; remaining: number; spent: number };
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  onLogout?: () => void;
}

export default function HomeView({ user, budget, schedule, onLogout }: HomeViewProps) {
  const [weather, setWeather] = useState({ temp: '--', label: '載入中' });

  const safeBudget = budget || { total: 50000, remaining: 38500, spent: 11500 };
  const spentPercent = (safeBudget.spent / safeBudget.total) * 100;

  // Fetch weather
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=13.7563&longitude=100.5018&current_weather=true&timezone=Asia%2FBangkok')
      .then(r => r.json())
      .then(data => {
        const { temperature } = data?.current_weather || {};
        setWeather({ temp: `${Math.round(temperature)}°`, label: '曼谷' });
      })
      .catch(() => setWeather({ temp: '33°', label: '曼谷' }));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '午安';
    return '晚安';
  };

  // Get companions (exclude current user)
  const companions = familyMembers.filter(m => m.id !== user?.id);

  // Next event
  const sortedSchedule = [...schedule].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
  const nextEvent = sortedSchedule.find(e => !e.completed);

  const handleAction = (id: string) => {
    if (id === 'taxi') window.open('https://www.grab.com/th/', '_blank');
    else if (id === 'rate') window.open('https://www.google.com/finance/quote/THB-TWD', '_blank');
    else if (id === 'translate') window.open('https://translate.google.com/?sl=auto&tl=th', '_blank');
    else if (id === 'sos') window.open('tel:1155', '_self');
  };

  return (
    <div className="min-h-screen bg-ios-bg pb-safe">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 safe-top">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-ios-footnote text-ios-gray mb-1">{weather.temp} {weather.label} ☀️</p>
            <h1 className="text-ios-largeTitle text-[#1C1C1E]">
              {getGreeting()}，<br/>{user?.name || '旅人'}
            </h1>
          </div>
          
          {/* Avatar - Larger tap target */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onLogout}
            className="relative"
          >
            <img 
              src={user?.image || '/avatars/me.jpg'}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover shadow-ios-md"
            />
            <div className="absolute -bottom-1 right-0 px-2 py-0.5 bg-ios-blue rounded-full text-[10px] text-white font-medium">
              切換
            </div>
          </motion.button>
        </div>
      </div>

      {/* Budget Card */}
      <div className="px-5 mb-6">
        <div className="ios-card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-ios-caption1 text-ios-gray mb-1">個人剩餘預算</p>
              <p className="text-ios-title1 text-[#1C1C1E]">
                ฿{Math.round(safeBudget.remaining).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-ios-green/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-ios-green text-[24px]">savings</span>
            </div>
          </div>
          
          <div className="h-2 bg-ios-gray5 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${spentPercent}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${spentPercent > 80 ? 'bg-ios-red' : 'bg-ios-green'}`}
            />
          </div>
          <p className="text-ios-caption2 text-ios-gray">
            已使用 ฿{Math.round(safeBudget.spent).toLocaleString()} / ฿{Math.round(safeBudget.total).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions - Larger buttons */}
      <div className="px-5 mb-8">
        <p className="text-ios-footnote text-ios-gray uppercase tracking-wide mb-3">快速動作</p>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAction(action.id)}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center shadow-ios`}>
                <span className="material-symbols-outlined text-white text-[28px]">{action.icon}</span>
              </div>
              <span className="text-ios-caption1 text-[#1C1C1E] font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Next Event */}
      {nextEvent && (
        <div className="px-5 mb-8">
          <p className="text-ios-footnote text-ios-gray uppercase tracking-wide mb-3">下一個行程</p>
          <div className="ios-card p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-ios-blue/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-ios-blue text-[28px]">schedule</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-headline text-[#1C1C1E] mb-1 truncate">{nextEvent.title}</p>
                {nextEvent.location && (
                  <p className="text-ios-caption1 text-ios-gray truncate">{nextEvent.location}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-ios-headline text-ios-blue">{nextEvent.time}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Companions */}
      <div className="px-5 mb-8">
        <p className="text-ios-footnote text-ios-gray uppercase tracking-wide mb-3">旅伴狀態</p>
        <div className="flex gap-5">
          {companions.map((member) => (
            <div key={member.id} className="flex flex-col items-center gap-2">
              <div className="relative">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover shadow-ios"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-ios-green rounded-full border-2 border-white" />
              </div>
              <span className="text-ios-caption1 text-[#1C1C1E]">{member.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}