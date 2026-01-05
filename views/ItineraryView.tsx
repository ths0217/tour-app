import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ScheduleItem } from '../types';
import MagazineCard from '../components/MagazineCard';
import SortableItem from '../components/SortableItem';
import ShareModal from '../components/ShareModal';
import AISuggestions from '../components/AISuggestions';
import ItineraryMap from '../components/ItineraryMap';
import ConflictDetector from '../components/ConflictDetector';

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
  
  // View mode and search
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Form state
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('restaurant');
  const [newLocation, setNewLocation] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);

  // Drag sensors for touch and pointer
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = schedule.findIndex(item => item.id === active.id);
      const newIndex = schedule.findIndex(item => item.id === over.id);
      const reordered = arrayMove(schedule, oldIndex, newIndex);
      // Update times based on new order
      setSchedule(reordered);
    }
  };

  // Navigate to location
  const handleNavigate = (item: ScheduleItem) => {
    if (item.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location + ' Bangkok')}`, '_blank');
    }
  };

  // Handle image upload from phone
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentDayData = days.find(d => d.id === selectedDay);
  const currentDaySchedule = schedule
    .filter(item => item.date === currentDayData?.fullDate)
    .filter(item => 
      searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
      image: newImage || undefined,
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
    setNewImage(null);
  };

  const handleAddAISuggestion = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = { ...item, id: Date.now() };
    setSchedule([...schedule, newItem]);
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
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowShareModal(true)}
                className="w-9 h-9 rounded-full bg-charcoal/80 flex items-center justify-center shadow-mag"
              >
                <span className="material-symbols-outlined text-white text-[16px]">share</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAI(true)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-mag"
              >
                <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddModal(true)}
                className="w-9 h-9 rounded-full bg-red-xhs flex items-center justify-center shadow-mag"
              >
                <span className="material-symbols-outlined text-white text-[16px]">add</span>
              </motion.button>
            </div>
          </div>

          {/* Day Selector Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {days.map((day) => (
              <motion.button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-pill whitespace-nowrap transition-all duration-200 ${
                  selectedDay === day.id
                    ? 'bg-charcoal text-white shadow-mag'
                    : 'bg-white/80 text-charcoal border border-black/5'
                }`}
              >
                <span className="font-mono text-[11px]">{day.date}</span>
                <span className={`text-[10px] ${selectedDay === day.id ? 'text-white/70' : 'text-stone'}`}>
                  {day.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Search Bar + View Toggle */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋行程..."
                className="w-full pl-9 pr-3 py-2 rounded-mag bg-white/80 border border-black/5 text-[13px] text-charcoal placeholder:text-stone/50 outline-none focus:ring-1 focus:ring-red-xhs"
              />
            </div>
            <div className="flex rounded-mag bg-white/80 border border-black/5 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-charcoal text-white' : 'text-stone'}`}
              >
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-charcoal text-white' : 'text-stone'}`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Conflict Detector */}
      <div className="px-4 pt-4 space-y-4">
        {/* Conflict Detection */}
        <ConflictDetector 
          schedule={schedule} 
          onResolve={(item) => setSelectedItem(item)}
        />
        
        {/* Route Map */}
        <ItineraryMap 
          schedule={schedule} 
          selectedDate={currentDayData?.fullDate || ''} 
          onLocationClick={(item) => setSelectedItem(item)}
        />
      </div>

      {/* Content Area */}
      <div className="px-4 pt-4 pb-32">
        {currentDaySchedule.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-pastel-blue flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-blue-500 text-[28px]">
                {searchQuery ? 'search_off' : 'explore'}
              </span>
            </div>
            <p className="text-[15px] font-medium text-charcoal mb-1">
              {searchQuery ? '找不到行程' : '開始規劃你的冒險'}
            </p>
            <p className="text-[12px] text-stone">
              {searchQuery ? '試試其他關鍵字' : '點擊右上角 + 新增行程'}
            </p>
          </motion.div>
        ) : viewMode === 'list' ? (
          /* Sortable List View */
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={currentDaySchedule.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {currentDaySchedule.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onPress={(i) => setSelectedItem(i)}
                  onNavigate={handleNavigate}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          /* Masonry Grid View */
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

                    {/* Image Upload */}
                    <div className="bg-white rounded-mag p-4 shadow-mag">
                      <label className="text-mag-caption text-stone block mb-3">照片（選填）</label>
                      {newImage ? (
                        <div className="relative">
                          <img 
                            src={newImage} 
                            alt="Preview" 
                            className="w-full h-40 object-cover rounded-mag"
                          />
                          <button
                            onClick={() => setNewImage(null)}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-white text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-stone/30 rounded-mag cursor-pointer hover:border-red-xhs transition-colors">
                          <span className="material-symbols-outlined text-stone text-[32px] mb-2">add_photo_alternate</span>
                          <span className="text-mag-caption text-stone">點擊上傳照片</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        schedule={schedule}
        tripName="曼谷探險"
        dateRange="2025/1/27 - 2/2"
      />

      {/* AI Suggestions Modal */}
      <AISuggestions
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        schedule={schedule}
        onAddSuggestion={handleAddAISuggestion}
      />
    </div>
  );
}