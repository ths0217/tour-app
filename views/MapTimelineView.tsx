import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
    'Wat Arun': { lat: 13.7437, lng: 100.4890, nameEn: 'Wat Arun' },
    'Wat Pho': { lat: 13.7465, lng: 100.4930, nameEn: 'Wat Pho' },
    'Grand Palace': { lat: 13.7500, lng: 100.4914, nameEn: 'Grand Palace' },
    'Mahanakhon': { lat: 13.7234, lng: 100.5296, nameEn: 'Mahanakhon' },
    'Chatuchak': { lat: 13.7999, lng: 100.5504, nameEn: 'Chatuchak Market' },
    'Asiatique': { lat: 13.7053, lng: 100.5014, nameEn: 'Asiatique' },
    '水門市場': { lat: 13.7509, lng: 100.5396, nameEn: 'Pratunam Market' },
    'Chinatown': { lat: 13.7407, lng: 100.5093, nameEn: 'Chinatown' },
    'Safari World': { lat: 13.9337, lng: 100.7015, nameEn: 'Safari World' },
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

const parseTravelMinutes = (travelTime?: string): number => {
    if (!travelTime) return 0;
    const match = travelTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

// Create numbered marker icon
const createNumberedIcon = (num: number, isActive: boolean) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: ${isActive ? '36px' : '28px'};
            height: ${isActive ? '36px' : '28px'};
            background: ${isActive ? '#F43F5E' : '#6366F1'};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isActive ? '16px' : '12px'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transform: translate(-50%, -50%);
        ">${num}</div>`,
        iconSize: [isActive ? 36 : 28, isActive ? 36 : 28],
        iconAnchor: [isActive ? 18 : 14, isActive ? 18 : 14],
    });
};

// Map controller component to handle pan/zoom
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 0.5 });
    }, [map, center, zoom]);
    return null;
}

export default function MapTimelineView({ schedule, selectedDay = 1 }: MapTimelineViewProps) {
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [currentDay, setCurrentDay] = useState(selectedDay);
    const [mapCenter, setMapCenter] = useState<[number, number]>([13.7563, 100.5018]);
    const [mapZoom, setMapZoom] = useState(13);

    const dayDates = useMemo(() => {
        return [...new Set(schedule.map(s => s.date))].sort();
    }, [schedule]);

    const currentDate = dayDates[currentDay - 1];

    const todaySchedule = useMemo(() => {
        return schedule
            .filter(item => item.date === currentDate)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [schedule, currentDate]);

    const locationsWithCoords = useMemo(() => {
        return todaySchedule
            .map((item, index) => ({
                ...item,
                index,
                coords: getLocationInfo(item.location),
            }))
            .filter(item => item.coords !== null);
    }, [todaySchedule]);

    // Polyline path
    const polylinePath = useMemo(() => {
        return locationsWithCoords.map(loc => [loc.coords!.lat, loc.coords!.lng] as [number, number]);
    }, [locationsWithCoords]);

    // Update map center when day changes
    useEffect(() => {
        if (locationsWithCoords.length > 0) {
            const avgLat = locationsWithCoords.reduce((sum, loc) => sum + loc.coords!.lat, 0) / locationsWithCoords.length;
            const avgLng = locationsWithCoords.reduce((sum, loc) => sum + loc.coords!.lng, 0) / locationsWithCoords.length;
            setMapCenter([avgLat, avgLng]);
            setMapZoom(locationsWithCoords.length > 2 ? 12 : 13);
        }
    }, [locationsWithCoords]);

    // Open Google Maps navigation
    const openGoogleMaps = (item: ScheduleItem) => {
        const coords = getLocationInfo(item.location);
        if (coords) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, '_blank');
        }
    };

    // Open full route
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

    // Smart notifications
    useEffect(() => {
        if (notificationService.getPermissionStatus() !== 'granted') return;
        todaySchedule.forEach((item, index) => {
            if (index === 0 || !item.travelTime) return;
            const travelMinutes = parseTravelMinutes(item.travelTime);
            if (travelMinutes > 0) {
                const [hours, minutes] = item.time.split(':').map(Number);
                const activityTime = new Date();
                activityTime.setHours(hours, minutes, 0, 0);
                const notifyTime = new Date(activityTime.getTime() - (travelMinutes + 5) * 60 * 1000);
                if (notifyTime > new Date()) {
                    notificationService.scheduleNotification(
                        `smart-commute-${item.id}`,
                        `🚶 該離開了！`,
                        `前往 ${item.title}`,
                        notifyTime,
                        { tag: 'smart-commute' }
                    );
                }
            }
        });
    }, [todaySchedule]);

    const handleTimelineClick = (index: number, item: ScheduleItem) => {
        setFocusedIndex(index);
        const coords = getLocationInfo(item.location);
        if (coords) {
            setMapCenter([coords.lat, coords.lng]);
            setMapZoom(15);
        }
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const currentProgress = useMemo(() => {
        if (todaySchedule.length <= 1) return 0;
        return (focusedIndex / (todaySchedule.length - 1)) * 100;
    }, [focusedIndex, todaySchedule.length]);

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
                        animate={{ width: `${Math.max(currentProgress, 5)}%` }}
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

            {/* Leaflet Map */}
            <div className="mx-4 rounded-2xl overflow-hidden shadow-xl h-[220px] shrink-0 relative">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <MapController center={mapCenter} zoom={mapZoom} />

                    {/* OpenStreetMap Dark Tiles (CartoDB Dark Matter - FREE) */}
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Route Polyline */}
                    {polylinePath.length > 1 && (
                        <Polyline
                            positions={polylinePath}
                            pathOptions={{
                                color: '#F43F5E',
                                weight: 4,
                                opacity: 0.8,
                            }}
                        />
                    )}

                    {/* Markers */}
                    {locationsWithCoords.map((loc, i) => (
                        <Marker
                            key={loc.id}
                            position={[loc.coords!.lat, loc.coords!.lng]}
                            icon={createNumberedIcon(i + 1, i === focusedIndex)}
                            eventHandlers={{
                                click: () => {
                                    setFocusedIndex(i);
                                    if (navigator.vibrate) navigator.vibrate(10);
                                },
                            }}
                        >
                            <Popup>
                                <div className="p-1">
                                    <p className="font-bold text-sm text-gray-800">{loc.title}</p>
                                    <p className="text-xs text-gray-600">{loc.time}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Open Route Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={openFullRoute}
                    className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg z-[1000]"
                >
                    <span className="material-symbols-outlined text-[16px] text-charcoal">directions</span>
                    <span className="text-[11px] font-medium text-charcoal">Google 導航</span>
                </motion.button>

                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 z-[1000]">
                    <span className="text-[10px] text-white/70">OpenStreetMap</span>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="flex-1 overflow-y-auto mt-4 pb-40 px-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] text-stone uppercase tracking-wider">行程表 Timeline</span>
                </div>

                {todaySchedule.map((item, index) => {
                    const isActive = index === focusedIndex;
                    const coords = getLocationInfo(item.location);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleTimelineClick(index, item)}
                            className={`flex gap-4 py-4 cursor-pointer rounded-xl transition-all ${isActive ? 'bg-white/5 -mx-2 px-4' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-lg ${isActive ? 'bg-[#F43F5E] text-white scale-110' : 'bg-[#2C2C2E] text-stone border border-white/20'
                                }`}>
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[13px] font-mono px-2 py-0.5 rounded-md ${isActive ? 'bg-[#F43F5E] text-white' : 'bg-white/10 text-stone'}`}>
                                        {item.time}
                                    </span>
                                    {item.travelTime && <span className="text-[11px] text-stone/70">{item.travelTime}</span>}
                                </div>
                                <h3 className="text-[16px] font-semibold text-white mb-1">{item.title}</h3>
                                {item.location && (
                                    <p className="text-[12px] text-stone/70 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                        {item.location}
                                    </p>
                                )}
                            </div>

                            {coords && <span className="material-symbols-outlined text-stone/50 text-[18px] self-center">chevron_right</span>}
                        </motion.div>
                    );
                })}
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
                                className={`flex-1 min-w-[55px] py-2 px-2 rounded-xl text-center transition-all ${isSelected ? 'bg-[#F43F5E] text-white shadow-lg' : 'text-stone hover:bg-white/5'
                                    }`}
                            >
                                <p className="text-[9px] opacity-70">DAY</p>
                                <p className="text-[16px] font-bold">{dayNum}</p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
