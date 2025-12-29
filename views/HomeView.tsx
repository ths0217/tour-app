import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem, User } from '../types';

const familyMembersData = [
  { id: 'vickly', name: 'Vickly', role: '我', image: '/avatars/me.jpg', bat: 80 },
  { id: 'sherry', name: 'Sherry', role: '姊姊', image: '/avatars/sister.jpg', bat: 45 },
  { id: 'alex', name: 'Alexsander', role: '哥哥', image: '/avatars/father.jpg', bat: 92 },
  { id: 'jenny', name: 'Jenny', role: '媽媽', image: '/avatars/mother.jpg', bat: 78 },
];

const quickActions = [
  { id: 'taxi', icon: 'local_taxi', label: '叫車', color: 'bg-green-100 text-green-700' },
  { id: 'rate', icon: 'currency_exchange', label: '匯率', color: 'bg-blue-100 text-blue-700' },
  { id: 'translate', icon: 'translate', label: '翻譯', color: 'bg-orange-100 text-orange-700' },
  { id: 'sos', icon: 'sos', label: '緊急', color: 'bg-red-100 text-red-700' },
];

const phrases = [
  { th: 'Sawatdee Khrap/Ka', en: '你好', aud: '🙏' },
  { th: 'Khop Khun', en: '謝謝', aud: '😊' },
  { th: 'Mai Phet', en: '不要辣', aud: '🌶️' },
  { th: 'Tao Rai?', en: '多少錢?', aud: '💰' },
  { th: 'Hong Nam', en: '廁所', aud: '🚽' },
  { th: 'Lot Noi Dai Mai', en: '便宜點?', aud: '📉' },
];

const WEATHER_SCENARIOS = [
  { temp: '33°C 晴', loc: '泰國曼谷', district: 'Siam', alertTitle: '高溫警報', alertDesc: '目前體感溫度達 39°C，戶外活動請多補充水分 💧', icon: 'thermometer' },
  { temp: '29°C 陰', loc: '泰國曼谷', district: 'Riverside', alertTitle: '午後雷陣雨', alertDesc: '預計下午 3 點有降雨機率 80%', icon: 'thunderstorm' },
  { temp: '28°C 晚', loc: '泰國曼谷', district: 'Thong Lor', alertTitle: '交通擁塞', alertDesc: '週五晚間尖峰時刻，建議改搭 BTS 或摩托計程車 🛵', icon: 'traffic' },
  { temp: '30°C 多雲', loc: '泰國曼谷', district: 'Chinatown', alertTitle: '人潮擁擠', alertDesc: '週末夜市時段人潮眾多，請小心隨身財物 🎒', icon: 'groups' },
];

const defaultSchedule = [
  { id: 1, title: '晚餐預約：Jay Fai', time: '19:00', completed: false, type: 'Dinner' },
  { id: 2, title: '按摩：Health Land', time: '21:30', completed: false, type: 'Activity' },
  { id: 3, title: 'Big C 採購', time: '10:00', completed: false, type: 'Shopping' },
];

const defaultMemories = [
  'https://images.unsplash.com/photo-1542259681-d2547b74288c?q=80&w=400',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=400',
  'https://images.unsplash.com/photo-1621251804470-43f5509935d2?q=80&w=400',
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?q=80&w=400',
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=400',
  'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=400',
];

// ... (keep constants)

interface HomeViewProps {
  user: User | null;
  budget?: { total: number; remaining: number; spent: number };
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
}

export default function HomeView({ user, budget, schedule, setSchedule }: HomeViewProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [weather, setWeather] = useState(WEATHER_SCENARIOS[0]);

  // Use passed budget or defaults
  const safeBudget = budget || { total: 12500, remaining: 9000, spent: 3500 };
  const percentSpent = safeBudget.total > 0 ? (safeBudget.spent / safeBudget.total) * 100 : 0;

  useEffect(() => {
    const randomScenario = WEATHER_SCENARIOS[Math.floor(Math.random() * WEATHER_SCENARIOS.length)];
    setWeather(randomScenario);
  }, []);

  const [showMemories, setShowMemories] = useState(false);
  const [memories, setMemories] = useState(defaultMemories);

  const [showEventEdit, setShowEventEdit] = useState(false);
  // Removed local schedule state

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]); // Default today

  // Find next upcoming event (first uncompleted)
  // Sort schedule by date then time just in case, or assume passed in order.
  // We'll rely on the App.tsx initial order for now, or do a quick sort.
  const sortedSchedule = [...schedule].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const nextEvent = sortedSchedule.find(e => !e.completed) || {
    id: 0,
    title: 'No upcoming events',
    time: '--:--',
    type: 'None',
    date: '',
    completed: true,
    location: '',
    travelTime: '',
    travelTip: ''
  } as ScheduleItem;

  // Filter out current user from "Companion Status" to avoid redundancy
  const companions = familyMembersData.filter(m => m.id !== user?.id);

  const handleAction = (id: string) => {
    if (id === 'taxi') {
      window.open('https://www.grab.com/th/transport/', '_blank');
    } else if (id === 'rate') {
      window.open('https://www.google.com/finance/quote/THB-TWD', '_blank');
    } else {
      setActiveModal(id);
    }
  };

  const addEvent = () => {
    if (!newEventTitle) return;
    const newItem: ScheduleItem = {
      id: Date.now(),
      title: newEventTitle,
      time: newEventTime || '00:00',
      date: newEventDate,
      completed: false,
      type: 'Activity',
      notificationOffset: 10,
    };
    setSchedule((prev) => [...prev, newItem]);
    setNewEventTitle('');
    setNewEventTime('');
  };

  const toggleEvent = (id: number) => {
    setSchedule((prev) => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const addMemory = () => {
    // Simulate upload
    const newMemory = 'https://images.unsplash.com/photo-1590523277543-a9d22ce67412?q=80&w=400';
    setMemories([newMemory, ...memories]);
  };

  return (
    <div className="pt-14 px-6 pb-6 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-light tracking-wide text-text-primary font-display"
          >
            早安，<br /><span className="font-normal">{user?.name || '旅人'}</span>
          </motion.h1>
          <div className="flex items-center gap-2 text-text-muted mt-2">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase">{weather.loc} • {weather.district} • {weather.temp}</p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <div
            className="w-12 h-12 rounded-full bg-bone border border-white shadow-sm bg-cover bg-center"
            style={{ backgroundImage: `url('${user?.image || '/avatars/me.jpg'}')` }}
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-ivory rounded-full"></div>
        </motion.div>
      </div>

      {/* Budget Snapshot */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 shadow-card border border-black/5 mb-6 relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">個人剩餘預算</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-text-primary">฿ {Math.round(safeBudget.remaining).toLocaleString()}</span>
              <span className="text-xs text-text-muted">/ ฿ {Math.round(safeBudget.total).toLocaleString()}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600">account_balance_wallet</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-bone rounded-full mb-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentSpent, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${safeBudget.remaining < 0 ? 'bg-red-400' : 'bg-green-500'}`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-text-muted">
          <span>已支出 {Math.round(percentSpent)}%</span>
          <span>{safeBudget.remaining < 0 ? '已超支' : '尚有額度'}</span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.id}
            onClick={() => handleAction(action.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${action.color}`}>
              <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
            </div>
            <span className="text-[11px] font-medium text-text-secondary">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Alert Card */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="mb-8 cursor-pointer relative overflow-hidden rounded-2xl bg-text-primary text-ivory shadow-soft p-5"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-gold/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shadow-sm">
            <span className="material-symbols-outlined text-gold">{weather.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-normal text-ivory text-sm tracking-wide">行程提醒：{weather.alertTitle}</h3>
              <span className="text-[10px] text-ivory bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">現在</span>
            </div>
            <p className="mt-2 text-xs text-ivory/80 leading-relaxed font-light">{weather.alertDesc}</p>
          </div>
        </div>
      </motion.div>

      {/* Family Status */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4 pl-1">旅伴狀態</h3>
        <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2 pl-1">
          {companions.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="flex flex-col items-center gap-2 min-w-[4rem]"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full p-[2px] border border-gray-200 group-hover:border-gold transition-colors">
                  <div
                    className="w-full h-full rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${member.image}')` }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white border border-ivory shadow-sm rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${member.bat > 30 ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </motion.div>
              <span className="text-[10px] font-medium text-text-secondary">{member.name}</span>
            </motion.div>
          ))}
          <div className="flex flex-col items-center gap-2 min-w-[4rem]">
            <motion.button
              whileTap={{ scale: 0.9, rotate: 90 }}
              className="w-14 h-14 rounded-full border border-dashed border-icon/40 flex items-center justify-center bg-transparent active:bg-black/5 transition-colors"
            >
              <span className="material-symbols-outlined text-icon text-[20px]">add</span>
            </motion.button>
            <span className="text-[10px] text-text-muted">新增</span>
          </div>
        </div>
      </section>

      {/* Memories */}
      <section className="mb-6">
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">今日回憶</h3>
          <span
            className="text-[10px] text-gold font-medium cursor-pointer"
            onClick={() => setShowMemories(true)}
          >
            查看全部
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pl-1">
          {memories.slice(0, 3).map((img, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.98 }}
              className="min-w-[140px] h-48 rounded-2xl bg-cover bg-center relative overflow-hidden shadow-card"
              style={{ backgroundImage: `url('${img}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Next Event */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowEventEdit(true)}
        className="bg-bone rounded-3xl p-6 border border-white relative overflow-hidden shadow-card group cursor-pointer mb-8"
      >
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${nextEvent.type === 'None' ? 'bg-gray-400' : 'bg-gold'}`}></span>
              <p className="text-[10px] font-medium text-gold uppercase tracking-[0.2em]">
                {nextEvent.type === 'None' ? 'NO UPCOMING' : `接下來 • ${nextEvent.date ? formatDate(nextEvent.date) + ' ' : ''}${nextEvent.time}`}
              </p>
            </div>
            <h3 className="text-xl font-light text-text-primary leading-tight">
              {nextEvent.type === 'None' ? '目前無行程' : `${nextEvent.type === 'Dinner' ? '晚餐預約' : '行程'}：`}
              <span className="font-normal font-serif">{nextEvent.title}</span>
            </h3>
            {/* Added details for clarity */}
            {nextEvent.location && (
              <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                {nextEvent.location}
              </p>
            )}
            {/* Added Travel Info if available */}
            {/* @ts-ignore - travelTime optional */}
            {nextEvent.travelTime && (
              <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">directions_car</span>
                需時 {nextEvent.travelTime}
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="bg-white hover:bg-bone-alt text-gold rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

              {activeModal === 'translate' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium text-text-primary">泰語快查</h3>
                    <button
                      onClick={() => window.open('https://translate.google.com/?sl=zh-TW&tl=th', '_blank')}
                      className="text-xs font-bold text-gold uppercase tracking-wider"
                    >
                      Google 翻譯 &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {phrases.map((p, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm text-left relative overflow-hidden group"
                      >
                        <div className="absolute right-2 top-2 text-2xl opacity-20 group-active:opacity-100 transition-opacity grayscale group-active:grayscale-0">{p.aud}</div>
                        <p className="text-lg font-medium text-text-primary mb-1">{p.th}</p>
                        <p className="text-xs text-text-muted">{p.en}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'sos' && (
                <div>
                  <h3 className="text-xl font-medium text-text-primary mb-6">緊急聯絡</h3>
                  <div className="space-y-4">
                    <motion.a
                      href="tel:1155"
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between bg-red-50 p-5 rounded-2xl border border-red-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">local_police</span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-text-primary">觀光警察</p>
                          <p className="text-xs text-text-muted">Tourist Police</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-red-600">1155</span>
                    </motion.a>
                    <motion.a
                      href="tel:191"
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between bg-white p-5 rounded-2xl border border-black/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                          <span className="material-symbols-outlined">emergency</span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-text-primary">緊急求助</p>
                          <p className="text-xs text-text-muted">Emergency</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-text-primary">191</span>
                    </motion.a>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Memories Modal */}
        {showMemories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] p-4 pt-12 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-white text-2xl font-light">所有回憶</h2>
              <button onClick={() => setShowMemories(false)} className="text-white p-2 bg-white/10 rounded-full">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Add Memory Button */}
            <div className="mb-6 px-2">
              <button
                onClick={addMemory}
                className="w-full bg-white/10 hover:bg-white/20 text-white p-4 rounded-xl border border-dashed border-white/30 flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined">add_a_photo</span>
                <span className="text-sm font-medium">新增回憶</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {memories.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-[3/4]"><img src={img} className="w-full h-full object-cover" /></div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Edit Schedule Modal */}
        {showEventEdit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEventEdit(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-[60] pb-safe h-[80vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-medium text-text-primary">行程規劃</h3>
                <button onClick={() => setShowEventEdit(false)} className="text-xs font-bold text-text-muted">完成</button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar relative">
                {/* Schedule List */}
                <div className="space-y-3 mb-6">
                  {schedule.map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                      <button
                        onClick={() => toggleEvent(event.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${event.completed ? 'bg-gold border-gold' : 'border-gray-300'}`}
                      >
                        {event.completed && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                      </button>
                      <div className={event.completed ? 'opacity-40 line-through' : ''}>
                        <p className="font-medium text-text-primary">{event.title}</p>
                        <p className="text-xs text-text-muted">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Event UI */}
                <div className="bg-bone rounded-xl p-4 sticky bottom-0">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">新增行程</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="標題"
                      value={newEventTitle}
                      onChange={e => setNewEventTitle(e.target.value)}
                      className="flex-1 bg-white border-none rounded-lg p-3 text-sm outline-none shadow-sm"
                    />
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={e => setNewEventTime(e.target.value)}
                      className="w-24 bg-white border-none rounded-lg p-3 text-sm outline-none shadow-sm"
                    />
                  </div>
                  <button
                    onClick={addEvent}
                    disabled={!newEventTitle}
                    className="w-full bg-text-primary text-ivory font-medium p-3 rounded-lg disabled:opacity-50"
                  >
                    加入清單
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}