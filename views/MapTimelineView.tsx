import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';
import notificationService from '../services/NotificationService';

interface MapTimelineViewProps {
    schedule: ScheduleItem[];
    selectedDay?: number;
}

// Real coordinates for Bangkok locations
const locationCoordinates: Record<string, { lat: number; lng: number; nameEn: string }> = {
    '觀景名廬': { lat: 25.0330, lng: 121.5654, nameEn: 'Home' },
    'TPE': { lat: 25.0797, lng: 121.2324, nameEn: 'Taoyuan Airport' },
    'BKK': { lat: 13.6900, lng: 100.7501, nameEn: 'Suvarnabhumi Airport' },
    'Bangkok Patio': { lat: 13.7428, lng: 100.5553, nameEn: 'Bangkok Patio Apartment' },
    'Jodd Fairs': { lat: 13.7490, lng: 100.5677, nameEn: 'Jodd Fairs Night Market' },
    'Terminal 21': { lat: 13.7378, lng: 100.5602, nameEn: 'Terminal 21 Asok' },
    'IconSiam': { lat: 13.7261, lng: 100.5099, nameEn: 'IconSiam Mall' },
    'Siam Paragon': { lat: 13.7466, lng: 100.5343, nameEn: 'Siam Paragon' },
    '大皇宮': { lat: 13.7500, lng: 100.4914, nameEn: 'Grand Palace Bangkok' },
    '鄭王廟': { lat: 13.7437, lng: 100.4890, nameEn: 'Wat Arun Temple' },
    'Mahanakhon': { lat: 13.7234, lng: 100.5296, nameEn: 'Mahanakhon Skywalk' },
    'Chatuchak': { lat: 13.7999, lng: 100.5504, nameEn: 'Chatuchak Weekend Market' },
    'Asiatique': { lat: 13.7053, lng: 100.5014, nameEn: 'Asiatique The Riverfront' },
    '水門市場': { lat: 13.7509, lng: 100.5396, nameEn: 'Pratunam Market' },
    'Chinatown': { lat: 13.7407, lng: 100.5093, nameEn: 'Bangkok Chinatown' },
    '臺灣桃園國際機場': { lat: 25.0797, lng: 121.2324, nameEn: 'Taoyuan Airport' },
    '素萬那普機場': { lat: 13.6900, lng: 100.7501, nameEn: 'Suvarnabhumi Airport' },
};

const getLocationInfo = (location?: string): { lat: number; lng: number; nameEn: string } | null => {
    if (!location) return null;
    for (const [key, info] of Object.entries(locationCoordinates)) {
        if (location.includes(key)) return info;
    }
    return null;
};

export default function MapTimelineView({ schedule, selectedDay = 1 }: MapTimelineViewProps) {
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    const [currentDay, setCurrentDay] = useState(selectedDay);

    // Get unique dates and current date
    const dayDates = useMemo(() => {
        const dates = [...new Set(schedule.map(s => s.date))].sort();
        return dates;
    }, [schedule]);

    const currentDate = dayDates[currentDay - 1];

    // Get today's activities sorted by time
    const todaySchedule = useMemo(() => {
        return schedule
            .filter(item => item.date === currentDate)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [schedule, currentDate]);

    // Get locations with coordinates
    const locationsWithCoords = useMemo(() => {
        return todaySchedule
            .map((item, index) => ({
                ...item,
                index,
                coords: getLocationInfo(item.location),
            }))
            .filter(item => item.coords !== null);
    }, [todaySchedule]);

    // Generate Google Maps Static API URL with markers
    const staticMapUrl = useMemo(() => {
        if (locationsWithCoords.length === 0) return '';

        // Build markers string for Google Maps Static API
        const markers = locationsWithCoords
            .map((item, idx) => {
                const { lat, lng } = item.coords!;
                return `markers=color:red%7Clabel:${idx + 1}%7C${lat},${lng}`;
            })
            .join('&');

        // Build path string for route line
        const pathCoords = locationsWithCoords
            .map(item => `${item.coords!.lat},${item.coords!.lng}`)
            .join('|');
        const path = locationsWithCoords.length > 1
            ? `&path=color:0xF43F5E%7Cweight:3%7C${pathCoords}`
            : '';

        // Calculate center
        const centerLat = locationsWithCoords.reduce((sum, item) => sum + item.coords!.lat, 0) / locationsWithCoords.length;
        const centerLng = locationsWithCoords.reduce((sum, item) => sum + item.coords!.lng, 0) / locationsWithCoords.length;

        // Use Google Maps Static API (with free tier - works without API key for limited use)
        // For production, add your API key
        return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=12&size=640x300&scale=2&maptype=roadmap&${markers}${path}&style=feature:poi%7Cvisibility:off`;
    }, [locationsWithCoords]);

    // Fallback to Mapbox if Google Maps doesn't work
    const mapboxUrl = useMemo(() => {
        if (locationsWithCoords.length === 0) return '';

        const pins = locationsWithCoords
            .map((item, idx) => {
                const { lat, lng } = item.coords!;
                return `pin-l-${idx + 1}+F43F5E(${lng},${lat})`;
            })
            .join(',');

        const centerLat = locationsWithCoords.reduce((sum, item) => sum + item.coords!.lat, 0) / locationsWithCoords.length;
        const centerLng = locationsWithCoords.reduce((sum, item) => sum + item.coords!.lng, 0) / locationsWithCoords.length;

        return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${pins}/${centerLng},${centerLat},11,0/640x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
    }, [locationsWithCoords]);

    // Open Google Maps with all waypoints
    const openGoogleMapsRoute = () => {
        if (locationsWithCoords.length === 0) return;

        const origin = locationsWithCoords[0].coords!;
        const destination = locationsWithCoords[locationsWithCoords.length - 1].coords!;
        const waypoints = locationsWithCoords
            .slice(1, -1)
            .map(item => `${item.coords!.lat},${item.coords!.lng}`)
            .join('|');

        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
        if (waypoints) {
            url += `&waypoints=${waypoints}`;
        }
        url += '&travelmode=driving';

        window.open(url, '_blank');
    };

    // Open single location in Google Maps
    const openLocationInMaps = (item: ScheduleItem) => {
        const coords = getLocationInfo(item.location);
        if (coords) {
            const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}&query_place_id=${encodeURIComponent(coords.nameEn)}`;
            window.open(url, '_blank');
        }
    };

    // Schedule smart commute reminders
    useEffect(() => {
        if (notificationService.getPermissionStatus() !== 'granted') return;

        todaySchedule.forEach((item, index) => {
            if (index === 0 || !item.travelTime) return;

            const travelMatch = item.travelTime?.match(/(\d+)/);
            const travelMinutes = travelMatch ? parseInt(travelMatch[1]) : 0;

            if (travelMinutes > 0) {
                const [hours, minutes] = item.time.split(':').map(Number);
                const activityTime = new Date();
                activityTime.setHours(hours, minutes, 0, 0);

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
                    <span className="text-2xl">🗺️</span>
                    <h1 className="text-xl font-bold">今日路線</h1>
                </div>
                <span className="text-stone text-[14px]">{locationsWithCoords.length} 個景點</span>
            </div>

            {/* Map Section - Clickable to open Google Maps */}
            <motion.div
                className="mx-4 rounded-2xl overflow-hidden shadow-lg cursor-pointer relative"
                whileTap={{ scale: 0.98 }}
                onClick={openGoogleMapsRoute}
            >
                {/* Map Image */}
                <div className="relative h-[200px] bg-[#2C2C2E]">
                    <img
                        src={mapboxUrl}
                        alt="Today's route map"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to a placeholder if map fails to load
                            (e.target as HTMLImageElement).src = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/100.5018,13.7563,11,0/640x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
                        }}
                    />

                    {/* Overlay with tap hint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Open in Maps button */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                        <span className="material-symbols-outlined text-[16px] text-charcoal">open_in_new</span>
                        <span className="text-[12px] font-medium text-charcoal">在 Google 地圖開啟</span>
                    </div>

                    {/* Location count badge */}
                    <div className="absolute top-3 left-3 bg-[#F43F5E] rounded-full px-3 py-1 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-white text-[14px]">route</span>
                        <span className="text-[12px] font-bold text-white">{locationsWithCoords.length} 站</span>
                    </div>
                </div>
            </motion.div>

            {/* Info Banner */}
            <div className="mx-4 mt-3 bg-blue-500/20 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">💡</span>
                <p className="text-[12px] text-blue-300 flex-1">
                    點擊地圖開啟 Google Maps 查看完整路線導航
                </p>
            </div>

            {/* Timeline List */}
            <div className="mt-4 px-4 pb-32">
                <h2 className="text-[13px] text-stone uppercase tracking-wide mb-3">行程表</h2>

                <AnimatePresence>
                    {todaySchedule.map((item, index) => {
                        const coords = getLocationInfo(item.location);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                    setSelectedItemIndex(index);
                                    if (coords) openLocationInMaps(item);
                                }}
                                className={`flex items-start gap-4 py-4 border-b border-white/10 cursor-pointer active:bg-white/5 rounded-lg -mx-2 px-2 ${selectedItemIndex === index ? 'bg-white/5' : ''
                                    }`}
                            >
                                {/* Number Badge */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg ${item.completed ? 'bg-green-500' : 'bg-[#F43F5E]'
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
                                        <span className="font-mono">{item.time}</span>
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

                                {/* Map Icon */}
                                {coords && (
                                    <div className="flex items-center gap-1 text-stone">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
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
                <div className="bg-[#2C2C2E]/95 backdrop-blur-sm rounded-2xl p-1.5 flex max-w-md mx-auto overflow-x-auto no-scrollbar shadow-lg">
                    {dayDates.map((date, index) => {
                        const dayNum = index + 1;
                        const isSelected = currentDay === dayNum;
                        const daySchedule = schedule.filter(item => item.date === date);
                        const hasLocations = daySchedule.some(item => getLocationInfo(item.location));

                        return (
                            <motion.button
                                key={date}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentDay(dayNum)}
                                className={`flex-1 min-w-[65px] py-2 px-3 rounded-xl text-center transition-all ${isSelected
                                        ? 'bg-[#F43F5E] text-white shadow-lg'
                                        : 'text-stone hover:bg-white/5'
                                    }`}
                            >
                                <p className="text-[10px] opacity-70">Day</p>
                                <p className="text-[16px] font-bold">{dayNum}</p>
                                {hasLocations && !isSelected && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] mx-auto mt-1" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Smart Commute Banner */}
            <div className="fixed bottom-32 left-4 right-4 max-w-md mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 shadow-lg"
                >
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-xl">🔔</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-white text-[13px] font-medium">智慧通勤提醒</p>
                        <p className="text-white/70 text-[11px]">出發前 5 分鐘自動通知到手機</p>
                    </div>
                    <span className="material-symbols-outlined text-white/70 text-[20px]">check_circle</span>
                </motion.div>
            </div>
        </div>
    );
}
