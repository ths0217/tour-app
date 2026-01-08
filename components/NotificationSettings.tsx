import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from '../services/NotificationService';

interface NotificationSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
    const [permissionStatus, setPermissionStatus] = useState<string>('checking');
    const [reminderMinutes, setReminderMinutes] = useState(30);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        const status = notificationService.getPermissionStatus();
        setPermissionStatus(status);
        setNotificationsEnabled(status === 'granted');

        // Load saved reminder time
        const savedMinutes = localStorage.getItem('tourapp_reminder_minutes');
        if (savedMinutes) {
            setReminderMinutes(parseInt(savedMinutes));
        }
    }, [isOpen]);

    const handleRequestPermission = async () => {
        const granted = await notificationService.requestPermission();
        setPermissionStatus(granted ? 'granted' : 'denied');
        setNotificationsEnabled(granted);

        if (granted) {
            // Show test notification
            notificationService.showNotification(
                '🔔 通知已啟用',
                '您現在會在行程開始前收到提醒',
                { vibrate: [100, 50, 100] }
            );
        }
    };

    const handleReminderChange = (minutes: number) => {
        setReminderMinutes(minutes);
        localStorage.setItem('tourapp_reminder_minutes', minutes.toString());
    };

    const handleTestNotification = () => {
        notificationService.showNotification(
            '⏰ 測試通知',
            '這是一個測試提醒，確認通知正常運作！',
            { vibrate: [100, 50, 100] }
        );
    };

    const reminderOptions = [
        { value: 15, label: '15 分鐘前' },
        { value: 30, label: '30 分鐘前' },
        { value: 60, label: '1 小時前' },
        { value: 120, label: '2 小時前' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-50 pb-safe"
                    >
                        <div className="relative">
                            <div className="w-12 h-1.5 bg-stone/20 rounded-full mx-auto mt-3 mb-4" />

                            <div className="px-5 pb-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-charcoal">🔔 通知設定</h2>
                                    <button onClick={onClose} className="text-stone">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Permission Status */}
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[15px] font-medium text-charcoal">通知權限</span>
                                            <span className={`px-2 py-1 rounded-full text-[12px] font-medium ${permissionStatus === 'granted'
                                                    ? 'bg-green-100 text-green-700'
                                                    : permissionStatus === 'denied'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {permissionStatus === 'granted' ? '已授權'
                                                    : permissionStatus === 'denied' ? '已拒絕'
                                                        : permissionStatus === 'unsupported' ? '不支援'
                                                            : '未設定'}
                                            </span>
                                        </div>

                                        {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleRequestPermission}
                                                className="w-full mt-3 py-3 bg-charcoal text-white rounded-xl font-medium"
                                            >
                                                啟用通知
                                            </motion.button>
                                        )}

                                        {permissionStatus === 'unsupported' && (
                                            <p className="text-[13px] text-stone mt-2">
                                                您的瀏覽器不支援通知功能
                                            </p>
                                        )}
                                    </div>

                                    {/* Reminder Time */}
                                    {permissionStatus === 'granted' && (
                                        <>
                                            <div className="bg-gray-50 rounded-2xl p-4">
                                                <p className="text-[15px] font-medium text-charcoal mb-3">⏰ 提前提醒時間</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {reminderOptions.map(option => (
                                                        <motion.button
                                                            key={option.value}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleReminderChange(option.value)}
                                                            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${reminderMinutes === option.value
                                                                    ? 'bg-charcoal text-white'
                                                                    : 'bg-white text-charcoal border border-black/10'
                                                                }`}
                                                        >
                                                            {option.label}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Test Button */}
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleTestNotification}
                                                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                                                發送測試通知
                                            </motion.button>
                                        </>
                                    )}

                                    {/* Info */}
                                    <div className="bg-blue-50 rounded-xl p-3">
                                        <p className="text-[12px] text-blue-700">
                                            💡 <strong>小提示：</strong>開啟通知後，我們會在行程開始前提醒您，讓您不錯過任何活動！
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
