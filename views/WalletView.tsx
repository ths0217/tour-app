import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Expense {
    id: number;
    title: string;
    amount: number;
    cat: string;
    time: string;
    payer: string;
}

const categories = [
    { id: 'Dining', label: '餐飲', icon: 'restaurant' },
    { id: 'Transport', label: '交通', icon: 'directions_car' },
    { id: 'Accommodation', label: '住宿', icon: 'hotel' },
    { id: 'Retail', label: '購物', icon: 'shopping_bag' },
    { id: 'Entertainment', label: '娛樂', icon: 'attractions' },
    { id: 'Other', label: '其他', icon: 'receipt' },
];

const initialExpenses: Expense[] = [
  { id: 1, title: 'Som Tam Nua 餐廳', amount: 1250, cat: 'Dining', time: '下午 12:30', payer: '媽媽' },
  { id: 2, title: 'Grab 商務車', amount: 350, cat: 'Transport', time: '上午 10:15', payer: '爸爸' },
  { id: 3, title: 'Central World 購物', amount: 4500, cat: 'Retail', time: '昨天', payer: '妹妹' },
];

const users = ['爸爸', '媽媽', '妹妹', '我'];

export default function WalletView() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Expense State
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPayer, setNewPayer] = useState(users[0]);
  const [newCategory, setNewCategory] = useState(categories[0].id);

  // Calculate Settlement
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const average = totalAmount / users.length;
  
  const balances = users.map(user => {
      const paid = expenses.filter(e => e.payer === user).reduce((acc, curr) => acc + curr.amount, 0);
      return { user, balance: paid - average };
  });

  const handleAddExpense = () => {
      if (!newTitle || !newAmount) return;
      const newExp: Expense = {
          id: Date.now(),
          title: newTitle,
          amount: parseFloat(newAmount),
          cat: newCategory,
          time: '剛剛',
          payer: newPayer
      };
      setExpenses([newExp, ...expenses]);
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
          className="bg-bone hover:bg-bone-alt p-2 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-icon">qr_code_scanner</span>
        </motion.button>
      </div>

      {/* Main Budget Card */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="relative w-full overflow-hidden rounded-3xl bg-text-primary p-8 shadow-xl text-ivory mb-8"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">總支出</p>
          <h2 className="text-4xl font-serif tracking-tight font-light mb-1">฿ {totalAmount.toLocaleString()}</h2>
          <p className="text-[10px] font-medium opacity-60 font-mono tracking-wider mb-8">約 TWD {(totalAmount * 0.92).toLocaleString()}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold">pie_chart</span>
              <span className="text-xs tracking-widest uppercase">人均 ฿{Math.round(average).toLocaleString()}</span>
            </div>
            <div className="h-8 w-[1px] bg-white/20"></div>
             <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gold">trending_up</span>
              <span className="text-xs tracking-widest uppercase">+12%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settlement Section */}
      <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4 pl-1">分帳結算</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
          {balances.map((b) => (
              <div key={b.user} className={`min-w-[100px] p-4 rounded-2xl border ${b.balance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} flex flex-col items-center shrink-0`}>
                  <span className="text-xs font-bold text-text-primary mb-1">{b.user}</span>
                  <span className={`text-sm font-medium ${b.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {b.balance >= 0 ? '+' : ''}{Math.round(b.balance).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-text-muted mt-1">{b.balance >= 0 ? '應收' : '應付'}</span>
              </div>
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

      {/* Add Expense Modal */}
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
                    className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe h-[85vh] flex flex-col"
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
                    <h3 className="text-xl font-medium text-text-primary mb-6 shrink-0">新增支出</h3>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">項目名稱</label>
                            <input 
                                type="text" 
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-gold transition-colors"
                                placeholder="例如: 7-11 零食"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">金額 (THB)</label>
                            <input 
                                type="number" 
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-lg outline-none focus:border-gold transition-colors font-serif"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">分類</label>
                            <div className="grid grid-cols-3 gap-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setNewCategory(cat.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                            newCategory === cat.id 
                                            ? 'bg-text-primary text-ivory border-text-primary shadow-lg' 
                                            : 'bg-white border-gray-200 text-text-secondary'
                                        }`}
                                    >
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
                                    <button
                                        key={u}
                                        onClick={() => setNewPayer(u)}
                                        className={`px-6 py-3 rounded-xl border whitespace-nowrap transition-all ${
                                            newPayer === u
                                            ? 'bg-gold text-white border-gold shadow-md'
                                            : 'bg-white border-gray-200 text-text-secondary'
                                        }`}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 shrink-0">
                        <button 
                            onClick={handleAddExpense}
                            className="w-full bg-text-primary text-ivory font-medium p-4 rounded-xl active:scale-95 transition-transform shadow-lg"
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