import React from 'react';
import { motion } from 'framer-motion';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: 'home', label: '首頁' },
  { id: 'itinerary', icon: 'calendar_today', label: '行程' },
  { id: 'wallet', icon: 'account_balance_wallet', label: '錢包' },
  { id: 'checklist', icon: 'checklist', label: '清單' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 ios-glass border-t border-black/5 z-50">
      <div className="max-w-md mx-auto flex justify-around items-end h-[84px] px-4 pb-[max(env(safe-area-inset-bottom),20px)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.85 }}
              className="flex flex-col items-center justify-center w-[72px] h-[50px] gap-1"
            >
              <span 
                className={`material-symbols-${isActive ? 'filled' : 'outlined'} text-[28px] transition-colors duration-150 ${
                  isActive ? 'text-ios-blue' : 'text-ios-gray'
                }`}
              >
                {item.icon}
              </span>
              <span className={`text-[11px] font-medium transition-colors duration-150 ${
                isActive ? 'text-ios-blue' : 'text-ios-gray'
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}