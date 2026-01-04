import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, User } from '../types';

const categories = [
    { id: 'Dining', label: '餐飲', icon: 'restaurant', color: 'from-orange-400 to-amber-500' },
    { id: 'Transport', label: '交通', icon: 'directions_car', color: 'from-blue-400 to-indigo-500' },
    { id: 'Accommodation', label: '住宿', icon: 'hotel', color: 'from-purple-400 to-violet-500' },
    { id: 'Retail', label: '購物', icon: 'shopping_bag', color: 'from-pink-400 to-rose-500' },
    { id: 'Entertainment', label: '娛樂', icon: 'attractions', color: 'from-green-400 to-emerald-500' },
    { id: 'Other', label: '其他', icon: 'receipt', color: 'from-stone to-charcoal' },
];

const familyMembers = [
    { name: '我', image: '/avatars/me.jpg' },
    { name: '姊姊', image: '/avatars/sister.jpg' },
    { name: '媽媽', image: '/avatars/mother.jpg' },
    { name: '哥哥', image: '/avatars/brother.jpg' },
];

interface WalletViewProps {
    user: User | null;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    budgetGoal: number;
    setBudgetGoal: React.Dispatch<React.SetStateAction<number>>;
    hotelInfo: { name: string; bookingId: string; location: string };
    setHotelInfo: React.Dispatch<React.SetStateAction<{ name: string; bookingId: string; location: string }>>;
}

export default function WalletView({ user, expenses, setExpenses, budgetGoal, setBudgetGoal }: WalletViewProps) {
    const [activeTab, setActiveTab] = useState<'expenses' | 'settle'>('expenses');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditBudget, setShowEditBudget] = useState(false);

    // New Expense State
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newPayer, setNewPayer] = useState(familyMembers[0]);
    const [newCategory, setNewCategory] = useState(categories[0].id);

    // Budget State
    const [budgetInput, setBudgetInput] = useState(budgetGoal);

    // Calculations
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = budgetGoal - totalSpent;
    const spentPercent = budgetGoal > 0 ? (totalSpent / budgetGoal) * 100 : 0;
    const average = totalSpent / familyMembers.length;

    // Per person settlement
    const settlements = familyMembers.map(member => {
        const paid = expenses.filter(e => e.payer === member.name).reduce((acc, curr) => acc + curr.amount, 0);
        return { ...member, paid, balance: paid - average };
    });

    useEffect(() => {
        if (showEditBudget) setBudgetInput(budgetGoal);
    }, [showEditBudget, budgetGoal]);

    const handleAddExpense = () => {
        if (!newTitle || !newAmount) return;
        const newExp: Expense = {
            id: Date.now(),
            title: newTitle,
            amount: parseFloat(newAmount) || 0,
            cat: newCategory,
            time: '剛剛',
            payer: newPayer.name
        };
        setExpenses(prev => [newExp, ...prev]);
        setShowAddModal(false);
        setNewTitle('');
        setNewAmount('');
    };

    const handleSaveBudget = () => {
        setBudgetGoal(budgetInput);
        setShowEditBudget(false);
    };

    const getCategoryInfo = (catId: string) => categories.find(c => c.id === catId) || categories[5];

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="sticky top-0 z-40 glass border-b border-black/5 safe-top">
                <div className="px-4 pt-4 pb-3">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-mag-hero text-charcoal">錢包</h1>
                            <p className="text-mag-caption text-stone mt-1">💰 旅程消費紀錄</p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddModal(true)}
                            className="w-11 h-11 rounded-full bg-red-xhs flex items-center justify-center shadow-mag"
                        >
                            <span className="material-symbols-outlined text-white text-[22px]">add</span>
                        </motion.button>
                    </div>

                    {/* Budget Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-mag p-4 shadow-mag mb-4 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pastel-mint to-transparent rounded-bl-full opacity-50" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-mag-caption text-stone mb-1">團體總預算</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[32px] font-bold text-charcoal leading-none">
                                        ฿{Math.round(remaining).toLocaleString()}
                                    </span>
                                    <span className="text-mag-caption text-stone">剩餘</span>
                                </div>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowEditBudget(true)}
                                className="px-3 py-1.5 rounded-pill bg-charcoal text-white text-mag-badge"
                            >
                                編輯
                            </motion.button>
                        </div>
                        
                        <div className="h-2 bg-stone/10 rounded-full overflow-hidden mb-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(spentPercent, 100)}%` }}
                                transition={{ duration: 0.6 }}
                                className={`h-full rounded-full ${
                                    spentPercent > 80 
                                        ? 'bg-gradient-to-r from-red-400 to-rose-500' 
                                        : 'bg-gradient-to-r from-green-400 to-emerald-500'
                                }`}
                            />
                        </div>
                        <div className="flex justify-between text-mag-badge text-stone">
                            <span>已花 ฿{Math.round(totalSpent).toLocaleString()}</span>
                            <span>總預算 ฿{Math.round(budgetGoal).toLocaleString()}</span>
                        </div>
                    </motion.div>

                    {/* Tab Switcher */}
                    <div className="flex gap-2 bg-stone/10 rounded-pill p-1">
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`flex-1 py-2 rounded-pill text-mag-badge font-medium transition-all ${
                                activeTab === 'expenses' ? 'bg-white text-charcoal shadow-mag' : 'text-stone'
                            }`}
                        >
                            消費紀錄
                        </button>
                        <button
                            onClick={() => setActiveTab('settle')}
                            className={`flex-1 py-2 rounded-pill text-mag-badge font-medium transition-all ${
                                activeTab === 'settle' ? 'bg-white text-charcoal shadow-mag' : 'text-stone'
                            }`}
                        >
                            結算分帳
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4 pb-safe">
                <AnimatePresence mode="wait">
                    {activeTab === 'expenses' ? (
                        <motion.div
                            key="expenses"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 rounded-full bg-pastel-mint flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-emerald-500 text-[36px]">receipt_long</span>
                                    </div>
                                    <p className="text-mag-title text-charcoal mb-2">尚無消費紀錄</p>
                                    <p className="text-mag-caption text-stone">點擊右上角 + 新增第一筆消費</p>
                                </div>
                            ) : (
                                expenses.map((expense, index) => {
                                    const cat = getCategoryInfo(expense.cat);
                                    const member = familyMembers.find(m => m.name === expense.payer);
                                    return (
                                        <motion.div
                                            key={expense.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white rounded-mag p-4 shadow-mag"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-mag flex items-center justify-center bg-gradient-to-br ${cat.color}`}>
                                                    <span className="material-symbols-outlined text-white text-[24px]">{cat.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-mag-body font-medium text-charcoal truncate">{expense.title}</p>
                                                    <p className="text-mag-caption text-stone">{expense.time}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-mag-body font-bold text-charcoal">฿{expense.amount.toLocaleString()}</p>
                                                    {member && (
                                                        <div className="flex items-center justify-end gap-1 mt-1">
                                                            <img src={member.image} className="w-5 h-5 rounded-full object-cover" />
                                                            <span className="text-mag-badge text-stone">{member.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settle"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Settlement Summary */}
                            <div className="bg-white rounded-mag p-4 shadow-mag">
                                <p className="text-mag-caption text-stone mb-2">總消費</p>
                                <p className="text-[28px] font-bold text-charcoal mb-1">฿{Math.round(totalSpent).toLocaleString()}</p>
                                <p className="text-mag-badge text-stone">人均 ฿{Math.round(average).toLocaleString()}</p>
                            </div>

                            {/* Per Person */}
                            <div className="space-y-3">
                                {settlements.map((member, index) => (
                                    <motion.div
                                        key={member.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-mag p-4 shadow-mag"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img src={member.image} className="w-14 h-14 rounded-full object-cover shadow-mag ring-2 ring-white" />
                                            <div className="flex-1">
                                                <p className="text-mag-body font-medium text-charcoal">{member.name}</p>
                                                <p className="text-mag-caption text-stone">已付 ฿{Math.round(member.paid).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-mag-body font-bold ${
                                                    member.balance >= 0 ? 'text-green-600' : 'text-red-500'
                                                }`}>
                                                    {member.balance >= 0 ? '+' : ''}฿{Math.round(member.balance).toLocaleString()}
                                                </p>
                                                <p className="text-mag-badge text-stone">
                                                    {member.balance >= 0 ? '可收回' : '需補繳'}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Expense Modal */}
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
                                    <h3 className="text-mag-title text-charcoal">新增消費</h3>
                                    <button onClick={handleAddExpense} className="text-red-xhs text-mag-body font-semibold">新增</button>
                                </div>

                                {/* Payer Selection */}
                                <div className="mb-5">
                                    <label className="text-mag-caption text-stone block mb-3">付款人</label>
                                    <div className="flex gap-4">
                                        {familyMembers.map(m => (
                                            <motion.button
                                                key={m.name}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setNewPayer(m)}
                                                className="flex flex-col items-center gap-2"
                                            >
                                                <img 
                                                    src={m.image} 
                                                    className={`w-14 h-14 rounded-full object-cover shadow-mag transition-all ${
                                                        newPayer.name === m.name ? 'ring-2 ring-red-xhs' : 'opacity-50'
                                                    }`} 
                                                />
                                                <span className={`text-mag-badge ${newPayer.name === m.name ? 'text-charcoal' : 'text-stone'}`}>
                                                    {m.name}
                                                </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="mb-5">
                                    <label className="text-mag-caption text-stone block mb-2">金額</label>
                                    <div className="bg-white rounded-mag p-4 shadow-mag flex items-center gap-2">
                                        <span className="text-mag-body text-charcoal">฿</span>
                                        <input
                                            type="number"
                                            value={newAmount}
                                            onChange={(e) => setNewAmount(e.target.value)}
                                            className="flex-1 text-[24px] font-bold text-charcoal bg-transparent outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="mb-5">
                                    <label className="text-mag-caption text-stone block mb-2">說明</label>
                                    <div className="bg-white rounded-mag p-4 shadow-mag">
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full text-mag-body text-charcoal bg-transparent outline-none placeholder:text-stone/50"
                                            placeholder="例如: 午餐 - 鄭王廟附近"
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
                                                onClick={() => setNewCategory(cat.id)}
                                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-pill text-mag-badge transition-all ${
                                                    newCategory === cat.id
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

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddExpense}
                                    className="w-full bg-gradient-to-r from-red-400 to-rose-500 text-white text-mag-body font-semibold p-4 rounded-mag shadow-mag"
                                >
                                    確認新增
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Budget Modal */}
            <AnimatePresence>
                {showEditBudget && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditBudget(false)}
                            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-sm bg-cream rounded-mag-xl p-6 shadow-mag"
                            >
                                <h3 className="text-mag-title text-charcoal text-center mb-6">設定預算</h3>
                                
                                <div className="bg-white rounded-mag p-4 shadow-mag mb-6">
                                    <label className="text-mag-caption text-stone block mb-2">總預算</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-mag-body text-charcoal">฿</span>
                                        <input
                                            type="number"
                                            value={budgetInput}
                                            onChange={(e) => setBudgetInput(parseInt(e.target.value) || 0)}
                                            className="flex-1 text-[24px] font-bold text-charcoal bg-transparent outline-none"
                                        />
                                    </div>
                                    <p className="text-mag-badge text-stone mt-2">
                                        人均 ฿{Math.round(budgetInput / familyMembers.length).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowEditBudget(false)}
                                        className="flex-1 py-3 rounded-mag bg-stone/10 text-charcoal text-mag-body font-medium"
                                    >
                                        取消
                                    </button>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSaveBudget}
                                        className="flex-1 py-3 rounded-mag bg-gradient-to-r from-green-400 to-emerald-500 text-white text-mag-body font-semibold"
                                    >
                                        確認
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}