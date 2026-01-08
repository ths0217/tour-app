import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';
import notificationService from '../services/NotificationService';

interface MapTimelineViewProps {
    schedule: ScheduleItem[];
    selectedDay?: number;
}

// Sample coordinates for Bangkok locations
const locationCoordinates: Record<string, [number, number]> = {
    '觀景名廬': [25.0330, 121.5654],
    'TPE': [25.0797, 121.2324],
    'BKK': [13.6900, 100.7501],
    'Bangkok Patio': [13.7563, 100.5018],
    'Jodd Fairs': [13.7490, 100.5677],
    'Terminal 21': [13.7378, 100.5602],
    'IconSiam': [13.7261, 100.5099],
    'Siam Paragon': [13.7466, 100.5343],
    '大皇宮': [13.7500, 100.4914],
    '鄭王廟': [13.7437, 100.4890],
    'Mahanakhon': [13.7234, 100.5296],
    'Chatuchak': [13.7999, 100.5504],
    'Asiatique': [13.7053, 100.5014],
    '水門市場': [13.7509, 100.5396],
    'Chinatown': [13.7407, 100.5093],
    'default': [13.7563, 100.5018],
};

const getLocationCoords = (location?: string): [number, number] => {
    if (!location) return locationCoordinates.default;
    for (const [key, coords] of Object.entries(locationCoordinates)) {
        if (location.includes(key)) return coords;
    }
    return locationCoordinates.default;
};

export default function MapTimelineView({ schedule, selectedDay = 1 }: MapTimelineViewProps) {
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

    // Get unique dates and current date
    const dayDates = useMemo(() => {
        const dates = [...new Set(schedule.map(s => s.date))].sort();
        return dates;
    }, [schedule]);

    const currentDate = dayDates[selectedDay - 1];

    // Get today's activities sorted by time
    const todaySchedule = useMemo(() => {
        return schedule
            .filter(item => item.date === currentDate)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [schedule, currentDate]);

    // Generate static map URL with markers
    const staticMapUrl = useMemo(() => {
        if (todaySchedule.length === 0) return '';

        const locations = todaySchedule
            .filter(item => item.location)
            .map((item, index) => {
                const coords = getLocationCoords(item.location);
                return `${coords[0]},${coords[1]}`;
            });

        if (locations.length === 0) return '';

        // Use OpenStreetMap static image API
        const markers = todaySchedule
            .filter(item => item.location)
            .map((item, i) => {
                const coords = getLocationCoords(item.location);
                return `pin-s-${i + 1}+F43F5E(${coords[1]},${coords[0]})`;
            })
            .join(',');

        // Calculate center
        const allCoords = todaySchedule
            .filter(item => item.location)
            .map(item => getLocationCoords(item.location));

        if (allCoords.length === 0) return '';

        const centerLat = allCoords.reduce((sum, c) => sum + c[0], 0) / allCoords.length;
        const centerLng = allCoords.reduce((sum, c) => sum + c[1], 0) / allCoords.length;

        // Use a free static map service
        return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${markers}/${centerLng},${centerLat},11,0/400x200@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
    }, [todaySchedule]);

    // Schedule smart commute reminders
    useEffect(() => {
        if (notificationService.getPermissionStatus() !== 'granted') return;

        todaySchedule.forEach((item, index) => {
            if (index === 0 || !item.travelTime) return;

            // Parse travel time (e.g., "🚗 30分" → 30)
            const travelMatch = item.travelTime?.match(/(\d+)/);
            const travelMinutes = travelMatch ? parseInt(travelMatch[1]) : 0;

            if (travelMinutes > 0) {
                const [hours, minutes] = item.time.split(':').map(Number);
                const activityTime = new Date();
                activityTime.setHours(hours, minutes, 0, 0);

                // Notification time = activity time - travel time - 5 min
                const notifyTime = new Date(activityTime.getTime() - (travelMinutes + 5) * 60 * 1000);

                if (notifyTime > new Date()) {
                    notificationService.scheduleNotification(
                        `commute-${item.id}`,
                        `🚗 ${travelMinutes}分鐘後出發`,
                        `前往 ${item.title}（${item.location || ''}）`,
                        notifyTime,
                        { tag: 'commute-reminder' }
                    );
                }
            }
        });
    }, [todaySchedule]);

    return (
        <div className="min-h-full bg-[#1C1C1E] text-white pb-safe">
            {/* Header */}
            <div className="px-4 pt-6 pb-3 safe-top flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xl">🗺️</span>
                    <h1 className="text-xl font-bold">今日路線</h1>
                </div>
                <span className="text-stone text-[14px]">{todaySchedule.length} 個地點</span>
            </div>

            {/* Route Visualization */}
            <div className="mx-4 rounded-2xl overflow-hidden bg-[#2C2C2E] relative">
                {/* Static Map Background */}
                <div
                    className="h-[200px] bg-cover bg-center relative"
                    style={{
                        backgroundImage: `linear-gradient(to bottom, rgba(44,44,46,0.3), rgba(44,44,46,0.8)), url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${todaySchedule.length > 0 ? getLocationCoords(todaySchedule[0]?.location)[1] : 100.5018},${todaySchedule.length > 0 ? getLocationCoords(todaySchedule[0]?.location)[0] : 13.7563},11,0/800x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw')`,
                    }}
                >
                    {/* SVG Route Diagram Overlay */}
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 400 200"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {/* Grid Background Pattern */}
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Route Lines */}
                        {todaySchedule.length > 1 && (
                            <path
                                d={todaySchedule.map((_, index) => {
                                    const x = 40 + (index * (320 / Math.max(todaySchedule.length - 1, 1)));
                                    const y = 50 + (Math.sin(index * 1.2) * 40 + 40);
                                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#F43F5E"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Location Markers */}
                        {todaySchedule.map((item, index) => {
                            const x = todaySchedule.length === 1 ? 200 : 40 + (index * (320 / Math.max(todaySchedule.length - 1, 1)));
                            const y = 50 + (Math.sin(index * 1.2) * 40 + 40);
                            const isSelected = selectedItemIndex === index;

                            return (
                                <g key={item.id} onClick={() => setSelectedItemIndex(index)} style={{ cursor: 'pointer' }}>
                                    {/* Shadow */}
                                    <ellipse cx={x} cy={y + 25} rx="12" ry="4" fill="rgba(0,0,0,0.2)" />

                                    {/* Marker Circle */}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isSelected ? 22 : 18}
                                        fill="#F43F5E"
                                        stroke="white"
                                        strokeWidth="3"
                                        className="transition-all duration-200"
                                    />

                                    {/* Number */}
                                    <text
                                        x={x}
                                        y={y + 1}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="white"
                                        fontSize={isSelected ? "16" : "14"}
                                        fontWeight="bold"
                                    >
                                        {index + 1}
                                    </text>

                                    {/* Location Label (below marker) */}
                                    <rect
                                        x={x - 30}
                                        y={y + 30}
                                        width="60"
                                        height="18"
                                        rx="9"
                                        fill="rgba(255,255,255,0.9)"
                                    />
                                    <text
                                        x={x}
                                        y={y + 40}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#333"
                                        fontSize="9"
                                        fontWeight="500"
                                    >
                                        {item.time}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Timeline List */}
            <div className="mt-4 px-4 pb-24">
                <AnimatePresence>
                    {todaySchedule.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedItemIndex(index)}
                            className={`flex items-start gap-4 py-4 border-b border-white/10 cursor-pointer ${selectedItemIndex === index ? 'bg-white/5 -mx-4 px-4 rounded-xl' : ''
                                }`}
                        >
                            {/* Number Badge */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${item.completed ? 'bg-green-500' : 'bg-[#F43F5E]'
                                }`}>
                                {item.completed ? '✓' : index + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-[16px] font-semibold ${item.completed ? 'text-stone line-through' : 'text-white'
                                    }`}>
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-[13px] text-stone">
                                    <span>{item.time}</span>
                                    {item.location && (
                                        <>
                                            <span>•</span>
                                            <span className="truncate">{item.location}</span>
                                        </>
                                    )}
                                </div>
                                {item.travelTime && (
                                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-[11px] text-stone">
                                        {item.travelTime}
                                    </div>
                                )}
                            </div>

                            {/* Arrow */}
                            <span className="material-symbols-outlined text-stone text-[20px]">chevron_right</span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State */}
                {todaySchedule.length === 0 && (
                    <div className="text-center py-16">
                        <span className="text-5xl">🗺️</span>
                        <p className="text-stone mt-4 text-[15px]">今日沒有行程安排</p>
                        <p className="text-stone/70 mt-1 text-[13px]">前往「行程」頁面新增活動</p>
                    </div>
                )}
            </div>

            {/* Day Selector */}
            <div className="fixed bottom-20 left-0 right-0 px-4 z-10">
                <div className="bg-[#2C2C2E] rounded-full p-1 flex max-w-md mx-auto overflow-x-auto no-scrollbar">
                    {dayDates.map((date, index) => {
                        const dayNum = index + 1;
                        const isSelected = selectedDay === dayNum;
                        return (
                            <motion.button
                                key={date}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-1 min-w-[60px] py-2 px-3 rounded-full text-center transition-colors ${isSelected
                                        ? 'bg-[#F43F5E] text-white'
                                        : 'text-stone'
                                    }`}
                            >
                                <p className="text-[10px] opacity-70">Day</p>
                                <p className="text-[14px] font-bold">{dayNum}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Smart Commute Info Banner */}
            <div className="fixed bottom-32 left-4 right-4 max-w-md mx-auto z-10">
                <div className="bg-gradient-to-r from-blue-500/90 to-indigo-500/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    <div className="flex-1">
                        <p className="text-white text-[13px] font-medium">智慧通勤提醒已啟用</p>
                        <p className="text-white/70 text-[11px]">出發前 5 分鐘自動通知</p>
                    </div>
                    <span className="material-symbols-outlined text-white/50">check_circle</span>
                </div>
            </div>
        </div>
    );
}
