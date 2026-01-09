import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { ScheduleItem } from '../types';
import notificationService from '../services/NotificationService';

interface MapTimelineViewProps {
    schedule: ScheduleItem[];
    selectedDay?: number;
}

// Google Maps API Key (for demo - should use env variable in production)
const GOOGLE_MAPS_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

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

// Parse travel time
const parseTravelMinutes = (travelTime?: string): number => {
    if (!travelTime) return 0;
    const match = travelTime.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

// Map container style
const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

// Dark map style
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];

export default function MapTimelineView({ schedule, selectedDay = 1 }: MapTimelineViewProps) {
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [currentDay, setCurrentDay] = useState(selectedDay);
    const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

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

    // Calculate map center
    const mapCenter = useMemo(() => {
        if (locationsWithCoords.length === 0) {
            return { lat: 13.7563, lng: 100.5018 }; // Bangkok default
        }
        const avgLat = locationsWithCoords.reduce((sum, loc) => sum + loc.coords!.lat, 0) / locationsWithCoords.length;
        const avgLng = locationsWithCoords.reduce((sum, loc) => sum + loc.coords!.lng, 0) / locationsWithCoords.length;
        return { lat: avgLat, lng: avgLng };
    }, [locationsWithCoords]);

    // Polyline path
    const polylinePath = useMemo(() => {
        return locationsWithCoords.map(loc => ({
            lat: loc.coords!.lat,
            lng: loc.coords!.lng,
        }));
    }, [locationsWithCoords]);

    // Fit bounds when locations change
    useEffect(() => {
        if (map && locationsWithCoords.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            locationsWithCoords.forEach(loc => {
                bounds.extend({ lat: loc.coords!.lat, lng: loc.coords!.lng });
            });
            map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
        }
    }, [map, locationsWithCoords]);

    // Handle marker click
    const handleMarkerClick = (index: number) => {
        setFocusedIndex(index);
        setSelectedMarker(index);
        if (navigator.vibrate) navigator.vibrate(10);
    };

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

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    // Progress
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

            {/* Google Map */}
            <div className="mx-4 rounded-2xl overflow-hidden shadow-xl h-[220px] shrink-0">
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={13}
                        onLoad={onLoad}
                        options={{
                            styles: darkMapStyle,
                            disableDefaultUI: true,
                            zoomControl: true,
                            gestureHandling: 'greedy',
                        }}
                    >
                        {/* Route Polyline */}
                        {polylinePath.length > 1 && (
                            <Polyline
                                path={polylinePath}
                                options={{
                                    strokeColor: '#F43F5E',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 4,
                                }}
                            />
                        )}

                        {/* Markers */}
                        {locationsWithCoords.map((loc, i) => (
                            <Marker
                                key={loc.id}
                                position={{ lat: loc.coords!.lat, lng: loc.coords!.lng }}
                                label={{
                                    text: String(i + 1),
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                                icon={{
                                    path: google.maps.SymbolPath.CIRCLE,
                                    scale: i === focusedIndex ? 16 : 12,
                                    fillColor: i === focusedIndex ? '#F43F5E' : '#6366F1',
                                    fillOpacity: 1,
                                    strokeColor: 'white',
                                    strokeWeight: 2,
                                }}
                                onClick={() => handleMarkerClick(i)}
                            />
                        ))}

                        {/* InfoWindow */}
                        {selectedMarker !== null && locationsWithCoords[selectedMarker] && (
                            <InfoWindow
                                position={{
                                    lat: locationsWithCoords[selectedMarker].coords!.lat,
                                    lng: locationsWithCoords[selectedMarker].coords!.lng,
                                }}
                                onCloseClick={() => setSelectedMarker(null)}
                            >
                                <div className="p-2">
                                    <p className="font-bold text-sm">{locationsWithCoords[selectedMarker].title}</p>
                                    <p className="text-xs text-gray-600">{locationsWithCoords[selectedMarker].time}</p>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </LoadScript>

                {/* Open Route Button Overlay */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={openFullRoute}
                    className="absolute bottom-16 left-8 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg z-10"
                >
                    <span className="material-symbols-outlined text-[16px] text-charcoal">directions</span>
                    <span className="text-[11px] font-medium text-charcoal">完整路線</span>
                </motion.button>
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
                            onClick={() => {
                                setFocusedIndex(index);
                                if (coords && map) {
                                    map.panTo({ lat: coords.lat, lng: coords.lng });
                                    map.setZoom(15);
                                }
                            }}
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
