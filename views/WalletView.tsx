import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, User } from '../types';

const categories = [
    { id: 'Dining', label: '餐飲', icon: 'restaurant', color: 'from-orange-400 to-amber-500' },
    { id: 'Transport', label: '交通', icon: 'directions_car', color: 'from-blue-400 to-indigo-500' },
    { id: 'Accommodation', label: '住宿', icon: 'hotel', color: 'from-purple-400 to-violet-500' },
    { id: 'Retail', label: '購物', icon: 'shopping_bag', color: 'from-pink-400 to-rose-500' },
    { id: 'Entertainment', label: '娛樂', icon: 'attractions', color: 'from-green-400 to-emerald-500' },
];

const familyMembers = [
    { id: 'vickly', name: '我', image: '/avatars/me.jpg' },
    { id: 'sister', name: '姊姊', image: '/avatars/sister.jpg' },
    { id: 'mother', name: '媽媽', image: '/avatars/mother.jpg' },
    { id: 'brother', name: '哥哥', image: '/avatars/brother.jpg' },
];

// Apple Wallet Style Passes
const flightPass = {
    type: 'flight',
    airline: 'EVA AIR',
    logo: '🌲',
    flightNumber: 'BR 206',
    departure: { code: 'TPE', city: '台北桃園', time: '08:30', date: '2025-01-27' },
    arrival: { code: 'BKK', city: '曼谷素萬那普', time: '11:15', date: '2025-01-27' },
    gate: 'D7',
    seat: '12A',
    boarding: '07:50',
    passenger: 'CHEN/VICKLY',
    bookingRef: 'ABC123',
};

const returnFlightPass = {
    type: 'flight',
    airline: 'EVA AIR',
    logo: '🌲',
    flightNumber: 'BR 207',
    departure: { code: 'BKK', city: '曼谷素萬那普', time: '17:50', date: '2025-02-02' },
    arrival: { code: 'TPE', city: '台北桃園', time: '22:30', date: '2025-02-02' },
    gate: 'C4',
    seat: '14F',
    boarding: '17:10',
    passenger: 'CHEN/VICKLY',
    bookingRef: 'ABC123',
};

const hotelPass = {
    type: 'hotel',
    name: 'Grande Centre Point Sukhumvit 55',
    logo: '🏨',
    checkIn: '2025-01-27',
    checkOut: '2025-02-02',
    roomType: 'Deluxe Family Suite',
    guests: 4,
    bookingRef: 'GCP-2025-88721',
    address: '300 Sukhumvit Rd, Khlong Toei, Bangkok',
};

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
    const [activeTab, setActiveTab] = useState<'passes' | 'budget' | 'settle'>('passes');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditBudget, setShowEditBudget] = useState(false);
    const [showQRModal, setShowQRModal] = useState<any>(null);

    // Budget system
    const [personalBudgets, setPersonalBudgets] = useState<Record<string, number>>({
        vickly: 15000,
        sister: 12000,
        mother: 15000,
        brother: 10000,
    });

    // Form state
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newPayer, setNewPayer] = useState(familyMembers[0]);
    const [newCategory, setNewCategory] = useState(categories[0].id);
    const [budgetInput, setBudgetInput] = useState(budgetGoal);
    const [isGroupExpense, setIsGroupExpense] = useState(true);
    const [editingPersonal, setEditingPersonal] = useState<string | null>(null);
    const [personalInput, setPersonalInput] = useState(0);

    // Calculations
    const groupExpenses = expenses.filter(e => e.payer === '團體' || !familyMembers.some(m => m.name === e.payer));
    const totalGroupSpent = expenses.filter(e => e.payer !== '個人').reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = budgetGoal - totalGroupSpent;
    const spentPercent = budgetGoal > 0 ? (totalGroupSpent / budgetGoal) * 100 : 0;
    const perPersonShare = totalGroupSpent / familyMembers.length;

    // Personal spending per person
    const getPersonalSpent = (memberId: string) => {
        const member = familyMembers.find(m => m.id === memberId);
        if (!member) return 0;
        return expenses.filter(e => e.payer === member.name).reduce((acc, curr) => acc + curr.amount, 0);
    };

    // Settlement calculation
    const settlements = familyMembers.map(member => {
        const paid = expenses.filter(e => e.payer === member.name).reduce((acc, curr) => acc + curr.amount, 0);
        return { ...member, paid, balance: paid - perPersonShare };
    });

    const handleAddExpense = () => {
        if (!newTitle || !newAmount) return;
        const newExp: Expense = {
            id: Date.now(),
            title: newTitle,
            amount: parseFloat(newAmount) || 0,
            cat: newCategory,
            time: '剛剛',
            payer: isGroupExpense ? '團體' : newPayer.name
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

    const handleSavePersonalBudget = () => {
        if (editingPersonal) {
            setPersonalBudgets(prev => ({ ...prev, [editingPersonal]: personalInput }));
        }
        setEditingPersonal(null);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' });
    };

    return (
        <div className="min-h-full pb-safe">
            {/* Header */}
            <div className="sticky top-0 z-40 glass border-b border-black/5 safe-top">
                <div className="px-4 pt-4 pb-3">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-mag-hero text-charcoal">錢包</h1>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddModal(true)}
                            className="w-11 h-11 rounded-full bg-red-xhs flex items-center justify-center shadow-mag"
                        >
                            <span className="material-symbols-outlined text-white text-[22px]">add</span>
                        </motion.button>
                    </div>

                    {/* 3 Tab Switcher */}
                    <div className="flex gap-1 bg-stone/10 rounded-pill p-1">
                        {[
                            { id: 'passes', label: '票卡', icon: 'credit_card' },
                            { id: 'budget', label: '預算', icon: 'savings' },
                            { id: 'settle', label: '結算', icon: 'handshake' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-pill text-mag-badge font-medium transition-all ${
                                    activeTab === tab.id ? 'bg-white text-charcoal shadow-mag' : 'text-stone'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4">
                <AnimatePresence mode="wait">
                    {/* PASSES TAB */}
                    {activeTab === 'passes' && (
                        <motion.div key="passes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            {/* Flight Pass - Outbound */}
                            <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowQRModal(flightPass)} className="relative overflow-hidden rounded-[20px] cursor-pointer" style={{ background: 'linear-gradient(135deg, #1D976C 0%, #2E7D32 100%)' }}>
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{flightPass.logo}</span>
                                            <span className="text-white font-bold">{flightPass.airline}</span>
                                        </div>
                                        <span className="text-white/80 text-mag-caption">{flightPass.flightNumber}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center">
                                            <p className="text-white text-[28px] font-bold">{flightPass.departure.code}</p>
                                            <p className="text-white/70 text-mag-caption">{flightPass.departure.city}</p>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center px-4">
                                            <div className="flex-1 h-[1px] bg-white/30" />
                                            <span className="material-symbols-outlined text-white mx-2">flight</span>
                                            <div className="flex-1 h-[1px] bg-white/30" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white text-[28px] font-bold">{flightPass.arrival.code}</p>
                                            <p className="text-white/70 text-mag-caption">{flightPass.arrival.city}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/20">
                                        <div><p className="text-white/60 text-[10px] uppercase">日期</p><p className="text-white text-mag-badge font-mono">{formatDate(flightPass.departure.date)}</p></div>
                                        <div><p className="text-white/60 text-[10px] uppercase">登機</p><p className="text-white text-mag-badge font-mono">{flightPass.boarding}</p></div>
                                        <div><p className="text-white/60 text-[10px] uppercase">登機口</p><p className="text-white text-mag-badge font-mono">{flightPass.gate}</p></div>
                                        <div><p className="text-white/60 text-[10px] uppercase">座位</p><p className="text-white text-mag-badge font-mono">{flightPass.seat}</p></div>
                                    </div>
                                    <div className="flex items-center justify-center gap-1 mt-3 text-white/50 text-mag-badge">
                                        <span className="material-symbols-outlined text-[14px]">touch_app</span>點擊顯示 QR Code
                                    </div>
                                </div>
                            </motion.div>

                            {/* Return Flight */}
                            <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowQRModal(returnFlightPass)} className="relative overflow-hidden rounded-[20px] cursor-pointer" style={{ background: 'linear-gradient(135deg, #1D976C 0%, #2E7D32 100%)' }}>
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2"><span className="text-2xl">{returnFlightPass.logo}</span><span className="text-white font-bold">{returnFlightPass.airline}</span></div>
                                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-mag-badge">回程</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-white text-[24px] font-bold">{returnFlightPass.departure.code}</p>
                                        <span className="material-symbols-outlined text-white">flight</span>
                                        <p className="text-white text-[24px] font-bold">{returnFlightPass.arrival.code}</p>
                                    </div>
                                    <p className="text-white/70 text-mag-caption text-center mt-1">{formatDate(returnFlightPass.departure.date)} • {returnFlightPass.departure.time}</p>
                                </div>
                            </motion.div>

                            {/* Hotel Pass */}
                            <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowQRModal(hotelPass)} className="relative overflow-hidden rounded-[20px] cursor-pointer" style={{ background: 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)' }}>
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{hotelPass.logo}</span><span className="text-white font-bold">飯店住宿</span></div>
                                    <p className="text-white text-mag-title mb-3">{hotelPass.name}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><p className="text-white/60 text-[10px] uppercase">入住</p><p className="text-white text-mag-badge font-mono">{formatDate(hotelPass.checkIn)}</p></div>
                                        <div><p className="text-white/60 text-[10px] uppercase">退房</p><p className="text-white text-mag-badge font-mono">{formatDate(hotelPass.checkOut)}</p></div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* BUDGET TAB */}
                    {activeTab === 'budget' && (
                        <motion.div key="budget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            {/* Group Budget Card */}
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[20px] p-5 text-white">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-white/70 text-mag-caption mb-1">👨‍👩‍👧‍👦 團體預算</p>
                                        <p className="text-[32px] font-bold">฿{Math.round(remaining).toLocaleString()}</p>
                                        <p className="text-white/70 text-mag-badge">剩餘可用</p>
                                    </div>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setBudgetInput(budgetGoal); setShowEditBudget(true); }} className="px-3 py-1.5 rounded-pill bg-white/20 text-white text-mag-badge">
                                        編輯
                                    </motion.button>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                                    <div style={{ width: `${Math.min(spentPercent, 100)}%` }} className="h-full rounded-full bg-white" />
                                </div>
                                <div className="flex justify-between text-mag-badge text-white/70">
                                    <span>已花 ฿{Math.round(totalGroupSpent).toLocaleString()}</span>
                                    <span>總預算 ฿{Math.round(budgetGoal).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Personal Budgets */}
                            <div>
                                <p className="text-mag-caption text-stone mb-3">👤 個人預算</p>
                                <div className="space-y-3">
                                    {familyMembers.map(member => {
                                        const budget = personalBudgets[member.id] || 0;
                                        const spent = getPersonalSpent(member.id);
                                        const personalRemaining = budget - spent;
                                        const personalPercent = budget > 0 ? (spent / budget) * 100 : 0;
                                        
                                        return (
                                            <div key={member.id} className="bg-white rounded-mag p-4 shadow-mag">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                                    <div className="flex-1">
                                                        <p className="text-mag-body font-medium text-charcoal">{member.name}</p>
                                                        <p className="text-mag-badge text-stone">剩餘 ฿{Math.round(personalRemaining).toLocaleString()}</p>
                                                    </div>
                                                    <motion.button 
                                                        whileTap={{ scale: 0.95 }} 
                                                        onClick={() => { setEditingPersonal(member.id); setPersonalInput(budget); }}
                                                        className="text-red-xhs text-mag-badge"
                                                    >
                                                        編輯
                                                    </motion.button>
                                                </div>
                                                <div className="h-1.5 bg-stone/10 rounded-full overflow-hidden">
                                                    <div 
                                                        style={{ width: `${Math.min(personalPercent, 100)}%` }} 
                                                        className={`h-full rounded-full ${personalPercent > 80 ? 'bg-red-xhs' : 'bg-green-500'}`}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[10px] text-stone mt-1">
                                                    <span>已花 ฿{Math.round(spent).toLocaleString()}</span>
                                                    <span>預算 ฿{Math.round(budget).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Expenses */}
                            <div>
                                <p className="text-mag-caption text-stone mb-3">📝 最近消費</p>
                                {expenses.slice(0, 5).map(exp => {
                                    const cat = categories.find(c => c.id === exp.cat) || categories[0];
                                    return (
                                        <div key={exp.id} className="bg-white rounded-mag p-3 shadow-mag mb-2 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-mag flex items-center justify-center bg-gradient-to-br ${cat.color}`}>
                                                <span className="material-symbols-outlined text-white text-[18px]">{cat.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-mag-body text-charcoal truncate">{exp.title}</p>
                                                <p className="text-mag-badge text-stone">{exp.payer} • {exp.time}</p>
                                            </div>
                                            <p className="text-mag-body font-bold text-charcoal">฿{exp.amount.toLocaleString()}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* SETTLE TAB */}
                    {activeTab === 'settle' && (
                        <motion.div key="settle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            {/* Summary */}
                            <div className="bg-white rounded-[20px] p-5 shadow-mag">
                                <p className="text-mag-caption text-stone mb-1">旅程總花費</p>
                                <p className="text-[32px] font-bold text-charcoal">฿{Math.round(totalGroupSpent).toLocaleString()}</p>
                                <p className="text-mag-badge text-stone">人均 ฿{Math.round(perPersonShare).toLocaleString()}</p>
                            </div>

                            {/* Settlement Details */}
                            <div>
                                <p className="text-mag-caption text-stone mb-3">💳 結算明細</p>
                                <div className="space-y-3">
                                    {settlements.map(member => (
                                        <div key={member.id} className="bg-white rounded-mag p-4 shadow-mag flex items-center gap-4">
                                            <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                                            <div className="flex-1">
                                                <p className="text-mag-body font-medium text-charcoal">{member.name}</p>
                                                <p className="text-mag-badge text-stone">已付 ฿{Math.round(member.paid).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-mag-title font-bold ${member.balance >= 0 ? 'text-green-600' : 'text-red-xhs'}`}>
                                                    {member.balance >= 0 ? '+' : ''}฿{Math.round(member.balance).toLocaleString()}
                                                </p>
                                                <p className="text-mag-badge text-stone">{member.balance >= 0 ? '可收回' : '需補繳'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Settlement Actions */}
                            <div className="bg-pastel-mint rounded-mag p-4">
                                <p className="text-mag-body font-medium text-green-800 mb-2">💡 結算建議</p>
                                <div className="space-y-1 text-mag-caption text-green-700">
                                    {settlements.filter(s => s.balance < 0).map(debtor => {
                                        const creditor = settlements.find(s => s.balance > 0);
                                        if (!creditor) return null;
                                        return (
                                            <p key={debtor.id}>
                                                {debtor.name} → {creditor.name}：฿{Math.abs(Math.round(debtor.balance)).toLocaleString()}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQRModal(null)} className="fixed inset-0 bg-black/60 z-50" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-[20px] p-6 z-50 max-w-sm mx-auto">
                            <h3 className="text-mag-title text-charcoal text-center mb-1">{showQRModal.type === 'flight' ? '登機證' : '預訂確認'}</h3>
                            <p className="text-mag-caption text-stone text-center mb-6">{showQRModal.type === 'flight' ? showQRModal.flightNumber : showQRModal.name}</p>
                            <div className="bg-white border-2 border-charcoal rounded-mag p-4 mx-auto w-48 h-48 flex items-center justify-center mb-4">
                                <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                                    {Array.from({ length: 64 }).map((_, i) => (<div key={i} className={`${Math.random() > 0.4 ? 'bg-charcoal' : 'bg-white'}`} />))}
                                </div>
                            </div>
                            <p className="text-center font-mono text-mag-body text-charcoal mb-6">{showQRModal.bookingRef}</p>
                            <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowQRModal(null)} className="w-full py-3 rounded-mag bg-charcoal text-white text-mag-body font-medium">關閉</motion.button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/40 z-50" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-[24px] z-50 max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 bg-cream pt-3 pb-2 z-10"><div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" /></div>
                            <div className="px-5 pb-safe">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setShowAddModal(false)} className="text-stone text-mag-body">取消</button>
                                    <h3 className="text-mag-title text-charcoal">新增消費</h3>
                                    <button onClick={handleAddExpense} className="text-red-xhs text-mag-body font-semibold">新增</button>
                                </div>

                                {/* Expense Type Toggle */}
                                <div className="flex gap-2 bg-stone/10 rounded-pill p-1 mb-5">
                                    <button onClick={() => setIsGroupExpense(true)} className={`flex-1 py-2.5 rounded-pill text-mag-badge font-medium transition-all ${isGroupExpense ? 'bg-white text-charcoal shadow-mag' : 'text-stone'}`}>
                                        👨‍👩‍👧‍👦 團體消費
                                    </button>
                                    <button onClick={() => setIsGroupExpense(false)} className={`flex-1 py-2.5 rounded-pill text-mag-badge font-medium transition-all ${!isGroupExpense ? 'bg-white text-charcoal shadow-mag' : 'text-stone'}`}>
                                        👤 個人消費
                                    </button>
                                </div>

                                {/* Payer (only for personal) */}
                                {!isGroupExpense && (
                                    <div className="mb-5">
                                        <label className="text-mag-caption text-stone block mb-3">付款人</label>
                                        <div className="flex gap-3">
                                            {familyMembers.map(m => (
                                                <motion.button key={m.id} whileTap={{ scale: 0.95 }} onClick={() => setNewPayer(m)} className="flex flex-col items-center gap-2">
                                                    <img src={m.image} className={`w-12 h-12 rounded-full object-cover shadow-mag transition-all ${newPayer.id === m.id ? 'ring-2 ring-red-xhs' : 'opacity-50'}`} alt={m.name} />
                                                    <span className={`text-mag-badge ${newPayer.id === m.id ? 'text-charcoal' : 'text-stone'}`}>{m.name}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Amount */}
                                <div className="bg-white rounded-mag p-4 shadow-mag mb-4">
                                    <label className="text-mag-caption text-stone block mb-2">金額</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-mag-body text-charcoal">฿</span>
                                        <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="flex-1 text-[24px] font-bold text-charcoal bg-transparent outline-none" placeholder="0" />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="bg-white rounded-mag p-4 shadow-mag mb-4">
                                    <label className="text-mag-caption text-stone block mb-2">說明</label>
                                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full text-mag-body text-charcoal bg-transparent outline-none placeholder:text-stone/50" placeholder="例如: 午餐 - 鄭王廟附近" />
                                </div>

                                {/* Category */}
                                <div className="mb-6">
                                    <label className="text-mag-caption text-stone block mb-3">分類</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button key={cat.id} onClick={() => setNewCategory(cat.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-mag-badge transition-all ${newCategory === cat.id ? 'bg-charcoal text-white' : 'bg-white text-charcoal border border-black/5'}`}>
                                                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>{cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleAddExpense} className="w-full bg-red-xhs text-white text-mag-body font-semibold p-4 rounded-mag shadow-mag">確認新增</motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Group Budget Modal */}
            <AnimatePresence>
                {showEditBudget && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditBudget(false)} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-[20px] p-6 shadow-mag">
                                <h3 className="text-mag-title text-charcoal text-center mb-6">設定團體預算</h3>
                                <div className="bg-cream rounded-mag p-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-mag-body text-charcoal">฿</span>
                                        <input type="number" value={budgetInput} onChange={(e) => setBudgetInput(parseInt(e.target.value) || 0)} className="flex-1 text-[24px] font-bold text-charcoal bg-transparent outline-none" />
                                    </div>
                                    <p className="text-mag-badge text-stone mt-2">人均 ฿{Math.round(budgetInput / familyMembers.length).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowEditBudget(false)} className="flex-1 py-3 rounded-mag bg-stone/10 text-charcoal text-mag-body font-medium">取消</button>
                                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveBudget} className="flex-1 py-3 rounded-mag bg-green-500 text-white text-mag-body font-semibold">確認</motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Personal Budget Modal */}
            <AnimatePresence>
                {editingPersonal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPersonal(null)} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-[20px] p-6 shadow-mag">
                                <h3 className="text-mag-title text-charcoal text-center mb-6">
                                    設定 {familyMembers.find(m => m.id === editingPersonal)?.name} 的預算
                                </h3>
                                <div className="bg-cream rounded-mag p-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-mag-body text-charcoal">฿</span>
                                        <input type="number" value={personalInput} onChange={(e) => setPersonalInput(parseInt(e.target.value) || 0)} className="flex-1 text-[24px] font-bold text-charcoal bg-transparent outline-none" />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setEditingPersonal(null)} className="flex-1 py-3 rounded-mag bg-stone/10 text-charcoal text-mag-body font-medium">取消</button>
                                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSavePersonalBudget} className="flex-1 py-3 rounded-mag bg-green-500 text-white text-mag-body font-semibold">確認</motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}