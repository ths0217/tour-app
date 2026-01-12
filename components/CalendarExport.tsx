// CalendarExport.tsx - Export schedule to .ics format for Google/Apple Calendar
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

interface CalendarExportProps {
    schedule: ScheduleItem[];
    tripName: string;
}

// Generate ICS format date (YYYYMMDDTHHMMSS)
const formatICSDate = (date: string, time: string): string => {
    const d = new Date(`${date}T${time}:00`);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}00`;
};

// Generate ICS file content
const generateICS = (schedule: ScheduleItem[], tripName: string): string => {
    const now = new Date();
    const timestamp = formatICSDate(now.toISOString().split('T')[0], now.toTimeString().slice(0, 5));

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tour App//Bangkok Trip//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${tripName}
X-WR-TIMEZONE:Asia/Bangkok
`;

    schedule.forEach((item, index) => {
        // Estimate duration based on activity type
        const durationHours: Record<string, number> = {
            restaurant: 1.5,
            flight: 3,
            hotel: 1,
            camera: 1,
            attraction: 2,
            spa: 2,
            shopping_bag: 1.5,
            coffee: 0.75,
        };
        const duration = durationHours[item.type] || 1;

        // Calculate end time
        const startDate = new Date(`${item.date}T${item.time}:00`);
        const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
        const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

        const startICS = formatICSDate(item.date, item.time);
        const endICS = formatICSDate(item.date, endTime);

        // Escape special characters for ICS
        const escapeICS = (str: string) => str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');

        const description = [
            item.desc,
            item.location ? `📍 ${item.location}` : '',
            item.travelTime ? `🚗 ${item.travelTime}` : '',
            item.estimatedCost ? `💰 ฿${item.estimatedCost}` : '',
            item.notes ? `📝 ${item.notes}` : '',
        ].filter(Boolean).join('\\n');

        icsContent += `BEGIN:VEVENT
UID:tour-app-${item.id}-${index}@bangkok-trip
DTSTAMP:${timestamp}
DTSTART;TZID=Asia/Bangkok:${startICS}
DTEND;TZID=Asia/Bangkok:${endICS}
SUMMARY:${escapeICS(item.title)}
DESCRIPTION:${escapeICS(description)}
${item.location ? `LOCATION:${escapeICS(item.location)}, Bangkok, Thailand` : ''}
STATUS:${item.completed ? 'COMPLETED' : 'CONFIRMED'}
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
};

export default function CalendarExport({ schedule, tripName }: CalendarExportProps) {
    const [showModal, setShowModal] = useState(false);
    const [exported, setExported] = useState(false);

    const handleExport = (type: 'download' | 'google' | 'apple') => {
        const icsContent = generateICS(schedule, tripName);

        if (type === 'download' || type === 'apple') {
            // Download ICS file
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tripName.replace(/\s+/g, '_')}_行程.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setExported(true);
        } else if (type === 'google') {
            // Open Google Calendar import page
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tripName.replace(/\s+/g, '_')}_行程.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Then open Google Calendar
            setTimeout(() => {
                window.open('https://calendar.google.com/calendar/r/settings/export', '_blank');
            }, 500);
            setExported(true);
        }

        setTimeout(() => setExported(false), 3000);
    };

    return (
        <>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-pill shadow-mag border border-black/5"
            >
                <span className="material-symbols-outlined text-[18px] text-indigo-500">calendar_add_on</span>
                <span className="text-[13px] text-charcoal font-medium">匯出日曆</span>
            </motion.button>

            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-black/40 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-mag-xl p-6 z-50 shadow-mag-hover"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[18px] font-bold text-charcoal">匯出行程到日曆</h3>
                                <button onClick={() => setShowModal(false)}>
                                    <span className="material-symbols-outlined text-stone">close</span>
                                </button>
                            </div>

                            <p className="text-[13px] text-stone mb-6">
                                將 {schedule.length} 個行程匯出為 .ics 檔案，可匯入 Google 日曆或 Apple 日曆。
                            </p>

                            <div className="space-y-3">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleExport('google')}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-black/10 rounded-mag hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                                        <span className="text-white text-[20px]">📅</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[14px] font-semibold text-charcoal">Google 日曆</p>
                                        <p className="text-[11px] text-stone">下載 .ics 並開啟 Google Calendar</p>
                                    </div>
                                    <span className="material-symbols-outlined text-stone">chevron_right</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleExport('apple')}
                                    className="w-full flex items-center gap-4 p-4 bg-white border border-black/10 rounded-mag hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                        <span className="text-white text-[20px]">🍎</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[14px] font-semibold text-charcoal">Apple 日曆</p>
                                        <p className="text-[11px] text-stone">下載 .ics 檔案</p>
                                    </div>
                                    <span className="material-symbols-outlined text-stone">chevron_right</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleExport('download')}
                                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-mag"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white">download</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-[14px] font-semibold text-white">直接下載 .ics</p>
                                        <p className="text-[11px] text-white/70">通用格式，支援所有日曆 App</p>
                                    </div>
                                </motion.button>
                            </div>

                            {exported && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-3 bg-green-50 border border-green-200 rounded-mag flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="text-[13px] text-green-700">匯出成功！請在下載資料夾中找到檔案。</span>
                                </motion.div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
