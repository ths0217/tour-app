import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  members: { id: string; name: string; role: string; image: string }[];
  onUpdateMember: (id: string, newImage: string) => void;
}

// Preset avatar options
const presetAvatars = [
  // Emoji avatars
  '👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👱', '👨‍🦰', '👩‍🦰',
  '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '🧔', '👲', '🧕', '👳', '👮', '🕵️',
];

// Gradient backgrounds for initials
const gradients = [
  'from-red-400 to-pink-500',
  'from-orange-400 to-amber-500',
  'from-green-400 to-emerald-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-violet-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-teal-500',
  'from-yellow-400 to-orange-500',
];

export default function AvatarPicker({ isOpen, onClose, members, onUpdateMember }: AvatarPickerProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'initial'>('preset');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const member = members.find(m => m.id === selectedMember);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMember) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateMember(selectedMember, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmoji = (emoji: string) => {
    if (!selectedMember) return;
    // Create a data URL with the emoji
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, 200, 200);
      ctx.font = '120px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 100, 110);
      onUpdateMember(selectedMember, canvas.toDataURL());
    }
  };

  const handleSelectGradient = (gradient: string, initial: string) => {
    if (!selectedMember) return;
    // Store as a special format that can be detected later
    onUpdateMember(selectedMember, `gradient:${gradient}:${initial}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-charcoal rounded-t-[24px] z-50 max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
            </div>
            
            <div className="px-5 pb-3 flex-shrink-0 border-b border-black/5 dark:border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[24px]">👤</span>
                  <h2 className="text-[18px] font-bold text-charcoal dark:text-white">更換大頭貼</h2>
                </div>
                <button onClick={onClose} className="text-stone text-[14px]">完成</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Member Selection */}
              {!selectedMember ? (
                <div className="p-5">
                  <p className="text-[12px] text-stone mb-3">選擇要更換的成員</p>
                  <div className="grid grid-cols-2 gap-3">
                    {members.map((m) => (
                      <motion.button
                        key={m.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMember(m.id)}
                        className="bg-white dark:bg-black/20 rounded-mag p-4 flex flex-col items-center gap-2 shadow-sm"
                      >
                        <div
                          className="w-16 h-16 rounded-full bg-cover bg-center ring-2 ring-white shadow-mag"
                          style={{ backgroundImage: m.image.startsWith('gradient:') ? undefined : `url('${m.image}')` }}
                        >
                          {m.image.startsWith('gradient:') && (
                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${m.image.split(':')[1]} flex items-center justify-center text-white text-[24px] font-bold`}>
                              {m.image.split(':')[2]}
                            </div>
                          )}
                        </div>
                        <span className="text-[13px] font-semibold text-charcoal dark:text-white">{m.name}</span>
                        <span className="text-[10px] text-stone">{m.role}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  {/* Back Button */}
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="flex items-center gap-1 text-stone text-[13px] mb-4"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    返回
                  </button>

                  {/* Current Avatar Preview */}
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className="w-24 h-24 rounded-full bg-cover bg-center ring-4 ring-white shadow-lg mb-2"
                      style={{ backgroundImage: member?.image.startsWith('gradient:') ? undefined : `url('${member?.image}')` }}
                    >
                      {member?.image.startsWith('gradient:') && (
                        <div className={`w-full h-full rounded-full bg-gradient-to-br ${member.image.split(':')[1]} flex items-center justify-center text-white text-[36px] font-bold`}>
                          {member.image.split(':')[2]}
                        </div>
                      )}
                    </div>
                    <p className="text-[14px] font-semibold text-charcoal dark:text-white">{member?.name}</p>
                  </div>

                  {/* Tab Selector */}
                  <div className="flex rounded-mag bg-stone/10 p-1 mb-4">
                    {[
                      { id: 'preset', label: '表情符號' },
                      { id: 'initial', label: '字母頭像' },
                      { id: 'upload', label: '上傳照片' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-2 rounded-mag text-[12px] font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-white dark:bg-charcoal text-charcoal dark:text-white shadow-sm'
                            : 'text-stone'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  {activeTab === 'preset' && (
                    <div className="grid grid-cols-5 gap-3">
                      {presetAvatars.map((emoji, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSelectEmoji(emoji)}
                          className="aspect-square rounded-mag bg-white dark:bg-black/20 flex items-center justify-center text-[28px] shadow-sm hover:shadow-md transition-shadow"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'initial' && (
                    <div className="grid grid-cols-4 gap-3">
                      {gradients.map((gradient, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSelectGradient(gradient, member?.name.charAt(0).toUpperCase() || 'U')}
                          className={`aspect-square rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[24px] font-bold shadow-md`}
                        >
                          {member?.name.charAt(0).toUpperCase()}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'upload' && (
                    <div className="text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-stone/30 rounded-mag flex flex-col items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-stone text-[32px]">cloud_upload</span>
                        <span className="text-[13px] text-stone">點擊選擇照片</span>
                        <span className="text-[10px] text-stone/60">支援 JPG、PNG 格式</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
