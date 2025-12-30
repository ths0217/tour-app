import React from 'react';
import { motion } from 'framer-motion';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: 'grid_view', label: '首頁' },
  { id: 'itinerary', icon: 'map', label: '行程' },
  { id: 'wallet', icon: 'account_balance_wallet', label: '錢包' },
  { id: 'checklist', icon: 'check_circle', label: '清單' },
  { id: 'explore', icon: 'photo_library', label: '探索' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md ios-glass border-t border-black/5 nav-safe z-50">
      <div className="flex justify-around items-center h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="relative">
                <span 
                  className={`material-symbols-outlined text-[26px] transition-all duration-200 ${
                    isActive 
                      ? 'text-ios-blue material-symbols-filled' 
                      : 'text-ios-secondary'
                  }`}
                >
                  {item.icon}
                </span>
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                isActive ? 'text-ios-blue' : 'text-ios-secondary'
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