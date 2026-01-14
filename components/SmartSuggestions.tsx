import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Suggestion {
    id: string;
    title: string;
    reason: string;  // AI Reasoning
    icon: string;
    color: string;
    action: () => void;
}

export default function SmartSuggestions({ onAdd }: { onAdd: (item: any) => void }) {
    const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

    useEffect(() => {
        // Mock AI Logic: Analyze time of day
        const hour = new Date().getHours();
        let newSuggestion: Suggestion | null = null;

        if (hour >= 6 && hour < 10) {
            newSuggestion = {
                id: 'coffee-morning',
                title: '需要咖啡嗎？',
                reason: 'AI 發現您早晨行程較滿',
                icon: 'coffee',
                color: 'bg-orange-500',
                action: () => onAdd({ title: 'Morning Coffee', type: 'dining', time: '09:30' })
            };
        } else if (hour >= 11 && hour < 14) {
            newSuggestion = {
                id: 'lunch-break',
                title: '附近的高評分午餐',
                reason: '基於您的位置 (Siam)',
                icon: 'restaurant',
                color: 'bg-red-500',
                action: () => onAdd({ title: 'Siam Paragon Food Hall', type: 'dining', time: '12:30' })
            };
        } else if (hour >= 18) {
            newSuggestion = {
                id: 'bar-night',
                title: '體驗曼谷夜生活',
                reason: '您的行程在 20:00 後有空檔',
                icon: 'local_bar',
                color: 'bg-indigo-500',
                action: () => onAdd({ title: 'Rooftop Bar Experience', type: 'activity', time: '21:00' })
            };
        }

        setSuggestion(newSuggestion);
    }, []);

    if (!suggestion) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 mb-6 p-1 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-[1px] shadow-mag"
        >
            <div className="bg-white rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${suggestion.color} flex items-center justify-center text-white shrink-0`}>
                        <span className="material-symbols-outlined">{suggestion.icon}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                                ✨ AI Suggestion
                            </span>
                        </div>
                        <h3 className="font-bold text-charcoal text-sm">{suggestion.title}</h3>
                        <p className="text-[10px] text-stone">{suggestion.reason}</p>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={suggestion.action}
                    className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-medium"
                >
                    查看
                </motion.button>
            </div>
        </motion.div>
    );
}
