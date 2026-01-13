import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showRestored, setShowRestored] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowRestored(true);
            setTimeout(() => setShowRestored(false), 3000);
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-0 left-0 right-0 z-[100] bg-charcoal text-white text-center py-2 text-mag-badge safe-top"
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">wifi_off</span>
                        <span>離線模式 - 仍可瀏覽已儲存的行程</span>
                    </div>
                </motion.div>
            )}
            {showRestored && isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-0 left-0 right-0 z-[100] bg-green-500 text-white text-center py-2 text-mag-badge safe-top"
                >
                    <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">wifi</span>
                        <span>網路已恢復</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
