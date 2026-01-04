import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { ScheduleItem } from '../types';

const typeLabels: Record<string, string> = {
  restaurant: '美食',
  flight: '交通',
  hotel: '住宿',
  camera: '拍照',
  attraction: '景點',
  spa: '按摩',
  shopping_bag: '購物',
  coffee: '咖啡',
};

const typeIcons: Record<string, string> = {
  restaurant: 'restaurant',
  flight: 'flight',
  hotel: 'hotel',
  camera: 'photo_camera',
  attraction: 'attractions',
  spa: 'spa',
  shopping_bag: 'shopping_bag',
  coffee: 'local_cafe',
};

interface SortableItemProps {
  item: ScheduleItem;
  onToggle: (id: number) => void;
  onPress: (item: ScheduleItem) => void;
  onNavigate: (item: ScheduleItem) => void;
}

export default function SortableItem({ item, onToggle, onPress, onNavigate }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`bg-white rounded-mag p-3 shadow-mag flex items-center gap-3 ${
          item.completed ? 'opacity-50' : ''
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-6 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="material-symbols-outlined text-stone text-[20px]">drag_indicator</span>
        </div>

        {/* Time */}
        <div className="flex-shrink-0 w-12 text-center">
          <span className="text-[14px] font-mono text-charcoal font-medium">{item.time}</span>
        </div>

        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-mag flex items-center justify-center ${
          item.completed ? 'bg-green-100' : 'bg-pastel-blue'
        }`}>
          <span className={`material-symbols-outlined text-[20px] ${
            item.completed ? 'text-green-600' : 'text-blue-600'
          }`}>
            {item.completed ? 'check' : typeIcons[item.type] || 'event'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onPress(item)}>
          <p className={`text-[13px] font-medium truncate ${
            item.completed ? 'text-stone line-through' : 'text-charcoal'
          }`}>
            {item.title}
          </p>
          {item.location && (
            <p className="text-[11px] text-stone truncate flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {item.location}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {item.location && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(item); }}
              className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-blue-600 text-[16px]">navigation</span>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              item.completed ? 'bg-green-100' : 'bg-stone/10'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${
              item.completed ? 'text-green-600' : 'text-stone'
            }`}>
              {item.completed ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
