import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import ReactConfetti from 'react-confetti';
import ChecklistItemComponent from '../components/ChecklistItem';
import { ChecklistItem, FamilyMember } from '../types';

interface ChecklistViewProps {
    currentUser?: { id: string; name: string } | null;
    familyMembers: FamilyMember[];
}

// Keep initialItems but update structure if needed (using member IDs)
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
    // Load initial items from localStorage or use default
    const [items, setItems] = useState<ChecklistItem[]>(() => {
        const saved = localStorage.getItem('tourapp_checklist');
        return saved ? JSON.parse(saved) : initialItems;
    });

    // Persist items to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tourapp_checklist', JSON.stringify(items));
    }, [items]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<string>('Other');
    const [selectedAssignee, setSelectedAssignee] = useState<FamilyMember | null>(familyMembers[0] || null);
    
    // Confetti State
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleItem = (id: string) => {
        const currentMember = familyMembers.find(m => m.id === currentUser?.id);
        const newItems = items.map(item => {
            if (item.id !== id) return item;
            const newChecked = !item.checked;
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(newChecked ? [10, 30] : 10);
            }

            return { 
                ...item, 
                checked: newChecked,
                confirmedById: newChecked && currentMember ? currentMember.id : undefined,
                sub: newChecked && currentMember ? `${currentMember.name} 已確認` : undefined
            };
        });
        setItems(newItems);
        
        // Check for 100% completion
        const allChecked = newItems.every(i => i.checked);
        if (allChecked && !items.every(i => i.checked)) {
             setShowConfetti(true);
             setTimeout(() => setShowConfetti(false), 5000); // Stop after 5s
             showToast('🎉 全部完成！準備出發！', 'success');
        }
    };

    const deleteItem = (id: string) => {
        if (navigator.vibrate) navigator.vibrate(50);
        setItems(prev => prev.filter(i => i.id !== id));
        showToast('項目已刪除', 'info');
    };

    const addItem = () => {
        if (!newItemText) {
            showToast('請輸入項目名稱', 'warning');
            return;
        }
        setItems([...items, {
            id: Date.now().toString(),
            text: newItemText,
            category: newItemCategory as any,
            checked: false,
            assigneeId: selectedAssignee?.id
        }]);
        setShowAddModal(false);
        setNewItemText('');
        showToast(`已新增: ${newItemText}`, 'success');
    };

    const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100);
    const completedCount = items.filter(i => i.checked).length;

    // Group items by category (Memoized)
    const groupedItems = useMemo(() => {
        const groups: Record<string, ChecklistItem[]> = {};
        categories.forEach(cat => groups[cat.id] = []);
        items.forEach(item => {
            if (groups[item.category]) groups[item.category].push(item);
            else {
                // Handle unknown categories
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
                            onClick={() => setShowAddModal(true)}
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
                                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                            />
                        </div>
                        <span className="text-[12px] font-bold text-stone w-8 text-right">{progress}%</span>
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
                    <p className="text-stone text-[15px] mb-8">目前清單是空的。<br/>點擊右上方或是下方按鈕來新增物品！</p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-charcoal text-white rounded-xl font-bold shadow-lg"
                    >
                        開始新增
                    </motion.button>
                </motion.div>
            )}

            {/* Grouped Lists (iOS Settings Style) */}
            {items.length > 0 && (
                <div className="px-4 py-6 space-y-6">
                    {categories.map(cat => {
                        const categoryItems = groupedItems[cat.id] || [];
                        if (categoryItems.length === 0) return null;

                        return (
                            <div key={cat.id}>
                                <h3 className="text-[13px] font-semibold text-stone ml-1 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                    <span className={`text-[16px] bg-clip-text text-transparent bg-gradient-to-r ${cat.color} material-symbols-outlined`}>
                                        {cat.icon}
                                    </span>
                                    {cat.label}
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-6 pb-safe pointer-events-auto m-0 sm:m-4"
                        >
                            <div className="w-12 h-1.5 bg-stone/20 rounded-full mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-charcoal mb-6">新增待辦事項</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-stone uppercase mb-1.5 block">項目名稱</label>
                                    <input
                                        type="text"
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        placeholder="例如：太陽眼鏡"
                                        className="w-full h-12 bg-ios-bg rounded-xl px-4 text-mag-body focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-stone uppercase mb-1.5 block">分類</label>
                                        <select
                                            value={newItemCategory}
                                            onChange={(e) => setNewItemCategory(e.target.value)}
                                            className="w-full h-12 bg-ios-bg rounded-xl px-4 text-mag-body focus:outline-none focus:ring-2 focus:ring-charcoal/20 appearance-none"
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-stone uppercase mb-1.5 block">負責人</label>
                                        <select
                                            value={selectedAssignee?.id || ''}
                                            onChange={(e) => setSelectedAssignee(familyMembers.find(m => m.id === e.target.value) || null)}
                                            className="w-full h-12 bg-ios-bg rounded-xl px-4 text-mag-body focus:outline-none focus:ring-2 focus:ring-charcoal/20 appearance-none"
                                        >
                                            {familyMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={addItem}
                                    className="w-full h-14 bg-charcoal text-white rounded-2xl font-bold text-[16px] shadow-lg mt-4"
                                >
                                    新增項目
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}