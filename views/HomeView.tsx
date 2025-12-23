import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const familyMembers = [
  { name: '媽媽', role: '購物擔當', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADJsoabjLSeQ7Jq4LGOAf84PUw2h0ydnAsTCIx956787057XmPN09ycJlYkJj5dgqknSxIIlgDr2C3Vg1sjmYl3uAYhTIaMYABN-CYEamB7Ancf4B2pjztapytqB45HS2wCBUDcLHVifm2F-vDZi75DjFuXbypddoswbqS8dztxJE6mmAATtZAXXCQJrVpg-nX_bFi9T3TPPFpckkYCxMd8AqDkNke43UIVaeKxQNO00TLLpbV4hFbh4kIeLrvD-7SH7Hz2NLhHMzL', bat: 80 },
  { name: '爸爸', role: '攝影師', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAZI8G2V4jLGeEfYCPS4gkMPBUdf8NWK2qbnYqY5SHv_3JJSiviiWY5ehv50iu2qPDesDsK4QuxZIRSWEnp93wtsB8Sgqr4PzWrAxsOGUKOCi9Kc5tEG0q75nhnGAUFd6BYfWyn66RlyCIRt4BLwxM8Y9tu6G6mhjXBrBbJ9kORF4z0cPFxx9TyLl4miAb6r7ZukjB4N0H8xj5MPxMv7mjQf_EGlCP-3N__44NitJgliVeU9cE98DhKKSAlNRx4SOa3lzpagb89C_Z', bat: 45 },
  { name: '妹妹', role: '美食家', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3cLQUCDP8aO230-8cjUamDyHIZ8Lq6nBgI3qENwDH0LzUOb6DuklCqNiNH4812QwNTIBM0NoQjx56npKaoPTAe-QDfkPp6tzo1sEvXsQS6h8naQljGsynsIxbpUPAEa1WmMHTL8IEEfR0jVWO5iwflQfAWgsKHEZsM-3J2fjOUkV0r1qEb9JVePV7WsTpxnQGG_5ht80-4ii_pxGW_45HaNG69YP6KXgXTjoOWbubqxTZffO0MJlnItaMBCWxFkOBSM7fy0UQfsWR', bat: 92 },
];

const quickActions = [
  { id: 'taxi', icon: 'local_taxi', label: '叫車', color: 'bg-green-100 text-green-700' },
  { id: 'rate', icon: 'currency_exchange', label: '匯率', color: 'bg-blue-100 text-blue-700' },
  { id: 'translate', icon: 'translate', label: '翻譯', color: 'bg-orange-100 text-orange-700' },
  { id: 'sos', icon: 'sos', label: '緊急', color: 'bg-red-100 text-red-700' },
];

const phrases = [
    { th: 'Sawatdee Khrap/Ka', en: '你好', aud: '🙏' },
    { th: 'Khop Khun', en: '謝謝', aud: '😊' },
    { th: 'Mai Phet', en: '不要辣', aud: '🌶️' },
    { th: 'Tao Rai?', en: '多少錢?', aud: '💰' },
    { th: 'Hong Nam', en: '廁所', aud: '🚽' },
    { th: 'Lot Noi Dai Mai', en: '便宜點?', aud: '📉' },
];

export default function HomeView() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleAction = (id: string) => {
      if (id === 'taxi') {
          window.open('https://www.grab.com/th/transport/', '_blank');
      } else if (id === 'rate') {
          window.open('https://www.google.com/finance/quote/THB-TWD', '_blank');
      } else {
          setActiveModal(id);
      }
  };

  return (
    <div className="pt-14 px-6 pb-6 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-light tracking-wide text-text-primary font-display"
          >
            早安，<br /><span className="font-normal">亞歷山大</span>
          </motion.h1>
          <div className="flex items-center gap-2 text-text-muted mt-2">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase">泰國曼谷 • 32°C 晴</p>
          </div>
        </div>
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
        >
          <div 
            className="w-12 h-12 rounded-full bg-bone border border-white shadow-sm bg-cover bg-center"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCR8T2rueke4Sjsg1lvYaRxcpIH3A2YqLCWew90E8OVHx8o90Gcmnf11bQzC8Hozx7GbNptPFd6a3g2KKxtcKGriu3souVTwE6zBDaXgbMTrzBr56Uy39ejT78BEWgc-TRckP-OGKauiO12dC_-v4UYsbE9n_Xi2dHfS4sgYpf_6QPt3MrgzNLQddgE3qY8DU_QgORQJsErI79JV32jHvVbdlOKdKifUystYXV8fKe8aDt5U1pRRXwwfLnmEWOlpDHXtCwjLPAnKGXh')` }}
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-ivory rounded-full"></div>
        </motion.div>
      </div>

      {/* Exchange Rate Widget */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-card border border-black/5 mb-6 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-bone flex items-center justify-center">
                <span className="text-xl">🇹🇭</span>
            </div>
            <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">THB / TWD</p>
                <p className="text-lg font-medium text-text-primary">0.92 <span className="text-xs text-green-600 font-bold">▲ 0.05%</span></p>
            </div>
        </div>
        <div className="h-8 w-[1px] bg-black/5"></div>
        <div className="flex flex-col items-end">
            <p className="text-[10px] text-text-muted">錢包餘額</p>
            <p className="text-sm font-medium text-text-primary">฿ 12,450</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, i) => (
            <motion.button 
                key={action.id}
                onClick={() => handleAction(action.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-2"
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${action.color}`}>
                    <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
                </div>
                <span className="text-[11px] font-medium text-text-secondary">{action.label}</span>
            </motion.button>
        ))}
      </div>

      {/* Alert Card */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="mb-8 cursor-pointer relative overflow-hidden rounded-2xl bg-text-primary text-ivory shadow-soft p-5"
      >
          <div className="absolute right-0 top-0 w-32 h-32 bg-gold/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm shadow-sm">
              <span className="material-symbols-outlined text-gold">thunderstorm</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-normal text-ivory text-sm tracking-wide">行程提醒：大皇宮區域</h3>
                <span className="text-[10px] text-ivory bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">現在</span>
              </div>
              <p className="mt-2 text-xs text-ivory/80 leading-relaxed font-light">預計下午 3 點有午後雷陣雨，建議安排室內備案或延後前往。</p>
            </div>
          </div>
      </motion.div>

      {/* Family Status */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4 pl-1">旅伴狀態</h3>
        <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2 pl-1">
          {familyMembers.map((member, i) => (
            <motion.div 
              key={member.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="flex flex-col items-center gap-2 min-w-[4rem]"
            >
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="relative group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full p-[2px] border border-gray-200 group-hover:border-gold transition-colors">
                  <div 
                    className="w-full h-full rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${member.image}')` }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white border border-ivory shadow-sm rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                  <div className={`w-1.5 h-1.5 rounded-full ${member.bat > 30 ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </motion.div>
              <span className="text-[10px] font-medium text-text-secondary">{member.name}</span>
            </motion.div>
          ))}
          <div className="flex flex-col items-center gap-2 min-w-[4rem]">
            <motion.button 
              whileTap={{ scale: 0.9, rotate: 90 }}
              className="w-14 h-14 rounded-full border border-dashed border-icon/40 flex items-center justify-center bg-transparent active:bg-black/5 transition-colors"
            >
              <span className="material-symbols-outlined text-icon text-[20px]">add</span>
            </motion.button>
            <span className="text-[10px] text-text-muted">新增</span>
          </div>
        </div>
      </section>

      {/* Memories */}
      <section className="mb-6">
        <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">今日回憶</h3>
            <span className="text-[10px] text-gold font-medium">查看全部</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pl-1">
            <motion.div 
                whileTap={{ scale: 0.98 }}
                className="min-w-[140px] h-48 rounded-2xl bg-cover bg-center relative overflow-hidden shadow-card"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590487363426-3d2315d1cb1c?q=80&w=300')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                    <p className="text-white text-xs font-bold">臥佛寺</p>
                    <p className="text-white/80 text-[10px]">上午 10:30</p>
                </div>
            </motion.div>
            <motion.div 
                whileTap={{ scale: 0.98 }}
                className="min-w-[140px] h-48 rounded-2xl bg-cover bg-center relative overflow-hidden shadow-card"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559628233-eb1b1ee297a7?q=80&w=300')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                    <p className="text-white text-xs font-bold">河畔午餐</p>
                    <p className="text-white/80 text-[10px]">下午 13:15</p>
                </div>
            </motion.div>
            <motion.div 
                whileTap={{ scale: 0.98 }}
                className="min-w-[140px] h-48 rounded-2xl bg-cover bg-center relative overflow-hidden shadow-card"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=300')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                    <p className="text-white text-xs font-bold">河濱夜市</p>
                    <p className="text-white/80 text-[10px]">晚上 19:30</p>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Next Event */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.98 }}
        className="bg-bone rounded-3xl p-6 border border-white relative overflow-hidden shadow-card group cursor-pointer mb-8"
      >
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
              <p className="text-[10px] font-medium text-gold uppercase tracking-[0.2em]">接下來 • 19:00</p>
            </div>
            <h3 className="text-xl font-light text-text-primary leading-tight">晚餐預約：<span className="font-normal font-serif">Jay Fai</span></h3>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="bg-white hover:bg-bone-alt text-gold rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">near_me</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveModal(null)}
                    className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe"
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
                    
                    {activeModal === 'translate' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-medium text-text-primary">泰語快查</h3>
                                <button 
                                    onClick={() => window.open('https://translate.google.com/?sl=zh-TW&tl=th', '_blank')}
                                    className="text-xs font-bold text-gold uppercase tracking-wider"
                                >
                                    Google 翻譯 &rarr;
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {phrases.map((p, i) => (
                                    <motion.button
                                        key={i}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm text-left relative overflow-hidden group"
                                    >
                                        <div className="absolute right-2 top-2 text-2xl opacity-20 group-active:opacity-100 transition-opacity grayscale group-active:grayscale-0">{p.aud}</div>
                                        <p className="text-lg font-medium text-text-primary mb-1">{p.th}</p>
                                        <p className="text-xs text-text-muted">{p.en}</p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeModal === 'sos' && (
                        <div>
                            <h3 className="text-xl font-medium text-text-primary mb-6">緊急聯絡</h3>
                            <div className="space-y-4">
                                <motion.a 
                                    href="tel:1155"
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-between bg-red-50 p-5 rounded-2xl border border-red-100"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined">local_police</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-text-primary">觀光警察</p>
                                            <p className="text-xs text-text-muted">Tourist Police</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-red-600">1155</span>
                                </motion.a>
                                <motion.a 
                                    href="tel:191"
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center justify-between bg-white p-5 rounded-2xl border border-black/5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined">emergency</span>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-text-primary">緊急求助</p>
                                            <p className="text-xs text-text-muted">Emergency</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-text-primary">191</span>
                                </motion.a>
                            </div>
                        </div>
                    )}
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}