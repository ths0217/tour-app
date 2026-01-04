import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';
import MagazineCard from '../components/MagazineCard';

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
  { id: 'restaurant', icon: 'restaurant', label: '美食' },
  { id: 'attraction', icon: 'attractions', label: '景點' },
  { id: 'camera', icon: 'photo_camera', label: '拍照' },
  { id: 'spa', icon: 'spa', label: '按摩' },
  { id: 'coffee', icon: 'local_cafe', label: '咖啡' },
  { id: 'shopping_bag', icon: 'shopping_bag', label: '購物' },
];

interface ItineraryViewProps {
  schedule: ScheduleItem[];
  setSchedule: (s: ScheduleItem[]) => void;
}

export default function ItineraryView({ schedule, setSchedule }: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);

  // Form state
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('restaurant');
  const [newLocation, setNewLocation] = useState('');

  const currentDayData = days.find(d => d.id === selectedDay);
  const currentDaySchedule = schedule
    .filter(item => item.date === currentDayData?.fullDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleToggle = (id: number) => {
    setSchedule(schedule.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
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
    resetForm();
  };

  const resetForm = () => {
    setNewTime('');
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setNewType('restaurant');
  };

  return (
    <div className="min-h-full">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-40 glass border-b border-black/5 safe-top">
        <div className="px-4 pt-4 pb-3">
          {/* Title Row */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-mag-hero text-charcoal">曼谷探險</h1>
              <p className="text-mag-caption text-stone mt-1">✨ 7天6夜家庭之旅</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className="w-11 h-11 rounded-full bg-red-xhs flex items-center justify-center shadow-mag"
            >
              <span className="material-symbols-outlined text-white text-[22px]">add</span>
            </motion.button>
          </div>

          {/* Day Selector Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {days.map((day) => (
              <motion.button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-pill whitespace-nowrap transition-all duration-200 ${
                  selectedDay === day.id
                    ? 'bg-charcoal text-white shadow-mag'
                    : 'bg-white/80 text-charcoal border border-black/5'
                }`}
              >
                <span className="font-mono text-mag-time">{day.date}</span>
                <span className={`text-mag-badge ${selectedDay === day.id ? 'text-white/70' : 'text-stone'}`}>
                  {day.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 pt-4 pb-safe">
        {currentDaySchedule.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-pastel-blue flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-blue-500 text-[36px]">explore</span>
            </div>
            <p className="text-mag-title text-charcoal mb-2">開始規劃你的冒險</p>
            <p className="text-mag-caption text-stone">點擊右上角 + 新增第一個行程</p>
          </motion.div>
        ) : (
          <div className="masonry">
            {currentDaySchedule.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="masonry-item"
              >
                <MagazineCard
                  item={item}
                  onToggle={handleToggle}
                  onPress={(i) => setSelectedItem(i)}
                />
              </motion.div>
            ))}
          </div>
        )}
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
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-mag-xl z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-cream pt-3 pb-2 z-10">
                <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
              </div>

              <div className="px-5 pb-safe">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <button onClick={() => setShowAddModal(false)} className="text-stone text-mag-body">取消</button>
                  <h3 className="text-mag-title text-charcoal">新增行程</h3>
                  <button onClick={handleAddActivity} className="text-red-xhs text-mag-body font-semibold">新增</button>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Type Pills */}
                  <div>
                    <label className="text-mag-caption text-stone block mb-3">類型</label>
                    <div className="flex flex-wrap gap-2">
                      {activityTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setNewType(type.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-mag-badge transition-all ${
                            newType === type.id
                              ? 'bg-charcoal text-white'
                              : 'bg-white text-charcoal border border-black/5'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-mag p-4 shadow-mag">
                      <label className="text-mag-caption text-stone block mb-2">時間</label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full text-mag-body text-charcoal bg-transparent outline-none font-mono"
                      />
                    </div>
                    
                    <div className="bg-white rounded-mag p-4 shadow-mag">
                      <label className="text-mag-caption text-stone block mb-2">標題</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="例如：鄭王廟拍泰服"
                        className="w-full text-mag-body text-charcoal bg-transparent outline-none placeholder:text-stone/50"
                      />
                    </div>

                    <div className="bg-white rounded-mag p-4 shadow-mag">
                      <label className="text-mag-caption text-stone block mb-2">地點</label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="例如：Wat Arun"
                        className="w-full text-mag-body text-charcoal bg-transparent outline-none placeholder:text-stone/50"
                      />
                    </div>

                    <div className="bg-white rounded-mag p-4 shadow-mag">
                      <label className="text-mag-caption text-stone block mb-2">備註</label>
                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="任何想記住的小提醒..."
                        rows={3}
                        className="w-full text-mag-body text-charcoal bg-transparent outline-none resize-none placeholder:text-stone/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 top-16 bg-cream rounded-mag-xl z-50 overflow-hidden shadow-mag-hover"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-pill text-mag-time font-mono bg-charcoal text-white mb-3">
                      {selectedItem.time}
                    </span>
                    <h2 className="text-mag-hero text-charcoal">{selectedItem.title}</h2>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedItem(null)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-mag"
                  >
                    <span className="material-symbols-outlined text-stone">close</span>
                  </motion.button>
                </div>
                
                {selectedItem.location && (
                  <div className="flex items-center gap-2 text-mag-body text-stone mb-4">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {selectedItem.location}
                  </div>
                )}
                
                {selectedItem.desc && (
                  <p className="text-mag-body text-charcoal leading-relaxed mb-6 bg-white p-4 rounded-mag shadow-mag">
                    {selectedItem.desc}
                  </p>
                )}

                {(selectedItem.travelTime || selectedItem.travelTip) && (
                  <div className="bg-pastel-blue p-4 rounded-mag">
                    <p className="text-mag-caption text-stone mb-2">🚗 交通建議</p>
                    {selectedItem.travelTime && (
                      <p className="text-mag-body text-charcoal font-semibold">{selectedItem.travelTime}</p>
                    )}
                    {selectedItem.travelTip && (
                      <p className="text-mag-caption text-stone mt-1">{selectedItem.travelTip}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}