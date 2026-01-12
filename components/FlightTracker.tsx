// FlightTracker.tsx - Track flight status in real-time
// Note: Real-time tracking requires AviationStack or FlightAware API (paid)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlightInfo {
    flightNumber: string;
    airline: string;
    airlineLogo?: string;
    departure: {
        airport: string;
        city: string;
        scheduled: string;
        actual?: string;
        terminal?: string;
        gate?: string;
    };
    arrival: {
        airport: string;
        city: string;
        scheduled: string;
        actual?: string;
        terminal?: string;
        gate?: string;
    };
    status: 'scheduled' | 'boarding' | 'departed' | 'in_air' | 'landed' | 'delayed' | 'cancelled';
    delay?: number; // minutes
    aircraft?: string;
    lastUpdated: string;
}

interface FlightTrackerProps {
    isOpen: boolean;
    onClose: () => void;
    defaultFlightNumber?: string;
}

// Mock flight data - In production, use AviationStack or FlightAware API
const mockFlights: Record<string, FlightInfo> = {
    'BR206': {
        flightNumber: 'BR206',
        airline: 'EVA Air',
        departure: {
            airport: 'TPE',
            city: '台北桃園',
            scheduled: '13:50',
            actual: '13:55',
            terminal: '2',
            gate: 'D5',
        },
        arrival: {
            airport: 'BKK',
            city: '曼谷',
            scheduled: '16:45',
            actual: '16:50',
            terminal: '1',
            gate: 'C3',
        },
        status: 'in_air',
        delay: 5,
        aircraft: 'Boeing 777-300ER',
        lastUpdated: new Date().toLocaleTimeString('zh-TW'),
    },
    'TG635': {
        flightNumber: 'TG635',
        airline: 'Thai Airways',
        departure: {
            airport: 'BKK',
            city: '曼谷',
            scheduled: '08:30',
            terminal: '1',
            gate: 'D7',
        },
        arrival: {
            airport: 'TPE',
            city: '台北桃園',
            scheduled: '13:00',
            terminal: '1',
        },
        status: 'scheduled',
        aircraft: 'Airbus A350-900',
        lastUpdated: new Date().toLocaleTimeString('zh-TW'),
    },
};

const statusConfig = {
    scheduled: { label: '準時', color: 'bg-green-100 text-green-700', icon: 'schedule' },
    boarding: { label: '登機中', color: 'bg-blue-100 text-blue-700', icon: 'airline_seat_recline_normal' },
    departed: { label: '已起飛', color: 'bg-indigo-100 text-indigo-700', icon: 'flight_takeoff' },
    in_air: { label: '飛行中', color: 'bg-purple-100 text-purple-700', icon: 'flight' },
    landed: { label: '已降落', color: 'bg-green-100 text-green-700', icon: 'flight_land' },
    delayed: { label: '延誤', color: 'bg-amber-100 text-amber-700', icon: 'schedule' },
    cancelled: { label: '取消', color: 'bg-red-100 text-red-700', icon: 'cancel' },
};

export default function FlightTracker({ isOpen, onClose, defaultFlightNumber }: FlightTrackerProps) {
    const [flightNumber, setFlightNumber] = useState(defaultFlightNumber || '');
    const [flightInfo, setFlightInfo] = useState<FlightInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedFlights, setSavedFlights] = useState<string[]>(() => {
        const saved = localStorage.getItem('tourapp_tracked_flights');
        return saved ? JSON.parse(saved) : ['BR206'];
    });

    // Auto-refresh every 5 minutes when tracking
    useEffect(() => {
        if (!flightInfo) return;

        const interval = setInterval(() => {
            trackFlight(flightInfo.flightNumber);
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [flightInfo]);

    const trackFlight = async (number: string) => {
        if (!number.trim()) return;

        setIsLoading(true);
        setError(null);

        const normalizedNumber = number.toUpperCase().replace(/\s/g, '');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In production, this would call the real API:
        // const response = await fetch(`/api/flights/${normalizedNumber}`);
        // const data = await response.json();

        const mockFlight = mockFlights[normalizedNumber];

        if (mockFlight) {
            setFlightInfo({
                ...mockFlight,
                lastUpdated: new Date().toLocaleTimeString('zh-TW'),
            });

            // Save to tracked flights
            if (!savedFlights.includes(normalizedNumber)) {
                const updated = [normalizedNumber, ...savedFlights.slice(0, 4)];
                setSavedFlights(updated);
                localStorage.setItem('tourapp_tracked_flights', JSON.stringify(updated));
            }
        } else {
            setError(`找不到航班 ${normalizedNumber}`);
            setFlightInfo(null);
        }

        setIsLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        trackFlight(flightNumber);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 z-50"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-mag-xl z-50 max-h-[90vh] overflow-hidden pb-safe"
                    >
                        <div className="sticky top-0 bg-white pt-3 pb-2 border-b border-black/5">
                            <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto mb-3" />
                            <div className="flex justify-between items-center px-5">
                                <h3 className="text-[18px] font-bold text-charcoal">✈️ 航班追蹤</h3>
                                <button onClick={handleClose}>
                                    <span className="material-symbols-outlined text-stone">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[75vh]">
                            {/* Search Form */}
                            <form onSubmit={handleSubmit} className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={flightNumber}
                                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                        placeholder="輸入航班號碼 (如 BR206)"
                                        className="flex-1 px-4 py-3 rounded-mag border border-black/10 text-[14px] text-charcoal bg-stone/5 outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-indigo-500 text-white rounded-mag font-semibold disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <span className="material-symbols-outlined">search</span>
                                        )}
                                    </motion.button>
                                </div>
                            </form>

                            {/* Quick Access */}
                            {savedFlights.length > 0 && !flightInfo && (
                                <div className="mb-4">
                                    <p className="text-[12px] text-stone mb-2">最近追蹤</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {savedFlights.map(fn => (
                                            <motion.button
                                                key={fn}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setFlightNumber(fn); trackFlight(fn); }}
                                                className="px-3 py-1.5 bg-stone/5 rounded-pill text-[13px] text-charcoal font-mono"
                                            >
                                                {fn}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-mag p-4 mb-4">
                                    <p className="text-[13px] text-red-700">{error}</p>
                                    <p className="text-[11px] text-red-500 mt-1">
                                        提示：試試 BR206 或 TG635
                                    </p>
                                </div>
                            )}

                            {/* Flight Info */}
                            {flightInfo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Header */}
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-mag p-4 text-white">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[12px] text-white/70">{flightInfo.airline}</p>
                                                <p className="text-[24px] font-bold">{flightInfo.flightNumber}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-pill ${statusConfig[flightInfo.status].color} text-[12px] font-medium`}>
                                                {statusConfig[flightInfo.status].label}
                                                {flightInfo.delay && flightInfo.delay > 0 && ` (+${flightInfo.delay}分)`}
                                            </div>
                                        </div>
                                        {flightInfo.aircraft && (
                                            <p className="text-[11px] text-white/60">✈️ {flightInfo.aircraft}</p>
                                        )}
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-4">
                                        {/* Departure */}
                                        <div className="flex-1 text-center">
                                            <p className="text-[32px] font-bold text-charcoal">{flightInfo.departure.airport}</p>
                                            <p className="text-[12px] text-stone">{flightInfo.departure.city}</p>
                                            <div className="mt-2 bg-stone/5 rounded-mag p-2">
                                                <p className="text-[11px] text-stone">預定</p>
                                                <p className="text-[18px] font-semibold text-charcoal font-mono">{flightInfo.departure.scheduled}</p>
                                                {flightInfo.departure.actual && flightInfo.departure.actual !== flightInfo.departure.scheduled && (
                                                    <p className="text-[12px] text-amber-600 font-mono">實際 {flightInfo.departure.actual}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex flex-col items-center">
                                            <span className="material-symbols-outlined text-indigo-500 text-[28px]">
                                                {flightInfo.status === 'in_air' ? 'flight' : 'arrow_forward'}
                                            </span>
                                            {flightInfo.status === 'in_air' && (
                                                <span className="text-[10px] text-stone">飛行中</span>
                                            )}
                                        </div>

                                        {/* Arrival */}
                                        <div className="flex-1 text-center">
                                            <p className="text-[32px] font-bold text-charcoal">{flightInfo.arrival.airport}</p>
                                            <p className="text-[12px] text-stone">{flightInfo.arrival.city}</p>
                                            <div className="mt-2 bg-stone/5 rounded-mag p-2">
                                                <p className="text-[11px] text-stone">預定</p>
                                                <p className="text-[18px] font-semibold text-charcoal font-mono">{flightInfo.arrival.scheduled}</p>
                                                {flightInfo.arrival.actual && flightInfo.arrival.actual !== flightInfo.arrival.scheduled && (
                                                    <p className="text-[12px] text-amber-600 font-mono">實際 {flightInfo.arrival.actual}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gate Info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {flightInfo.departure.gate && (
                                            <div className="bg-stone/5 rounded-mag p-3">
                                                <p className="text-[11px] text-stone mb-1">出發登機門</p>
                                                <p className="text-[20px] font-bold text-charcoal">
                                                    {flightInfo.departure.terminal && `T${flightInfo.departure.terminal} • `}
                                                    Gate {flightInfo.departure.gate}
                                                </p>
                                            </div>
                                        )}
                                        {flightInfo.arrival.gate && (
                                            <div className="bg-stone/5 rounded-mag p-3">
                                                <p className="text-[11px] text-stone mb-1">到達登機門</p>
                                                <p className="text-[20px] font-bold text-charcoal">
                                                    {flightInfo.arrival.terminal && `T${flightInfo.arrival.terminal} • `}
                                                    Gate {flightInfo.arrival.gate}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Last Updated */}
                                    <div className="text-center py-2">
                                        <p className="text-[11px] text-stone">
                                            🔄 最後更新: {flightInfo.lastUpdated}
                                        </p>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => trackFlight(flightInfo.flightNumber)}
                                            className="mt-2 text-[12px] text-indigo-500 font-medium"
                                        >
                                            點擊刷新
                                        </motion.button>
                                    </div>

                                    {/* Enable Notifications */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-mag p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-blue-500">notifications</span>
                                            <div className="flex-1">
                                                <p className="text-[13px] font-medium text-blue-700">開啟航班通知</p>
                                                <p className="text-[11px] text-blue-600">延誤、登機門變更即時提醒</p>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    if ('Notification' in window) {
                                                        Notification.requestPermission();
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-mag text-[12px] font-medium"
                                            >
                                                開啟
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Demo Notice */}
                            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-mag p-3">
                                <p className="text-[11px] text-amber-700">
                                    ⚠️ 這是展示版本，使用模擬數據。整合真實航班追蹤需要 AviationStack 或 FlightAware API 訂閱。
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
