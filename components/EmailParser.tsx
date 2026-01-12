// EmailParser.tsx - Parse booking emails and extract travel information
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

interface ParsedBooking {
    type: 'flight' | 'hotel' | 'restaurant' | 'activity' | 'transport';
    title: string;
    date: string;
    time: string;
    location?: string;
    confirmationCode?: string;
    details?: string;
    confidence: number;
}

interface EmailParserProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItems: (items: Omit<ScheduleItem, 'id'>[]) => void;
}

// Email parsing patterns
const parseEmailContent = (text: string): ParsedBooking[] => {
    const results: ParsedBooking[] = [];
    const textLower = text.toLowerCase();

    // Detect email type
    const isFlightEmail = textLower.includes('flight') || textLower.includes('航班') ||
        textLower.includes('boarding') || textLower.includes('itinerary') ||
        textLower.includes('eva air') || textLower.includes('thai airways');

    const isHotelEmail = textLower.includes('reservation') || textLower.includes('check-in') ||
        textLower.includes('hotel') || textLower.includes('飯店') ||
        textLower.includes('agoda') || textLower.includes('booking.com');

    const isRestaurantEmail = textLower.includes('restaurant') || textLower.includes('餐廳') ||
        textLower.includes('dinner') || textLower.includes('lunch') ||
        textLower.includes('opentable') || textLower.includes('chope');

    // Extract dates
    const datePatterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi,
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/gi,
    ];

    let foundDate = '';
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            foundDate = match[0];
            break;
        }
    }

    // Extract times
    const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/g;
    const times = text.match(timePattern) || [];

    // Extract confirmation codes
    const confirmPattern = /(?:confirmation|booking|reference|訂單|預訂)[:\s#]*([A-Z0-9]{5,12})/gi;
    const confirmMatch = text.match(confirmPattern);
    const confirmationCode = confirmMatch ? confirmMatch[0].split(/[:\s#]+/).pop() : undefined;

    // Flight parsing
    if (isFlightEmail) {
        // Extract flight numbers
        const flightPattern = /([A-Z]{2})\s*(\d{3,4})/g;
        const flights = text.match(flightPattern) || [];

        // Extract airports
        const airportPattern = /([A-Z]{3})\s*(?:→|->|to|-)\s*([A-Z]{3})/gi;
        const routeMatch = text.match(airportPattern);

        if (flights.length > 0 || routeMatch) {
            results.push({
                type: 'flight',
                title: flights[0] ? `航班 ${flights[0]}` : '機票預訂',
                date: foundDate || '2025-01-27',
                time: times[0] || '12:00',
                location: routeMatch ? routeMatch[0] : undefined,
                confirmationCode,
                details: `確認碼: ${confirmationCode || 'N/A'}`,
                confidence: 0.8,
            });
        }
    }

    // Hotel parsing
    if (isHotelEmail) {
        // Extract hotel name
        const hotelPatterns = [
            /(?:Hotel|Resort|Inn|Suites?)[\s:]*([A-Za-z\s]+)/i,
            /staying at[\s:]*([A-Za-z\s]+)/i,
            /(?:飯店|酒店)[\s:]*([^\n]+)/,
        ];

        let hotelName = '飯店預訂';
        for (const pattern of hotelPatterns) {
            const match = text.match(pattern);
            if (match) {
                hotelName = match[1].trim().substring(0, 50);
                break;
            }
        }

        results.push({
            type: 'hotel',
            title: hotelName,
            date: foundDate || '2025-01-27',
            time: times[0] || '14:00',
            confirmationCode,
            details: `入住確認: ${confirmationCode || 'N/A'}`,
            confidence: 0.75,
        });
    }

    // Restaurant parsing
    if (isRestaurantEmail) {
        const restaurantPatterns = [
            /(?:reservation at|booking at|dinner at|餐廳)[\s:]*([A-Za-z\s]+)/i,
            /restaurant[\s:]*([A-Za-z\s]+)/i,
        ];

        let restaurantName = '餐廳預訂';
        for (const pattern of restaurantPatterns) {
            const match = text.match(pattern);
            if (match) {
                restaurantName = match[1].trim().substring(0, 50);
                break;
            }
        }

        results.push({
            type: 'restaurant',
            title: restaurantName,
            date: foundDate || '2025-01-27',
            time: times[0] || '19:00',
            confirmationCode,
            details: `訂位確認: ${confirmationCode || 'N/A'}`,
            confidence: 0.7,
        });
    }

    // If nothing specific found, try generic extraction
    if (results.length === 0 && (foundDate || times.length > 0)) {
        results.push({
            type: 'activity',
            title: '預訂項目',
            date: foundDate || '2025-01-27',
            time: times[0] || '12:00',
            confirmationCode,
            confidence: 0.4,
        });
    }

    return results;
};

const typeLabels: Record<string, { icon: string; label: string; color: string }> = {
    flight: { icon: '✈️', label: '航班', color: 'from-blue-400 to-indigo-500' },
    hotel: { icon: '🏨', label: '住宿', color: 'from-amber-400 to-orange-500' },
    restaurant: { icon: '🍜', label: '餐廳', color: 'from-red-400 to-rose-500' },
    activity: { icon: '🎯', label: '活動', color: 'from-purple-400 to-violet-500' },
    transport: { icon: '🚗', label: '交通', color: 'from-green-400 to-emerald-500' },
};

export default function EmailParser({ isOpen, onClose, onAddItems }: EmailParserProps) {
    const [emailText, setEmailText] = useState('');
    const [parsedBookings, setParsedBookings] = useState<ParsedBooking[]>([]);
    const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set());
    const [step, setStep] = useState<'input' | 'results'>('input');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleParse = async () => {
        if (!emailText.trim()) return;

        setIsProcessing(true);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        const results = parseEmailContent(emailText);
        setParsedBookings(results);
        setSelectedBookings(new Set(results.map((_, i) => i)));
        setStep('results');
        setIsProcessing(false);
    };

    const toggleSelection = (index: number) => {
        setSelectedBookings(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleAddSelected = () => {
        const items = parsedBookings
            .filter((_, i) => selectedBookings.has(i))
            .map(booking => ({
                title: booking.title,
                date: booking.date,
                time: booking.time,
                type: booking.type,
                location: booking.location,
                desc: booking.details,
                completed: false,
            }));

        onAddItems(items);
        handleReset();
        onClose();
    };

    const handleReset = () => {
        setEmailText('');
        setParsedBookings([]);
        setSelectedBookings(new Set());
        setStep('input');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    // Sample email for demo
    const sampleEmail = `
Subject: Your EVA Air Flight Confirmation - BR206

Dear Passenger,

Your flight booking has been confirmed.

Flight: BR206
Route: TPE → BKK (Taipei to Bangkok)
Date: January 27, 2025
Departure: 13:50
Arrival: 16:45

Confirmation Code: EVACD123456

Please arrive at the airport 3 hours before departure.

Thank you for choosing EVA Air.
  `;

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
                                <h3 className="text-[18px] font-bold text-charcoal">📧 解析預訂郵件</h3>
                                <button onClick={handleClose}>
                                    <span className="material-symbols-outlined text-stone">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[75vh]">
                            {step === 'input' && (
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mx-auto mb-3">
                                            <span className="material-symbols-outlined text-white text-[32px]">mail</span>
                                        </div>
                                        <p className="text-[13px] text-stone">貼上機票、飯店、餐廳的確認郵件內容</p>
                                    </div>

                                    <textarea
                                        value={emailText}
                                        onChange={(e) => setEmailText(e.target.value)}
                                        placeholder="在這裡貼上郵件內容..."
                                        className="w-full h-48 p-4 rounded-mag border border-black/10 text-[14px] text-charcoal bg-stone/5 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                                    />

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setEmailText(sampleEmail)}
                                        className="w-full py-2 text-[12px] text-indigo-500 hover:bg-indigo-50 rounded-mag transition-colors"
                                    >
                                        📋 使用範例郵件測試
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleParse}
                                        disabled={!emailText.trim() || isProcessing}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-mag font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                解析中...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">search</span>
                                                解析郵件內容
                                            </>
                                        )}
                                    </motion.button>

                                    <div className="bg-blue-50 rounded-mag p-3 mt-4">
                                        <p className="text-[12px] text-blue-700">
                                            💡 支援解析：航班確認信、飯店預訂、餐廳訂位、活動票券等
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 'results' && (
                                <div className="space-y-4">
                                    {parsedBookings.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 rounded-full bg-stone/10 flex items-center justify-center mx-auto mb-3">
                                                <span className="material-symbols-outlined text-stone text-[32px]">search_off</span>
                                            </div>
                                            <p className="text-[14px] font-medium text-charcoal mb-1">找不到預訂資訊</p>
                                            <p className="text-[12px] text-stone">請確認郵件內容包含日期、時間等資訊</p>
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setStep('input')}
                                                className="mt-4 px-6 py-2 bg-stone/10 rounded-mag text-[13px] text-charcoal"
                                            >
                                                重新輸入
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[14px] font-medium text-charcoal">
                                                    找到 {parsedBookings.length} 筆預訂
                                                </p>
                                                <span className="text-[11px] text-stone">點選取消選取</span>
                                            </div>

                                            {parsedBookings.map((booking, index) => {
                                                const typeInfo = typeLabels[booking.type] || typeLabels.activity;
                                                const isSelected = selectedBookings.has(index);

                                                return (
                                                    <motion.button
                                                        key={index}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => toggleSelection(index)}
                                                        className={`w-full text-left p-4 rounded-mag border-2 transition-all ${isSelected
                                                                ? 'border-indigo-500 bg-indigo-50'
                                                                : 'border-black/5 bg-white'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-10 h-10 rounded-mag bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-[18px] flex-shrink-0`}>
                                                                {typeInfo.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[14px] font-semibold text-charcoal truncate">
                                                                        {booking.title}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 rounded-pill bg-stone/10 text-[10px] text-stone flex-shrink-0">
                                                                        {typeInfo.label}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[12px] text-stone mt-1">
                                                                    📅 {booking.date} • ⏰ {booking.time}
                                                                </p>
                                                                {booking.confirmationCode && (
                                                                    <p className="text-[11px] text-indigo-500 mt-1 font-mono">
                                                                        確認碼: {booking.confirmationCode}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                                                    ? 'border-indigo-500 bg-indigo-500'
                                                                    : 'border-stone/30'
                                                                }`}>
                                                                {isSelected && (
                                                                    <span className="material-symbols-outlined text-white text-[16px]">check</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}

                                            <div className="flex gap-3 pt-4">
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setStep('input')}
                                                    className="flex-1 py-3 bg-stone/10 text-charcoal rounded-mag font-semibold"
                                                >
                                                    返回
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleAddSelected}
                                                    disabled={selectedBookings.size === 0}
                                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-mag font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                                    加入行程 ({selectedBookings.size})
                                                </motion.button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
