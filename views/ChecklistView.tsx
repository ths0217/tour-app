import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistItem {
    id: string;
    text: string;
    category: 'Documents' | 'Medical' | 'Gadgets' | 'Clothing' | 'Other';
    checked: boolean;
    sub?: string;
    assignee?: string;
    confirmedBy?: { id: string; name: string; image: string };
}

interface FamilyMember {
    id: string;
    name: string;
    role: string;
    image: string;
}

interface ChecklistViewProps {
    currentUser?: { id: string; name: string } | null;
    familyMembers: FamilyMember[];
}

const initialItems: ChecklistItem[] = [
    { id: '1', text: '全家簽證 (e-VOA)', category: 'Documents', checked: true, sub: '姊姊已確認', assignee: '/avatars/sister.jpg' },
    { id: '2', text: '機票行程單 (列印)', category: 'Documents', checked: false, assignee: '/avatars/sister.jpg' },
    { id: '3', text: '常備藥品 (腸胃/感冒)', category: 'Medical', checked: false, assignee: '/avatars/mother.jpg' },
    { id: '4', text: '相機 & 腳架', category: 'Gadgets', checked: true, assignee: '/avatars/me.jpg' },
    { id: '5', text: '行動電源', category: 'Gadgets', checked: false, assignee: '/avatars/me.jpg' },
    { id: '6', text: '泳衣 & 墨鏡', category: 'Clothing', checked: false, assignee: '/avatars/sister.jpg' },
    { id: '7', text: '泰銖現金', category: 'Other', checked: false, assignee: '/avatars/brother.jpg' },
];

const categories = [
    { id: 'Documents', label: '文件', icon: 'description', color: 'from-blue-400 to-indigo-500' },
    { id: 'Medical', label: '藥品', icon: 'medication', color: 'from-green-400 to-emerald-500' },
    { id: 'Gadgets', label: '電子', icon: 'devices', color: 'from-purple-400 to-violet-500' },
    { id: 'Clothing', label: '衣物', icon: 'checkroom', color: 'from-pink-400 to-rose-500' },
    { id: 'Other', label: '其他', icon: 'category', color: 'from-orange-400 to-amber-500' },
];

export default function ChecklistView({ currentUser, familyMembers }: ChecklistViewProps) {
    const [items, setItems] = useState(initialItems);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<string>('Other');
    const [selectedAssignee, setSelectedAssignee] = useState<FamilyMember | null>(familyMembers[0] || null);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);

    // Helper to get member image with gradient support
    const getMemberImage = (memberId: string) => {
        const member = familyMembers.find(m => m.id === memberId);
        return member?.image || '/avatars/me.jpg';
    };

    const toggleItem = (id: string) => {
        const currentMember = familyMembers.find(m => m.id === currentUser?.id);
        setItems(items.map(item => {
            if (item.id !== id) return item;
            const newChecked = !item.checked;
            return { 
                ...item, 
                checked: newChecked,
                confirmedBy: newChecked && currentMember ? {
                    id: currentMember.id,
                    name: currentMember.name,
                    image: currentMember.image
                } : undefined,
                sub: newChecked && currentMember ? `${currentMember.name} 已確認` : undefined
            };
        }));
    };

    const addItem = () => {
        if (!newItemText) return;
        setItems([...items, {
            id: Date.now().toString(),
            text: newItemText,
            category: newItemCategory as any,
            checked: false,
            assignee: selectedAssignee?.image
        }]);
        setShowAddModal(false);
        setNewItemText('');
    };

    const filteredItems = filterCategory 
        ? items.filter(i => i.category === filterCategory)
        : items;

    const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100);
    const completedCount = items.filter(i => i.checked).length;

    return (
        <div className="min-h-full">
            {/* Glassmorphism Header */}
            <div className="sticky top-0 z-40 glass border-b border-black/5 safe-top">
                <div className="px-4 pt-4 pb-3">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-mag-hero text-charcoal">行前準備</h1>
                            <p className="text-mag-caption text-stone mt-1">📦 出發前的打包清單</p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddModal(true)}
                            className="w-11 h-11 rounded-full bg-red-xhs flex items-center justify-center shadow-mag"
                        >
                            <span className="material-symbols-outlined text-white text-[22px]">add</span>
                        </motion.button>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white rounded-mag p-4 shadow-mag mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-mag-caption text-stone">完成進度</span>
                            <span className="text-mag-body font-semibold text-charcoal">{completedCount}/{items.length}</span>
                        </div>
                        <div className="h-2 bg-stone/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                            />
                        </div>
                        <p className="text-mag-badge text-stone mt-2">
                            {progress === 100 ? '✨ 全部完成！準備出發！' : `還有 ${items.length - completedCount} 項待完成`}
                        </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                        <button
                            onClick={() => setFilterCategory(null)}
                            className={`px-4 py-2 rounded-pill text-mag-badge whitespace-nowrap transition-all ${
                                !filterCategory
                                    ? 'bg-charcoal text-white'
                                    : 'bg-white/80 text-charcoal border border-black/5'
                            }`}
                        >
                            全部
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-mag-badge whitespace-nowrap transition-all ${
                                    filterCategory === cat.id
                                        ? 'bg-charcoal text-white'
                                        : 'bg-white/80 text-charcoal border border-black/5'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Checklist Items */}
            <div className="px-4 pt-4 pb-safe">
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredItems.map((item, index) => {
                            const cat = categories.find(c => c.id === item.category);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                    onClick={() => toggleItem(item.id)}
                                    className={`bg-white rounded-mag p-4 shadow-mag cursor-pointer transition-all ${
                                        item.checked ? 'opacity-60' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Checkbox */}
                                        <motion.div 
                                            whileTap={{ scale: 0.8 }}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                item.checked 
                                                    ? 'bg-gradient-to-br ' + (cat?.color || 'from-green-400 to-emerald-500') + ' border-transparent' 
                                                    : 'border-stone/30'
                                            }`}
                                        >
                                            {item.checked && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="material-symbols-outlined text-white text-[16px]"
                                                >
                                                    check
                                                </motion.span>
                                            )}
                                        </motion.div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-mag-body transition-all ${
                                                item.checked ? 'line-through text-stone' : 'text-charcoal'
                                            }`}>
                                                {item.text}
                                            </p>
                                            {item.sub && (
                                                <p className="text-mag-caption text-stone mt-0.5">{item.sub}</p>
                                            )}
                                        </div>
                                        
                                        {/* Category Badge */}
                                        <span className={`px-2.5 py-1 rounded-pill text-mag-badge bg-gradient-to-r ${cat?.color} text-white shrink-0`}>
                                            {cat?.label}
                                        </span>
                                        
                                        {/* Assignee */}
                                        {item.assignee && (() => {
                                            // Find member by image or use confirmedBy
                                            const confirmedMember = item.confirmedBy;
                                            const assigneeImage = confirmedMember?.image || item.assignee;
                                            
                                            if (assigneeImage.startsWith('gradient:')) {
                                                return (
                                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${assigneeImage.split(':')[1]} flex items-center justify-center text-white text-[12px] font-bold ring-2 ring-white shadow-mag shrink-0`}>
                                                        {assigneeImage.split(':')[2]}
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div 
                                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-stone/20 to-stone/10 flex items-center justify-center ring-2 ring-white shadow-mag shrink-0 overflow-hidden"
                                                >
                                                    <img 
                                                        src={assigneeImage} 
                                                        alt="Assignee"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <span className="hidden text-[14px]">👤</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add Item Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="fixed inset-0 bg-black/40 z-50"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-mag-xl z-50 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-cream pt-3 pb-2 z-10">
                                <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
                            </div>
                            
                            <div className="px-5 pb-safe">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setShowAddModal(false)} className="text-stone text-mag-body">取消</button>
                                    <h3 className="text-mag-title text-charcoal">新增物品</h3>
                                    <button onClick={addItem} className="text-red-xhs text-mag-body font-semibold">新增</button>
                                </div>

                                {/* User Selection */}
                                <div className="mb-5">
                                    <label className="text-mag-caption text-stone block mb-3">負責人</label>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                                        {familyMembers.map(u => (
                                            <motion.button
                                                key={u.id}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedAssignee(u)}
                                                className="flex flex-col items-center gap-2 flex-shrink-0"
                                            >
                                                {u.image.startsWith('gradient:') ? (
                                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${u.image.split(':')[1]} flex items-center justify-center text-white text-[16px] font-bold shadow-mag transition-all ${
                                                        selectedAssignee?.id === u.id 
                                                            ? 'ring-2 ring-red-xhs' 
                                                            : 'opacity-50'
                                                    }`}>
                                                        {u.image.split(':')[2]}
                                                    </div>
                                                ) : (
                                                    <img 
                                                        src={u.image} 
                                                        className={`w-12 h-12 rounded-full object-cover shadow-mag transition-all ${
                                                            selectedAssignee?.id === u.id 
                                                                ? 'ring-2 ring-red-xhs' 
                                                                : 'opacity-50'
                                                        }`} 
                                                    />
                                                )}
                                                <span className={`text-[10px] ${
                                                    selectedAssignee?.id === u.id ? 'text-charcoal font-medium' : 'text-stone'
                                                }`}>{u.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Item Name */}
                                <div className="mb-5">
                                    <label className="text-mag-caption text-stone block mb-2">物品名稱</label>
                                    <div className="bg-white rounded-mag p-4 shadow-mag">
                                        <input
                                            type="text"
                                            value={newItemText}
                                            onChange={(e) => setNewItemText(e.target.value)}
                                            className="w-full text-mag-body text-charcoal bg-transparent outline-none placeholder:text-stone/50"
                                            placeholder="例如: 暈車藥"
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="mb-6">
                                    <label className="text-mag-caption text-stone block mb-3">分類</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setNewItemCategory(cat.id)}
                                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-pill text-mag-badge transition-all ${
                                                    newItemCategory === cat.id
                                                        ? `bg-gradient-to-r ${cat.color} text-white`
                                                        : 'bg-white text-charcoal border border-black/5'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={addItem}
                                    className="w-full bg-gradient-to-r from-red-400 to-rose-500 text-white text-mag-body font-semibold p-4 rounded-mag shadow-mag"
                                >
                                    確認新增
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}