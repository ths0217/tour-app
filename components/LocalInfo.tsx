import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocalInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const simCards = [
  {
    provider: 'AIS',
    logo: '🟢',
    plans: [
      { name: '8天 15GB', price: 299, includes: '無限通話' },
      { name: '15天 30GB', price: 599, includes: '無限社群' },
    ],
    where: '機場 AIS 櫃檯、7-11',
    coverage: '⭐⭐⭐⭐⭐ 覆蓋最廣',
  },
  {
    provider: 'DTAC',
    logo: '🔵',
    plans: [
      { name: '8天 15GB', price: 299, includes: '5G 網速' },
      { name: '30天 50GB', price: 899, includes: '熱點分享' },
    ],
    where: '機場 DTAC 櫃檯、True Shop',
    coverage: '⭐⭐⭐⭐ 城市優秀',
  },
  {
    provider: 'True Move',
    logo: '🔴',
    plans: [
      { name: '8天 無限', price: 349, includes: '真無限流量' },
      { name: '15天 無限', price: 599, includes: '真無限流量' },
    ],
    where: '機場 True 櫃檯、True Shop',
    coverage: '⭐⭐⭐⭐ 速度快',
  },
];

const usefulApps = [
  { icon: '🚗', name: 'Grab', desc: '叫車/外送必備', link: 'https://www.grab.com' },
  { icon: '🗺️', name: 'Google Maps', desc: '離線地圖超重要', link: 'https://maps.google.com' },
  { icon: '🈲', name: 'Google 翻譯', desc: '拍照翻譯救命', link: 'https://translate.google.com' },
  { icon: '💱', name: 'XE Currency', desc: '即時匯率', link: 'https://www.xe.com' },
  { icon: '🚇', name: 'BKK Rail', desc: 'BTS/MRT 路線圖', link: 'https://www.bts.co.th' },
  { icon: '📞', name: 'LINE', desc: '泰國人都用 LINE', link: 'https://line.me' },
];

const powerInfo = {
  voltage: '220V',
  frequency: '50Hz',
  plugType: 'A/B/C/O 型',
  note: '台灣電器可直接使用，無需變壓器',
};

export default function LocalInfo({ isOpen, onClose }: LocalInfoProps) {
  const [activeTab, setActiveTab] = useState<'sim' | 'apps' | 'tips'>('sim');

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
            
            <div className="px-5 pb-3 flex-shrink-0 border-b border-black/5 dark:border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[24px]">📱</span>
                  <h2 className="text-[18px] font-bold text-charcoal dark:text-white">當地實用資訊</h2>
                </div>
                <button onClick={onClose} className="text-stone text-[14px]">關閉</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 py-3 flex gap-2 flex-shrink-0">
              {[
                { id: 'sim', label: '📶 SIM 卡' },
                { id: 'apps', label: '📲 必備 App' },
                { id: 'tips', label: '💡 小技巧' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 rounded-mag text-[11px] font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-red-xhs text-white'
                      : 'bg-stone/10 text-stone'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-safe">
              {/* SIM Cards */}
              {activeTab === 'sim' && (
                <div className="space-y-4">
                  {simCards.map((sim) => (
                    <div key={sim.provider} className="bg-white dark:bg-black/20 rounded-mag overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-black/5 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[20px]">{sim.logo}</span>
                          <span className="text-[14px] font-semibold text-charcoal dark:text-white">{sim.provider}</span>
                          <span className="text-[10px] text-stone ml-auto">{sim.coverage}</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {sim.plans.map((plan, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div>
                              <p className="text-[12px] font-medium text-charcoal dark:text-white">{plan.name}</p>
                              <p className="text-[10px] text-stone">{plan.includes}</p>
                            </div>
                            <span className="text-[14px] font-bold text-red-xhs">฿{plan.price}</span>
                          </div>
                        ))}
                        <p className="text-[10px] text-stone pt-2 border-t border-black/5 dark:border-white/10">
                          📍 購買地點：{sim.where}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-mag p-3">
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      💡 建議在機場購買，有中文服務且可立即啟用
                    </p>
                  </div>
                </div>
              )}

              {/* Apps */}
              {activeTab === 'apps' && (
                <div className="grid grid-cols-2 gap-3">
                  {usefulApps.map((app) => (
                    <motion.a
                      key={app.name}
                      href={app.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileTap={{ scale: 0.98 }}
                      className="bg-white dark:bg-black/20 rounded-mag p-4 block"
                    >
                      <span className="text-[28px] block mb-2">{app.icon}</span>
                      <p className="text-[13px] font-semibold text-charcoal dark:text-white">{app.name}</p>
                      <p className="text-[10px] text-stone mt-0.5">{app.desc}</p>
                    </motion.a>
                  ))}
                </div>
              )}

              {/* Tips */}
              {activeTab === 'tips' && (
                <div className="space-y-4">
                  {/* Power Info */}
                  <div className="bg-white dark:bg-black/20 rounded-mag p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[20px]">🔌</span>
                      <span className="text-[14px] font-semibold text-charcoal dark:text-white">電源資訊</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-stone/5 dark:bg-white/5 rounded-mag p-2 text-center">
                        <p className="text-[10px] text-stone">電壓</p>
                        <p className="text-[14px] font-bold text-charcoal dark:text-white">{powerInfo.voltage}</p>
                      </div>
                      <div className="bg-stone/5 dark:bg-white/5 rounded-mag p-2 text-center">
                        <p className="text-[10px] text-stone">頻率</p>
                        <p className="text-[14px] font-bold text-charcoal dark:text-white">{powerInfo.frequency}</p>
                      </div>
                      <div className="bg-stone/5 dark:bg-white/5 rounded-mag p-2 text-center">
                        <p className="text-[10px] text-stone">插頭</p>
                        <p className="text-[14px] font-bold text-charcoal dark:text-white">{powerInfo.plugType}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-green-600 dark:text-green-400">✓ {powerInfo.note}</p>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-white dark:bg-black/20 rounded-mag p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[20px]">💡</span>
                      <span className="text-[14px] font-semibold text-charcoal dark:text-white">實用小技巧</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        '出門隨身攜帶飯店名片（泰文地址）',
                        '隨時補充水分，注意防曬',
                        'BTS 兔子卡可儲值多次使用',
                        '7-11 可用 Rabbit LINE Pay',
                        '計程車記得確認打錶',
                        '按摩前先議價確認總金額',
                      ].map((tip, i) => (
                        <p key={i} className="text-[11px] text-charcoal dark:text-white flex items-start gap-2">
                          <span className="text-stone">•</span>
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-mag p-4 text-white">
                    <p className="text-[12px] text-white/80 mb-1">1月份曼谷天氣</p>
                    <p className="text-[20px] font-bold">25-32°C</p>
                    <p className="text-[11px] text-white/70">乾季、舒適、偶有午後雷陣雨</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
