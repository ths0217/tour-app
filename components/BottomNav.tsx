import React from 'react';
import { motion } from 'framer-motion';
import { Tab } from '../types';
import { haptics } from '../utils/haptics';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; icon: string; label: string; aria: string }[] = [
  { id: 'home', icon: 'home', label: '首頁', aria: '首頁' },
  { id: 'itinerary', icon: 'calendar_month', label: '行程', aria: '行程規劃' },
  { id: 'map', icon: 'map', label: '地圖', aria: '地圖總覽' },
  { id: 'wallet', icon: 'account_balance_wallet', label: '錢包', aria: '旅費錢包' },
  { id: 'checklist', icon: 'checklist', label: '清單', aria: '旅遊清單' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const handleTabClick = (tab: Tab) => {
    haptics.selection(); // iOS-like selection feedback
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass-strong border-t border-black/5 safe-bottom z-50">
      <div className="flex justify-around items-center h-[70px] px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              aria-label={item.aria}
              aria-current={isActive}
              onClick={() => handleTabClick(item.id)}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 outline-none"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -3 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span
                  className={`material-symbols-${isActive ? 'filled' : 'outlined'} text-[26px] ${isActive ? 'text-red-xhs' : 'text-stone'
                    }`}
                >
                  {item.icon}
                </span>
              </motion.div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-red-xhs' : 'text-stone'
                }`}>
                {item.label}
              </span>

              {/* Active Indicator Dot with smooth animation */}
              <motion.div
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 : 0.5,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-red-xhs"
              />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}