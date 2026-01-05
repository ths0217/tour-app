import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { ScheduleItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleItem[];
  tripName?: string;
  dateRange?: string;
}

export default function ShareModal({ isOpen, onClose, schedule, tripName = '曼谷家庭之旅', dateRange = '2025/1/27 - 2/2' }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);

  // Group schedule by date
  const scheduleByDate = schedule.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const generateImage = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#FAFAFA',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImage(dataUrl);
    } catch (error) {
      console.error('Error generating image:', error);
    }
    setIsGenerating(false);
  };

  const downloadImage = () => {
    if (!shareImage) return;
    const link = document.createElement('a');
    link.download = `${tripName}-行程表.png`;
    link.href = shareImage;
    link.click();
  };

  const shareNative = async () => {
    if (!shareImage) return;
    try {
      const blob = await (await fetch(shareImage)).blob();
      const file = new File([blob], `${tripName}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: tripName,
          text: `${tripName} 行程表 ${dateRange}`,
          files: [file],
        });
      } else {
        downloadImage();
      }
    } catch (error) {
      downloadImage();
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-[24px] z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-cream pt-3 pb-2 z-10">
              <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
            </div>
            
            <div className="px-5 pb-safe">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[18px] font-bold text-charcoal">分享行程</h2>
                <button onClick={onClose} className="text-stone text-[14px]">關閉</button>
              </div>

              {/* Preview Card */}
              {!shareImage ? (
                <div 
                  ref={cardRef}
                  className="bg-white rounded-[16px] p-5 shadow-mag mb-4"
                >
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h3 className="text-[20px] font-bold text-charcoal">{tripName}</h3>
                    <p className="text-[12px] text-stone">{dateRange}</p>
                  </div>

                  {/* Schedule Summary */}
                  <div className="space-y-3">
                    {Object.entries(scheduleByDate).slice(0, 5).map(([date, items]) => (
                      <div key={date} className="border-l-2 border-red-xhs pl-3">
                        <p className="text-[11px] font-medium text-red-xhs mb-1">{formatDate(date)}</p>
                        {items.slice(0, 3).map(item => (
                          <p key={item.id} className="text-[12px] text-charcoal">
                            {item.time} {item.title}
                          </p>
                        ))}
                        {items.length > 3 && (
                          <p className="text-[10px] text-stone">+{items.length - 3} 更多...</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-stone/10 flex items-center justify-center gap-2">
                    <span className="text-[10px] text-stone">由 曼谷探險 App 產生</span>
                    <span className="text-[16px]">✈️</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <img src={shareImage} alt="行程圖片" className="w-full rounded-[16px] shadow-mag" />
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 mb-4">
                {!shareImage ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="w-full py-3.5 bg-red-xhs text-white rounded-mag text-[14px] font-semibold flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        產生中...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">image</span>
                        產生圖片
                      </>
                    )}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={shareNative}
                      className="w-full py-3.5 bg-red-xhs text-white rounded-mag text-[14px] font-semibold flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      分享
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={downloadImage}
                      className="w-full py-3.5 bg-charcoal text-white rounded-mag text-[14px] font-semibold flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      下載圖片
                    </motion.button>
                    <button
                      onClick={() => setShareImage(null)}
                      className="w-full py-2 text-stone text-[13px]"
                    >
                      重新產生
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
