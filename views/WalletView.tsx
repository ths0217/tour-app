import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, User } from '../types';

const categories = [
    { id: 'Dining', label: '餐飲', icon: 'restaurant' },
    { id: 'Transport', label: '交通', icon: 'directions_car' },
    { id: 'Accommodation', label: '住宿', icon: 'hotel' },
    { id: 'Retail', label: '購物', icon: 'shopping_bag' },
    { id: 'Entertainment', label: '娛樂', icon: 'attractions' },
    { id: 'Other', label: '其他', icon: 'receipt' },
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

export default function WalletView({ expenses, setExpenses, budgetGoal, setBudgetGoal }: WalletViewProps) {
    const [activeTab, setActiveTab] = useState<'expenses' | 'settle'>('expenses');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditBudget, setShowEditBudget] = useState(false);

    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newPayer, setNewPayer] = useState(familyMembers[0]);
    const [newCategory, setNewCategory] = useState(categories[0].id);
    const [budgetInput, setBudgetInput] = useState(budgetGoal);

    // Calculations
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = budgetGoal - totalSpent;
    const spentPercent = budgetGoal > 0 ? (totalSpent / budgetGoal) * 100 : 0;
    const average = totalSpent / familyMembers.length;

    const settlements = familyMembers.map(member => {
        const paid = expenses.filter(e => e.payer === member.name).reduce((acc, curr) => acc + curr.amount, 0);
        return { ...member, paid, balance: paid - average };
    });

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

    const getCategoryIcon = (catId: string) => categories.find(c => c.id === catId)?.icon || 'receipt';

    return (
        <div className="min-h-screen bg-ios-bg pb-safe">
            {/* Header */}
            <div className="ios-glass sticky top-0 z-40 border-b border-black/5 safe-top">
                <div className="px-5 pt-4 pb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-ios-largeTitle text-[#1C1C1E]">錢包</h1>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddModal(true)}
                            className="w-11 h-11 rounded-full bg-ios-blue flex items-center justify-center shadow-ios"
                        >
                            <span className="material-symbols-outlined text-white text-[22px]">add</span>
                        </motion.button>
                    </div>

                    {/* Budget Card */}
                    <div className="ios-card p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="text-ios-caption1 text-ios-gray mb-1">團體總預算</p>
                                <p className="text-ios-title1 text-[#1C1C1E]">฿{Math.round(remaining).toLocaleString()}</p>
                                <p className="text-ios-caption2 text-ios-gray mt-1">剩餘可用</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setBudgetInput(budgetGoal); setShowEditBudget(true); }}
                                className="px-3 py-1.5 rounded-lg bg-ios-blue/10 text-ios-blue text-ios-caption1 font-medium"
                            >
                                編輯
                            </motion.button>
                        </div>
                        
                        <div className="h-2 bg-ios-gray5 rounded-full overflow-hidden mb-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(spentPercent, 100)}%` }}
                                className={`h-full rounded-full ${spentPercent > 80 ? 'bg-ios-red' : 'bg-ios-green'}`}
                            />
                        </div>
                        <p className="text-ios-caption2 text-ios-gray">
                            已花 ฿{Math.round(totalSpent).toLocaleString()} / ฿{Math.round(budgetGoal).toLocaleString()}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-ios-gray5 rounded-lg p-0.5">
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`flex-1 py-2 rounded-md text-ios-subhead font-medium transition-all ${
                                activeTab === 'expenses' ? 'bg-white text-[#1C1C1E] shadow-ios' : 'text-ios-gray'
                            }`}
                        >
                            消費紀錄
                        </button>
                        <button
                            onClick={() => setActiveTab('settle')}
                            className={`flex-1 py-2 rounded-md text-ios-subhead font-medium transition-all ${
                                activeTab === 'settle' ? 'bg-white text-[#1C1C1E] shadow-ios' : 'text-ios-gray'
                            }`}
                        >
                            結算分帳
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-5">
                <AnimatePresence mode="wait">
                    {activeTab === 'expenses' ? (
                        <motion.div
                            key="expenses"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 rounded-full bg-ios-green/10 flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-ios-green text-[40px]">receipt_long</span>
                                    </div>
                                    <p className="text-ios-headline text-[#1C1C1E] mb-2">尚無消費紀錄</p>
                                    <p className="text-ios-subhead text-ios-gray">點擊右上角 + 新增消費</p>
                                </div>
                            ) : (
                                <div className="ios-list">
                                    {expenses.map((expense) => {
                                        const member = familyMembers.find(m => m.name === expense.payer);
                                        return (
                                            <div key={expense.id} className="ios-list-item flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-xl bg-ios-orange/10 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-ios-orange text-[22px]">
                                                        {getCategoryIcon(expense.cat)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-ios-body text-[#1C1C1E] truncate">{expense.title}</p>
                                                    <p className="text-ios-caption1 text-ios-gray">{expense.time}</p>
                                                </div>
                                                <div className="text-right shrink-0 flex items-center gap-2">
                                                    <div>
                                                        <p className="text-ios-body font-medium text-[#1C1C1E]">฿{expense.amount.toLocaleString()}</p>
                                                        {member && (
                                                            <p className="text-ios-caption2 text-ios-gray text-right">{member.name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settle"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {/* Summary */}
                            <div className="ios-card p-4 mb-5">
                                <p className="text-ios-caption1 text-ios-gray mb-1">總消費</p>
                                <p className="text-ios-title1 text-[#1C1C1E]">฿{Math.round(totalSpent).toLocaleString()}</p>
                                <p className="text-ios-caption2 text-ios-gray mt-1">人均 ฿{Math.round(average).toLocaleString()}</p>
                            </div>

                            {/* Settlements */}
                            <p className="text-ios-footnote text-ios-gray uppercase mb-2 px-4">結算明細</p>
                            <div className="ios-list">
                                {settlements.map((member) => (
                                    <div key={member.name} className="ios-list-item flex items-center gap-4">
                                        <img src={member.image} className="w-12 h-12 rounded-full object-cover" alt={member.name} />
                                        <div className="flex-1">
                                            <p className="text-ios-body text-[#1C1C1E]">{member.name}</p>
                                            <p className="text-ios-caption1 text-ios-gray">已付 ฿{Math.round(member.paid).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-ios-body font-medium ${member.balance >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                                                {member.balance >= 0 ? '+' : ''}฿{Math.round(member.balance).toLocaleString()}
                                            </p>
                                            <p className="text-ios-caption2 text-ios-gray">
                                                {member.balance >= 0 ? '可收回' : '需補繳'}
                                            </p>
                                        </div>
                                    </div>
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/40 z-50" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-ios-bg rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 bg-ios-bg pt-3 pb-2 z-10">
                                <div className="w-10 h-1 bg-ios-gray3 rounded-full mx-auto" />
                            </div>
                            
                            <div className="px-5 pb-safe">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setShowAddModal(false)} className="text-ios-blue text-ios-body">取消</button>
                                    <h3 className="text-ios-headline text-[#1C1C1E]">新增消費</h3>
                                    <button onClick={handleAddExpense} className="text-ios-blue text-ios-body font-semibold">完成</button>
                                </div>

                                {/* Payer Selection */}
                                <p className="text-ios-footnote text-ios-gray uppercase mb-3">付款人</p>
                                <div className="flex gap-4 mb-5">
                                    {familyMembers.map(m => (
                                        <motion.button key={m.name} whileTap={{ scale: 0.95 }} onClick={() => setNewPayer(m)} className="flex flex-col items-center gap-2">
                                            <img src={m.image} className={`w-14 h-14 rounded-full object-cover transition-all ${newPayer.name === m.name ? 'ring-2 ring-ios-blue' : 'opacity-50'}`} alt={m.name} />
                                            <span className={`text-ios-caption1 ${newPayer.name === m.name ? 'text-[#1C1C1E]' : 'text-ios-gray'}`}>{m.name}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Inputs */}
                                <div className="ios-list mb-5">
                                    <div className="ios-list-item flex items-center">
                                        <label className="w-16 text-ios-body text-[#1C1C1E]">金額</label>
                                        <span className="text-ios-body text-ios-gray">฿</span>
                                        <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="flex-1 text-ios-body text-[#1C1C1E] bg-transparent outline-none text-right" placeholder="0" />
                                    </div>
                                    <div className="ios-list-item flex items-center">
                                        <label className="w-16 text-ios-body text-[#1C1C1E]">說明</label>
                                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="flex-1 text-ios-body text-[#1C1C1E] bg-transparent outline-none text-right placeholder:text-ios-gray3" placeholder="午餐" />
                                    </div>
                                </div>

                                {/* Category */}
                                <p className="text-ios-footnote text-ios-gray uppercase mb-3">分類</p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button key={cat.id} onClick={() => setNewCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-ios-subhead transition-all ${newCategory === cat.id ? 'bg-ios-blue text-white' : 'bg-white text-[#1C1C1E] shadow-ios'}`}>
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

            {/* Edit Budget Modal */}
            <AnimatePresence>
                {showEditBudget && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditBudget(false)} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-ios-bg rounded-2xl p-5 shadow-ios-lg">
                                <h3 className="text-ios-headline text-[#1C1C1E] text-center mb-5">設定預算</h3>
                                <div className="ios-list mb-5">
                                    <div className="ios-list-item flex items-center">
                                        <span className="text-ios-body text-ios-gray">฿</span>
                                        <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(parseInt(e.target.value) || 0)} className="flex-1 text-ios-title2 text-[#1C1C1E] bg-transparent outline-none text-center" />
                                    </div>
                                </div>
                                <p className="text-ios-caption1 text-ios-gray text-center mb-5">人均 ฿{Math.round(budgetInput / familyMembers.length).toLocaleString()}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowEditBudget(false)} className="flex-1 py-3 rounded-xl bg-ios-gray5 text-[#1C1C1E] text-ios-body font-medium">取消</button>
                                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveBudget} className="flex-1 py-3 rounded-xl bg-ios-blue text-white text-ios-body font-semibold">確認</motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}