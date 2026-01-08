import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ScheduleItem } from '../types';
import notificationService from '../services/NotificationService';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons by activity type
const createCustomIcon = (type: string, isActive: boolean) => {
    const colors: Record<string, string> = {
        restaurant: '#F97316',
        attraction: '#8B5CF6',
        transport: '#3B82F6',
        shopping: '#EC4899',
        accommodation: '#10B981',
        coffee: '#78350F',
        spa: '#06B6D4',
        flight: '#6366F1',
        default: '#6B7280'
    };

    const color = colors[type] || colors.default;
    const size = isActive ? 36 : 28;

    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        ${isActive ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        <span style="color: white; font-size: ${isActive ? 16 : 12}px;">
          ${isActive ? '📍' : ''}
        </span>
      </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
};

// Component to fly to a location
function FlyToLocation({ position }: { position: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 0.8 });
        }
    }, [position, map]);

    return null;
}

interface MapTimelineViewProps {
    schedule: ScheduleItem[];
    selectedDay?: number;
}

// Sample coordinates for Bangkok locations (simulated)
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
    // Add some randomness for variety
    const defaultCoords = locationCoordinates.default;
    return [
        defaultCoords[0] + (Math.random() - 0.5) * 0.02,
        defaultCoords[1] + (Math.random() - 0.5) * 0.02,
    ];
};

export default function MapTimelineView({ schedule, selectedDay = 1 }: MapTimelineViewProps) {
    const [activeItemId, setActiveItemId] = useState<number | null>(null);
    const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Get today's activities
    const dayDates = useMemo(() => {
        const dates = [...new Set(schedule.map(s => s.date))].sort();
        return dates;
    }, [schedule]);

    const currentDate = dayDates[selectedDay - 1];
    const todaySchedule = useMemo(() => {
        return schedule
            .filter(item => item.date === currentDate)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [schedule, currentDate]);

    // Create markers with coordinates
    const markers = useMemo(() => {
        return todaySchedule
            .filter(item => item.location)
            .map(item => ({
                ...item,
                coords: getLocationCoords(item.location),
            }));
    }, [todaySchedule]);

    // Route polyline
    const routePositions = useMemo(() => {
        return markers.map(m => m.coords);
    }, [markers]);

    // Center map on first marker or Bangkok
    const mapCenter = useMemo(() => {
        if (markers.length > 0) {
            const lats = markers.map(m => m.coords[0]);
            const lngs = markers.map(m => m.coords[1]);
            return [
                (Math.min(...lats) + Math.max(...lats)) / 2,
                (Math.min(...lngs) + Math.max(...lngs)) / 2,
            ] as [number, number];
        }
        return locationCoordinates.default;
    }, [markers]);

    // Handle timeline item click
    const handleItemClick = (item: ScheduleItem) => {
        setActiveItemId(item.id);
        const coords = getLocationCoords(item.location);
        setFlyToPosition(coords);

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);
    };

    // Schedule smart commute reminders
    useEffect(() => {
        if (notificationService.getPermissionStatus() !== 'granted') return;

        const reminderMinutes = parseInt(localStorage.getItem('tourapp_reminder_minutes') || '30');

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
                        { tag: 'commute-reminder', renotify: true }
                    );
                }
            }
        });
    }, [todaySchedule]);

    // Get type icon
    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            restaurant: '🍽️',
            attraction: '🏛️',
            transport: '🚗',
            shopping: '🛍️',
            accommodation: '🏨',
            coffee: '☕',
            spa: '💆',
            flight: '✈️',
        };
        return icons[type] || '📍';
    };

    return (
        <div className="h-full flex flex-col bg-ios-bg">
            {/* Map Section (40%) */}
            <div className="h-[40%] relative">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    className="h-full w-full z-0"
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Route Polyline */}
                    {routePositions.length > 1 && (
                        <Polyline
                            positions={routePositions}
                            pathOptions={{
                                color: '#3B82F6',
                                weight: 3,
                                opacity: 0.7,
                                dashArray: '10, 10',
                            }}
                        />
                    )}

                    {/* Markers */}
                    {markers.map((item, index) => (
                        <Marker
                            key={item.id}
                            position={item.coords}
                            icon={createCustomIcon(item.type, item.id === activeItemId)}
                            eventHandlers={{
                                click: () => handleItemClick(item),
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                                    <p className="font-bold text-sm">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <FlyToLocation position={flyToPosition} />
                </MapContainer>

                {/* Day Selector Overlay */}
                <div className="absolute top-3 left-3 z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                        <p className="text-[11px] text-stone uppercase tracking-wide">Day {selectedDay}</p>
                        <p className="text-[14px] font-bold text-charcoal">{currentDate}</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-3 right-3 z-10 flex gap-1">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm text-[10px] text-stone flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        路線
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm text-[10px] text-stone flex items-center gap-1">
                        <span>📍</span>
                        景點
                    </div>
                </div>
            </div>

            {/* Timeline Section (60%) */}
            <div
                ref={timelineRef}
                className="flex-1 overflow-y-auto bg-white rounded-t-[28px] -mt-5 relative z-10 shadow-lg"
            >
                <div className="sticky top-0 bg-white pt-3 pb-2 z-20">
                    <div className="w-12 h-1.5 bg-stone/20 rounded-full mx-auto" />
                </div>

                <div className="px-4 pb-safe">
                    <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
                        <span>🗓️</span>
                        今日行程
                        <span className="text-[13px] font-normal text-stone">({todaySchedule.length} 個活動)</span>
                    </h2>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-stone/20" />

                        {/* Timeline Items */}
                        <div className="space-y-4">
                            {todaySchedule.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleItemClick(item)}
                                    className={`relative flex gap-4 cursor-pointer ${item.id === activeItemId ? 'scale-[1.02]' : ''
                                        }`}
                                >
                                    {/* Timeline Dot */}
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 z-10 shadow-md ${item.id === activeItemId
                                            ? 'bg-blue-500 ring-4 ring-blue-500/30'
                                            : item.completed
                                                ? 'bg-green-500'
                                                : 'bg-white border-2 border-stone/20'
                                        }`}>
                                        {item.completed ? '✓' : getTypeIcon(item.type)}
                                    </div>

                                    {/* Content Card */}
                                    <div className={`flex-1 p-4 rounded-xl transition-all ${item.id === activeItemId
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : 'bg-gray-50 border border-transparent'
                                        }`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[12px] font-mono px-2 py-0.5 rounded-full ${item.id === activeItemId
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-charcoal text-white'
                                                }`}>
                                                {item.time}
                                            </span>
                                            {item.travelTime && (
                                                <span className="text-[11px] text-stone bg-white px-2 py-0.5 rounded-full">
                                                    {item.travelTime}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={`text-[15px] font-semibold mb-1 ${item.completed ? 'text-stone line-through' : 'text-charcoal'
                                            }`}>
                                            {item.title}
                                        </h3>

                                        {item.location && (
                                            <p className="text-[12px] text-stone flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                {item.location}
                                            </p>
                                        )}

                                        {item.desc && (
                                            <p className="text-[12px] text-stone mt-1 line-clamp-1">{item.desc}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {todaySchedule.length === 0 && (
                        <div className="text-center py-12">
                            <span className="text-4xl">🗺️</span>
                            <p className="text-stone mt-2">今日沒有行程安排</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for pulse animation */}
            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
        </div>
    );
}
