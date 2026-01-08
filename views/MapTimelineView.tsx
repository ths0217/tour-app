import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
    'Bangkok Patio': { lat: 13.7428, lng: 100.5553, nameEn: 'Bangkok Patio' },
    'Jodd Fairs': { lat: 13.7490, lng: 100.5677, nameEn: 'Jodd Fairs' },
    'Terminal 21': { lat: 13.7378, lng: 100.5602, nameEn: 'Terminal 21' },
    'IconSiam': { lat: 13.7261, lng: 100.5099, nameEn: 'IconSiam' },
    'Siam Paragon': { lat: 13.7466, lng: 100.5343, nameEn: 'Siam Paragon' },
    '大皇宮': { lat: 13.7500, lng: 100.4914, nameEn: 'Grand Palace' },
    '鄭王廟': { lat: 13.7437, lng: 100.4890, nameEn: 'Wat Arun' },
    'Mahanakhon': { lat: 13.7234, lng: 100.5296, nameEn: 'Mahanakhon' },
    'Chatuchak': { lat: 13.7999, lng: 100.5504, nameEn: 'Chatuchak Market' },
    'Asiatique': { lat: 13.7053, lng: 100.5014, nameEn: 'Asiatique' },
    '水門市場': { lat: 13.7509, lng: 100.5396, nameEn: 'Pratunam Market' },
    'Chinatown': { lat: 13.7407, lng: 100.5093, nameEn: 'Chinatown' },
    '臺灣桃園國際機場': { lat: 25.0797, lng: 121.2324, nameEn: 'TPE Airport' },
    '素萬那普機場': { lat: 13.6900, lng: 100.7501, nameEn: 'BKK Airport' },
};

const getLocationInfo = (location?: string): { lat: number; lng: number; nameEn: string } | null => {
    if (!location) return null;
    for (const [key, info] of Object.entries(locationCoordinates)) {
        if (location.includes(key)) return info;
    }
    return null;
};

// Parse travel time string to minutes
const parseTravelMinutes = (travelTime?: string): number => {
    if (!travelTime) return 0;
    const match = travelTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

// Estimate walking time to station (in minutes)
const estimateWalkingTime = (transportType?: string): number => {
    if (!transportType) return 5;
    if (transportType.includes('BTS') || transportType.includes('MRT')) return 8;
    if (transportType.includes('Grab') || transportType.includes('🚗')) return 3;
    if (transportType.includes('步行')) return 0;
    return 5;
};

export default function MapTimelineView({ schedule, selectedDay = 1 }: MapTimelineViewProps) {
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [currentDay, setCurrentDay] = useState(selectedDay);
    const [isMapExpanded, setIsMapExpanded] = useState(true);
    const [showSmartAlert, setShowSmartAlert] = useState(false);
    const [alertContent, setAlertContent] = useState({ title: '', body: '', walkTime: 0, bufferTime: 5 });
    const timelineRef = useRef<HTMLDivElement>(null);

    // Get unique dates
    const dayDates = useMemo(() => {
        return [...new Set(schedule.map(s => s.date))].sort();
    }, [schedule]);

    const currentDate = dayDates[currentDay - 1];

    // Get today's activities
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

    // Current and next location for focused map
    const currentLocation = locationsWithCoords[focusedIndex] || locationsWithCoords[0];
    const nextLocation = locationsWithCoords[focusedIndex + 1];

    // Generate focused map URL (current → next only for better visual hierarchy)
    const focusedMapUrl = useMemo(() => {
        if (!currentLocation?.coords) return '';

        const current = currentLocation.coords;
        let pins = `pin-l-${focusedIndex + 1}+F43F5E(${current.lng},${current.lat})`;
        let pathCoords = `${current.lng},${current.lat}`;
        let centerLat = current.lat;
        let centerLng = current.lng;
        let zoom = 14;

        if (nextLocation?.coords) {
            const next = nextLocation.coords;
            pins += `,pin-l-${focusedIndex + 2}+6366F1(${next.lng},${next.lat})`;
            pathCoords += `;${next.lng},${next.lat}`;
            centerLat = (current.lat + next.lat) / 2;
            centerLng = (current.lng + next.lng) / 2;
            zoom = 12;
        }

        return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${pins},path-4+F43F5E-0.6(${encodeURIComponent(pathCoords)})/${centerLng},${centerLat},${zoom},0/640x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
    }, [currentLocation, nextLocation, focusedIndex]);

    // Calculate current progress (0-100)
    const currentProgress = useMemo(() => {
        if (todaySchedule.length <= 1) return 0;
        return (focusedIndex / (todaySchedule.length - 1)) * 100;
    }, [focusedIndex, todaySchedule.length]);

    // Handle timeline scroll - update focused index
    const handleTimelineScroll = () => {
        if (!timelineRef.current) return;
        const scrollTop = timelineRef.current.scrollTop;
        const itemHeight = 100; // Approximate card height
        const newIndex = Math.min(
            Math.floor(scrollTop / itemHeight),
            todaySchedule.length - 1
        );
        if (newIndex !== focusedIndex && newIndex >= 0) {
            setFocusedIndex(newIndex);
        }
    };

    // Open Google Maps navigation
    const openGoogleMaps = (item?: ScheduleItem) => {
        if (!item) return;
        const coords = getLocationInfo(item.location);
        if (coords) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, '_blank');
        }
    };

    // Open full route in Google Maps
    const openFullRoute = () => {
        if (locationsWithCoords.length < 2) return;
        const origin = locationsWithCoords[0].coords!;
        const dest = locationsWithCoords[locationsWithCoords.length - 1].coords!;
        const waypoints = locationsWithCoords
            .slice(1, -1)
            .map(l => `${l.coords!.lat},${l.coords!.lng}`)
            .join('|');

        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}`;
        if (waypoints) url += `&waypoints=${waypoints}`;
        window.open(url, '_blank');
    };

    // Smart notification with walking time + buffer
    useEffect(() => {
        if (notificationService.getPermissionStatus() !== 'granted') return;

        todaySchedule.forEach((item, index) => {
            if (index === 0 || !item.travelTime) return;

            const travelMinutes = parseTravelMinutes(item.travelTime);
            const walkingTime = estimateWalkingTime(item.travelTime);
            const bufferTime = 5; // Dynamic buffer

            if (travelMinutes > 0) {
                const [hours, minutes] = item.time.split(':').map(Number);
                const activityTime = new Date();
                activityTime.setHours(hours, minutes, 0, 0);

                // Smart formula: activity_time - travel_time - walking_time - buffer
                const totalLeadTime = travelMinutes + walkingTime + bufferTime;
                const notifyTime = new Date(activityTime.getTime() - totalLeadTime * 60 * 1000);

                if (notifyTime > new Date()) {
                    notificationService.scheduleNotification(
                        `smart-commute-${item.id}`,
                        `🚶 該離開了！`,
                        `步行至車站需 ${walkingTime} 分鐘，車程 ${travelMinutes} 分鐘\n前往：${item.title}`,
                        notifyTime,
                        { tag: 'smart-commute' }
                    );
                }
            }
        });
    }, [todaySchedule]);

    // Simulate smart alert for demo
    const showDemoAlert = (item: ScheduleItem, nextItem?: ScheduleItem) => {
        if (!nextItem) return;
        const travelMinutes = parseTravelMinutes(nextItem.travelTime);
        const walkingTime = estimateWalkingTime(nextItem.travelTime);

        setAlertContent({
            title: `🚶 該離開「${item.title}」了`,
            body: `步行至車站需 ${walkingTime} 分鐘`,
            walkTime: walkingTime,
            bufferTime: 5,
        });
        setShowSmartAlert(true);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => setShowSmartAlert(false), 4000);
    };

    return (
        <div className="min-h-full bg-[#0A0A0B] text-white pb-safe flex flex-col">
            {/* Header */}
            <div className="px-4 pt-6 pb-2 safe-top flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🗺️</span>
                    <h1 className="text-xl font-bold">今日路線</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#F43F5E] font-bold">{locationsWithCoords.length}</span>
                    <span className="text-stone text-[14px]">個景點</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 mb-3 shrink-0">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#F43F5E] to-[#6366F1] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(currentProgress, 5)}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-stone">開始</span>
                    <span className="text-[10px] text-[#F43F5E] font-medium">
                        {focusedIndex + 1} / {todaySchedule.length}
                    </span>
                    <span className="text-[10px] text-stone">結束</span>
                </div>
            </div>

            {/* Map Section - Collapsible */}
            <motion.div
                className="mx-4 rounded-2xl overflow-hidden shadow-xl shrink-0"
                animate={{ height: isMapExpanded ? 200 : 80 }}
                transition={{ duration: 0.3 }}
            >
                <div
                    className="relative h-full cursor-pointer"
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                >
                    {/* Map Image */}
                    <img
                        src={focusedMapUrl}
                        alt="Route map"
                        className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                    {/* Current Location Label */}
                    <div className="absolute top-3 left-3 bg-[#F43F5E] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
                        <span className="text-white font-bold text-[14px]">{focusedIndex + 1}</span>
                        <span className="text-white/90 text-[12px] max-w-[120px] truncate">
                            {currentLocation?.title || '起點'}
                        </span>
                    </div>

                    {/* Next Location Label */}
                    {nextLocation && (
                        <div className="absolute top-3 right-3 bg-[#6366F1] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
                            <span className="text-white font-bold text-[14px]">{focusedIndex + 2}</span>
                            <span className="text-white/90 text-[12px] max-w-[100px] truncate">
                                {nextLocation.title}
                            </span>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => { e.stopPropagation(); openFullRoute(); }}
                            className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg"
                        >
                            <span className="material-symbols-outlined text-[16px] text-charcoal">directions</span>
                            <span className="text-[11px] font-medium text-charcoal">開啟 Google 地圖</span>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-white text-[18px]">
                                {isMapExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Timeline Section */}
            <div
                ref={timelineRef}
                onScroll={handleTimelineScroll}
                className="flex-1 overflow-y-auto mt-4 pb-40"
            >
                <div className="px-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] text-stone uppercase tracking-wider">行程表 Timeline</span>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => focusedIndex > 0 && showDemoAlert(todaySchedule[focusedIndex - 1], todaySchedule[focusedIndex])}
                            className="text-[11px] text-[#F43F5E] flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                            測試提醒
                        </motion.button>
                    </div>

                    {/* Timeline Items */}
                    <div className="relative">
                        {/* Vertical Progress Line */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10" />
                        <motion.div
                            className="absolute left-5 top-0 w-0.5 bg-gradient-to-b from-[#F43F5E] to-[#6366F1]"
                            initial={{ height: 0 }}
                            animate={{ height: `${currentProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />

                        {todaySchedule.map((item, index) => {
                            const isActive = index === focusedIndex;
                            const isPast = index < focusedIndex;
                            const coords = getLocationInfo(item.location);
                            const travelMinutes = parseTravelMinutes(item.travelTime);
                            const walkingTime = estimateWalkingTime(item.travelTime);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => {
                                        setFocusedIndex(index);
                                        if (coords) openGoogleMaps(item);
                                    }}
                                    className={`relative flex gap-4 py-4 pl-2 cursor-pointer rounded-xl transition-all ${isActive ? 'bg-white/5 -mx-2 px-4' : ''
                                        }`}
                                >
                                    {/* Timeline Node */}
                                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-all shadow-lg ${isPast ? 'bg-green-500 text-white' :
                                            isActive ? 'bg-[#F43F5E] text-white scale-110 ring-4 ring-[#F43F5E]/30' :
                                                'bg-[#2C2C2E] text-stone border-2 border-white/20'
                                        }`}>
                                        {isPast ? '✓' : index + 1}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[13px] font-mono px-2 py-0.5 rounded-md ${isActive ? 'bg-[#F43F5E] text-white' : 'bg-white/10 text-stone'
                                                }`}>
                                                {item.time}
                                            </span>
                                            {item.travelTime && (
                                                <span className="text-[11px] text-stone/70 flex items-center gap-1">
                                                    {item.travelTime}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={`text-[16px] font-semibold mb-1 ${isPast ? 'text-stone/50 line-through' : 'text-white'
                                            }`}>
                                            {item.title}
                                        </h3>

                                        {item.location && (
                                            <p className="text-[12px] text-stone/70 flex items-center gap-1 mb-1">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                {item.location}
                                            </p>
                                        )}

                                        {/* Smart Travel Info */}
                                        {travelMinutes > 0 && isActive && (
                                            <div className="mt-2 p-2 bg-blue-500/20 rounded-lg">
                                                <p className="text-[11px] text-blue-300 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                                    步行 {walkingTime} 分 + 車程 {travelMinutes} 分 = 共 {walkingTime + travelMinutes} 分鐘
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    {coords && (
                                        <span className="material-symbols-outlined text-stone/50 text-[18px] self-center">
                                            chevron_right
                                        </span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Day Selector */}
            <div className="fixed bottom-20 left-0 right-0 px-4 z-10">
                <div className="bg-[#1C1C1E]/95 backdrop-blur-md rounded-2xl p-1.5 flex max-w-md mx-auto overflow-x-auto no-scrollbar shadow-xl border border-white/10">
                    {dayDates.map((date, index) => {
                        const dayNum = index + 1;
                        const isSelected = currentDay === dayNum;

                        return (
                            <motion.button
                                key={date}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setCurrentDay(dayNum); setFocusedIndex(0); }}
                                className={`flex-1 min-w-[55px] py-2 px-2 rounded-xl text-center transition-all ${isSelected
                                        ? 'bg-[#F43F5E] text-white shadow-lg'
                                        : 'text-stone hover:bg-white/5'
                                    }`}
                            >
                                <p className="text-[9px] opacity-70">DAY</p>
                                <p className="text-[16px] font-bold">{dayNum}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Smart Alert Modal */}
            <AnimatePresence>
                {showSmartAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-36 left-4 right-4 max-w-md mx-auto z-50"
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-2xl">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-2xl">🚶</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-[15px] mb-1">{alertContent.title}</h4>
                                    <p className="text-white/80 text-[13px]">{alertContent.body}</p>
                                    <div className="flex gap-2 mt-3">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setShowSmartAlert(false);
                                                openGoogleMaps(todaySchedule[focusedIndex]);
                                            }}
                                            className="flex-1 py-2 bg-white text-charcoal rounded-lg text-[13px] font-medium"
                                        >
                                            開始導航
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowSmartAlert(false)}
                                            className="px-4 py-2 bg-white/20 text-white rounded-lg text-[13px]"
                                        >
                                            稍後
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
