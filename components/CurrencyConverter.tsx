import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurrencyConverterProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencies = [
  { code: 'THB', symbol: '฿', name: '泰銖', flag: '🇹🇭' },
  { code: 'TWD', symbol: 'NT$', name: '台幣', flag: '🇹🇼' },
  { code: 'USD', symbol: '$', name: '美元', flag: '🇺🇸' },
  { code: 'JPY', symbol: '¥', name: '日圓', flag: '🇯🇵' },
];

// Approximate rates (THB base)
const baseRates: Record<string, number> = {
  THB: 1,
  TWD: 0.91,    // 1 THB ≈ 0.91 TWD
  USD: 0.028,   // 1 THB ≈ 0.028 USD
  JPY: 4.3,     // 1 THB ≈ 4.3 JPY
};

export default function CurrencyConverter({ isOpen, onClose }: CurrencyConverterProps) {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('THB');
  const [toCurrency, setToCurrency] = useState('TWD');
  const [rates, setRates] = useState(baseRates);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch real rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Using exchangerate-api free tier
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/THB');
        const data = await res.json();
        if (data.rates) {
          setRates({
            THB: 1,
            TWD: data.rates.TWD || baseRates.TWD,
            USD: data.rates.USD || baseRates.USD,
            JPY: data.rates.JPY || baseRates.JPY,
          });
          setLastUpdated(new Date().toLocaleTimeString('zh-TW'));
        }
      } catch (error) {
        console.log('Using offline rates');
      }
    };
    if (isOpen) fetchRates();
  }, [isOpen]);

  const convert = (value: number, from: string, to: string): number => {
    // Convert to THB first, then to target
    const inTHB = value / rates[from];
    return inTHB * rates[to];
  };

  const result = convert(parseFloat(amount) || 0, fromCurrency, toCurrency);
  const fromCurrencyData = currencies.find(c => c.code === fromCurrency)!;
  const toCurrencyData = currencies.find(c => c.code === toCurrency)!;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
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
            className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-charcoal rounded-t-[24px] z-50"
          >
            <div className="pt-3 pb-2">
              <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
            </div>
            
            <div className="px-5 pb-safe">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[18px] font-bold text-charcoal dark:text-white">💱 匯率計算機</h2>
                <button onClick={onClose} className="text-stone text-[14px]">關閉</button>
              </div>

              {/* Amount Input */}
              <div className="bg-white dark:bg-black/20 rounded-[16px] p-4 mb-4">
                <label className="text-[11px] text-stone block mb-2">輸入金額</label>
                <div className="flex items-center gap-3">
                  <span className="text-[24px]">{fromCurrencyData.flag}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 text-[28px] font-bold text-charcoal dark:text-white bg-transparent outline-none"
                    placeholder="0"
                  />
                  <span className="text-[14px] text-stone">{fromCurrency}</span>
                </div>
              </div>

              {/* Currency Selectors */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-white dark:bg-black/20 rounded-[12px] p-3">
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full bg-transparent text-charcoal dark:text-white text-[14px] outline-none"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  onClick={swapCurrencies}
                  className="w-10 h-10 rounded-full bg-red-xhs flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-white text-[18px]">swap_horiz</span>
                </motion.button>

                <div className="flex-1 bg-white dark:bg-black/20 rounded-[12px] p-3">
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full bg-transparent text-charcoal dark:text-white text-[14px] outline-none"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[16px] p-5 text-white mb-4">
                <p className="text-[12px] text-white/70 mb-1">換算結果</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-bold">
                    {toCurrencyData.symbol}{result.toLocaleString('zh-TW', { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[14px] text-white/70">{toCurrency}</span>
                </div>
                <p className="text-[11px] text-white/60 mt-2">
                  1 {fromCurrency} = {convert(1, fromCurrency, toCurrency).toFixed(4)} {toCurrency}
                </p>
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <p className="text-[11px] text-stone text-center">
                  ✓ 匯率更新於 {lastUpdated}
                </p>
              )}

              {/* Quick Amounts */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {[100, 500, 1000, 5000, 10000].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className={`flex-shrink-0 px-4 py-2 rounded-pill text-[12px] font-medium ${
                      amount === val.toString()
                        ? 'bg-charcoal text-white dark:bg-white dark:text-charcoal'
                        : 'bg-white dark:bg-black/20 text-charcoal dark:text-white border border-black/5'
                    }`}
                  >
                    {val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
