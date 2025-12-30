import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistItem {
    id: string;
    text: string;
    category: 'Documents' | 'Medical' | 'Gadgets' | 'Clothing' | 'Other';
    checked: boolean;
    sub?: string;
    assignee?: string;
    image?: string; // Legacy support if needed
    initials?: string; // Legacy support
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
    { id: 'Documents', label: '文件' },
    { id: 'Wardrobe', label: '衣物' },
    { id: 'Tech', label: '電子' },
    { id: 'Health', label: '藥品' },
    { id: 'Other', label: '其他' },
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
    const [newItemCategory, setNewItemCategory] = useState('Other');
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
        <div className="pt-14 px-6 pb-6 relative min-h-full">
            <h2 className="text-3xl font-light tracking-wide text-text-primary font-display mb-2">行前準備</h2>
            <div className="flex items-center gap-2 text-gold mb-8">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <p className="text-[11px] font-medium tracking-[0.15em] uppercase">1月27日 — 2月2日 • 4 位旅客</p>
            </div>

            {/* Progress */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">完成度</span>
                    <span className="text-xl font-serif text-text-primary">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gold rounded-full"
                    />
                </div>
            </div>

            <div className="space-y-4 pb-20">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        onClick={() => toggleItem(item.id)}
                        className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] duration-200 ${item.checked ? 'bg-bone border-transparent opacity-60' : 'bg-white border-black/5 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`relative flex items-center justify-center size-6 rounded-full border-[1.5px] transition-colors ${item.checked ? 'border-gold bg-gold' : 'border-icon group-hover:border-text-primary'
                                }`}>
                                {item.checked && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="material-symbols-outlined text-white text-[16px] font-bold"
                                    >
                                        check
                                    </motion.span>
                                )}
                            </div>
                            <div>
                                <span className={`text-base font-medium tracking-wide ${item.checked ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                    {item.text}
                                </span>
                                {item.sub && <p className="text-xs text-text-muted font-light mt-0.5">{item.sub}</p>}
                            </div>
                        </div>
                        {item.assignee && (
                            <img src={item.assignee} alt="Assignee" className="size-8 rounded-full border-2 border-white object-cover shadow-sm" />
                        )}
                    </motion.div>
                ))}
            </div>

            <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-icon/30 p-4 text-text-muted hover:bg-white hover:text-gold hover:border-gold transition-all active:scale-[0.99]"
            >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span className="text-sm font-medium tracking-wide">新增項目</span>
            </button>

            {/* Add Item Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe"
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
                            <h3 className="text-xl font-medium text-text-primary mb-6">新增準備物品</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">誰添加的？</label>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                        {users.map(u => (
                                            <button
                                                key={u.name}
                                                onClick={() => setNewItemUser(u)}
                                                className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-opacity ${newItemUser.name === u.name ? 'opacity-100' : 'opacity-50 grayscale'}`}
                                            >
                                                <img src={u.image} className={`w-12 h-12 rounded-full border-2 ${newItemUser.name === u.name ? 'border-gold' : 'border-transparent'}`} />
                                                <span className="text-[10px] font-bold text-text-primary">{u.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">物品名稱</label>
                                    <input
                                        type="text"
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-gold transition-colors"
                                        placeholder="例如: 暈車藥"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">分類</label>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setNewItemCategory(cat.id)}
                                                className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-all text-sm ${newItemCategory === cat.id
                                                    ? 'bg-text-primary text-white border-text-primary'
                                                    : 'bg-white border-gray-200 text-text-secondary'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={addItem}
                                    className="w-full bg-text-primary text-ivory font-medium p-4 rounded-xl mt-4 active:scale-95 transition-transform"
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