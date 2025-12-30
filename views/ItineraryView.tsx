import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ScheduleItem } from '../types';
import ItineraryCard from '../components/ItineraryCard';

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

// iOS Spring Physics
const springConfig = { stiffness: 400, damping: 30 };

interface ItineraryViewProps {
  schedule: ScheduleItem[];
  setSchedule: (s: ScheduleItem[]) => void;
}

export default function ItineraryView({ schedule, setSchedule }: ItineraryViewProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Rubber banding effect
  const y = useMotionValue(0);
  const springY = useSpring(y, springConfig);

  // New Activity State
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('restaurant');
  const [newLocation, setNewLocation] = useState('');
  const [newTravelTime, setNewTravelTime] = useState('');
  const [newTravelTip, setNewTravelTip] = useState('');

  // Get current day's schedule
  const currentDayData = days.find(d => d.id === selectedDay);
  const currentDaySchedule = schedule
    .filter(item => item.date === currentDayData?.fullDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const completedCount = currentDaySchedule.filter(i => i.completed).length;
  const progress = currentDaySchedule.length > 0 
    ? Math.round((completedCount / currentDaySchedule.length) * 100) 
    : 0;

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
      travelTime: newTravelTime,
      travelTip: newTravelTip,
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
    setNewTravelTime('');
    setNewTravelTip('');
  };

  return (
    <div className="min-h-full bg-ios-groupedBg">
      {/* Header */}
      <div className="sticky top-0 z-40 ios-glass border-b border-ios-separator px-4 pt-4 pb-3 safe-area-top">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-ios-largeTitle font-bold text-ios-label tracking-tight">行程規劃</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-full bg-ios-blue flex items-center justify-center shadow-ios-sm"
          >
            <span className="material-symbols-outlined text-white text-[22px]">add</span>
          </motion.button>
        </div>

        {/* Day Selector - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {days.map((day) => (
            <motion.button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center min-w-[4.5rem] py-3 px-2 rounded-ios transition-all duration-200 shrink-0 ${
                selectedDay === day.id
                  ? 'bg-ios-blue shadow-ios-sm'
                  : 'bg-white/60'
              }`}
            >
              <span className={`text-ios-caption2 font-medium ${
                selectedDay === day.id ? 'text-white/80' : 'text-ios-secondaryLabel'
              }`}>
                {day.weekday}
              </span>
              <span className={`text-ios-title3 font-semibold ${
                selectedDay === day.id ? 'text-white' : 'text-ios-label'
              }`}>
                {day.date}
              </span>
              <span className={`text-ios-caption2 ${
                selectedDay === day.id ? 'text-white/70' : 'text-ios-tertiaryLabel'
              }`}>
                {day.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {currentDaySchedule.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-ios-footnote text-ios-secondaryLabel">今日進度</span>
            <span className="text-ios-footnote font-medium text-ios-blue">{completedCount}/{currentDaySchedule.length}</span>
          </div>
          <div className="h-1.5 bg-ios-gray5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-ios-blue rounded-full"
            />
          </div>
        </div>
      )}

      {/* Schedule List with Rubber Banding */}
      <motion.div 
        ref={scrollRef}
        className="px-4 pb-8 space-y-3 scroll-momentum"
        style={{ y: springY }}
      >
        <AnimatePresence mode="popLayout">
          {currentDaySchedule.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-ios-gray5 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-ios-gray text-[28px]">event_busy</span>
              </div>
              <p className="text-ios-headline text-ios-secondaryLabel mb-1">尚無行程</p>
              <p className="text-ios-subheadline text-ios-tertiaryLabel">點擊右上角 + 新增行程</p>
            </motion.div>
          ) : (
            currentDaySchedule.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <ItineraryCard
                  item={item}
                  onToggle={handleToggle}
                  onPress={(i) => setSelectedItem(i)}
                  layoutId={`card-${item.id}`}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Activity Modal - iOS Style Bottom Sheet */}
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
              className="fixed bottom-0 left-0 right-0 bg-ios-groupedBg rounded-t-ios-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="sticky top-0 bg-ios-groupedBg pt-3 pb-2 z-10">
                <div className="w-10 h-1 bg-ios-gray3 rounded-full mx-auto" />
              </div>

              <div className="px-4 pb-safe">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-ios-blue text-ios-body"
                  >
                    取消
                  </button>
                  <h3 className="text-ios-headline font-semibold text-ios-label">新增行程</h3>
                  <button 
                    onClick={handleAddActivity}
                    className="text-ios-blue text-ios-body font-semibold"
                  >
                    新增
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Time & Title */}
                  <div className="bg-white rounded-ios overflow-hidden">
                    <div className="flex items-center border-b border-ios-separator">
                      <label className="w-20 px-4 py-3 text-ios-body text-ios-label">時間</label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="flex-1 py-3 pr-4 text-ios-body text-ios-label bg-transparent outline-none"
                      />
                    </div>
                    <div className="flex items-center border-b border-ios-separator">
                      <label className="w-20 px-4 py-3 text-ios-body text-ios-label">標題</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="行程名稱"
                        className="flex-1 py-3 pr-4 text-ios-body text-ios-label bg-transparent outline-none placeholder:text-ios-tertiaryLabel"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-20 px-4 py-3 text-ios-body text-ios-label">地點</label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="選填"
                        className="flex-1 py-3 pr-4 text-ios-body text-ios-label bg-transparent outline-none placeholder:text-ios-tertiaryLabel"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-ios overflow-hidden">
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="備註說明..."
                      rows={3}
                      className="w-full p-4 text-ios-body text-ios-label bg-transparent outline-none resize-none placeholder:text-ios-tertiaryLabel"
                    />
                  </div>

                  {/* Activity Type */}
                  <div>
                    <label className="text-ios-footnote text-ios-secondaryLabel block mb-2 px-1">類型</label>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      {activityTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setNewType(type.id)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full whitespace-nowrap transition-all text-ios-subheadline ${
                            newType === type.id
                              ? 'bg-ios-blue text-white'
                              : 'bg-white text-ios-label'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel Info */}
                  <div className="bg-white rounded-ios overflow-hidden">
                    <div className="flex items-center border-b border-ios-separator">
                      <label className="w-24 px-4 py-3 text-ios-body text-ios-label">交通時間</label>
                      <input
                        type="text"
                        value={newTravelTime}
                        onChange={(e) => setNewTravelTime(e.target.value)}
                        placeholder="例: 🚗 20m"
                        className="flex-1 py-3 pr-4 text-ios-body text-ios-label bg-transparent outline-none placeholder:text-ios-tertiaryLabel"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="w-24 px-4 py-3 text-ios-body text-ios-label">交通建議</label>
                      <input
                        type="text"
                        value={newTravelTip}
                        onChange={(e) => setNewTravelTip(e.target.value)}
                        placeholder="例: 建議叫 Grab"
                        className="flex-1 py-3 pr-4 text-ios-body text-ios-label bg-transparent outline-none placeholder:text-ios-tertiaryLabel"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal - Hero Transition */}
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
              layoutId={`card-${selectedItem.id}`}
              className="fixed inset-4 top-20 bg-white rounded-ios-xl z-50 overflow-hidden shadow-ios-lg"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-ios-caption1 text-ios-blue font-medium mb-1">{selectedItem.time}</p>
                    <h2 className="text-ios-title1 font-bold text-ios-label">{selectedItem.title}</h2>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedItem(null)}
                    className="w-8 h-8 rounded-full bg-ios-gray5 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-ios-gray text-[20px]">close</span>
                  </motion.button>
                </div>
                
                {selectedItem.location && (
                  <div className="flex items-center gap-2 text-ios-subheadline text-ios-secondaryLabel mb-4">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {selectedItem.location}
                  </div>
                )}
                
                {selectedItem.desc && (
                  <p className="text-ios-body text-ios-label leading-relaxed mb-6">{selectedItem.desc}</p>
                )}

                {(selectedItem.travelTime || selectedItem.travelTip) && (
                  <div className="bg-ios-gray6 rounded-ios p-4">
                    <p className="text-ios-footnote text-ios-secondaryLabel mb-2">交通資訊</p>
                    {selectedItem.travelTime && (
                      <p className="text-ios-subheadline text-ios-blue font-medium">{selectedItem.travelTime}</p>
                    )}
                    {selectedItem.travelTip && (
                      <p className="text-ios-caption1 text-ios-tertiaryLabel mt-1">{selectedItem.travelTip}</p>
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