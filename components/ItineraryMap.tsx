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

      {/* Map Placeholder with Route Visualization */}
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
        {mapPreview ? (
          <img
            src={mapPreview}
            alt="曼谷行程地圖預覽"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[12px] text-stone">
            請於 .env 設定 VITE_MAPBOX_TOKEN 以載入地圖
          </div>
        )}

        {/* Simple Route Visualization */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
          {/* Route Path */}
          <path
            d={`M ${daySchedule.map((_, i) => {
              const x = 40 + (i * (320 / Math.max(daySchedule.length - 1, 1)));
              const y = 40 + Math.sin(i * 0.8) * 30 + (i % 2 ? 20 : 0);
              return `${x},${y}`;
            }).join(' L ')}`}
            fill="none"
            stroke="#FF2442"
            strokeWidth="3"
            strokeDasharray="0"
            className="drop-shadow-sm"
          />

          {/* Location Markers */}
          {daySchedule.map((item, i) => {
            const x = 40 + (i * (320 / Math.max(daySchedule.length - 1, 1)));
            const y = 40 + Math.sin(i * 0.8) * 30 + (i % 2 ? 20 : 0);
            return (
              <g key={item.id}>
                <circle cx={x} cy={y} r="14" fill="white" className="drop-shadow-md" />
                <circle cx={x} cy={y} r="10" fill={item.completed ? '#22c55e' : '#FF2442'} />
                <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Time Labels */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-around px-4">
          {daySchedule.slice(0, 4).map((item, i) => (
            <div key={item.id} className="text-center">
              <p className="text-[9px] text-charcoal/70 dark:text-white/70 font-mono">{item.time}</p>
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
