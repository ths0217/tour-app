import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TipCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const scenarios = [
  { id: 'restaurant', icon: '🍽️', name: '餐廳', tipRange: '10-15%', note: '高級餐廳建議15%' },
  { id: 'massage', icon: '💆', name: '按摩/SPA', tipRange: '50-100฿', note: '每小時50-100泰銖' },
  { id: 'taxi', icon: '🚕', name: '計程車', tipRange: '湊整數', note: '通常不需小費' },
  { id: 'hotel', icon: '🏨', name: '飯店行李', tipRange: '20-50฿', note: '每件行李20-50泰銖' },
  { id: 'guide', icon: '🧑‍🏫', name: '導遊', tipRange: '100-300฿', note: '半日100/全日300' },
  { id: 'delivery', icon: '🛵', name: '外送', tipRange: '20-40฿', note: '不強制但appreciated' },
];

export default function TipCalculator({ isOpen, onClose }: TipCalculatorProps) {
  const [amount, setAmount] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string>('restaurant');
  const [customPercent, setCustomPercent] = useState(10);

  const billAmount = parseFloat(amount) || 0;
  const scenario = scenarios.find(s => s.id === selectedScenario);

  const calculateTip = () => {
    if (selectedScenario === 'restaurant') {
      return {
        low: Math.round(billAmount * 0.10),
        mid: Math.round(billAmount * 0.12),
        high: Math.round(billAmount * 0.15),
        custom: Math.round(billAmount * (customPercent / 100)),
      };
    }
    return { low: 50, mid: 80, high: 100, custom: customPercent };
  };

  const tips = calculateTip();

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
            className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-charcoal rounded-t-[24px] z-50 max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
            </div>
            
            <div className="px-5 pb-3 flex-shrink-0 border-b border-black/5 dark:border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[24px]">💰</span>
                  <h2 className="text-[18px] font-bold text-charcoal dark:text-white">小費計算機</h2>
                </div>
                <button onClick={onClose} className="text-stone text-[14px]">關閉</button>
              </div>
              <p className="text-[12px] text-stone mt-1">泰國各場合小費建議</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-safe">
              {/* Scenario Selection */}
              <div className="py-4">
                <p className="text-[12px] font-semibold text-charcoal dark:text-white mb-3">選擇場合</p>
                <div className="grid grid-cols-3 gap-2">
                  {scenarios.map((s) => (
                    <motion.button
                      key={s.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`p-3 rounded-mag text-center transition-all ${
                        selectedScenario === s.id
                          ? 'bg-red-xhs text-white shadow-md'
                          : 'bg-white dark:bg-black/20 text-charcoal dark:text-white'
                      }`}
                    >
                      <span className="text-[20px] block mb-1">{s.icon}</span>
                      <span className="text-[11px] font-medium">{s.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tip Info */}
              {scenario && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-mag p-3 mb-4">
                  <p className="text-[12px] text-amber-700 dark:text-amber-300">
                    💡 {scenario.name} 建議小費：<strong>{scenario.tipRange}</strong>
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{scenario.note}</p>
                </div>
              )}

              {/* Bill Amount */}
              {selectedScenario === 'restaurant' && (
                <div className="mb-4">
                  <label className="text-[12px] text-stone block mb-2">帳單金額 (฿)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="輸入帳單金額"
                    className="w-full px-4 py-3 rounded-mag border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-charcoal dark:text-white text-[16px] text-center font-mono"
                  />
                </div>
              )}

              {/* Quick Amount Buttons */}
              {selectedScenario === 'restaurant' && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[500, 1000, 1500, 2000, 3000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className="px-3 py-1.5 rounded-pill bg-stone/10 text-stone text-[11px] font-medium hover:bg-stone/20"
                    >
                      ฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              )}

              {/* Tip Suggestions */}
              {selectedScenario === 'restaurant' && billAmount > 0 && (
                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-charcoal dark:text-white mb-3">建議小費</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-black/20 rounded-mag p-3 text-center">
                      <p className="text-[10px] text-stone mb-1">10%</p>
                      <p className="text-[18px] font-bold text-charcoal dark:text-white">฿{tips.low}</p>
                      <p className="text-[10px] text-stone">一般服務</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-mag p-3 text-center text-white shadow-md">
                      <p className="text-[10px] text-white/80 mb-1">12%</p>
                      <p className="text-[18px] font-bold">฿{tips.mid}</p>
                      <p className="text-[10px] text-white/80">推薦 ⭐</p>
                    </div>
                    <div className="bg-white dark:bg-black/20 rounded-mag p-3 text-center">
                      <p className="text-[10px] text-stone mb-1">15%</p>
                      <p className="text-[18px] font-bold text-charcoal dark:text-white">฿{tips.high}</p>
                      <p className="text-[10px] text-stone">優質服務</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total with Tip */}
              {selectedScenario === 'restaurant' && billAmount > 0 && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-mag p-4 text-white">
                  <p className="text-[12px] text-white/80">總計 (含建議小費)</p>
                  <p className="text-[28px] font-bold">฿{(billAmount + tips.mid).toLocaleString()}</p>
                  <p className="text-[11px] text-white/70">帳單 ฿{billAmount.toLocaleString()} + 小費 ฿{tips.mid}</p>
                </div>
              )}

              {/* Non-restaurant Tips */}
              {selectedScenario !== 'restaurant' && (
                <div className="bg-white dark:bg-black/20 rounded-mag p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[14px] text-charcoal dark:text-white">建議金額</span>
                    <span className="text-[24px] font-bold text-red-xhs">{scenario?.tipRange}</span>
                  </div>
                  <p className="text-[11px] text-stone">{scenario?.note}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
