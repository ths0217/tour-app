import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import useMeasure from 'react-use-measure';
import { ChecklistItem as ItemType, FamilyMember } from '../types';
import { categories } from '../views/WalletView'; // Reuse categories or define new ones

interface ChecklistItemProps {
    item: ItemType;
    toggleItem: (id: string) => void;
    deleteItem: (id: string) => void; // New prop for deletion
    familyMembers: FamilyMember[];
    categories: any[];
}

const ChecklistItem = React.memo(({ item, toggleItem, deleteItem, familyMembers, categories }: ChecklistItemProps) => {
    const [ref, bounds] = useMeasure();
    const x = useMotionValue(0);
    const background = useTransform(x, [-100, 0, 100], ["#ef4444", "#ffffff", "#10b981"]);
    const [isDragging, setIsDragging] = useState(false);
    
    // Find category info
    const cat = categories.find(c => c.id === item.category);
    
    // Determine assignee avatar
    const assignee = item.assigneeId ? familyMembers.find(m => m.id === item.assigneeId) : null;

    const handleDragEnd = (event: any, info: PanInfo) => {
        setIsDragging(false);
        if (info.offset.x < -100) {
            // Swiped Left -> Delete
            deleteItem(item.id);
        } else if (info.offset.x > 100) {
            // Swiped Right -> Toggle
            toggleItem(item.id);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ opacity: { duration: 0.2 } }}
            className="relative overflow-hidden group"
        >
            {/* Background Actions */}
            <motion.div 
                style={{ background }}
                className="absolute inset-0 flex items-center justify-between px-6"
            >
                <div className="flex items-center gap-2 text-white font-bold opacity-0" style={{ opacity: useTransform(x, [50, 100], [0, 1]) as any }}>
                    <span className="material-symbols-outlined">check</span>
                    <span>完成</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold opacity-0" style={{ opacity: useTransform(x, [-50, -100], [0, 1]) as any }}>
                    <span>刪除</span>
                    <span className="material-symbols-outlined">delete</span>
                </div>
            </motion.div>

            {/* Content Card */}
            <motion.div
                ref={ref}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1} // Resistance feel
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`relative bg-white p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing border-b border-black/5 last:border-0 ${item.checked ? 'bg-stone/5' : ''}`}
                whileTap={{ scale: 0.995 }} // Slight press effect
            >
                {/* Visual Checkbox (Matches WalletView logic but smaller) */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    item.checked 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-stone/30'
                }`}>
                    {item.checked && (
                        <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                    )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 select-none">
                    <p className={`text-[15px] font-medium transition-all leading-snug ${
                        item.checked ? 'line-through text-stone' : 'text-charcoal'
                    }`}>
                        {item.text}
                    </p>
                    {item.sub && (
                        <p className="text-[12px] text-stone mt-0.5">{item.sub}</p>
                    )}
                </div>

                {/* Info / Assignee */}
                <div className="flex items-center gap-3 shrink-0">
                     {/* Category Dot */}
                     {cat && (
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${cat.color}`} title={cat.label} />
                     )}

                    {/* Assignee Avatar */}
                    {assignee && (
                        <div className="w-7 h-7">
                            {assignee.image.startsWith('gradient:') ? (
                                <div className={`w-full h-full rounded-full bg-gradient-to-br ${assignee.image.split(':')[1]} flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-1 ring-white/50`}>
                                    {assignee.image.split(':')[2]}
                                </div>
                            ) : (
                                <img 
                                    src={assignee.image} 
                                    alt={assignee.name}
                                    className="w-full h-full rounded-full object-cover shadow-sm ring-1 ring-white/50"
                                />
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
});

export default ChecklistItem;
