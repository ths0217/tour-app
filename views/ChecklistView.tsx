import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import ReactConfetti from 'react-confetti';
import ChecklistItemComponent from '../components/ChecklistItem';
import { ChecklistItem, FamilyMember } from '../types';

interface ChecklistViewProps {
    currentUser?: { id: string; name: string } | null;
    familyMembers: FamilyMember[];
}

const initialItems: ChecklistItem[] = [
    { id: '1', text: '全家簽證 (e-VOA)', category: 'Documents', checked: true, sub: '姊姊已確認', assigneeId: 'sherry', confirmedById: 'sherry' },
    { id: '2', text: '機票行程單 (列印)', category: 'Documents', checked: false, assigneeId: 'sherry' },
    { id: '3', text: '常備藥品 (腸胃/感冒)', category: 'Medical', checked: false, assigneeId: 'mom' },
    { id: '4', text: '相機 & 腳架', category: 'Gadgets', checked: true, assigneeId: 'vickly', confirmedById: 'vickly' },
    { id: '5', text: '行動電源', category: 'Gadgets', checked: false, assigneeId: 'vickly' },
    { id: '6', text: '泳衣 & 墨鏡', category: 'Clothing', checked: false, assigneeId: 'sherry' },
    { id: '7', text: '泰銖現金', category: 'Other', checked: false, assigneeId: 'brother' },
];

const categories = [
    { id: 'Documents', label: '文件', icon: 'description', color: 'from-blue-400 to-indigo-500' },
    { id: 'Medical', label: '藥品', icon: 'medication', color: 'from-green-400 to-emerald-500' },
    { id: 'Gadgets', label: '電子', icon: 'devices', color: 'from-purple-400 to-violet-500' },
    { id: 'Clothing', label: '衣物', icon: 'checkroom', color: 'from-pink-400 to-rose-500' },
    { id: 'Other', label: '其他', icon: 'category', color: 'from-orange-400 to-amber-500' },
];

export default function ChecklistView({ currentUser, familyMembers }: ChecklistViewProps) {
    const { showToast } = useToast();
    const [items, setItems] = useState<ChecklistItem[]>(() => {
        const saved = localStorage.getItem('tourapp_checklist');
        return saved ? JSON.parse(saved) : initialItems;
    });

    useEffect(() => {
        localStorage.setItem('tourapp_checklist', JSON.stringify(items));
    }, [items]);

    // iOS Reminders style inline add state
    const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
    const [newItemText, setNewItemText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Focus input when adding to a category
    useEffect(() => {
        if (addingToCategory && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [addingToCategory]);

    const toggleItem = (id: string) => {
        const currentMember = familyMembers.find(m => m.id === currentUser?.id);
        const newItems = items.map(item => {
            if (item.id !== id) return item;
            const newChecked = !item.checked;

            if (navigator.vibrate) {
                navigator.vibrate(newChecked ? [10, 30, 10] : 10);
            }

            return {
                ...item,
                checked: newChecked,
                confirmedById: newChecked && currentMember ? currentMember.id : undefined,
                sub: newChecked && currentMember ? `${currentMember.name} 已確認` : undefined
            };
        });
        setItems(newItems);

        const allChecked = newItems.every(i => i.checked);
        if (allChecked && !items.every(i => i.checked)) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            showToast('🎉 全部完成！準備出發！', 'success');
            if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 200]);
        }
    };

    const deleteItem = (id: string) => {
        if (navigator.vibrate) navigator.vibrate(50);
        setItems(prev => prev.filter(i => i.id !== id));
        showToast('✓ 已刪除', 'info');
    };

    const startAddingToCategory = (categoryId: string) => {
        setAddingToCategory(categoryId);
        setNewItemText('');
    };

    const handleAddItem = () => {
        const trimmedText = newItemText.trim();
        if (!trimmedText || !addingToCategory) return;

        const newItem: ChecklistItem = {
            id: Date.now().toString(),
            text: trimmedText,
            category: addingToCategory as any,
            checked: false,
            assigneeId: currentUser?.id || familyMembers[0]?.id
        };

        setItems(prev => [...prev, newItem]);
        setNewItemText('');
        if (navigator.vibrate) navigator.vibrate([10, 20]);
        showToast(`✓ 已新增: ${trimmedText}`, 'success');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        } else if (e.key === 'Escape') {
            setAddingToCategory(null);
            setNewItemText('');
        }
    };

    const handleBlur = () => {
        if (!newItemText.trim()) {
            setTimeout(() => setAddingToCategory(null), 200);
        }
    };

    const progress = items.length > 0 ? Math.round((items.filter(i => i.checked).length / items.length) * 100) : 0;
    const completedCount = items.filter(i => i.checked).length;

    const groupedItems = useMemo(() => {
        const groups: Record<string, ChecklistItem[]> = {};
        categories.forEach(cat => groups[cat.id] = []);
        items.forEach(item => {
            if (groups[item.category]) groups[item.category].push(item);
            else {
                if (!groups['Other']) groups['Other'] = [];
                groups['Other'].push(item);
            }
        });
        return groups;
    }, [items]);

    return (
        <div className="min-h-full bg-ios-bg pb-safe">
            {showConfetti && <ReactConfetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

            {/* Header */}
            <div className="sticky top-0 z-40 glass border-b border-black/5 safe-top backdrop-blur-md bg-white/70">
                <div className="px-5 pt-4 pb-3">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-[28px] font-bold text-charcoal tracking-tight">行前準備</h1>
                            <p className="text-[13px] text-stone mt-0.5 font-medium">✨ {items.length - completedCount} 個待辦事項</p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startAddingToCategory('Other')}
                            className="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center shadow-lg"
                        >
                            <span className="material-symbols-outlined text-white text-[20px]">add</span>
                        </motion.button>
                    </div>

                    {/* Compact Progress */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-stone/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-full rounded-full ${progress === 100 ? 'bg-gradient-to-r from-yellow-400 via-green-500 to-emerald-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`}
                            />
                        </div>
                        <span className={`text-[12px] font-bold w-8 text-right ${progress === 100 ? 'text-emerald-600' : 'text-stone'}`}>
                            {progress}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center pt-20 px-6 text-center"
                >
                    <div className="w-24 h-24 bg-stone/10 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-[40px] text-stone/50">checklist</span>
                    </div>
                    <h3 className="text-lg font-bold text-charcoal mb-2">準備好出發了嗎？</h3>
                    <p className="text-stone text-[15px] mb-8">目前清單是空的。<br />點擊分類下方的「新增」按鈕！</p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startAddingToCategory('Other')}
                        className="px-6 py-3 bg-charcoal text-white rounded-xl font-bold shadow-lg"
                    >
                        開始新增
                    </motion.button>
                </motion.div>
            )}

            {/* Grouped Lists - iOS Reminders Style */}
            {items.length > 0 && (
                <div className="px-4 py-6 space-y-6">
                    {categories.map(cat => {
                        const categoryItems = groupedItems[cat.id] || [];
                        const isAddingHere = addingToCategory === cat.id;

                        return (
                            <div key={cat.id}>
                                <h3 className="text-[13px] font-semibold text-stone ml-1 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                    <span className={`text-[16px] bg-clip-text text-transparent bg-gradient-to-r ${cat.color} material-symbols-outlined`}>
                                        {cat.icon}
                                    </span>
                                    {cat.label}
                                    <span className="text-stone/50 font-normal">({categoryItems.length})</span>
                                </h3>
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-black/5">
                                    <AnimatePresence initial={false}>
                                        {categoryItems.map(item => (
                                            <ChecklistItemComponent
                                                key={item.id}
                                                item={item}
                                                toggleItem={toggleItem}
                                                deleteItem={deleteItem}
                                                familyMembers={familyMembers}
                                                categories={categories}
                                            />
                                        ))}
                                    </AnimatePresence>

                                    {/* iOS Reminders Style Inline Add */}
                                    {isAddingHere ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-black/5 flex items-center gap-3 px-4 py-3"
                                        >
                                            <div className="w-5 h-5 rounded-full border-2 border-stone/30 flex-shrink-0" />
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={newItemText}
                                                onChange={(e) => setNewItemText(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onBlur={handleBlur}
                                                placeholder="輸入項目名稱，按 Enter 確認"
                                                className="flex-1 bg-transparent text-[15px] text-charcoal placeholder:text-stone/50 outline-none"
                                            />
                                            {newItemText.trim() && (
                                                <motion.button
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={handleAddItem}
                                                    className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                                                >
                                                    <span className="material-symbols-outlined text-white text-[16px]">check</span>
                                                </motion.button>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            whileTap={{ scale: 0.98, backgroundColor: 'rgba(0,0,0,0.03)' }}
                                            onClick={() => startAddingToCategory(cat.id)}
                                            className="w-full border-t border-black/5 flex items-center gap-3 px-4 py-3 text-stone transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                            <span className="text-[14px]">新增{cat.label}</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Floating Celebration Banner */}
            <AnimatePresence>
                {progress === 100 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 shadow-xl flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[24px]">celebration</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold text-[16px]">全部準備完成！</p>
                            <p className="text-white/80 text-[13px]">{items.length} 個項目已確認 ✓</p>
                        </div>
                        <span className="text-3xl">🎉</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}