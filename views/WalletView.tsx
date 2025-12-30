import React, { useEffect, useState } from 'react';
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

const users = ['爸爸', '媽媽', '妹妹', '我'];

interface WalletViewProps {
    user: User | null;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    budgetGoal: number;
    setBudgetGoal: React.Dispatch<React.SetStateAction<number>>;
    hotelInfo: { name: string; bookingId: string; location: string };
    setHotelInfo: React.Dispatch<React.SetStateAction<{ name: string; bookingId: string; location: string }>>;
}

export default function WalletView({ user, expenses, setExpenses, budgetGoal, setBudgetGoal, hotelInfo, setHotelInfo }: WalletViewProps) {
    const [activeTab, setActiveTab] = useState<'budget' | 'tickets'>('budget');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQR, setShowQR] = useState<string | null>(null);
    const [showEditTicketModal, setShowEditTicketModal] = useState(false);

    // Ticket State
    const [ticketInfo, setTicketInfo] = useState({
        origin: 'BKK', originCity: 'Bangkok',
        destination: 'TPE', destinationCity: 'Taipei',
        date: 'Feb 02', time: '17:50', flight: 'BR 202',
        gate: 'D7', seat: '12A', boarding: '17:10',
        duration: '2h 45m'
    });

    // New Expense State
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newPayer, setNewPayer] = useState(users[0]);
    const [newCategory, setNewCategory] = useState(categories[0].id);

    // Budget State - handled by props
    const [showEditBudget, setShowEditBudget] = useState(false);
    const [editMode, setEditMode] = useState<'total' | 'personal'>('total');
    const [budgetInput, setBudgetInput] = useState<number>(budgetGoal);
    const [budgetInputDisplay, setBudgetInputDisplay] = useState<string>(budgetGoal.toLocaleString());
    const [showSettlementModal, setShowSettlementModal] = useState(false);

    // Calculate Settlement
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const average = totalAmount / users.length;
    const remainingBudget = budgetGoal - totalAmount;

    const balances = users.map(user => {
        const paid = expenses.filter(e => e.payer === user).reduce((acc, curr) => acc + curr.amount, 0);
        return { user, balance: paid - average };
    });

    const syncBudgetDisplay = (mode: 'total' | 'personal') => {
        const value = mode === 'total' ? budgetGoal : Math.round(budgetGoal / users.length);
        setBudgetInput(value);
        setBudgetInputDisplay(value.toLocaleString());
    };

    useEffect(() => {
        if (showEditBudget) {
            syncBudgetDisplay(editMode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showEditBudget, editMode, budgetGoal]);

    const handleBudgetInputChange = (value: string) => {
        const sanitized = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
        setBudgetInput(sanitized);
        setBudgetInputDisplay(sanitized.toLocaleString());
    };

    const computedTotalBudget = editMode === 'total' ? budgetInput : budgetInput * users.length;
    const computedPerPerson = Math.round(computedTotalBudget / users.length);

    const handleAddExpense = () => {
        if (!newTitle || !newAmount) return;
        const newExp: Expense = {
            id: Date.now(),
            title: newTitle,
            amount: Number.parseFloat(newAmount) || 0,
            cat: newCategory,
            time: '剛剛',
            payer: newPayer
        };
        setExpenses((prev) => [newExp, ...prev]);
        setShowAddModal(false);
        setNewTitle('');
        setNewAmount('');
        setNewCategory(categories[0].id);
    };

    const getCategoryIcon = (catId: string) => {
        return categories.find(c => c.id === catId)?.icon || 'receipt';
    };

    return (
        <div className="pt-14 px-6 pb-24 relative min-h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-light tracking-wide text-text-primary font-display">旅費錢包</h2>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveTab(activeTab === 'budget' ? 'tickets' : 'budget')}
                    className="bg-bone hover:bg-bone-alt flex items-center gap-2 px-4 py-2 rounded-full transition-colors border border-black/5"
                >
                    <span className="material-symbols-outlined text-icon text-[20px]">
                        {activeTab === 'budget' ? 'confirmation_number' : 'account_balance_wallet'}
                    </span>
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        {activeTab === 'budget' ? '票券' : '錢包'}
                    </span>
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'budget' ? (
                    <motion.div
                        key="budget-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Main Budget Card - Now shows Remaining / Total */}
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowEditBudget(true)}
                            className="relative w-full overflow-hidden rounded-3xl bg-text-primary p-8 shadow-xl text-ivory mb-8 cursor-pointer"
                        >
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">剩餘公費</p>
                                    <span className="material-symbols-outlined text-white/40 text-[16px]">edit</span>
                                </div>
                                <h2 className="text-4xl font-serif tracking-tight font-light mb-1">฿ {remainingBudget.toLocaleString()}</h2>
                                <p className="text-[10px] text-ivory/80 font-medium tracking-widest mb-2">
                                    人均應繳: ฿{(budgetGoal / users.length).toLocaleString()}
                                </p>
                                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 mb-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${remainingBudget < 0 ? 'bg-red-400' : 'bg-gold'}`}
                                        style={{ width: `${Math.min((totalAmount / budgetGoal) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] font-medium opacity-60 font-mono tracking-wider mb-6 flex justify-between">
                                    <span>公費總額: ฿{budgetGoal.toLocaleString()}</span>
                                    <span>已支出: ฿{totalAmount.toLocaleString()}</span>
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gold">pie_chart</span>
                                        <span className="text-xs tracking-widest uppercase">人均 ฿{Math.round(average).toLocaleString()}</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/20"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gold">trending_up</span>
                                        <span className="text-xs tracking-widest uppercase">
                                            {Math.round((totalAmount / budgetGoal) * 100)}% 使用率
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Settlement Section - Fixed visual issues */}
                        <div className="flex items-center justify-between mb-4 pl-1">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">分帳結算</h3>
                            <button
                                onClick={() => setShowSettlementModal(true)}
                                className="text-[10px] text-gold font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-gold/10 transition-colors"
                            >
                                查看全部
                            </button>
                        </div>
                        {/* Improved Scrollable Container */}
                        <div className="flex overflow-x-auto gap-3 pb-4 px-1 no-scrollbar snap-x snap-mandatory w-full">
                            {balances.map((b) => (
                                <motion.div
                                    key={b.user}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-28 flex-none snap-start p-4 rounded-2xl border ${b.balance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} flex flex-col items-center shadow-sm`}
                                >
                                    <span className="text-xs font-bold text-text-primary mb-1">{b.user}</span>
                                    <span className={`text-sm font-medium ${b.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {b.balance >= 0 ? '+' : ''}{Math.round(b.balance).toLocaleString()}
                                    </span>
                                    <span className="text-[9px] text-text-muted mt-1">{b.balance >= 0 ? '應收' : '應付'}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Ledger Header with Add Button */}
                        <div className="flex items-center justify-between mt-6 mb-4 pl-1">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">近期交易</h3>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-1 text-gold hover:text-text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">記一筆</span>
                            </motion.button>
                        </div>

                        {/* Transaction List */}
                        <div className="flex flex-col gap-3 pb-8">
                            {expenses.map((expense) => (
                                <motion.div
                                    key={expense.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileTap={{ scale: 0.98, backgroundColor: "#F4F3EF" }}
                                    className="flex items-center justify-between bg-white p-4 rounded-2xl border border-black/5 shadow-sm transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-bone-alt flex items-center justify-center text-gold border border-gold/20 shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">
                                                {getCategoryIcon(expense.cat)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary line-clamp-1">{expense.title}</p>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider">{expense.payer} • {categories.find(c => c.id === expense.cat)?.label || '其他'} • {expense.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-serif font-medium text-text-primary">- ฿{expense.amount.toLocaleString()}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Floating Action Button (FAB) */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowAddModal(true)}
                            className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-text-primary text-ivory shadow-lg flex items-center justify-center z-40 border border-white/20 active:shadow-sm"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="tickets-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Edit Button for Tickets */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowEditTicketModal(true)}
                                className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1 hover:opacity-80 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Edit Details
                            </button>
                        </div>

                        {/* Boarding Pass Card */}
                        <div className="relative">
                            <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-black/5">
                                {/* Header */}
                                <div className="bg-text-primary p-6 text-ivory relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="flex justify-between items-center mb-6 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gold">flight_takeoff</span>
                                            <span className="text-xs font-bold tracking-widest uppercase">Boarding Pass</span>
                                        </div>
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-medium tracking-wider">ECONOMY</span>
                                    </div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <div>
                                            <p className="text-4xl font-serif font-light mb-1">BKK</p>
                                            <p className="text-[10px] opacity-60 uppercase tracking-widest">Bangkok</p>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center px-4">
                                            <div className="flex items-center gap-1 w-full opacity-60 mb-1">
                                                <div className="h-[1px] bg-ivory flex-1"></div>
                                                <span className="material-symbols-outlined text-[14px] rotate-90">flight</span>
                                                <div className="h-[1px] bg-ivory flex-1"></div>
                                            </div>
                                            <p className="text-[10px] tracking-wider font-mono">2h 45m</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-serif font-light mb-1">TPE</p>
                                            <p className="text-[10px] opacity-60 uppercase tracking-widest">Taipei</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-6 relative">
                                    {/* Perforated Line Decoration */}
                                    <div className="absolute top-0 left-0 w-full -translate-y-[1px] flex justify-between px-2">
                                        {[...Array(20)].map((_, i) => <div key={i} className="w-2 h-0.5 bg-white"></div>)}
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 mb-6">
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Date</p>
                                            <p className="text-sm font-bold text-text-primary">Feb 02</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Time</p>
                                            <p className="text-sm font-bold text-text-primary">17:50</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Flight</p>
                                            <p className="text-sm font-bold text-text-primary">BR 202</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Gate</p>
                                            <p className="text-xl font-bold text-gold">D7</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Seat</p>
                                            <p className="text-xl font-bold text-text-primary">12A</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Boarding</p>
                                            <p className="text-sm font-bold text-text-primary">17:10</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Barcode Section (Clickable) */}
                                <motion.div
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowQR('flight')}
                                    className="bg-bone-alt p-4 flex flex-col items-center justify-center border-t border-black/5 cursor-pointer hover:bg-black/5 transition-colors"
                                >
                                    <div className="h-12 w-full max-w-[200px] flex items-center justify-between gap-[2px] opacity-80">
                                        {[...Array(40)].map((_, i) => (
                                            <div key={i} className={`h-full ${Math.random() > 0.5 ? 'w-[2px]' : 'w-[4px]'} bg-text-primary`}></div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-text-muted mt-2 uppercase tracking-widest">Tap to view QR Code</p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Hotel Voucher */}
                        <div className="bg-white rounded-2xl p-4 shadow-card border border-black/5 flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-text-muted shrink-0">
                                <span className="material-symbols-outlined">hotel</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-text-primary">Avani+ Riverside</h4>
                                <p className="text-[10px] text-text-muted mt-0.5">Booking ID: #KV-8829</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowQR('hotel')}
                                className="p-3 rounded-full bg-bone hover:bg-gold hover:text-white transition-colors text-icon"
                            >
                                <span className="material-symbols-outlined">qr_code</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals (Already Existing Expense Modal + QR Modal) */}
            <AnimatePresence>
                {/* Expense Modal (Keep simplified for brevity in this replace, assume functionality is preserved or I should include it completely) */}
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
                            className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe h-[85vh] flex flex-col"
                        >
                            {/* Content duplicated from original file to ensure functionality remains */}
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
                            <h3 className="text-xl font-medium text-text-primary mb-6 shrink-0">新增支出</h3>
                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">項目名稱</label>
                                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-gold transition-colors" placeholder="例如: 7-11 零食" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">金額 (THB)</label>
                                    <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-gold transition-colors font-serif" placeholder="0" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">分類</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {categories.map(cat => (
                                            <button key={cat.id} onClick={() => setNewCategory(cat.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${newCategory === cat.id ? 'bg-text-primary text-ivory border-text-primary shadow-lg' : 'bg-white border-gray-200 text-text-secondary'}`}>
                                                <span className="material-symbols-outlined text-[20px] mb-1">{cat.icon}</span>
                                                <span className="text-[10px] font-medium">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">付款人</label>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                        {users.map(u => (
                                            <button key={u} onClick={() => setNewPayer(u)} className={`px-6 py-3 rounded-xl border whitespace-nowrap transition-all ${newPayer === u ? 'bg-gold text-white border-gold shadow-md' : 'bg-white border-gray-200 text-text-secondary'}`}>{u}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 shrink-0">
                                <button onClick={handleAddExpense} className="w-full bg-text-primary text-ivory font-medium p-4 rounded-xl active:scale-95 transition-transform shadow-lg">確認新增</button>
                            </div>
                        </motion.div>
                    </>
                )}

                {/* QR Code Modal for Boarding Pass / Voucher */}
                {showQR && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowQR(null)}
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-md flex items-center justify-center p-8"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white p-6 rounded-3xl w-full max-w-sm text-center relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-bold text-text-primary mb-1">
                                    {showQR === 'flight' ? 'Scan at Gate' : 'Booking Reference'}
                                </h3>
                                <p className="text-xs text-text-muted mb-6 uppercase tracking-wider">Please increase brightness</p>

                                <div className="aspect-square bg-white border-2 border-black/5 rounded-2xl p-4 flex items-center justify-center mb-6">
                                    {/* Simulated QR Code */}
                                    <div className="w-full h-full bg-contain bg-center bg-no-repeat opacity-90" style={{ backgroundImage: `url('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${showQR === 'flight' ? `${ticketInfo.flight}-${ticketInfo.origin}-${ticketInfo.destination}` : `HOTEL-${hotelInfo.bookingId}`}')` }}></div>
                                </div>

                                <button
                                    onClick={() => setShowQR(null)}
                                    className="bg-black/5 hover:bg-black/10 text-text-primary py-3 px-8 rounded-full text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    </>
                )}

                {/* Edit Ticket Modal */}
                {showEditTicketModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditTicketModal(false)}
                            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe h-[85vh] flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
                            <h3 className="text-xl font-medium text-text-primary mb-6 shrink-0">Edit Ticket Details</h3>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Origin</label>
                                        <input type="text" value={ticketInfo.origin} onChange={(e) => setTicketInfo({ ...ticketInfo, origin: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Dest</label>
                                        <input type="text" value={ticketInfo.destination} onChange={(e) => setTicketInfo({ ...ticketInfo, destination: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Flight</label>
                                    <input type="text" value={ticketInfo.flight} onChange={(e) => setTicketInfo({ ...ticketInfo, flight: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Date</label>
                                        <input type="text" value={ticketInfo.date} onChange={(e) => setTicketInfo({ ...ticketInfo, date: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Time</label>
                                        <input type="text" value={ticketInfo.time} onChange={(e) => setTicketInfo({ ...ticketInfo, time: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Gate</label>
                                        <input type="text" value={ticketInfo.gate} onChange={(e) => setTicketInfo({ ...ticketInfo, gate: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Seat</label>
                                        <input type="text" value={ticketInfo.seat} onChange={(e) => setTicketInfo({ ...ticketInfo, seat: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                    </div>
                                </div>
                                <hr className="border-black/5 my-2" />
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Hotel Name</label>
                                    <input type="text" value={hotelInfo.name} onChange={(e) => setHotelInfo({ ...hotelInfo, name: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Booking ID</label>
                                    <input type="text" value={hotelInfo.bookingId} onChange={(e) => setHotelInfo({ ...hotelInfo, bookingId: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-gold" />
                                </div>
                            </div>

                            <div className="pt-4 shrink-0">
                                <button onClick={() => setShowEditTicketModal(false)} className="w-full bg-text-primary text-ivory font-medium p-4 rounded-xl active:scale-95 transition-transform shadow-lg">Save Changes</button>
                            </div>
                        </motion.div>
                    </>
                )}
                {/* Edit Budget Modal */}
                {showEditBudget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditBudget(false)}
                        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl"
                        >
                            <h3 className="text-lg font-bold text-text-primary mb-4 text-center">設定預算</h3>

                            <div className="flex gap-2 mb-6 bg-bone rounded-xl p-1">
                                <button
                                    onClick={() => setEditMode('total')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${editMode === 'total' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}
                                >
                                    總預算
                                </button>
                                <button
                                    onClick={() => setEditMode('personal')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${editMode === 'personal' ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}
                                >
                                    個人預算
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2 text-center">
                                    {editMode === 'total' ? '總金額 (THB)' : '個人金額 (THB)'}
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={budgetInputDisplay}
                                    onChange={(e) => handleBudgetInputChange(e.target.value)}
                                    className="w-full bg-bone border-none rounded-2xl p-4 text-3xl font-serif text-center text-text-primary outline-none focus:ring-2 focus:ring-gold/50"
                                />
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-[10px] text-text-muted">
                                    {editMode === 'total'
                                        ? `每人約 ฿${computedPerPerson.toLocaleString()}`
                                        : `總預算將設為 ฿${computedTotalBudget.toLocaleString()}`
                                    }
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setBudgetGoal(computedTotalBudget);
                                    setShowEditBudget(false);
                                }}
                                className="w-full bg-text-primary text-ivory font-medium p-4 rounded-xl active:scale-95 transition-transform shadow-lg"
                            >
                                確認修改
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settlement Modal */}
            <AnimatePresence>
                {showSettlementModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettlementModal(false)}
                            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe max-h-[70vh] flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="text-xl font-medium text-text-primary">分帳總覽</h3>
                                <button onClick={() => setShowSettlementModal(false)} className="text-xs font-bold text-text-muted">關閉</button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-4">
                                {balances.map((b) => (
                                    <div key={b.user} className={`flex items-center justify-between p-4 rounded-xl border ${b.balance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${b.balance >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                <span className="material-symbols-outlined">{b.balance >= 0 ? 'arrow_downward' : 'arrow_upward'}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-text-primary">{b.user}</p>
                                                <p className="text-xs text-text-muted">{b.balance >= 0 ? '應向公費領取' : '應支付給公費'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-lg font-serif font-bold ${b.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {b.balance >= 0 ? '+' : ''}{Math.round(b.balance).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                <div className="mt-6 p-4 rounded-xl bg-bone border border-black/5 text-center">
                                    <p className="text-xs text-text-muted mb-1 uppercase tracking-wider">目前人均消費</p>
                                    <p className="text-2xl font-serif text-text-primary">฿ {Math.round(average).toLocaleString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div >
    );
}