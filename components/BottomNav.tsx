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
    <nav className="absolute bottom-0 left-0 w-full bg-ivory/90 backdrop-blur-xl border-t border-black/5 pb-safe pt-2 z-50 shadow-nav">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-1 group outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="relative p-1">
                <span 
                  className={`material-symbols-outlined text-[24px] transition-all duration-300 ${
                    isActive ? 'text-gold material-symbols-filled scale-110' : 'text-icon group-hover:text-text-primary'
                  }`}
                >
                  {item.icon}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-widest transition-colors duration-300 ${
                isActive ? 'text-gold' : 'text-text-muted group-hover:text-text-primary'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for mobile */}
      <div className="h-6 w-full" />
    </nav>
  );
}