import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { openMap } from '../utils/device';

interface TransportLinksProps {
  destination?: string;
  lat?: number;
  lng?: number;
}

const transportOptions = [
  {
    id: 'grab',
    name: 'Grab',
    icon: '🚗',
    color: 'from-green-500 to-green-600',
    getUrl: (lat?: number, lng?: number) =>
      lat && lng
        ? `grab://open?screenType=BOOKING&pickUpLat=${lat}&pickUpLng=${lng}`
        : 'https://www.grab.com/th/',
    fallback: 'https://www.grab.com/th/',
    desc: '叫車'
  },
  {
    id: 'bolt',
    name: 'Bolt',
    icon: '⚡',
    color: 'from-emerald-400 to-teal-500',
    getUrl: () => 'https://bolt.eu/th/',
    fallback: 'https://bolt.eu/th/',
    desc: '便宜替代'
  },
  {
    id: 'bts',
    name: 'BTS',
    icon: '🚇',
    color: 'from-green-600 to-lime-500',
    getUrl: () => 'https://www.bts.co.th/eng/routemap.html',
    fallback: 'https://www.bts.co.th/eng/routemap.html',
    desc: '空鐵路線圖'
  },
  {
    id: 'mrt',
    name: 'MRT',
    icon: '🚈',
    color: 'from-blue-500 to-indigo-600',
    getUrl: () => 'https://www.mrta.co.th/en/',
    fallback: 'https://www.mrta.co.th/en/',
    desc: '地鐵路線圖'
  },
  {
    id: 'google',
    name: 'Maps',
    icon: '📍',
    color: 'from-red-500 to-orange-500',
    getUrl: (lat?: number, lng?: number) =>
      lat && lng
        ? { lat, lng }
        : undefined,
    fallback: 'https://maps.google.com',
    desc: '路線規劃'
  },
];

export default function TransportLinks({ destination, lat, lng }: TransportLinksProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = (option: typeof transportOptions[0]) => {
    const url = option.getUrl(lat, lng);

    // Try to open app, fallback to web
    if (option.id === 'grab') {
      // Try Grab app first
      const timeout = setTimeout(() => {
        window.open(option.fallback, '_blank');
      }, 500);

      window.location.href = url as string;

      window.addEventListener('blur', () => {
        clearTimeout(timeout);
      }, { once: true });
    } else if (option.id === 'google' && url && typeof url === 'object') {
      openMap({ lat: url.lat, lng: url.lng });
    } else {
      window.open(typeof url === 'string' ? url : option.fallback, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-charcoal/50 rounded-mag shadow-mag overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🚕</span>
          <span className="text-[13px] font-semibold text-charcoal dark:text-white">
            交通方式
          </span>
          {destination && (
            <span className="text-[11px] text-stone">→ {destination}</span>
          )}
        </div>
        <span className={`material-symbols-outlined text-stone text-[18px] transition-transform ${expanded ? 'rotate-180' : ''
          }`}>
          expand_more
        </span>
      </button>

      {/* Transport Options */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-black/5 dark:border-white/10"
          >
            <div className="p-3 grid grid-cols-5 gap-2">
              {transportOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleClick(option)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-mag bg-gradient-to-br ${option.color} flex items-center justify-center shadow-sm`}>
                    <span className="text-[20px]">{option.icon}</span>
                  </div>
                  <span className="text-[10px] font-medium text-charcoal dark:text-white">{option.name}</span>
                  <span className="text-[8px] text-stone">{option.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for inline use
export function TransportQuickLinks({ lat, lng }: { lat?: number; lng?: number }) {
  return (
    <div className="flex gap-1.5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => window.open('https://www.grab.com/th/', '_blank')}
        className="px-2 py-1 rounded-pill bg-green-500 text-white text-[10px] font-semibold flex items-center gap-1"
      >
        🚗 Grab
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => lat && lng && openMap({ lat, lng })}
        className="px-2 py-1 rounded-pill bg-blue-500 text-white text-[10px] font-semibold flex items-center gap-1"
      >
        🚇 交通
      </motion.button>
    </div>
  );
}
