import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistItem {
    id: string;
    text: string;
    category: 'Documents' | 'Medical' | 'Gadgets' | 'Clothing' | 'Other';
    checked: boolean;
    sub?: string;
}

const initialItems: ChecklistItem[] = [
    { id: '1', text: '全家簽證 (e-VOA)', category: 'Documents', checked: true, sub: '姊姊已確認' },
    { id: '2', text: '機票行程單 (列印)', category: 'Documents', checked: false },
    { id: '3', text: '常備藥品 (腸胃/感冒)', category: 'Medical', checked: false },
    { id: '4', text: '相機 & 腳架', category: 'Gadgets', checked: true },
    { id: '5', text: '行動電源', category: 'Gadgets', checked: false },
    { id: '6', text: '泳衣 & 墨鏡', category: 'Clothing', checked: false },
    { id: '7', text: '泰銖現金', category: 'Other', checked: false },
];

const categories = [
    { id: 'Documents', label: '文件', icon: 'description' },
    { id: 'Medical', label: '藥品', icon: 'medication' },
    { id: 'Gadgets', label: '電子', icon: 'devices' },
    { id: 'Clothing', label: '衣物', icon: 'checkroom' },
    { id: 'Other', label: '其他', icon: 'category' },
];

export default function ChecklistView() {
    const [items, setItems] = useState(initialItems);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<string>('Other');

    const toggleItem = (id: string) => {
        setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const addItem = () => {
        if (!newItemText) return;
        setItems([...items, {
            id: Date.now().toString(),
            text: newItemText,
            category: newItemCategory as any,
            checked: false,
        }]);
        setShowAddModal(false);
        setNewItemText('');
    };

    const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100);
    const completedCount = items.filter(i => i.checked).length;

    // Group by category
    const groupedItems = categories.map(cat => ({
        ...cat,
        items: items.filter(i => i.category === cat.id)
    })).filter(g => g.items.length > 0);

    return (
        <div className="min-h-screen bg-ios-bg pb-safe">
            {/* Header */}
            <div className="ios-glass sticky top-0 z-40 border-b border-black/5 safe-top">
                <div className="px-5 pt-4 pb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-ios-largeTitle text-[#1C1C1E]">行前準備</h1>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddModal(true)}
                            className="w-11 h-11 rounded-full bg-ios-blue flex items-center justify-center shadow-ios"
                        >
                            <span className="material-symbols-outlined text-white text-[22px]">add</span>
                        </motion.button>
                    </div>

                    {/* Progress */}
                    <div className="ios-card p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-ios-subhead text-ios-gray">完成進度</span>
                            <span className="text-ios-headline text-[#1C1C1E]">{completedCount}/{items.length}</span>
                        </div>
                        <div className="h-2 bg-ios-gray5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full rounded-full bg-ios-green"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grouped List */}
            <div className="px-5 pt-5 space-y-6">
                {groupedItems.map((group) => (
                    <div key={group.id}>
                        <p className="text-ios-footnote text-ios-gray uppercase mb-2 px-4">{group.label}</p>
                        <div className="ios-list">
                            {group.items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className="ios-list-item flex items-center gap-4 cursor-pointer"
                                >
                                    {/* Checkbox */}
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                        item.checked 
                                            ? 'bg-ios-green border-ios-green' 
                                            : 'border-ios-gray3'
                                    }`}>
                                        {item.checked && (
                                            <span className="material-symbols-outlined text-white text-[16px]">check</span>
                                        )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-ios-body text-[#1C1C1E] ${
                                            item.checked ? 'line-through text-ios-gray' : ''
                                        }`}>{item.text}</p>
                                        {item.sub && (
                                            <p className="text-ios-caption1 text-ios-gray">{item.sub}</p>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    <span className="material-symbols-outlined text-ios-gray3 text-[20px]">chevron_right</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
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
                            className="fixed bottom-0 left-0 right-0 bg-ios-bg rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-ios-bg pt-3 pb-2 z-10">
                                <div className="w-10 h-1 bg-ios-gray3 rounded-full mx-auto" />
                            </div>
                            
                            <div className="px-5 pb-safe">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setShowAddModal(false)} className="text-ios-blue text-ios-body">取消</button>
                                    <h3 className="text-ios-headline text-[#1C1C1E]">新增物品</h3>
                                    <button onClick={addItem} className="text-ios-blue text-ios-body font-semibold">完成</button>
                                </div>

                                {/* Input */}
                                <div className="ios-list mb-5">
                                    <div className="ios-list-item">
                                        <input
                                            type="text"
                                            value={newItemText}
                                            onChange={(e) => setNewItemText(e.target.value)}
                                            className="w-full text-ios-body text-[#1C1C1E] bg-transparent outline-none placeholder:text-ios-gray3"
                                            placeholder="物品名稱"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <p className="text-ios-footnote text-ios-gray uppercase mb-3">分類</p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewItemCategory(cat.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-ios-subhead transition-all ${
                                                newItemCategory === cat.id
                                                    ? 'bg-ios-blue text-white'
                                                    : 'bg-white text-[#1C1C1E] shadow-ios'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}