import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const collections = [
    { 
        title: '時尚與配件', 
        desc: 'Greyhound Original, CPS Chaps', 
        images: [
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBMP9xYayLyx_H03ogyxoIKpWcQGt_UXyBvsiiRxAdzcIweyF2jIA-yw7GJ1gMliQSi6X7-jppSCaDmu0bzsb8ONM9vM86lC4OQt-v7L6utdhYB9lEZ77lGLwR_QDcr_9JP6fzm8ycSSU7vs21LhUH6DZ-GY_cEPeFg0QpxButzgfUVsaF7UjD-e4yal8cKz6Ie-acaUKpf938N6KpUNrSlfTvGK03V9vZO_slfkebJuaLCZm6PTapwfQp37IDxktt8Hhd9cgtcbQBK',
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400'
        ]
    },
    { 
        title: '美容與芳療', 
        desc: 'Bath & Bloom, Harnn Heritage', 
        images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBXO5trTGWgwerzx8wSPrMLwJ6YOMi0uTrPGnCS2RAD5wRjfiDMy3-7qkAlfpn9_b1VsAXj1hod5PYKWEzbJM4Q7kKcXOZKOqvGszWrdou9BWkeEqxylcaNsQlwolnNkjjBdaf_dzrhxuY_7cBJDogyUWaTqWn-4GSzWHvVHYDvaZ5gFr0j3fzWlmZDCwVLKhHAWIcYlE_S1u-fAvZ6Jg7DDf1baCOzw73hKaOt1kFYVmGYakC-x9tqUwXKtUZkTqDHbM_a40OVSeYH',
            'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=400',
            'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=400'
        ]
    },
    { 
        title: '特色咖啡廳', 
        desc: 'Ari 巷弄探險, 文青必去', 
        images: [
            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400',
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400',
            'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=400'
        ]
    },
    { 
        title: '米其林街頭美食', 
        desc: 'Jay Fai, 媽媽麵', 
        images: [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400',
            'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=400',
            'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400'
        ]
    },
];

export default function ExploreView() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll({ container: containerRef });
  
  // Parallax effects
  const y = useTransform(scrollY, [0, 300], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto no-scrollbar relative bg-ivory">
        {/* Parallax Header */}
        <div className="relative w-full h-[380px] z-0 overflow-hidden">
            <motion.div 
                style={{ y, opacity, scale }}
                className="absolute inset-0 bg-cover bg-center" 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAuoNRBOzj6h4_vA_djjorjV8E6k5qPSvUwNnLWr9O5kXh5nkhsuHYRTGJ7kpwASMIBKWFiW5QcodFNzVTNb6210SpLGgEf01cyEeX_fPhJ41l8Ig_vrFBDPZAX1ogICGNpS00oj6teGc0U4yFHQHk0DYtd7D0FMyRTXaKEw1cFPrNuCLRw46eDFFqJVj6jf_CZRxAlVodOBwWK3yh-7C8Q8vyDTGhOiOUHOD3Kgp5K3Qqwl1WB-mmr36eEs_xiGHjN1_AHtwQaOVmW')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </motion.div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 pb-16 z-10 translate-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em]">獨家精選</span>
                    </div>
                    <h2 className="text-4xl font-light text-white mb-3 leading-tight tracking-wide font-display">曼谷<br/><span className="font-normal font-serif">深度指南</span></h2>
                    <p className="text-white/80 text-xs font-light tracking-widest mt-2 uppercase">1月27日 - 2月2日 • 私人訂製</p>
                </motion.div>
            </div>

            {/* Overlay Navigation Header */}
             <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 pt-14">
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </motion.button>
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white"
                >
                    <span className="material-symbols-outlined">favorite</span>
                </motion.button>
             </div>
        </div>

        {/* Content Layer - Snaps over header */}
        <div className="relative z-10 -mt-8 bg-ivory rounded-t-[2.5rem] min-h-screen">
             <div className="px-6 -mt-8 transform -translate-y-1/2">
                 <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl p-6 flex justify-between divide-x divide-black/5"
                 >
                    <div className="flex flex-col items-center px-2 flex-1">
                        <span className="material-symbols-outlined text-gold text-[24px] mb-1">currency_exchange</span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">預算</span>
                        <span className="text-xs font-medium text-text-primary">高端</span>
                    </div>
                    <div className="flex flex-col items-center px-2 flex-1">
                        <span className="material-symbols-outlined text-gold text-[24px] mb-1">receipt_long</span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">退稅</span>
                        <span className="text-xs font-medium text-text-primary">可退稅</span>
                    </div>
                    <div className="flex flex-col items-center px-2 flex-1">
                        <span className="material-symbols-outlined text-gold text-[24px] mb-1">stars</span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">評分</span>
                        <span className="text-xs font-medium text-text-primary">5.0</span>
                    </div>
                 </motion.div>
             </div>

            <div className="px-6 pb-32">
                <h3 className="text-xl font-light text-text-primary tracking-widest uppercase mb-6 pl-1">精選系列</h3>
                
                <div className="space-y-8">
                    {collections.map((col, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex gap-4 items-center pl-1">
                                <div className="w-10 h-10 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center">
                                    <span className="material-symbols-outlined text-icon text-[20px]">styler</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-normal text-text-primary">{col.title}</h4>
                                    <p className="text-text-secondary text-sm font-light">{col.desc}</p>
                                </div>
                            </div>
                            
                            <div className="bg-bone p-4 rounded-3xl transition-colors">
                                {/* Horizontal Image Scroll */}
                                <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                                    {col.images.map((img, imgIdx) => (
                                        <motion.div 
                                            key={imgIdx}
                                            whileTap={{ scale: 0.98 }}
                                            className="min-w-[240px] h-40 rounded-xl bg-cover bg-center snap-center shadow-sm"
                                            style={{ backgroundImage: `url('${img}')` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}