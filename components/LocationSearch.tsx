import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (result: { name: string, lat: number, lng: number }) => void;
    placeholder?: string;
    className?: string;
}

export default function LocationSearch({ value, onChange, onSelect, placeholder = "搜尋地點...", className = "" }: Props) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length < 2 || !isOpen) return;

            // Avoid searching if query matches selected value exactly
            if (query === value) return;

            setLoading(true);
            try {
                // Using OpenStreetMap Nominatim API (Free, No Key)
                // Limit to Thailand for relevance (or broader if needed)
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=TH&limit=5&accept-language=zh-TW,en`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query, isOpen]);

    const handleSelect = (result: SearchResult) => {
        // Extract a shorter name (first part of display_name)
        const name = result.display_name.split(',')[0];

        onChange(name);
        setIsOpen(false);
        setResults([]);

        if (onSelect) {
            onSelect({
                name: name,
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            });
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full text-mag-body text-charcoal bg-transparent outline-none placeholder:text-stone/50 pr-8"
                />
                {loading && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-stone/20 border-t-stone rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-mag shadow-mag-hover z-50 overflow-hidden border border-black/5"
                    >
                        {results.map((result) => (
                            <button
                                key={result.place_id}
                                onClick={() => handleSelect(result)}
                                className="w-full text-left px-4 py-3 hover:bg-stone/5 transition-colors border-b border-black/5 last:border-0 flex items-start gap-3"
                            >
                                <span className="material-symbols-outlined text-stone text-[18px] mt-0.5">location_on</span>
                                <div>
                                    <p className="text-mag-body font-semibold text-charcoal line-clamp-1">
                                        {result.display_name.split(',')[0]}
                                    </p>
                                    <p className="text-[11px] text-stone line-clamp-1">
                                        {result.display_name.split(',').slice(1).join(',')}
                                    </p>
                                </div>
                            </button>
                        ))}
                        <div className="px-2 py-1 bg-stone/5 text-[10px] text-stone text-center flex items-center justify-center gap-1">
                            Powered by <span className="font-semibold">OpenStreetMap</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
