import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-stone/10 to-stone/5 flex items-center justify-center mb-4"
      >
        <span className="text-[48px]">{icon}</span>
      </motion.div>
      
      <h3 className="text-[18px] font-bold text-charcoal dark:text-white mb-2">{title}</h3>
      <p className="text-[13px] text-stone max-w-[280px] mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-red-xhs text-white rounded-mag font-semibold text-[14px] shadow-mag"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

// Preset empty states
export const emptyStates = {
  itinerary: {
    icon: '🗓️',
    title: '還沒有行程',
    description: '點擊右上角新增按鈕，或使用範本快速建立行程',
    actionLabel: '新增行程',
  },
  expenses: {
    icon: '💸',
    title: '還沒有支出',
    description: '記錄你的花費，輕鬆追蹤旅行預算',
    actionLabel: '記帳',
  },
  checklist: {
    icon: '✓',
    title: '清單是空的',
    description: '新增待辦事項，確保旅行準備萬全',
    actionLabel: '新增項目',
  },
  search: {
    icon: '🔍',
    title: '找不到結果',
    description: '試試其他關鍵字，或調整篩選條件',
  },
};
