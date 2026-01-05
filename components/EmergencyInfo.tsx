import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const emergencyContacts = [
  { icon: '🚨', name: '泰國報警', number: '191', desc: '緊急報案' },
  { icon: '🚑', name: '急救電話', number: '1669', desc: '醫療緊急' },
  { icon: '👮', name: '觀光警察', number: '1155', desc: '24小時中英泰語服務' },
  { icon: '🏥', name: 'Bumrungrad 醫院', number: '+66-2-066-8888', desc: '國際醫療中心' },
  { icon: '🇹🇼', name: '台灣駐泰代表處', number: '+66-2-119-3555', desc: '護照遺失/緊急協助' },
  { icon: '🏦', name: '信用卡掛失', number: '', desc: '各銀行不同' },
];

const usefulInfo = [
  { title: '護照遺失處理', content: '1. 報警取得報案證明\n2. 至代表處申請臨時護照\n3. 需：照片2張、報案證明、機票' },
  { title: '錢包遺失處理', content: '1. 立即掛失信用卡\n2. 報警取得證明\n3. 聯繫保險公司' },
  { title: '醫療緊急', content: '1. 撥打 1669\n2. 前往 Bumrungrad 或 Bangkok Hospital\n3. 保留收據供保險理賠' },
  { title: '常用泰語', content: '救命 = ช่วยด้วย (Chuay duay)\n警察 = ตำรวจ (Tam ruat)\n醫院 = โรงพยาบาล (Rong pa ya ban)' },
];

export default function EmergencyInfo({ isOpen, onClose }: EmergencyInfoProps) {
  const [selectedInfo, setSelectedInfo] = useState<typeof usefulInfo[0] | null>(null);

  const handleCall = (number: string) => {
    if (number) {
      window.open(`tel:${number}`, '_self');
    }
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
            className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-charcoal rounded-t-[24px] z-50 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
            </div>
            
            <div className="px-5 pb-2 flex-shrink-0 border-b border-black/5 dark:border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[24px]">🆘</span>
                  <h2 className="text-[18px] font-bold text-charcoal dark:text-white">緊急資訊</h2>
                </div>
                <button onClick={onClose} className="text-stone text-[14px]">關閉</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-safe">
              {/* Emergency Contacts */}
              <div className="py-4">
                <p className="text-[12px] font-semibold text-charcoal dark:text-white mb-3">📞 緊急聯絡</p>
                <div className="grid grid-cols-2 gap-2">
                  {emergencyContacts.map((contact, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCall(contact.number)}
                      className="bg-white dark:bg-black/20 rounded-mag p-3 text-left shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[18px]">{contact.icon}</span>
                        <span className="text-[12px] font-semibold text-charcoal dark:text-white">{contact.name}</span>
                      </div>
                      {contact.number && (
                        <p className="text-[14px] font-mono text-red-xhs">{contact.number}</p>
                      )}
                      <p className="text-[10px] text-stone mt-0.5">{contact.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Useful Info */}
              <div className="py-4 border-t border-black/5 dark:border-white/10">
                <p className="text-[12px] font-semibold text-charcoal dark:text-white mb-3">📋 緊急處理流程</p>
                <div className="space-y-2">
                  {usefulInfo.map((info, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedInfo(selectedInfo?.title === info.title ? null : info)}
                      className="w-full bg-white dark:bg-black/20 rounded-mag p-3 text-left shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-charcoal dark:text-white">{info.title}</span>
                        <span className={`material-symbols-outlined text-stone text-[18px] transition-transform ${
                          selectedInfo?.title === info.title ? 'rotate-180' : ''
                        }`}>
                          expand_more
                        </span>
                      </div>
                      <AnimatePresence>
                        {selectedInfo?.title === info.title && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[11px] text-stone whitespace-pre-line mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                              {info.content}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="py-4 border-t border-black/5 dark:border-white/10">
                <p className="text-[12px] font-semibold text-charcoal dark:text-white mb-3">💡 重要提醒</p>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-mag p-3 space-y-2">
                  <p className="text-[11px] text-amber-800 dark:text-amber-200">• 隨身攜帶護照影本</p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-200">• 記下飯店地址（泰文）</p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-200">• 保存緊急聯絡人電話</p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-200">• 購買旅遊保險</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
