import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem, User } from '../types';
import CurrencyConverter from '../components/CurrencyConverter';
import ThemeToggle from '../components/ThemeToggle';
import EmergencyInfo from '../components/EmergencyInfo';
import AvatarPicker from '../components/AvatarPicker';
import TipCalculator from '../components/TipCalculator';
import LocalInfo from '../components/LocalInfo';
import ExpertReview from '../components/ExpertReview';

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
  { id: 'tip', icon: 'payments', label: '小費', gradient: 'from-purple-400 to-violet-500' },
  { id: 'info', icon: 'info', label: '攻略', gradient: 'from-cyan-400 to-teal-500' },
];

const destinations = [
  { id: 1, name: '鄭王廟', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400', badge: '必訪', lat: 13.7437, lng: 100.4890 },
  { id: 2, name: 'IconSiam', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400', badge: '購物', lat: 13.7261, lng: 100.5099 },
  { id: 3, name: 'Jodd Fairs', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400', badge: '夜市', lat: 13.7490, lng: 100.5677 },
  { id: 4, name: '大皇宮', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400', badge: '文化', lat: 13.7500, lng: 100.4914 },
];

// 🔥 小紅書/Threads 爆紅行程 2024-2025
const trendingItineraries = [
  { 
    id: 't1',
    title: 'Mahanakhon SkyWalk',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    source: '小紅書',
    likes: '52.8萬',
    tag: '必拍',
    type: 'attraction',
    location: 'King Power Mahanakhon',
    time: '17:00',
    desc: '314m 高空玻璃棧道 🌅',
    lat: 13.7234, lng: 100.5296
  },
  { 
    id: 't2',
    title: 'Featherstone Café',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    source: 'Threads',
    likes: '38.2萬',
    tag: '網美',
    type: 'coffee',
    location: 'Ekkamai Soi 12',
    time: '10:00',
    desc: '純白咖啡廳 ☕',
    lat: 13.7182, lng: 100.5854
  },
  { 
    id: 't3',
    title: 'Jodd Fairs 火山排骨',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    source: '小紅書',
    likes: '89.1萬',
    tag: '美食',
    type: 'restaurant',
    location: 'Jodd Fairs',
    time: '19:00',
    desc: '火焰表演超震撼 🔥',
    lat: 13.7490, lng: 100.5677
  },
  { 
    id: 't4',
    title: 'The Rim 河畔晚餐',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    source: 'Threads',
    likes: '25.6萬',
    tag: '浪漫',
    type: 'restaurant',
    location: 'The Siam Hotel',
    time: '18:30',
    desc: '鄭王廟夜景 ✨',
    lat: 13.7626, lng: 100.4876
  },
  { 
    id: 't5',
    title: '水門雞飯',
    image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400',
    source: '小紅書',
    likes: '102萬',
    tag: '必吃',
    type: 'restaurant',
    location: 'Pratunam Market',
    time: '11:00',
    desc: '40泰銖海南雞飯 🍗',
    lat: 13.7509, lng: 100.5396
  },
  { 
    id: 't6',
    title: "Let's Relax Spa",
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    source: 'Threads',
    likes: '31.4萬',
    tag: '放鬆',
    type: 'spa',
    location: 'Terminal 21',
    time: '15:00',
    desc: '2hr 精油按摩 💆',
    lat: 13.7378, lng: 100.5602
  },
];

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

interface HomeViewProps {
  user: User | null;
  budget?: { total: number; remaining: number; spent: number };
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  onLogout?: () => void;
  familyMembers: FamilyMember[];
  onUpdateFamilyMember: (id: string, newImage: string) => void;
}

export default function HomeView({ user, budget, schedule, onLogout, familyMembers, onUpdateFamilyMember }: HomeViewProps) {
  const [weather, setWeather] = useState({ temp: '--', label: '載入中', icon: 'cloud' });
  const [likedDestinations, setLikedDestinations] = useState<Set<number>>(new Set());
  const [showCurrency, setShowCurrency] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTipCalc, setShowTipCalc] = useState(false);
  const [showLocalInfo, setShowLocalInfo] = useState(false);

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

  // Add trending item to schedule
  const [addedTrending, setAddedTrending] = useState<Set<string>>(new Set());
  const [showAddedToast, setShowAddedToast] = useState<string | null>(null);

  const addTrendingToSchedule = (item: typeof trendingItineraries[0]) => {
    if (addedTrending.has(item.id)) return;
    
    const newItem: ScheduleItem = {
      id: Date.now(),
      title: item.title,
      time: item.time,
      date: '2025-01-28', // Add to Day 2 by default
      type: item.type,
      location: item.location,
      desc: item.desc,
      completed: false,
      image: item.image,
    };
    
    setSchedule(prev => [...prev, newItem]);
    setAddedTrending(prev => new Set([...prev, item.id]));
    setShowAddedToast(item.title);
    setTimeout(() => setShowAddedToast(null), 2000);
  };

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
          
          <div className="flex items-start gap-3">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="relative"
            >
              {(() => {
                const currentMember = familyMembers.find(m => m.id === user?.id);
                const avatarImage = currentMember?.image || user?.image || '/avatars/me.jpg';
                
                if (avatarImage.startsWith('gradient:')) {
                  return (
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarImage.split(':')[1]} flex items-center justify-center text-white text-[20px] font-bold shadow-mag ring-2 ring-white`}>
                      {avatarImage.split(':')[2]}
                    </div>
                  );
                }
                return (
                  <div 
                    className="w-14 h-14 rounded-full bg-cover bg-center shadow-mag ring-2 ring-white"
                    style={{ backgroundImage: `url('${avatarImage}')` }}
                  />
                );
              })()}
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-red-xhs rounded-pill text-[10px] text-white font-semibold">
                切換
              </div>
            </motion.button>
          </div>
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
        <div className="grid grid-cols-6 gap-2">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (action.id === 'taxi') window.open('https://www.grab.com/th/', '_blank');
                else if (action.id === 'rate') setShowCurrency(true);
                else if (action.id === 'translate') window.open('https://translate.google.com/?sl=auto&tl=th', '_blank');
                else if (action.id === 'sos') setShowEmergency(true);
                else if (action.id === 'tip') setShowTipCalc(true);
                else if (action.id === 'info') setShowLocalInfo(true);
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-11 h-11 rounded-mag flex items-center justify-center bg-gradient-to-br ${action.gradient} shadow-mag`}>
                <span className="material-symbols-outlined text-white text-[20px]">{action.icon}</span>
              </div>
              <span className="text-[10px] text-charcoal">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <ExpertReview schedule={schedule} budget={safeBudget} />

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
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAvatarPicker(true)}
            className="text-[11px] text-red-xhs font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            編輯
          </motion.button>
        </div>
        <div className="flex gap-4">
          {familyMembers.map((member, i) => (
            <motion.button
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => setShowAvatarPicker(true)}
              className="flex flex-col items-center gap-2"
            >
              <div className="relative">
                {member.image.startsWith('gradient:') ? (
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.image.split(':')[1]} flex items-center justify-center text-white text-[20px] font-bold shadow-mag ring-2 ring-white`}>
                    {member.image.split(':')[2]}
                  </div>
                ) : (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover shadow-mag ring-2 ring-white"
                  />
                )}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <span className="text-mag-badge text-charcoal">{member.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 🔥 Trending Itineraries - Xiaohongshu/Threads */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 px-4">
          <h2 className="text-[15px] font-semibold text-charcoal">🔥 小紅書爆紅行程</h2>
        </div>
        
        <div 
          className="flex gap-3 overflow-x-auto no-scrollbar pl-4 pr-4 pb-3"
          onTouchStart={(e) => e.stopPropagation()}
        >
          {trendingItineraries.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex-none w-40"
            >
              <div className="relative aspect-[3/4] rounded-mag overflow-hidden shadow-mag mb-2">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 img-overlay" />
                
                {/* Source Badge */}
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-pill text-[10px] font-bold ${
                  item.source === '小紅書' ? 'bg-red-500 text-white' : 'bg-black text-white'
                }`}>
                  {item.source}
                </span>
                
                {/* Tag */}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-pill text-[10px] bg-white/90 text-charcoal">
                  {item.tag}
                </span>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-white text-[12px] font-semibold line-clamp-1 mb-0.5 drop-shadow-lg">{item.title}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-[10px]">
                    <span className="material-symbols-outlined text-[12px]">favorite</span>
                    {item.likes}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1.5 mt-1.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank')}
                  className="flex-1 py-1.5 rounded-mag bg-white border border-black/10 text-charcoal text-[10px] font-medium flex items-center justify-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[12px]">navigation</span>
                  導航
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addTrendingToSchedule(item)}
                  disabled={addedTrending.has(item.id)}
                  className={`flex-1 py-1.5 rounded-mag text-[10px] font-medium transition-all ${
                    addedTrending.has(item.id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-xhs text-white'
                  }`}
                >
                  {addedTrending.has(item.id) ? '✓ 已加' : '+ 加入'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Added Toast */}
      <AnimatePresence>
        {showAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 bg-charcoal text-white p-4 rounded-mag shadow-lg text-center z-50"
          >
            ✓ 已將「{showAddedToast}」加入 Day 2 行程
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destinations Grid - Magazine Masonry */}
      <div className="px-4 pb-32">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-mag-title text-charcoal">推薦景點</h2>
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
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-pill text-[10px] bg-white/90 text-charcoal">
                  {dest.badge}
                </span>
                
                {/* Heart */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); toggleLike(dest.id); }}
                  whileTap={{ scale: 1.4 }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                >
                  <span className={`material-symbols-${likedDestinations.has(dest.id) ? 'filled' : 'outlined'} text-[14px] ${likedDestinations.has(dest.id) ? 'text-red-xhs' : 'text-stone'}`}>
                    favorite
                  </span>
                </motion.button>
                
                {/* Title + Nav */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white text-[14px] font-semibold drop-shadow-lg mb-2">{dest.name}</h3>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`, '_blank')}
                    className="w-full py-1.5 rounded-pill bg-white/90 text-charcoal text-[11px] font-medium flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">navigation</span>
                    導航
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Currency Converter Modal */}
      <CurrencyConverter 
        isOpen={showCurrency} 
        onClose={() => setShowCurrency(false)} 
      />

      {/* Emergency Info Modal */}
      <EmergencyInfo
        isOpen={showEmergency}
        onClose={() => setShowEmergency(false)}
      />

      {/* Avatar Picker Modal */}
      <AvatarPicker
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        members={familyMembers}
        onUpdateMember={onUpdateFamilyMember}
      />

      {/* Tip Calculator Modal */}
      <TipCalculator
        isOpen={showTipCalc}
        onClose={() => setShowTipCalc(false)}
      />

      {/* Local Info Modal */}
      <LocalInfo
        isOpen={showLocalInfo}
        onClose={() => setShowLocalInfo(false)}
      />
    </div>
  );
}