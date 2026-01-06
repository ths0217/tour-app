import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: 'home', label: '首頁' },
  { id: 'itinerary', icon: 'explore', label: '探索' },
  { id: 'wallet', icon: 'account_balance_wallet', label: '錢包' },
  { id: 'checklist', icon: 'checklist', label: '清單' },
  { id: 'explore', icon: 'photo_library', label: '相簿' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass-strong border-t border-black/5 safe-bottom z-50">
      <div className="flex justify-around items-center h-[70px] px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 outline-none active:scale-90 transition-transform duration-100"
            >
              <span 
                className={`material-symbols-${isActive ? 'filled' : 'outlined'} text-[26px] transition-all duration-150 ${
                  isActive ? 'text-red-xhs scale-110 -translate-y-0.5' : 'text-stone'
                }`}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium transition-colors duration-150 ${
                isActive ? 'text-red-xhs' : 'text-stone'
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 rounded-full bg-red-xhs" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}