import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

const days = [
  { id: 1, date: '1/27', weekday: '一', label: '抵達', fullDate: '2025-01-27' },
  { id: 2, date: '1/28', weekday: '二', label: '文化', fullDate: '2025-01-28' },
  { id: 3, date: '1/29', weekday: '三', label: '購物', fullDate: '2025-01-29' },
  { id: 4, date: '1/30', weekday: '四', label: '網美', fullDate: '2025-01-30' },
  { id: 5, date: '1/31', weekday: '五', label: '文青', fullDate: '2025-01-31' },
  { id: 6, date: '2/1', weekday: '六', label: '市場', fullDate: '2025-02-01' },
  { id: 7, date: '2/2', weekday: '日', label: '返程', fullDate: '2025-02-02' },
];

const activityTypes = [
  { id: 'restaurant', icon: 'restaurant', label: '美食' },
  { id: 'attraction', icon: 'attractions', label: '景點' },
  { id: 'camera', icon: 'photo_camera', label: '拍照' },
  { id: 'spa', icon: 'spa', label: '按摩' },
  { id: 'coffee', icon: 'local_cafe', label: '咖啡' },
  { id: 'shopping_bag', icon: 'shopping_bag', label: '購物' },
];

const typeColors: Record<string, string> = {
  restaurant: 'bg-ios-orange',
  attraction: 'bg-ios-blue',
  camera: 'bg-ios-pink',
  spa: 'bg-ios-green',
  coffee: 'bg-amber-500',
  shopping_bag: 'bg-ios-purple',
};

interface ItineraryViewProps {
  schedule: ScheduleItem[];
  setSchedule: (s: ScheduleItem[]) => void;
}

export default function ItineraryView({ schedule, setSchedule }: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

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
    <div className="min-h-screen bg-ios-bg pb-safe">
      {/* Header */}
      <div className="ios-glass sticky top-0 z-40 border-b border-black/5 safe-top">
        <div className="px-5 pt-4 pb-3">
          {/* Title Row */}
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-ios-largeTitle text-[#1C1C1E]">行程規劃</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className="w-11 h-11 rounded-full bg-ios-blue flex items-center justify-center shadow-ios"
            >
              <span className="material-symbols-outlined text-white text-[22px]">add</span>
            </motion.button>
          </div>

          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
            {days.map((day) => (
              <motion.button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-xl transition-all ${
                  selectedDay === day.id
                    ? 'bg-ios-blue shadow-ios'
                    : 'bg-white shadow-ios'
                }`}
              >
                <span className={`text-ios-caption2 ${
                  selectedDay === day.id ? 'text-white/70' : 'text-ios-gray'
                }`}>週{day.weekday}</span>
                <span className={`text-ios-title3 font-bold ${
                  selectedDay === day.id ? 'text-white' : 'text-[#1C1C1E]'
                }`}>{day.date.split('/')[1]}</span>
                <span className={`text-ios-caption2 ${
                  selectedDay === day.id ? 'text-white/70' : 'text-ios-gray'
                }`}>{day.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="px-5 pt-5">
        {currentDaySchedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-ios-blue/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-ios-blue text-[40px]">event</span>
            </div>
            <p className="text-ios-headline text-[#1C1C1E] mb-2">尚無行程</p>
            <p className="text-ios-subhead text-ios-gray">點擊右上角 + 新增行程</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDaySchedule.map((item, index) => {
              const bgColor = typeColors[item.type || ''] || 'bg-ios-gray';
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleToggle(item.id)}
                  className={`ios-card p-4 cursor-pointer transition-opacity ${
                    item.completed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-white text-[24px]">
                        {activityTypes.find(t => t.id === item.type)?.icon || 'event'}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-ios-headline text-[#1C1C1E] mb-1 ${
                        item.completed ? 'line-through' : ''
                      }`}>{item.title}</p>
                      {item.location && (
                        <p className="text-ios-caption1 text-ios-gray truncate">{item.location}</p>
                      )}
                    </div>
                    
                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-ios-headline text-ios-blue">{item.time}</p>
                    </div>
                    
                    {/* Checkbox */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      item.completed 
                        ? 'bg-ios-green border-ios-green' 
                        : 'border-ios-gray3'
                    }`}>
                      {item.completed && (
                        <span className="material-symbols-outlined text-white text-[16px]">check</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
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
              className="fixed bottom-0 left-0 right-0 bg-ios-bg rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-ios-bg pt-3 pb-2 z-10">
                <div className="w-10 h-1 bg-ios-gray3 rounded-full mx-auto" />
              </div>

              <div className="px-5 pb-safe">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <button onClick={() => setShowAddModal(false)} className="text-ios-blue text-ios-body">取消</button>
                  <h3 className="text-ios-headline text-[#1C1C1E]">新增行程</h3>
                  <button onClick={handleAddActivity} className="text-ios-blue text-ios-body font-semibold">完成</button>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  {/* Type Selection */}
                  <div>
                    <p className="text-ios-footnote text-ios-gray uppercase mb-3">類型</p>
                    <div className="flex flex-wrap gap-2">
                      {activityTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setNewType(type.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-ios-subhead transition-all ${
                            newType === type.id
                              ? 'bg-ios-blue text-white'
                              : 'bg-white text-[#1C1C1E] shadow-ios'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="ios-list">
                    <div className="ios-list-item flex items-center">
                      <label className="w-20 text-ios-body text-[#1C1C1E]">時間</label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="flex-1 text-ios-body text-ios-blue bg-transparent outline-none text-right"
                      />
                    </div>
                    <div className="ios-list-item flex items-center">
                      <label className="w-20 text-ios-body text-[#1C1C1E]">標題</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="行程名稱"
                        className="flex-1 text-ios-body text-[#1C1C1E] bg-transparent outline-none text-right placeholder:text-ios-gray3"
                      />
                    </div>
                    <div className="ios-list-item flex items-center">
                      <label className="w-20 text-ios-body text-[#1C1C1E]">地點</label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="選填"
                        className="flex-1 text-ios-body text-[#1C1C1E] bg-transparent outline-none text-right placeholder:text-ios-gray3"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="ios-list">
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="備註..."
                      rows={3}
                      className="w-full p-4 text-ios-body text-[#1C1C1E] bg-transparent outline-none resize-none placeholder:text-ios-gray3"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}