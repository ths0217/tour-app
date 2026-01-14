import React from 'react';
import { motion } from 'framer-motion';
import { ScheduleItem } from '../types';

interface ItineraryCardProps {
  item: ScheduleItem;
  onToggle?: (id: number) => void;
  onPress?: (item: ScheduleItem) => void;
  layoutId?: string;
}

// iOS Spring Physics
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

// Icon mapping for activity types
const typeIcons: Record<string, string> = {
  flight: 'flight',
  flight_takeoff: 'flight_takeoff',
  hotel: 'hotel',
  restaurant: 'restaurant',
  camera: 'photo_camera',
  attraction: 'attractions',
  shopping_bag: 'shopping_bag',
  shopping_cart: 'shopping_cart',
  spa: 'spa',
  coffee: 'coffee',
  wine_bar: 'wine_bar',
  celebration: 'celebration',
  storefront: 'storefront',
  music_note: 'music_note',
  brunch: 'brunch_dining',
  checkroom: 'checkroom',
  icecream: 'icecream',
  fastfood: 'fastfood',
};

// Color mapping for activity types
const typeColors: Record<string, { bg: string; text: string }> = {
  flight: { bg: 'bg-ios-blue/10', text: 'text-ios-blue' },
  flight_takeoff: { bg: 'bg-ios-blue/10', text: 'text-ios-blue' },
  hotel: { bg: 'bg-ios-purple/10', text: 'text-ios-purple' },
  restaurant: { bg: 'bg-ios-orange/10', text: 'text-ios-orange' },
  camera: { bg: 'bg-ios-pink/10', text: 'text-ios-pink' },
  attraction: { bg: 'bg-ios-teal/10', text: 'text-ios-teal' },
  spa: { bg: 'bg-ios-green/10', text: 'text-ios-green' },
  default: { bg: 'bg-ios-gray/10', text: 'text-ios-gray' },
};

export default function ItineraryCard({ item, onToggle, onPress, layoutId }: ItineraryCardProps) {
  const icon = typeIcons[item.type || ''] || 'event';
  const colors = typeColors[item.type || ''] || typeColors.default;

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle(item.id);
    }
  };

  return (
    <motion.div
      layoutId={layoutId}
      onClick={handlePress}
      whileTap={{ scale: 0.96 }}
      transition={springTransition}
      className={`relative bg-white rounded-ios-lg shadow-ios-card overflow-hidden cursor-pointer ios-press ${item.completed ? 'opacity-60' : ''
        }`}
    >
      {/* Main Content */}
      <div className="flex items-start gap-4 p-4">
        {/* Time Column */}
        <div className="flex flex-col items-center shrink-0 w-12">
          <span className="text-ios-title3 font-semibold text-ios-label">{item.time.split(':')[0]}</span>
          <span className="text-ios-caption1 text-ios-secondaryLabel">
            {item.time.includes(':') ? item.time.split(':')[1].replace(/\D/g, '').slice(0, 2) : '00'}
          </span>
        </div>

        {/* Timeline Dot */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <motion.div
            whileTap={{ scale: 0.85 }}
            onClick={handleToggle}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.completed
              ? 'bg-ios-green border-ios-green'
              : 'border-ios-gray3 bg-white'
              }`}
          >
            {item.completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springTransition}
                className="material-symbols-outlined text-white text-[14px]"
              >
                check
              </motion.span>
            )}
          </motion.div>
          <div className="w-0.5 flex-1 bg-ios-gray5 mt-2 min-h-[20px]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-2">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`text-ios-headline font-semibold ${item.completed ? 'line-through text-ios-tertiaryLabel' : 'text-ios-label'
              }`}>
              {item.title}
            </h3>
            <div className={`shrink-0 w-8 h-8 rounded-ios-sm flex items-center justify-center ${colors.bg}`}>
              <span className={`material-symbols-outlined text-[18px] ${colors.text}`}>
                {icon}
              </span>
            </div>
          </div>

          {/* Description */}
          {item.desc && (
            <p className="text-ios-subheadline text-ios-secondaryLabel line-clamp-2 mb-2">
              {item.desc}
            </p>
          )}

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-1 text-ios-caption1 text-ios-tertiaryLabel">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>{item.location}</span>
            </div>
          )}

          {/* Travel Info */}
          {(item.travelTime || item.travelTip) && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-ios-separator">
              {item.travelTime && (
                <span className="text-ios-caption1 text-ios-blue font-medium">
                  {item.travelTime}
                </span>
              )}
              {item.travelTip && (
                <span className="text-ios-caption2 text-ios-tertiaryLabel">
                  {item.travelTip}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Partner Actions (Commercial Optimization) */}
      {!item.completed && (item.type === 'flight' || item.type === 'accommodation' || item.type === 'activity') && (
        <div className="bg-ios-gray6 px-4 py-2 flex items-center justify-between border-t border-ios-separator">
          <span className="text-[10px] text-ios-secondaryLabel uppercase font-bold tracking-wider">Sponsored</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              const urls: Record<string, string> = {
                flight: 'https://www.skyscanner.com.tw',
                accommodation: 'https://www.agoda.com',
                activity: 'https://www.klook.com'
              };
              window.open(urls[item.type!] || 'https://www.google.com', '_blank');
            }}
            className="flex items-center gap-1 bg-white border border-ios-gray3 px-3 py-1 rounded-full text-[11px] font-medium text-ios-blue shadow-sm"
          >
            {item.type === 'flight' && <span className="material-symbols-outlined text-[14px]">flight</span>}
            {item.type === 'accommodation' && <span className="material-symbols-outlined text-[14px]">bed</span>}
            {item.type === 'activity' && <span className="material-symbols-outlined text-[14px]">local_activity</span>}
            {item.type === 'flight' ? '查機票' : item.type === 'accommodation' ? '查房價' : '預訂門票'}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
