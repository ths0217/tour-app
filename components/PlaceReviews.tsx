// PlaceReviews.tsx - Display place ratings and reviews
// Note: Real Google Places API requires API key. This uses mock data with the structure ready for API integration.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
    id: string;
    author: string;
    authorImage?: string;
    rating: number;
    text: string;
    time: string;
    language: string;
}

interface PlaceInfo {
    name: string;
    rating: number;
    totalReviews: number;
    priceLevel?: number;
    openNow?: boolean;
    photos?: string[];
    reviews: Review[];
}

interface PlaceReviewsProps {
    placeName: string;
    placeId?: string;
    compact?: boolean;
}

// Mock reviews data - In production, this would come from Google Places API
const mockPlaceData: Record<string, PlaceInfo> = {
    'Wat Arun': {
        name: '鄭王廟 Wat Arun',
        rating: 4.7,
        totalReviews: 52891,
        openNow: true,
        reviews: [
            { id: '1', author: 'Sakura tanaka', rating: 5, text: '日落時分最美！泰服拍照超棒 📸', time: '2週前', language: 'zh-TW', authorImage: 'https://randomuser.me/api/portraits/women/44.jpg' },
            { id: '2', author: 'Mike Chen', rating: 5, text: 'Must visit! The temple is stunning at sunset.', time: '1個月前', language: 'en', authorImage: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: '3', author: '小紅書用戶', rating: 4, text: '人很多要排隊，但值得一去！建議早上來', time: '3週前', language: 'zh-CN' },
        ]
    },
    'Jodd Fairs Ratchada': {
        name: 'Jodd Fairs 夜市',
        rating: 4.4,
        totalReviews: 18234,
        openNow: false,
        reviews: [
            { id: '1', author: '美食達人', rating: 5, text: '火山排骨必吃！🔥 建議7點前到，不然要排很久', time: '1週前', language: 'zh-TW' },
            { id: '2', author: 'FoodieKaren', rating: 4, text: 'Great night market, lots of food options. The volcano ribs are amazing!', time: '2週前', language: 'en' },
        ]
    },
    'Wat Pho': {
        name: '臥佛寺 Wat Pho',
        rating: 4.6,
        totalReviews: 41567,
        openNow: true,
        priceLevel: 1,
        reviews: [
            { id: '1', author: '歷史愛好者', rating: 5, text: '泰國最大臥佛，非常壯觀！傳統按摩學校也在這裡', time: '4天前', language: 'zh-TW' },
        ]
    },
};

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starSize = size === 'sm' ? 'text-[12px]' : 'text-[16px]';

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <span
                    key={i}
                    className={`material-symbols-${i < fullStars ? 'filled' : (i === fullStars && hasHalfStar ? 'outlined' : 'outlined')} ${starSize} ${i < fullStars || (i === fullStars && hasHalfStar) ? 'text-amber-400' : 'text-stone/30'}`}
                >
                    star
                </span>
            ))}
        </div>
    );
}

export default function PlaceReviews({ placeName, placeId, compact = false }: PlaceReviewsProps) {
    const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAllReviews, setShowAllReviews] = useState(false);

    useEffect(() => {
        const fetchPlaceInfo = async () => {
            setIsLoading(true);

            // In production, this would be:
            // const response = await fetch(`/api/places/${placeId}`);
            // const data = await response.json();

            // For now, use mock data
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

            // Find matching place or use generic data
            const matchedPlace = Object.entries(mockPlaceData).find(([key]) =>
                placeName.toLowerCase().includes(key.toLowerCase())
            );

            if (matchedPlace) {
                setPlaceInfo(matchedPlace[1]);
            } else {
                // Generate generic place info
                setPlaceInfo({
                    name: placeName,
                    rating: 4.2 + Math.random() * 0.6,
                    totalReviews: Math.floor(1000 + Math.random() * 5000),
                    openNow: true,
                    reviews: [
                        { id: '1', author: '旅人', rating: 4, text: '值得一遊！', time: '最近', language: 'zh-TW' }
                    ]
                });
            }

            setIsLoading(false);
        };

        if (placeName) {
            fetchPlaceInfo();
        }
    }, [placeName, placeId]);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 w-24 bg-stone/10 rounded mb-2" />
                <div className="h-3 w-16 bg-stone/10 rounded" />
            </div>
        );
    }

    if (!placeInfo) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <StarRating rating={placeInfo.rating} size="sm" />
                <span className="text-[12px] font-medium text-charcoal">{placeInfo.rating.toFixed(1)}</span>
                <span className="text-[11px] text-stone">({placeInfo.totalReviews.toLocaleString()})</span>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-mag p-4 shadow-mag">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[24px] font-bold text-charcoal">{placeInfo.rating.toFixed(1)}</span>
                            <StarRating rating={placeInfo.rating} />
                        </div>
                        <p className="text-[12px] text-stone">{placeInfo.totalReviews.toLocaleString()} 則評價</p>
                    </div>

                    {placeInfo.openNow !== undefined && (
                        <span className={`px-2 py-1 rounded-pill text-[10px] font-medium ${placeInfo.openNow
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {placeInfo.openNow ? '營業中' : '已打烊'}
                        </span>
                    )}
                </div>

                {/* Top reviews */}
                <div className="space-y-3">
                    {placeInfo.reviews.slice(0, 2).map(review => (
                        <div key={review.id} className="border-t border-black/5 pt-3">
                            <div className="flex items-center gap-2 mb-1">
                                {review.authorImage ? (
                                    <img src={review.authorImage} alt="" className="w-6 h-6 rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold">
                                        {review.author.charAt(0)}
                                    </div>
                                )}
                                <span className="text-[12px] font-medium text-charcoal">{review.author}</span>
                                <StarRating rating={review.rating} size="sm" />
                            </div>
                            <p className="text-[12px] text-stone line-clamp-2">{review.text}</p>
                            <p className="text-[10px] text-stone/60 mt-1">{review.time}</p>
                        </div>
                    ))}
                </div>

                {placeInfo.reviews.length > 2 && (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAllReviews(true)}
                        className="w-full mt-4 py-2 bg-stone/5 rounded-mag text-[12px] text-charcoal font-medium flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[16px]">reviews</span>
                        查看全部 {placeInfo.reviews.length} 則評價
                    </motion.button>
                )}

                <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(placeName + ' Bangkok')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 text-center text-[11px] text-blue-500 hover:underline"
                >
                    在 Google Maps 上查看更多 →
                </a>
            </div>

            {/* All Reviews Modal */}
            <AnimatePresence>
                {showAllReviews && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAllReviews(false)}
                            className="fixed inset-0 bg-black/40 z-50"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-mag-xl z-50 max-h-[80vh] overflow-y-auto pb-safe"
                        >
                            <div className="sticky top-0 bg-white pt-3 pb-2 border-b border-black/5">
                                <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto mb-3" />
                                <div className="flex justify-between items-center px-5">
                                    <h3 className="text-[18px] font-bold text-charcoal">{placeInfo.name}</h3>
                                    <button onClick={() => setShowAllReviews(false)}>
                                        <span className="material-symbols-outlined text-stone">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                {placeInfo.reviews.map(review => (
                                    <div key={review.id} className="bg-stone/5 rounded-mag p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            {review.authorImage ? (
                                                <img src={review.authorImage} alt="" className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[12px] font-bold">
                                                    {review.author.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-[13px] font-medium text-charcoal">{review.author}</p>
                                                <div className="flex items-center gap-2">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="text-[10px] text-stone">{review.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[13px] text-charcoal">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
