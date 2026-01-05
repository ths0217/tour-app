import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

interface ConflictDetectorProps {
  schedule: ScheduleItem[];
  onResolve?: (item: ScheduleItem) => void;
}

interface Conflict {
  item1: ScheduleItem;
  item2: ScheduleItem;
  overlapMinutes: number;
}

// Parse time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Estimate activity duration in minutes based on type
const getEstimatedDuration = (type: string): number => {
  const durations: Record<string, number> = {
    restaurant: 90,
    flight: 180,
    hotel: 60,
    camera: 60,
    attraction: 120,
    spa: 120,
    shopping_bag: 90,
    coffee: 45,
    default: 60,
  };
  return durations[type] || durations.default;
};

export default function ConflictDetector({ schedule, onResolve }: ConflictDetectorProps) {
  const conflicts = useMemo(() => {
    const result: Conflict[] = [];
    
    // Group by date
    const byDate: Record<string, ScheduleItem[]> = {};
    schedule.forEach(item => {
      if (!byDate[item.date]) byDate[item.date] = [];
      byDate[item.date].push(item);
    });

    // Check each day for conflicts
    Object.values(byDate).forEach(dayItems => {
      const sorted = dayItems.sort((a, b) => a.time.localeCompare(b.time));
      
      for (let i = 0; i < sorted.length - 1; i++) {
        const item1 = sorted[i];
        const item2 = sorted[i + 1];
        
        const start1 = timeToMinutes(item1.time);
        const end1 = start1 + getEstimatedDuration(item1.type);
        const start2 = timeToMinutes(item2.time);

        if (end1 > start2) {
          result.push({
            item1,
            item2,
            overlapMinutes: end1 - start2,
          });
        }
      }
    });

    return result;
  }, [schedule]);

  if (conflicts.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800/30 rounded-mag p-4 mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-orange-500 text-[20px]">warning</span>
          <span className="text-[13px] font-semibold text-orange-700 dark:text-orange-300">
            偵測到 {conflicts.length} 個時間衝突
          </span>
        </div>

        <div className="space-y-2">
          {conflicts.slice(0, 3).map((conflict, i) => (
            <div
              key={i}
              className="bg-white dark:bg-black/20 rounded-mag p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-pill bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  {formatDate(conflict.item1.date)}
                </span>
                <span className="text-[10px] text-stone">
                  重疊 {conflict.overlapMinutes} 分鐘
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-charcoal dark:text-white font-medium">{conflict.item1.time}</span>
                <span className="text-stone line-clamp-1 flex-1">{conflict.item1.title}</span>
              </div>
              
              <div className="flex items-center gap-2 text-[12px] mt-1">
                <span className="text-charcoal dark:text-white font-medium">{conflict.item2.time}</span>
                <span className="text-stone line-clamp-1 flex-1">{conflict.item2.title}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onResolve?.(conflict.item2)}
                className="mt-2 w-full py-1.5 rounded-mag bg-orange-500 text-white text-[11px] font-medium"
              >
                調整時間
              </motion.button>
            </div>
          ))}
        </div>

        {conflicts.length > 3 && (
          <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-2 text-center">
            還有 {conflicts.length - 3} 個衝突...
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
