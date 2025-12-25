import React, { useState } from 'react';
import { motion } from 'framer-motion';

const tags = ['全部', '美食', '景點', '購物', '按摩'];

interface ExploreItem {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    rating: number;
    saves: number;
    mapUrl: string;
    zone: string;
    category: 'food' | 'spot' | 'shop' | 'activity';
}

const exploreData: ExploreItem[] = [
    {
        id: '1',
        title: '鄭王廟 (Wat Arun)',
        description: '必拍地標！建議傍晚去，夕陽下最美。穿泰服拍照超有氛圍，CP值超高。',
        image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800',
        tags: ['必去地標', '泰服體驗', 'IG打卡'],
        rating: 4.9,
        saves: 12400,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Wat+Arun',
        zone: 'Riverside',
        category: 'spot'
    },
    {
        id: '2',
        title: 'ICONSIAM 暹羅天地',
        description: '曼谷最強商場！室內水上市場好吃又好逛，冷氣超涼，適合全家大小。',
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800',
        tags: ['室內水上市場', '吹冷氣', '美食聚集'],
        rating: 4.8,
        saves: 8900,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=ICONSIAM',
        zone: 'Riverside',
        category: 'shop'
    },
    {
        id: '3',
        title: 'Jodd Fairs 夜市',
        description: '網紅火山排骨必吃！水果西施也在這。乾淨好逛，年輕人最愛。',
        image: 'https://images.unsplash.com/photo-1533552063857-e83cb4819777?q=80&w=800',
        tags: ['火山排骨', '網紅夜市', '吃貨天堂'],
        rating: 4.7,
        saves: 15600,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Jodd+Fairs+Rama+9',
        zone: 'Rama9',
        category: 'food'
    },
    {
        id: '4',
        title: 'After You 刨冰',
        description: '泰國必吃甜點，芒果糯米飯刨冰是招牌！排隊也值得。',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800',
        tags: ['甜點控', '必吃', '消暑'],
        rating: 4.9,
        saves: 5400,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=After+You+Dessert+Cafe',
        zone: 'Siam',
        category: 'food'
    },
    {
        id: '5',
        title: 'Let\'s Relax Spa',
        description: '連鎖按摩品質保證，芒果糯米飯是隱藏版美味。建議提前預約。',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
        tags: ['按摩放鬆', '連鎖名店', '服務好'],
        rating: 4.6,
        saves: 3200,
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Let\'s+Relax+Spa',
        zone: 'Multiple',
        category: 'activity'
    }
];

interface ExploreViewProps {
    hotelInfo?: { name: string; bookingId: string; location: string };
}

export default function ExploreView({ hotelInfo }: ExploreViewProps) {
    const [activeTag, setActiveTag] = useState('全部');

    // Context Aware Logic
    // If hotel is Riverside (Avani is Riverside), prioritize Riverside items
    const isRiverside = hotelInfo?.location?.includes('Riverside') || hotelInfo?.name?.includes('Avani');

    // Sort items: "Riverside" first if at Avani, then by saves
    const sortedData = [...exploreData].sort((a, b) => {
        if (isRiverside) {
            if (a.zone === 'Riverside' && b.zone !== 'Riverside') return -1;
            if (a.zone !== 'Riverside' && b.zone === 'Riverside') return 1;
        }
        return b.saves - a.saves;
    });

    const filteredData = activeTag === '全部'
        ? sortedData
        : sortedData.filter(item => {
            if (activeTag === '美食') return item.category === 'food';
            if (activeTag === '景點') return item.category === 'spot';
            if (activeTag === '購物') return item.category === 'shop';
            if (activeTag === '按摩') return item.category === 'activity';
            return true;
        });

    return (
        <div className="pt-14 px-6 pb-24 relative min-h-full bg-bone/30">
            <h2 className="text-3xl font-light tracking-wide text-text-primary font-display mb-1">探索曼谷</h2>
            <p className="text-xs text-text-muted mb-6">小紅書熱門 • 在地人推薦</p>

            {/* Hotel Context Banner */}
            {hotelInfo && (
                <div className="mb-8 p-4 bg-white rounded-2xl border border-black/5 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gold tracking-wider mb-1">您的住宿</p>
                        <h3 className="text-sm font-bold text-text-primary">{hotelInfo.name}</h3>
                        <p className="text-[10px] text-text-muted mt-0.5">已為您優先推薦 {isRiverside ? '河岸區 (Riverside)' : '附近'} 景點</p>
                    </div>
                    <span className="material-symbols-outlined text-gold">hotel_class</span>
                </div>
            )}

            {/* Filter Tags */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                {tags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTag === tag
                            ? 'bg-text-primary text-white shadow-md'
                            : 'bg-white text-text-secondary border border-black/5'
                            }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredData.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5"
                    >
                        <div className="relative aspect-[16/10] overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                {item.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] text-white font-medium border border-white/20">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            {item.zone === 'Riverside' && isRiverside && (
                                <div className="absolute bottom-3 left-3 px-2 py-1 bg-gold text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-lg">
                                    <span className="material-symbols-outlined text-[12px]">near_me</span>
                                    距離近
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-text-primary">{item.title}</h3>
                                <div className="flex items-center gap-1 text-xs font-medium text-text-muted">
                                    <span className="material-symbols-outlined text-[14px] text-gold">star</span>
                                    {item.rating}
                                </div>
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
                                {item.description}
                            </p>

                            <div className="flex items-center justify-between border-t border-black/5 pt-4">
                                <span className="text-xs text-text-muted flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">favorite</span>
                                    {item.saves > 10000 ? `${(item.saves / 10000).toFixed(1)}w` : item.saves} 收藏
                                </span>
                                <a
                                    href={item.mapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-xs font-bold text-gold hover:underline"
                                >
                                    <span className="material-symbols-outlined text-[16px]">map</span>
                                    導航
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}