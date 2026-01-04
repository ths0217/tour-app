import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

interface MagazineCardProps {
  item: ScheduleItem;
  onToggle?: (id: number) => void;
  onPress?: (item: ScheduleItem) => void;
  aspectRatio?: 'tall' | 'medium' | 'short';
}

// Activity type to badge color mapping
const typeBadgeColors: Record<string, { bg: string; text: string }> = {
  restaurant: { bg: 'bg-pastel-peach', text: 'text-orange-700' },
  flight: { bg: 'bg-pastel-blue', text: 'text-blue-700' },
  flight_takeoff: { bg: 'bg-pastel-blue', text: 'text-blue-700' },
  hotel: { bg: 'bg-pastel-lavender', text: 'text-purple-700' },
  camera: { bg: 'bg-pastel-pink', text: 'text-pink-700' },
  attraction: { bg: 'bg-pastel-mint', text: 'text-green-700' },
  spa: { bg: 'bg-pastel-mint', text: 'text-teal-700' },
  shopping_bag: { bg: 'bg-pastel-pink', text: 'text-pink-700' },
  coffee: { bg: 'bg-pastel-peach', text: 'text-amber-700' },
  default: { bg: 'bg-white/90', text: 'text-charcoal' },
};

// Activity type labels
const typeLabels: Record<string, string> = {
  restaurant: '美食',
  flight: '交通',
  flight_takeoff: '交通',
  hotel: '住宿',
  camera: '拍照',
  attraction: '景點',
  spa: '按摩',
  shopping_bag: '購物',
  shopping_cart: '購物',
  coffee: '咖啡',
  wine_bar: '酒吧',
  celebration: '慶祝',
  storefront: '逛街',
  fastfood: '小吃',
  brunch: '早午餐',
  icecream: '甜點',
};

// Placeholder images for different activity types
const typeImages: Record<string, string> = {
  restaurant: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
  flight_takeoff: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80',
  camera: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80',
  attraction: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80',
  spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
  shopping_bag: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80',
};

// Random aspect ratios for masonry variety
const aspectRatios = {
  tall: 'aspect-[3/4]',
  medium: 'aspect-[4/5]',
  short: 'aspect-[1/1]',
};

export default function MagazineCard({ item, onToggle, onPress, aspectRatio }: MagazineCardProps) {
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const badgeColors = typeBadgeColors[item.type || ''] || typeBadgeColors.default;
  const typeLabel = typeLabels[item.type || ''] || '行程';
  const imageUrl = typeImages[item.type || ''] || typeImages.default;
  const ratio = aspectRatio || (item.id % 3 === 0 ? 'tall' : item.id % 3 === 1 ? 'medium' : 'short');

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setAnimatingHeart(true);
    setTimeout(() => setAnimatingHeart(false), 400);
  };

  const handlePress = () => {
    if (onPress) onPress(item);
  };

  return (
    <motion.div
      layout
      onClick={handlePress}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative rounded-mag overflow-hidden shadow-mag hover:shadow-mag-hover transition-shadow duration-300 cursor-pointer ${
        item.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Image Container */}
      <div className={`relative ${aspectRatios[ratio]} w-full overflow-hidden bg-gray-100`}>
        {/* Skeleton Loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        
        {/* Image */}
        <img
          src={imageUrl}
          alt={item.title}
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 img-overlay" />

        {/* Pill Badge - Top Right */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`px-3 py-1.5 rounded-pill text-mag-badge font-semibold border border-black/5 ${badgeColors.bg} ${badgeColors.text}`}>
            {typeLabel}
          </span>
        </div>

        {/* Time Badge - Top Left */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-2.5 py-1.5 rounded-pill text-mag-time font-mono bg-white/90 text-charcoal border border-black/5">
            {item.time}
          </span>
        </div>

        {/* Heart Button - Floating */}
        <motion.button
          onClick={handleLike}
          className="absolute top-3 right-16 z-20 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center border border-black/5"
          animate={animatingHeart ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.4, ease: [0.17, 0.67, 0.35, 1.5] }}
        >
          <span className={`material-symbols-${liked ? 'filled' : 'outlined'} text-[18px] ${liked ? 'text-red-xhs' : 'text-stone'}`}>
            favorite
          </span>
        </motion.button>

        {/* Content Overlay - Bottom */}
        <div className="mag-card-content">
          <h3 className="text-white text-mag-title font-semibold mb-1 line-clamp-2 drop-shadow-sm">
            {item.title}
          </h3>
          {item.location && (
            <div className="flex items-center gap-1 text-white/80 text-mag-caption">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}
        </div>

        {/* Completed Overlay */}
        {item.completed && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <span className="material-symbols-filled text-green-600 text-[28px]">check_circle</span>
            </div>
          </div>
        )}
      </div>

      {/* Optional: Extra info below image */}
      {(item.travelTime || item.desc) && (
        <div className="p-4 bg-white">
          {item.desc && (
            <p className="text-mag-caption text-stone line-clamp-2 mb-2">{item.desc}</p>
          )}
          {item.travelTime && (
            <div className="flex items-center gap-2 text-mag-badge text-stone">
              <span className="material-symbols-outlined text-[14px]">directions_car</span>
              <span>{item.travelTime}</span>
              {item.travelTip && <span className="text-charcoal/50">• {item.travelTip}</span>}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
