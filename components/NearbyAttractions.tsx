// NearbyAttractions.tsx - Recommend nearby places based on current location
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { openMap } from '../utils/device';

interface Attraction {
    id: string;
    name: string;
    nameEn: string;
    category: string;
    distance: number; // in meters
    rating: number;
    image?: string;
    coords: { lat: number; lng: number };
    description: string;
    priceRange?: string;
}

interface NearbyAttractionsProps {
    currentLocation?: { lat: number; lng: number };
    isOpen: boolean;
    onClose: () => void;
}

// Bangkok attractions database
const bangkokAttractions: Attraction[] = [
    {
        id: 'maha',
        name: '瑪哈拉碼頭',
        nameEn: 'Tha Maharaj',
        category: '購物',
        rating: 4.3,
        coords: { lat: 13.7556, lng: 100.4890 },
        description: '河畔文創商場，適合喝咖啡看夕陽',
        priceRange: '💰💰',
        distance: 0,
    },
    {
        id: 'wat-arun',
        name: '鄭王廟',
        nameEn: 'Wat Arun',
        category: '景點',
        rating: 4.7,
        coords: { lat: 13.7437, lng: 100.4890 },
        description: '泰國最著名寺廟，日落必訪',
        priceRange: '💰',
        distance: 0,
    },
    {
        id: 'wat-pho',
        name: '臥佛寺',
        nameEn: 'Wat Pho',
        category: '景點',
        rating: 4.6,
        coords: { lat: 13.7465, lng: 100.4926 },
        description: '泰國最大臥佛，傳統按摩發源地',
        priceRange: '💰',
        distance: 0,
    },
    {
        id: 'iconsiam',
        name: 'ICONSIAM',
        nameEn: 'ICONSIAM',
        category: '購物',
        rating: 4.5,
        coords: { lat: 13.7261, lng: 100.5099 },
        description: '河畔超大購物中心，水上市場風格室內市集',
        priceRange: '💰💰💰',
        distance: 0,
    },
    {
        id: 'jodd',
        name: '喬德夜市',
        nameEn: 'Jodd Fairs',
        category: '美食',
        rating: 4.4,
        coords: { lat: 13.7490, lng: 100.5677 },
        description: '火山排骨超有名！網紅夜市',
        priceRange: '💰💰',
        distance: 0,
    },
    {
        id: 'chatuchak',
        name: '恰圖恰週末市集',
        nameEn: 'Chatuchak Market',
        category: '購物',
        rating: 4.3,
        coords: { lat: 13.7999, lng: 100.5502 },
        description: '超過15000攤位！週末限定',
        priceRange: '💰💰',
        distance: 0,
    },
    {
        id: 'terminal21',
        name: 'Terminal 21',
        nameEn: 'Terminal 21 Asok',
        category: '購物',
        rating: 4.4,
        coords: { lat: 13.7378, lng: 100.5602 },
        description: '機場主題購物中心，美食街超便宜',
        priceRange: '💰💰',
        distance: 0,
    },
    {
        id: 'centralworld',
        name: 'Central World',
        nameEn: 'Central World',
        category: '購物',
        rating: 4.3,
        coords: { lat: 13.7466, lng: 100.5392 },
        description: '曼谷最大購物中心之一',
        priceRange: '💰💰💰',
        distance: 0,
    },
];

// Calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} 公尺`;
    }
    return `${(meters / 1000).toFixed(1)} 公里`;
}

const categoryIcons: Record<string, string> = {
    '景點': '🏛️',
    '美食': '🍜',
    '購物': '🛍️',
    '咖啡': '☕',
    '按摩': '💆',
};

const categoryColors: Record<string, string> = {
    '景點': 'from-amber-400 to-orange-500',
    '美食': 'from-red-400 to-rose-500',
    '購物': 'from-blue-400 to-indigo-500',
    '咖啡': 'from-amber-600 to-amber-700',
    '按摩': 'from-purple-400 to-violet-500',
};

export default function NearbyAttractions({ currentLocation, isOpen, onClose }: NearbyAttractionsProps) {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(currentLocation || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get user location
    useEffect(() => {
        if (isOpen && !userLocation) {
            setIsLoading(true);
            setError(null);

            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                        setIsLoading(false);
                    },
                    (err) => {
                        console.warn('Geolocation error:', err);
                        // Default to Bangkok city center
                        setUserLocation({ lat: 13.7563, lng: 100.5018 });
                        setError('無法取得您的位置，顯示曼谷市中心附近');
                        setIsLoading(false);
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                );
            } else {
                setUserLocation({ lat: 13.7563, lng: 100.5018 });
                setError('您的瀏覽器不支援定位');
                setIsLoading(false);
            }
        }
    }, [isOpen, userLocation]);

    // Calculate distances and sort
    useEffect(() => {
        if (userLocation) {
            const withDistances = bangkokAttractions.map(attraction => ({
                ...attraction,
                distance: calculateDistance(
                    userLocation.lat, userLocation.lng,
                    attraction.coords.lat, attraction.coords.lng
                ),
            }));

            // Sort by distance
            withDistances.sort((a, b) => a.distance - b.distance);
            setAttractions(withDistances);
        }
    }, [userLocation]);

    const categories = Array.from(new Set(bangkokAttractions.map(a => a.category)));
    const filteredAttractions = selectedCategory
        ? attractions.filter(a => a.category === selectedCategory)
        : attractions;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-50"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-mag-xl z-50 max-h-[85vh] pb-safe"
                    >
                        <div className="sticky top-0 bg-cream pt-3 pb-2 border-b border-black/5 z-10">
                            <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto mb-3" />
                            <div className="flex justify-between items-center px-5 mb-3">
                                <div>
                                    <h3 className="text-[18px] font-bold text-charcoal">📍 附近推薦</h3>
                                    <p className="text-[12px] text-stone">
                                        {isLoading ? '正在定位...' : error || '依距離排序'}
                                    </p>
                                </div>
                                <button onClick={onClose}>
                                    <span className="material-symbols-outlined text-stone">close</span>
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar pb-2">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-2 rounded-pill text-[12px] font-medium whitespace-nowrap ${selectedCategory === null
                                            ? 'bg-charcoal text-white'
                                            : 'bg-white text-charcoal border border-black/5'
                                        }`}
                                >
                                    全部
                                </motion.button>
                                {categories.map(cat => (
                                    <motion.button
                                        key={cat}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-pill text-[12px] font-medium whitespace-nowrap flex items-center gap-1 ${selectedCategory === cat
                                                ? 'bg-charcoal text-white'
                                                : 'bg-white text-charcoal border border-black/5'
                                            }`}
                                    >
                                        <span>{categoryIcons[cat]}</span>
                                        {cat}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[65vh] p-5 space-y-3">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-stone">正在尋找附近景點...</p>
                                </div>
                            ) : (
                                filteredAttractions.map((attraction, i) => (
                                    <motion.div
                                        key={attraction.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white rounded-mag p-4 shadow-mag"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-12 h-12 rounded-mag bg-gradient-to-br ${categoryColors[attraction.category] || 'from-gray-400 to-gray-500'} flex items-center justify-center text-[20px] flex-shrink-0`}>
                                                {categoryIcons[attraction.category] || '📍'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-[14px] font-bold text-charcoal truncate">{attraction.name}</h4>
                                                    <span className="px-2 py-0.5 rounded-pill bg-stone/10 text-[10px] text-stone flex-shrink-0">
                                                        {formatDistance(attraction.distance)}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-stone/70 mb-2">{attraction.nameEn}</p>
                                                <p className="text-[12px] text-stone line-clamp-1 mb-2">{attraction.description}</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-filled text-[14px] text-amber-400">star</span>
                                                        <span className="text-[12px] font-medium text-charcoal">{attraction.rating}</span>
                                                    </div>
                                                    {attraction.priceRange && (
                                                        <span className="text-[11px] text-stone">{attraction.priceRange}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => openMap({ lat: attraction.coords.lat, lng: attraction.coords.lng, travelMode: 'd' })}
                                                className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-mag flex-shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-white text-[18px]">navigation</span>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
