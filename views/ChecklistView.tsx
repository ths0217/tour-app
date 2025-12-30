import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistItem {
    id: string;
    text: string;
    category: 'Documents' | 'Medical' | 'Gadgets' | 'Clothing' | 'Other';
    checked: boolean;
    sub?: string;
    assignee?: string;
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
    { id: 'Documents', label: '文件', icon: 'description' },
    { id: 'Medical', label: '藥品', icon: 'medication' },
    { id: 'Gadgets', label: '電子', icon: 'devices' },
    { id: 'Clothing', label: '衣物', icon: 'checkroom' },
    { id: 'Other', label: '其他', icon: 'category' },
];

const users = [
    { name: 'Vickly', image: '/avatars/me.jpg' },
    { name: 'Sherry', image: '/avatars/sister.jpg' },
    { name: 'Jenny', image: '/avatars/mother.jpg' },
    { name: 'Alex', image: '/avatars/brother.jpg' },
];

export default function ChecklistView() {
    const [items, setItems] = useState(initialItems);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<string>('Other');
    const [newItemUser, setNewItemUser] = useState(users[0]);

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
            assignee: newItemUser.image
        }]);
        setShowAddModal(false);
        setNewItemText('');
    };

    const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100);

    return (
        <div className="px-4 py-6 min-h-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-ios-title1 text-text-primary mb-1">行前準備</h1>
                <p className="text-ios-subhead text-ios-secondary">1/27 − 2/2 • 4 位旅客</p>
            </div>

            {/* Progress Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-ios-lg p-4 shadow-ios mb-6"
            >
                <div className="flex justify-between items-center mb-3">
                    <span className="text-ios-subhead text-ios-secondary">完成進度</span>
                    <span className="text-ios-headline text-ios-blue">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-ios-bg rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-ios-blue rounded-full"
                    />
                </div>
            </motion.div>

            {/* Checklist Items */}
            <div className="bg-white rounded-ios-lg shadow-ios overflow-hidden">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center gap-4 p-4 active:bg-ios-bg transition-colors cursor-pointer ${
                            index !== items.length - 1 ? 'border-b border-ios-separator/30' : ''
                        }`}
                    >
                        {/* Checkbox */}
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                            item.checked 
                                ? 'bg-ios-blue border-ios-blue' 
                                : 'border-ios-tertiary'
                        }`}>
                            {item.checked && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="material-symbols-outlined text-[16px] text-white font-bold"
                                >
                                    check
                                </motion.span>
                            )}
                        </div>
                        
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className={`text-ios-body truncate ${
                                item.checked ? 'line-through text-ios-tertiary' : 'text-text-primary'
                            }`}>
                                {item.text}
                            </p>
                            {item.sub && (
                                <p className="text-ios-caption1 text-ios-secondary mt-0.5">{item.sub}</p>
                            )}
                        </div>
                        
                        {/* Assignee Avatar */}
                        {item.assignee && (
                            <img 
                                src={item.assignee} 
                                alt="Assignee" 
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-ios-sm" 
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Add Button */}
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 p-4 rounded-ios-lg bg-white shadow-ios text-ios-blue text-ios-body font-medium active:bg-ios-bg transition-colors"
            >
                <span className="material-symbols-outlined text-[20px]">add</span>
                新增項目
            </motion.button>

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
                            className="fixed bottom-0 left-0 right-0 bg-ios-bg rounded-t-ios-2xl z-50 pb-safe max-h-[85vh] overflow-y-auto"
                        >
                            {/* Handle */}
                            <div className="sticky top-0 bg-ios-bg pt-3 pb-2">
                                <div className="w-10 h-1 bg-ios-tertiary rounded-full mx-auto" />
                            </div>
                            
                            <div className="px-4 pb-6">
                                <h3 className="text-ios-title3 text-text-primary mb-6 text-center">新增準備物品</h3>

                                {/* User Selection */}
                                <div className="mb-5">
                                    <label className="text-ios-footnote text-ios-secondary block mb-3">負責人</label>
                                    <div className="flex gap-3">
                                        {users.map(u => (
                                            <button
                                                key={u.name}
                                                onClick={() => setNewItemUser(u)}
                                                className={`flex flex-col items-center gap-1 transition-opacity ${
                                                    newItemUser.name === u.name ? 'opacity-100' : 'opacity-40'
                                                }`}
                                            >
                                                <img 
                                                    src={u.image} 
                                                    className={`w-14 h-14 rounded-full ring-2 ${
                                                        newItemUser.name === u.name ? 'ring-ios-blue' : 'ring-transparent'
                                                    }`} 
                                                />
                                                <span className="text-ios-caption2 text-text-primary">{u.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Item Name */}
                                <div className="mb-5">
                                    <label className="text-ios-footnote text-ios-secondary block mb-2">物品名稱</label>
                                    <input
                                        type="text"
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        className="w-full bg-white rounded-ios p-4 text-ios-body outline-none border border-ios-separator/30 focus:border-ios-blue transition-colors"
                                        placeholder="例如: 暈車藥"
                                    />
                                </div>

                                {/* Category */}
                                <div className="mb-6">
                                    <label className="text-ios-footnote text-ios-secondary block mb-2">分類</label>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setNewItemCategory(cat.id)}
                                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full whitespace-nowrap transition-all text-ios-subhead ${
                                                    newItemCategory === cat.id
                                                        ? 'bg-ios-blue text-white'
                                                        : 'bg-white text-text-primary border border-ios-separator/30'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={addItem}
                                    className="w-full bg-ios-blue text-white text-ios-body font-semibold p-4 rounded-ios-lg active:opacity-80 transition-opacity"
                                >
                                    確認新增
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}