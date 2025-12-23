import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const initialItems = [
  { id: '1', text: '家庭簽證 (已核准)', category: 'Documents', checked: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP95HvZCIJDZXI66KXm8B79YmuMYeaPjWGIW0tUAvgrwkYtLvRoGwHh-lPS1tOd2YpSa9BSR-hNGIX0rj2CxXP7Q9cFQ5M94tuVLT5i2D5z2JSsBeQ9JhU2c_efIh4pu6XqfpW61MbP8FWxLHH0oe52GHD7QsMLSHAe1-Sj1vuRwXcDlkgBnolcAEUlaf9PwGmjou8Fhd0XO1JLMtOgZBaRi8rs_4-LIkRJIk8-noHXhCY3ClTcrU_pSUXu2aEQm7jCUK_ND0qqVEX' },
  { id: '2', text: '航班行程單影本', category: 'Documents', checked: false, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq5nqKoHvrfknE9W9kbBqchknlTNV_8g_LtPYgDhNEfo2l6TKwdj-mBWK6Z8Kiqc9ZXbr9NRfhFJDwRkhQ8JB0VYXlGbMoQo7_0t3GqmYPzqV4b2GAx5kYNZGl6mvMwGTbrDM-TzHbmD_JAyPo0ej9D-NP4YlBYDplRW943Y1b-Iww_SKeMkVx2pmVWs-2ZJjcEZchnCVdJK7y-NN0jyWpr8THjZ3-Gr8WxUe0KTVUDbVC5L99Ht62Q82ykFmfjkPmA4CBYFHTFmXk' },
  { id: '3', text: '亞麻透氣衣物', category: 'Wardrobe', checked: false, initials: 'AL' },
  { id: '4', text: '泳衣與遮陽帽', category: 'Wardrobe', checked: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRwMerKqw-JkBxKOmKwPjJFZO4-wr5KcStg9AjlvtXi7IUyDHJnj89dV9BKpUEGYXGUGc_iUJnW5AwmYeQYwSHDf2MCpwEo2QEWmnIFg_FuuBOKKlmjnaLEZu_1JsBwFnj2e5bviqioNUv6axKDP3xO4greysguh4h52TUwH5oXnUrgEDuhNeAabs6VA4XZg9q9sGWD19_tw0jWPUAzjTncQtIB3Qf5oniQpkT3hqz__mBW5PS2nPupIvnCYTWEzxE61nNSJC7TSlW' },
  { id: '5', text: '萬用轉接頭', sub: '需要 Type A, B & C', category: 'Tech', checked: false, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbaya4hwxCODJBZ0fdZ3KtpQy9gCOk8EMA-YLgNBxnA_tiKgqINVEZJh0-E3HEhgCl7udPg8Jm6k960_-dJRKAfRLln2O1eAz5GFELGHcIfaTOfqLHLY2_3Bpy1_46ur28ncU_7oSseasskluFQIAq4ut39_Ggp8guqcBjxu2E3p-c4P-mOBJUKq_z0QfhJbORIF4WVdpTCr46S0l1bX54yWOffxLkSBcdgs26_hCBtdYmZoZ8v9ic3OpABLExcs5NsJC0zzxtt4tR' },
];

const categories = [
    { id: 'Documents', label: '文件' },
    { id: 'Wardrobe', label: '衣物' },
    { id: 'Tech', label: '電子' },
    { id: 'Health', label: '藥品' },
    { id: 'Other', label: '其他' },
];

export default function ChecklistView() {
  const [items, setItems] = useState(initialItems);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Other');

  const toggleItem = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addItem = () => {
      if (!newItemText) return;
      setItems([...items, {
          id: Date.now().toString(),
          text: newItemText,
          category: newItemCategory,
          checked: false,
          initials: 'ME'
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
                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] duration-200 ${
                    item.checked ? 'bg-bone border-transparent opacity-60' : 'bg-white border-black/5 shadow-sm'
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`relative flex items-center justify-center size-6 rounded-full border-[1.5px] transition-colors ${
                        item.checked ? 'border-gold bg-gold' : 'border-icon group-hover:border-text-primary'
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
                {item.image ? (
                    <img src={item.image} alt="assignee" className="size-8 rounded-full border-2 border-white object-cover" />
                ) : item.initials ? (
                    <div className="size-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-text-secondary">{item.initials}</div>
                ) : null}
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
                                        className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-all text-sm ${
                                            newItemCategory === cat.id
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