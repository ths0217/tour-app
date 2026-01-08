import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurrencyConverterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fallback rate when offline (approximate)
const FALLBACK_RATE = 1.1; // 1 TWD ≈ 1.1 THB

export default function CurrencyConverter({ isOpen, onClose }: CurrencyConverterProps) {
  const [twdAmount, setTwdAmount] = useState('1000');
  const [thbAmount, setThbAmount] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState<'twd' | 'thb'>('twd');

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      setIsLoading(true);
      try {
        // Try to get cached rate first
        const cached = localStorage.getItem('tourapp_exchange_rate');
        if (cached) {
          const { rate: cachedRate, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // Use cache if less than 1 hour old
          if (age < 3600000) {
            setRate(cachedRate);
            setLastUpdated(new Date(timestamp).toLocaleTimeString('zh-TW'));
            setIsLoading(false);
            return;
          }
        }

        // Fetch new rate from free API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/TWD');
        if (response.ok) {
          const data = await response.json();
          const newRate = data.rates.THB;
          setRate(newRate);
          setLastUpdated(new Date().toLocaleTimeString('zh-TW'));
          // Cache the rate
          localStorage.setItem('tourapp_exchange_rate', JSON.stringify({
            rate: newRate,
            timestamp: Date.now()
          }));
        } else {
          throw new Error('API failed');
        }
      } catch (error) {
        console.warn('Using fallback rate');
        setRate(FALLBACK_RATE);
        setLastUpdated('離線模式');
      }
      setIsLoading(false);
    };

    if (isOpen) {
      fetchRate();
    }
  }, [isOpen]);

  // Convert when rate or amount changes
  useEffect(() => {
    if (!rate) return;
    if (activeInput === 'twd') {
      const twd = parseFloat(twdAmount) || 0;
      setThbAmount((twd * rate).toFixed(2));
    } else {
      const thb = parseFloat(thbAmount) || 0;
      setTwdAmount((thb / rate).toFixed(2));
    }
  }, [rate, twdAmount, thbAmount, activeInput]);

  const handleTwdChange = (value: string) => {
    setActiveInput('twd');
    setTwdAmount(value);
  };

  const handleThbChange = (value: string) => {
    setActiveInput('thb');
    setThbAmount(value);
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

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
              {/* Handle */}
              <div className="w-12 h-1.5 bg-stone/20 rounded-full mx-auto mt-3 mb-4" />

              {/* Header */}
              <div className="px-5 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold text-charcoal">匯率換算</h2>
                  <button onClick={onClose} className="text-stone">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-stone">
                  {isLoading ? (
                    <span className="animate-pulse">更新匯率中...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span>更新時間: {lastUpdated}</span>
                      {rate && <span className="font-mono">(1 TWD = {rate.toFixed(4)} THB)</span>}
                    </>
                  )}
                </div>
              </div>

              {/* Converter */}
              <div className="px-5 pb-6 space-y-4">
                {/* TWD Input */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🇹🇼</span>
                    <span className="text-[13px] font-medium text-stone">台幣 TWD</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-charcoal mr-2">NT$</span>
                    <input
                      type="number"
                      value={twdAmount}
                      onChange={(e) => handleTwdChange(e.target.value)}
                      onFocus={() => setActiveInput('twd')}
                      placeholder="0"
                      className="flex-1 text-3xl font-bold text-charcoal bg-transparent outline-none text-right"
                    />
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">swap_vert</span>
                  </div>
                </div>

                {/* THB Input */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🇹🇭</span>
                    <span className="text-[13px] font-medium text-stone">泰銖 THB</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-amber-700 mr-2">฿</span>
                    <input
                      type="number"
                      value={thbAmount}
                      onChange={(e) => handleThbChange(e.target.value)}
                      onFocus={() => setActiveInput('thb')}
                      placeholder="0"
                      className="flex-1 text-3xl font-bold text-amber-700 bg-transparent outline-none text-right"
                    />
                  </div>
                </div>

                {/* Quick Amounts */}
                <div>
                  <p className="text-[12px] text-stone mb-2">快速選擇台幣金額：</p>
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map(amount => (
                      <motion.button
                        key={amount}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTwdChange(amount.toString())}
                        className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${parseFloat(twdAmount) === amount
                            ? 'bg-charcoal text-white'
                            : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                          }`}
                      >
                        NT${amount.toLocaleString()}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 rounded-xl p-3 mt-4">
                  <p className="text-[12px] text-blue-700">
                    💡 <strong>小提示：</strong>泰國大部分店家接受現金，建議在機場或 Super Rich 換匯
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
