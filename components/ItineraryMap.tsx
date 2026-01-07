import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScheduleItem } from '../types';

interface ItineraryMapProps {
  schedule: ScheduleItem[];
  selectedDate: string;
  onLocationClick?: (item: ScheduleItem) => void;
}

// Location coordinates for Bangkok attractions
const locationCoords: Record<string, { lat: number; lng: number }> = {
  'Wat Arun': { lat: 13.7437, lng: 100.4890 },
  'Grand Palace': { lat: 13.7500, lng: 100.4913 },
  'ICONSIAM': { lat: 13.7263, lng: 100.5098 },
  'Jodd Fairs': { lat: 13.7490, lng: 100.5677 },
  'Wat Pho': { lat: 13.7465, lng: 100.4930 },
  'Pratunam': { lat: 13.7509, lng: 100.5396 },
  'Terminal 21': { lat: 13.7378, lng: 100.5602 },
  'Siam Paragon': { lat: 13.7465, lng: 100.5349 },
  'BKK': { lat: 13.6900, lng: 100.7501 },
  'Avani+ Riverside': { lat: 13.7020, lng: 100.5000 },
  'Asiatique': { lat: 13.7055, lng: 100.5019 },
  'default': { lat: 13.7563, lng: 100.5018 },
};

const getCoords = (location?: string) => {
  if (!location) return locationCoords.default;
  for (const [key, coords] of Object.entries(locationCoords)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      return coords;
    }
  }
  return locationCoords.default;
};

export default function ItineraryMap({ schedule, selectedDate, onLocationClick }: ItineraryMapProps) {
  const daySchedule = useMemo(() =>
    schedule
      .filter(item => item.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [schedule, selectedDate]
  );

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  if (daySchedule.length === 0) {
    return (
      <div className="bg-white dark:bg-charcoal/50 rounded-mag p-4 shadow-mag text-center">
        <span className="material-symbols-outlined text-stone text-[32px] mb-2 block">map</span>
        <p className="text-[12px] text-stone">今日無行程</p>
      </div>
    );
  }

  // Calculate map bounds
  const coords = daySchedule.map(item => getCoords(item.location));
  const centerLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
  const centerLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;

  const mapMarkers = daySchedule
    .map((item, i) => {
      const c = getCoords(item.location);
      return `pin-s-${i + 1}+FF2442(${c.lng},${c.lat})`;
    })
    .join(',');

  const mapPreview = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${mapMarkers}/${centerLng},${centerLat},12,0/600x320@2x?access_token=${mapboxToken}`
    : '';

  return (
    <div className="bg-white dark:bg-charcoal/50 rounded-mag overflow-hidden shadow-mag">
      {/* Map Header */}
      <div className="p-3 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-xhs text-[18px]">route</span>
          <span className="text-[13px] font-semibold text-charcoal dark:text-white">今日路線</span>
        </div>
        <span className="text-[11px] text-stone">{daySchedule.length} 個地點</span>
      </div>

      {/* Map Area with Route Visualization */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-blue-900/30 dark:to-indigo-900/30 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 400 180">
            {/* Grid Pattern */}
            {[...Array(8)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 25} x2="400" y2={i * 25} stroke="#6366f1" strokeWidth="0.5" strokeDasharray="4 4" />
            ))}
            {[...Array(16)].map((_, i) => (
              <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2="180" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="4 4" />
            ))}
          </svg>
        </div>

        {/* Mapbox Image if token available */}
        {mapPreview && (
          <img
            src={mapPreview}
            alt="曼谷行程地圖預覽"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Route Visualization SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180">
          {/* Route Connection Lines */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Route Path with glow effect */}
          <path
            d={`M ${daySchedule.map((_, i) => {
              const x = 50 + (i * (300 / Math.max(daySchedule.length - 1, 1)));
              const y = 70 + Math.sin(i * 1.2) * 25 + (i % 2 ? 15 : -10);
              return `${x},${y}`;
            }).join(' L ')}`}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Location Markers with shadow */}
          {daySchedule.map((item, i) => {
            const x = 50 + (i * (300 / Math.max(daySchedule.length - 1, 1)));
            const y = 70 + Math.sin(i * 1.2) * 25 + (i % 2 ? 15 : -10);
            return (
              <g key={item.id}>
                {/* Shadow */}
                <ellipse cx={x} cy={y + 20} rx="8" ry="3" fill="rgba(0,0,0,0.15)" />
                {/* Pin body */}
                <circle cx={x} cy={y} r="16" fill="white" className="drop-shadow-lg" />
                <circle cx={x} cy={y} r="12" fill={item.completed ? '#22c55e' : '#f43f5e'} />
                <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Bottom Time Labels */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-around px-6">
          {daySchedule.slice(0, 5).map((item) => (
            <div key={item.id} className="bg-white/80 dark:bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <p className="text-[9px] text-charcoal dark:text-white font-mono font-medium">{item.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Location List */}
      <div className="p-2 max-h-32 overflow-y-auto">
        {daySchedule.map((item, i) => (
          <motion.button
            key={item.id}
            onClick={() => onLocationClick?.(item)}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-2 p-2 hover:bg-stone/5 dark:hover:bg-white/5 rounded-mag transition-colors"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
              item.completed ? 'bg-green-500' : 'bg-red-xhs'
            }`}>
              {i + 1}
            </div>
            <div className="flex-1 text-left">
              <p className="text-[12px] font-medium text-charcoal dark:text-white line-clamp-1">{item.title}</p>
              <p className="text-[10px] text-stone">{item.time} · {item.location || '未設定地點'}</p>
            </div>
            <span className="material-symbols-outlined text-stone text-[16px]">chevron_right</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
