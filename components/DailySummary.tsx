import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScheduleItem } from '../types';

interface DailySummaryProps {
  schedule: ScheduleItem[];
  selectedDate: string;
  weather?: { temp: string; condition: string };
}

const typeIcons: Record<string, string> = {
  restaurant: '🍜',
  flight: '✈️',
  hotel: '🏨',
  camera: '📸',
  attraction: '🎡',
  spa: '💆',
  shopping_bag: '🛍️',
  coffee: '☕',
};

export default function DailySummary({ schedule, selectedDate, weather }: DailySummaryProps) {
  const daySummary = useMemo(() => {
    const dayItems = schedule.filter(item => item.date === selectedDate);
    
    // Count by type
    const typeCounts: Record<string, number> = {};
    let totalCost = 0;
    let meals = 0;
    
    dayItems.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      if (item.estimatedCost) totalCost += item.estimatedCost;
      if (item.type === 'restaurant' || item.type === 'coffee') meals++;
    });

    // Get time range
    const times = dayItems.map(i => i.time).sort();
    const startTime = times[0] || '--:--';
    const endTime = times[times.length - 1] || '--:--';
    
    // Completed count
    const completed = dayItems.filter(i => i.completed).length;

    return {
      total: dayItems.length,
      completed,
      meals,
      totalCost,
      startTime,
      endTime,
      typeCounts,
    };
  }, [schedule, selectedDate]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return {
      month: d.getMonth() + 1,
      day: d.getDate(),
      weekday: weekdays[d.getDay()],
    };
  };

  const date = formatDate(selectedDate);

  if (daySummary.total === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[16px] p-4 text-white shadow-mag"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[11px] text-white/70">今日總覽</p>
          <p className="text-[18px] font-bold">{date.month}/{date.day} {date.weekday}</p>
        </div>
        {weather && (
          <div className="text-right">
            <p className="text-[18px] font-bold">{weather.temp}</p>
            <p className="text-[10px] text-white/70">{weather.condition}</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-white/20 rounded-mag p-2 text-center">
          <p className="text-[16px] font-bold">📍 {daySummary.total}</p>
          <p className="text-[9px] text-white/80">景點</p>
        </div>
        <div className="bg-white/20 rounded-mag p-2 text-center">
          <p className="text-[16px] font-bold">🍜 {daySummary.meals}</p>
          <p className="text-[9px] text-white/80">餐廳</p>
        </div>
        <div className="bg-white/20 rounded-mag p-2 text-center">
          <p className="text-[16px] font-bold">✓ {daySummary.completed}</p>
          <p className="text-[9px] text-white/80">已完成</p>
        </div>
        <div className="bg-white/20 rounded-mag p-2 text-center">
          <p className="text-[16px] font-bold">฿{daySummary.totalCost > 0 ? (daySummary.totalCost / 1000).toFixed(1) + 'k' : '--'}</p>
          <p className="text-[9px] text-white/80">預估</p>
        </div>
      </div>

      {/* Time Range */}
      <div className="flex items-center justify-between bg-white/10 rounded-mag px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span className="text-[12px]">{daySummary.startTime} - {daySummary.endTime}</span>
        </div>
        <div className="flex gap-1">
          {Object.entries(daySummary.typeCounts).slice(0, 4).map(([type]) => (
            <span key={type} className="text-[14px]">{typeIcons[type] || '📌'}</span>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-white/70 mb-1">
          <span>進度</span>
          <span>{daySummary.completed}/{daySummary.total}</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(daySummary.completed / daySummary.total) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
