import React from 'react';
import { motion } from 'framer-motion';
import { ScheduleItem } from '../types';

interface BusinessHoursWarningProps {
  schedule: ScheduleItem[];
  selectedDate: string;
}

// Known business hours for Bangkok attractions
const businessHours: Record<string, { open: string; close: string; closedDays: string[]; note?: string }> = {
  'Grand Palace': { open: '08:30', close: '15:30', closedDays: [], note: '16:30 完全關閉' },
  'Wat Pho': { open: '08:00', close: '18:30', closedDays: [] },
  'Wat Arun': { open: '08:00', close: '18:00', closedDays: [] },
  'ICONSIAM': { open: '10:00', close: '22:00', closedDays: [] },
  'Terminal 21': { open: '10:00', close: '22:00', closedDays: [] },
  'Jodd Fairs': { open: '16:00', close: '24:00', closedDays: ['週一'] },
  'Chatuchak': { open: '09:00', close: '18:00', closedDays: ['週一', '週二', '週三', '週四', '週五'], note: '只有週末開放' },
  'Platinum': { open: '09:00', close: '20:00', closedDays: [] },
  'Raan Jay Fai': { open: '14:00', close: '21:00', closedDays: ['週日'], note: '需預約' },
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const getDayOfWeek = (dateStr: string): string => {
  const d = new Date(dateStr);
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return days[d.getDay()];
};

export default function BusinessHoursWarning({ schedule, selectedDate }: BusinessHoursWarningProps) {
  const dayOfWeek = getDayOfWeek(selectedDate);
  
  const warnings = schedule
    .filter(item => item.date === selectedDate && item.location)
    .map(item => {
      const hours = Object.entries(businessHours).find(([key]) => 
        item.location?.toLowerCase().includes(key.toLowerCase())
      )?.[1];
      
      if (!hours) return null;

      const problems: string[] = [];
      const itemTime = timeToMinutes(item.time);
      const openTime = timeToMinutes(hours.open);
      const closeTime = timeToMinutes(hours.close);

      // Check if closed on this day
      if (hours.closedDays.includes(dayOfWeek)) {
        problems.push(`${dayOfWeek}公休`);
      }

      // Check if too early
      if (itemTime < openTime) {
        problems.push(`尚未開門 (${hours.open} 開)`);
      }

      // Check if too late
      if (itemTime > closeTime - 30) { // 30 min buffer
        problems.push(`快打烊了 (${hours.close} 關)`);
      }

      if (problems.length === 0) return null;

      return {
        item,
        problems,
        note: hours.note,
      };
    })
    .filter(Boolean);

  if (warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800/30 rounded-mag p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[16px]">⏰</span>
        <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-300">
          營業時間提醒
        </span>
      </div>

      <div className="space-y-2">
        {warnings.map((w, i) => (
          <div key={i} className="bg-white/50 dark:bg-black/20 rounded-mag p-2">
            <p className="text-[12px] font-medium text-charcoal dark:text-white">
              {w!.item.time} {w!.item.title}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {w!.problems.map((p, j) => (
                <span key={j} className="text-[10px] px-2 py-0.5 rounded-pill bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  ⚠️ {p}
                </span>
              ))}
            </div>
            {w!.note && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">💡 {w!.note}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
