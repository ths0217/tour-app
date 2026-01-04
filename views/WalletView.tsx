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
    { name: '我', image: '/avatars/me.jpg' },
    { name: '姊姊', image: '/avatars/sister.jpg' },
    { name: '媽媽', image: '/avatars/mother.jpg' },
    { name: '哥哥', image: '/avatars/brother.jpg' },
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

export default function WalletView({ expenses, setExpenses, budgetGoal, setBudgetGoal }: WalletViewProps) {
    const [activeTab, setActiveTab] = useState<'passes' | 'expenses'>('passes');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditBudget, setShowEditBudget] = useState(false);
    const [showQRModal, setShowQRModal] = useState<any>(null);

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

                    {/* Tab Switcher */}
                    <div className="flex gap-2 bg-stone/10 rounded-pill p-1">
                        <button
                            onClick={() => setActiveTab('passes')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-pill text-mag-badge font-medium transition-all ${
                                activeTab === 'passes' ? 'bg-white text-charcoal shadow-mag' : 'text-stone'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">credit_card</span>
                            票卡
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-pill text-mag-badge font-medium transition-all ${
                                activeTab === 'expenses' ? 'bg-white text-charcoal shadow-mag' : 'text-stone'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            消費
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pt-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'passes' ? (
                        <motion.div
                            key="passes"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Flight Pass - Outbound */}
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowQRModal(flightPass)}
                                className="relative overflow-hidden rounded-mag-xl cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #1D976C 0%, #2E7D32 100%)' }}
                            >
                                {/* Decorative circles */}
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{flightPass.logo}</span>
                                            <span className="text-white font-bold">{flightPass.airline}</span>
                                        </div>
                                        <span className="text-white/80 text-mag-caption">{flightPass.flightNumber}</span>
                                    </div>

                                    {/* Route */}
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

                                    {/* Details */}
                                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/20">
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">日期</p>
                                            <p className="text-white text-mag-body font-mono">{formatDate(flightPass.departure.date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">登機</p>
                                            <p className="text-white text-mag-body font-mono">{flightPass.boarding}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">登機口</p>
                                            <p className="text-white text-mag-body font-mono">{flightPass.gate}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">座位</p>
                                            <p className="text-white text-mag-body font-mono">{flightPass.seat}</p>
                                        </div>
                                    </div>

                                    {/* Tap hint */}
                                    <div className="flex items-center justify-center gap-1 mt-4 text-white/50 text-mag-badge">
                                        <span className="material-symbols-outlined text-[14px]">touch_app</span>
                                        點擊顯示 QR Code
                                    </div>
                                </div>
                            </motion.div>

                            {/* Flight Pass - Return */}
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowQRModal(returnFlightPass)}
                                className="relative overflow-hidden rounded-mag-xl cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #1D976C 0%, #2E7D32 100%)' }}
                            >
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{returnFlightPass.logo}</span>
                                            <span className="text-white font-bold">{returnFlightPass.airline}</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-mag-badge">回程</span>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center">
                                            <p className="text-white text-[28px] font-bold">{returnFlightPass.departure.code}</p>
                                            <p className="text-white/70 text-mag-caption">{returnFlightPass.departure.city}</p>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center px-4">
                                            <div className="flex-1 h-[1px] bg-white/30" />
                                            <span className="material-symbols-outlined text-white mx-2">flight</span>
                                            <div className="flex-1 h-[1px] bg-white/30" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white text-[28px] font-bold">{returnFlightPass.arrival.code}</p>
                                            <p className="text-white/70 text-mag-caption">{returnFlightPass.arrival.city}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/20">
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">日期</p>
                                            <p className="text-white text-mag-body font-mono">{formatDate(returnFlightPass.departure.date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">登機</p>
                                            <p className="text-white text-mag-body font-mono">{returnFlightPass.boarding}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">登機口</p>
                                            <p className="text-white text-mag-body font-mono">{returnFlightPass.gate}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">座位</p>
                                            <p className="text-white text-mag-body font-mono">{returnFlightPass.seat}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-1 mt-4 text-white/50 text-mag-badge">
                                        <span className="material-symbols-outlined text-[14px]">touch_app</span>
                                        點擊顯示 QR Code
                                    </div>
                                </div>
                            </motion.div>

                            {/* Hotel Pass */}
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowQRModal(hotelPass)}
                                className="relative overflow-hidden rounded-mag-xl cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)' }}
                            >
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cream rounded-full" />
                                
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{hotelPass.logo}</span>
                                                <span className="text-white font-bold">飯店住宿</span>
                                            </div>
                                            <p className="text-white text-mag-title">{hotelPass.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">入住</p>
                                            <p className="text-white text-mag-body font-mono">{formatDate(hotelPass.checkIn)}</p>
                                        </div>
                                        <div>
                                            <p className="text-white/60 text-mag-badge uppercase">退房</p>
                                            <p className="text-white text-mag-body font-mono">{formatDate(hotelPass.checkOut)}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/20">
                                        <p className="text-white/60 text-mag-badge uppercase mb-1">房型</p>
                                        <p className="text-white text-mag-body">{hotelPass.roomType}</p>
                                        <p className="text-white/70 text-mag-caption mt-2">
                                            <span className="material-symbols-outlined text-[14px] align-middle mr-1">group</span>
                                            {hotelPass.guests} 位旅客
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-1 mt-4 text-white/50 text-mag-badge">
                                        <span className="material-symbols-outlined text-[14px]">touch_app</span>
                                        點擊顯示預訂條碼
                                    </div>
                                </div>
                            </motion.div>

                            {/* Budget Card */}
                            <div className="bg-white rounded-mag p-4 shadow-mag">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-mag-caption text-stone mb-1">團體預算</p>
                                        <p className="text-[24px] font-bold text-charcoal">฿{Math.round(remaining).toLocaleString()}</p>
                                        <p className="text-mag-badge text-stone">剩餘可用</p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setBudgetInput(budgetGoal); setShowEditBudget(true); }}
                                        className="px-3 py-1.5 rounded-pill bg-charcoal text-white text-mag-badge"
                                    >
                                        編輯
                                    </motion.button>
                                </div>
                                <div className="h-2 bg-stone/10 rounded-full overflow-hidden">
                                    <div 
                                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                                        className={`h-full rounded-full transition-all ${spentPercent > 80 ? 'bg-red-xhs' : 'bg-green-500'}`}
                                    />
                                </div>
                                <p className="text-mag-badge text-stone mt-2">
                                    已花 ฿{Math.round(totalSpent).toLocaleString()} / ฿{Math.round(budgetGoal).toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expenses"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3"
                        >
                            {expenses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-pastel-mint flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-green-600 text-[32px]">receipt_long</span>
                                    </div>
                                    <p className="text-mag-title text-charcoal mb-1">尚無消費紀錄</p>
                                    <p className="text-mag-caption text-stone">點擊右上角 + 新增消費</p>
                                </div>
                            ) : (
                                expenses.map((expense) => {
                                    const cat = categories.find(c => c.id === expense.cat) || categories[0];
                                    const member = familyMembers.find(m => m.name === expense.payer);
                                    return (
                                        <div key={expense.id} className="bg-white rounded-mag p-4 shadow-mag flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-mag flex items-center justify-center bg-gradient-to-br ${cat.color}`}>
                                                <span className="material-symbols-outlined text-white text-[22px]">{cat.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-mag-body font-medium text-charcoal truncate">{expense.title}</p>
                                                <p className="text-mag-caption text-stone">{expense.time}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-mag-body font-bold text-charcoal">฿{expense.amount.toLocaleString()}</p>
                                                {member && <p className="text-mag-badge text-stone">{member.name}</p>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowQRModal(null)}
                            className="fixed inset-0 bg-black/60 z-50"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-mag-xl p-6 z-50 max-w-sm mx-auto"
                        >
                            <h3 className="text-mag-title text-charcoal text-center mb-1">
                                {showQRModal.type === 'flight' ? '登機證' : '預訂確認'}
                            </h3>
                            <p className="text-mag-caption text-stone text-center mb-6">
                                {showQRModal.type === 'flight' ? showQRModal.flightNumber : showQRModal.name}
                            </p>
                            
                            {/* QR Code Placeholder */}
                            <div className="bg-white border-2 border-charcoal rounded-mag p-4 mx-auto w-48 h-48 flex items-center justify-center mb-4">
                                <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                                    {Array.from({ length: 64 }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`${Math.random() > 0.4 ? 'bg-charcoal' : 'bg-white'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-center font-mono text-mag-body text-charcoal mb-6">
                                {showQRModal.bookingRef}
                            </p>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowQRModal(null)}
                                className="w-full py-3 rounded-mag bg-charcoal text-white text-mag-body font-medium"
                            >
                                關閉
                            </motion.button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/40 z-50" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-mag-xl z-50 max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 bg-cream pt-3 pb-2 z-10">
                                <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
                            </div>
                            
                            <div className="px-5 pb-safe">
                                <div className="flex justify-between items-center mb-6">
                                    <button onClick={() => setShowAddModal(false)} className="text-stone text-mag-body">取消</button>
                                    <h3 className="text-mag-title text-charcoal">新增消費</h3>
                                    <button onClick={handleAddExpense} className="text-red-xhs text-mag-body font-semibold">新增</button>
                                </div>

                                {/* Payer */}
                                <div className="mb-5">
                                    <label className="text-mag-caption text-stone block mb-3">付款人</label>
                                    <div className="flex gap-4">
                                        {familyMembers.map(m => (
                                            <motion.button key={m.name} whileTap={{ scale: 0.95 }} onClick={() => setNewPayer(m)} className="flex flex-col items-center gap-2">
                                                <img src={m.image} className={`w-14 h-14 rounded-full object-cover shadow-mag transition-all ${newPayer.name === m.name ? 'ring-2 ring-red-xhs' : 'opacity-50'}`} alt={m.name} />
                                                <span className={`text-mag-badge ${newPayer.name === m.name ? 'text-charcoal' : 'text-stone'}`}>{m.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

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
                                                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleAddExpense} className="w-full bg-red-xhs text-white text-mag-body font-semibold p-4 rounded-mag shadow-mag">
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditBudget(false)} className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white rounded-mag-xl p-6 shadow-mag">
                                <h3 className="text-mag-title text-charcoal text-center mb-6">設定預算</h3>
                                
                                <div className="bg-cream rounded-mag p-4 mb-4">
                                    <label className="text-mag-caption text-stone block mb-2">總預算</label>
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
        </div>
    );
}