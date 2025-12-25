import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

const days = [
  { id: 1, date: '1/27', weekday: 'Mon', label: '抵達', fullDate: '2025-01-27' },
  { id: 2, date: '1/28', weekday: 'Tue', label: '文化', fullDate: '2025-01-28' },
  { id: 3, date: '1/29', weekday: 'Wed', label: '購物', fullDate: '2025-01-29' },
  { id: 4, date: '1/30', weekday: 'Thu', label: '網美', fullDate: '2025-01-30' },
  { id: 5, date: '1/31', weekday: 'Fri', label: '文青', fullDate: '2025-01-31' },
  { id: 6, date: '2/1', weekday: 'Sat', label: '市場', fullDate: '2025-02-01' },
  { id: 7, date: '2/2', weekday: 'Sun', label: '返程', fullDate: '2025-02-02' },
];

const activityTypes = [
  { id: 'restaurant', icon: 'restaurant', label: '餐廳' },
  { id: 'storefront', icon: 'storefront', label: '逛街' },
  { id: 'photo_camera', icon: 'photo_camera', label: '拍照' },
  { id: 'spa', icon: 'spa', label: '按摩' },
  { id: 'local_cafe', icon: 'local_cafe', label: '咖啡' },
  { id: 'flight_takeoff', icon: 'flight_takeoff', label: '交通' },
];

interface ItineraryViewProps {
  schedule: ScheduleItem[];
  setSchedule: (s: ScheduleItem[]) => void;
}

export default function ItineraryView({ schedule, setSchedule }: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Activity State
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('restaurant');
  const [newLocation, setNewLocation] = useState('');

  // Get current day's schedule
  const currentDayData = days.find(d => d.id === selectedDay);
  const currentDaySchedule = schedule
    .filter(item => item.date === currentDayData?.fullDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const openMap = (location: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };

  const openTranslate = (text: string) => {
    window.open(`https://translate.google.com/?sl=auto&tl=th&text=${encodeURIComponent(text)}&op=translate`, '_blank');
  };

  const handleDelete = (itemId: number) => {
    setSchedule(schedule.filter(item => item.id !== itemId));
  };

  const handleAddActivity = () => {
    if (!newTime || !newTitle || !currentDayData) return;
    const newItem: ScheduleItem = {
      id: Date.now(),
      time: newTime,
      title: newTitle,
      date: currentDayData.fullDate,
      desc: newDesc,
      type: newType,
      location: newLocation,
      completed: false
    };

    setSchedule([...schedule, newItem]);
    setShowAddModal(false);
    setNewTime('');
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
  };

  return (
    <div className="pt-6 pb-20 relative min-h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md px-6 pt-4 pb-2 border-b border-black/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light tracking-wide text-text-primary">行程規劃</h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <span className="material-symbols-outlined text-icon">calendar_month</span>
          </motion.button>
        </div>

        {/* Day Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 px-1 snap-x">
          {days.map((day) => (
            <motion.button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center min-w-[5.5rem] p-3 rounded-2xl border transition-all duration-300 snap-center shrink-0 ${selectedDay === day.id
                ? 'bg-text-primary border-text-primary text-ivory shadow-lg scale-105'
                : 'bg-white border-black/5 text-text-muted hover:border-gold/50'
                }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{day.weekday}</span>
              <span className="text-lg font-serif font-bold tracking-tight">{day.date}</span>
              <span className="text-[10px] font-medium mt-1 opacity-80">{day.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 pt-8 pb-10 min-h-[60vh]">
        <AnimatePresence mode='wait'>
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col"
          >
            {currentDaySchedule.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-[48px_1fr] gap-x-4 relative group"
              >
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`relative flex items-center justify-center size-10 rounded-full border z-10 shadow-sm transition-transform duration-500 ${index === 0 ? 'bg-bone border-gold shadow-glow scale-110' : 'bg-ivory border-black/10'}`}>
                    <span className={`material-symbols-outlined text-lg ${index === 0 ? 'text-gold' : 'text-icon'}`}>{item.type}</span>
                  </div>
                  {index !== (currentDaySchedule.length - 1) && (
                    <div className="flex flex-col items-center h-full min-h-[4rem] -mt-2 w-full relative">
                      <div className="w-[1px] bg-gradient-to-b from-black/10 via-black/5 to-transparent h-full absolute top-0"></div>
                      {item.travelTime && (
                        <div className="mt-4 bg-white/95 backdrop-blur-sm border border-gold/30 rounded-xl px-2 py-1.5 shadow-sm z-10 flex flex-col items-center text-center max-w-[100px]">
                          <span className="text-[10px] font-bold text-text-secondary flex items-center gap-1 whitespace-nowrap">
                            {item.travelTime}
                          </span>
                          {item.travelTip && (
                            <span className="text-[9px] font-normal text-text-muted leading-tight mt-0.5 w-full break-words">
                              {item.travelTip}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="pb-10 pt-1 relative">
                  {/* Delete Button (Visible on hover or consistent) */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-0 right-0 p-2 text-icon/50 hover:text-red-500 transition-colors z-10"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </motion.button>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gold text-[10px] font-bold tracking-widest uppercase">{item.time}</span>
                    {item.tag && (
                      <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100/50 tracking-wider">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-text-primary text-lg font-normal mb-2 pr-8">{item.title}</h3>
                  <p className="text-text-secondary text-sm font-light leading-relaxed mb-4">{item.desc}</p>

                  {item.image && (
                    <div className="rounded-xl overflow-hidden h-32 w-full relative shadow-soft border border-white mb-4">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Smart Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); openTranslate(item.location || item.title); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm transition-transform hover:bg-bone hover:border-gold/30"
                    >
                      <span className="material-symbols-outlined text-[14px] text-gold">translate</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">翻譯</span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); openMap(item.location || item.title); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm transition-transform hover:bg-bone hover:border-gold/30"
                    >
                      <span className="material-symbols-outlined text-[14px] text-icon">map</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">地圖</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add Activity Button */}
            <motion.button
              layout
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="ml-[64px] flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-icon/30 text-text-muted hover:border-gold hover:text-gold transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="text-sm font-medium">新增行程</span>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe h-[85vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
              <h3 className="text-xl font-medium text-text-primary mb-6 shrink-0">新增行程</h3>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">時間</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">標題</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors"
                      placeholder="例如: 晚餐"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">類型</label>
                  <div className="grid grid-cols-3 gap-3">
                    {activityTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setNewType(type.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${newType === type.id
                          ? 'bg-text-primary text-ivory border-text-primary shadow-lg'
                          : 'bg-white border-gray-200 text-text-secondary'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[20px] mb-1">{type.icon}</span>
                        <span className="text-[10px] font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">地點 (用於地圖)</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors"
                    placeholder="Google Maps 搜尋關鍵字"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">備註</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors h-24 resize-none"
                    placeholder="例如: 記得訂位、穿著要求..."
                  />
                </div>
              </div>

              <div className="pt-4 shrink-0">
                <button
                  onClick={handleAddActivity}
                  className="w-full bg-text-primary text-ivory font-medium p-4 rounded-xl active:scale-95 transition-transform shadow-lg"
                >
                  確認新增
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}