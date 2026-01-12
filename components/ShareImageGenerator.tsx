// ShareImageGenerator.tsx - Generate beautiful trip summary cards for social sharing
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleItem } from '../types';

interface ShareImageGeneratorProps {
    schedule: ScheduleItem[];
    tripName: string;
    dateRange: string;
}

export default function ShareImageGenerator({ schedule, tripName, dateRange }: ShareImageGeneratorProps) {
    const [showModal, setShowModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateImage = async () => {
        setIsGenerating(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Canvas size for Instagram story (1080x1920)
        canvas.width = 1080;
        canvas.height = 1920;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f97316');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add decorative circles
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(100, 200, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(980, 1700, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`✈️ ${tripName}`, canvas.width / 2, 200);

        // Date range
        ctx.font = '36px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(dateRange, canvas.width / 2, 270);

        // Stats section
        const totalDays = new Set(schedule.map(s => s.date)).size;
        const totalActivities = schedule.length;
        const categories = new Set(schedule.map(s => s.type)).size;

        const stats = [
            { label: '天數', value: `${totalDays}天`, icon: '📅' },
            { label: '行程', value: `${totalActivities}項`, icon: '📍' },
            { label: '類別', value: `${categories}種`, icon: '🎯' },
        ];

        let statsY = 400;
        ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
        stats.forEach((stat, i) => {
            const x = canvas.width / 4 + (i * canvas.width / 4);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(x - 100, statsY - 60, 200, 130, 20);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillText(stat.icon, x, statsY - 10);
            ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
            ctx.fillText(stat.value, x, statsY + 40);
            ctx.font = '28px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(stat.label, x, statsY + 80);
            ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
        });

        // Highlights section
        ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('🔥 精選行程', 80, 650);

        // Draw schedule items
        const highlights = schedule.slice(0, 6);
        let itemY = 720;

        for (const item of highlights) {
            // Card background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.roundRect(60, itemY, canvas.width - 120, 140, 20);
            ctx.fill();

            // Time badge
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.roundRect(80, itemY + 20, 120, 40, 10);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px monospace';
            ctx.fillText(item.time, 100, itemY + 48);

            // Title
            ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#ffffff';
            const title = item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title;
            ctx.fillText(title, 220, itemY + 50);

            // Location
            if (item.location) {
                ctx.font = '24px system-ui, -apple-system, sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText(`📍 ${item.location}`, 220, itemY + 90);
            }

            // Type icon
            const typeEmojis: Record<string, string> = {
                restaurant: '🍜',
                flight: '✈️',
                hotel: '🏨',
                camera: '📸',
                attraction: '🎡',
                spa: '💆',
                shopping_bag: '🛍️',
                coffee: '☕',
                activity: '🎯',
                transport: '🚗',
                accommodation: '🏠',
                dining: '🍽️',
            };
            ctx.font = '40px system-ui, -apple-system, sans-serif';
            ctx.fillText(typeEmojis[item.type] || '📌', canvas.width - 120, itemY + 70);

            itemY += 160;
        }

        // Footer
        ctx.textAlign = 'center';
        ctx.font = '28px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('📱 Created with Tour App', canvas.width / 2, canvas.height - 100);

        // Watermark
        ctx.font = '24px system-ui, -apple-system, sans-serif';
        ctx.fillText('掃描 QR Code 下載行程', canvas.width / 2, canvas.height - 50);

        // Convert to image
        const imageUrl = canvas.toDataURL('image/png', 1.0);
        setGeneratedImage(imageUrl);
        setIsGenerating(false);
    };

    const downloadImage = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `${tripName}_行程分享.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareImage = async () => {
        if (!generatedImage) return;

        try {
            // Convert data URL to blob
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const file = new File([blob], `${tripName}_行程.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: tripName,
                    text: `來看看我的${tripName}行程！`,
                    files: [file],
                });
            } else {
                // Fallback to download
                downloadImage();
            }
        } catch (error) {
            console.error('Share failed:', error);
            downloadImage();
        }
    };

    return (
        <>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowModal(true); generateImage(); }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-pill text-white shadow-mag"
            >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span className="text-[13px] font-medium">分享圖卡</span>
            </motion.button>

            {/* Hidden canvas for image generation */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-black/60 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-4 right-4 top-10 bottom-10 bg-white rounded-mag-xl z-50 overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b border-black/5">
                                <h3 className="text-[18px] font-bold text-charcoal">分享行程圖卡</h3>
                                <button onClick={() => setShowModal(false)}>
                                    <span className="material-symbols-outlined text-stone">close</span>
                                </button>
                            </div>

                            {/* Preview */}
                            <div className="flex-1 overflow-auto p-4 bg-stone/5">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-stone">正在生成精美圖卡...</p>
                                    </div>
                                ) : generatedImage ? (
                                    <img
                                        src={generatedImage}
                                        alt="Trip summary"
                                        className="w-full max-w-xs mx-auto rounded-mag shadow-mag-hover"
                                    />
                                ) : null}
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-black/5 space-y-3">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={shareImage}
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-mag font-semibold flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">share</span>
                                    分享到社群
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={downloadImage}
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-white border border-black/10 text-charcoal rounded-mag font-semibold flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                    下載圖片
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
