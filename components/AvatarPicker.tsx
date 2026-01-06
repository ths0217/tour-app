import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  members: { id: string; name: string; role: string; image: string }[];
  onUpdateMember: (id: string, newImage: string) => void;
}

// Preset avatar options - more variety
const presetAvatars = [
  '😊', '😎', '🤓', '😇', '🥳', '😄', '🤗', '😌',
  '👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👱',
  '👨‍💼', '👩‍💼', '👨‍🎤', '👩‍🎤', '🧔', '👸', '🤴', '🦸',
];

// Gradient backgrounds for initials
const gradients = [
  { name: '紅粉', class: 'from-red-400 to-pink-500' },
  { name: '橙黃', class: 'from-orange-400 to-amber-500' },
  { name: '綠翠', class: 'from-green-400 to-emerald-500' },
  { name: '藍靛', class: 'from-blue-400 to-indigo-500' },
  { name: '紫藍', class: 'from-purple-400 to-violet-500' },
  { name: '粉紅', class: 'from-pink-400 to-rose-500' },
  { name: '青藍', class: 'from-cyan-400 to-teal-500' },
  { name: '金橙', class: 'from-yellow-400 to-orange-500' },
];

export default function AvatarPicker({ isOpen, onClose, members, onUpdateMember }: AvatarPickerProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMemberId) return;

    // Compress and resize image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxSize = 200;
          let { width, height } = img;
          
          // Resize proportionally
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG at 80% quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            onUpdateMember(selectedMemberId, compressedDataUrl);
          }
        } catch (err) {
          console.error('Photo compression failed:', err);
        }
      };
      img.onerror = () => console.error('Failed to load image');
      img.src = event.target?.result as string;
    };
    reader.onerror = () => console.error('Failed to read file');
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectEmoji = (emoji: string) => {
    if (!selectedMemberId) return;
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, 200, 200);
      ctx.font = '100px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 100, 105);
      onUpdateMember(selectedMemberId, canvas.toDataURL());
    }
  };

  const handleSelectGradient = (gradient: string) => {
    if (!selectedMemberId || !selectedMember) return;
    onUpdateMember(selectedMemberId, `gradient:${gradient}:${selectedMember.name.charAt(0).toUpperCase()}`);
  };

  const renderAvatar = (image: string, size: string = 'w-12 h-12', textSize: string = 'text-[18px]') => {
    if (image.startsWith('gradient:')) {
      return (
        <div className={`${size} rounded-full bg-gradient-to-br ${image.split(':')[1]} flex items-center justify-center text-white ${textSize} font-bold`}>
          {image.split(':')[2]}
        </div>
      );
    }
    return (
      <div 
        className={`${size} rounded-full bg-cover bg-center`}
        style={{ backgroundImage: `url('${image}')` }}
      />
    );
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
            className="fixed bottom-0 left-0 right-0 bg-cream dark:bg-charcoal rounded-t-[24px] z-50 max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-stone/30 rounded-full mx-auto" />
            </div>
            
            <div className="px-5 pb-3 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-[18px] font-bold text-charcoal dark:text-white">👤 更換大頭貼</h2>
                <button onClick={onClose} className="px-3 py-1.5 bg-red-xhs text-white text-[12px] font-semibold rounded-pill">完成</button>
              </div>
            </div>

            {/* Member Selector Tabs - Horizontal Scroll */}
            <div className="px-5 pb-3 flex-shrink-0 border-b border-black/5 dark:border-white/10">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {members.map((member) => (
                  <motion.button
                    key={member.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-mag transition-all ${
                      selectedMemberId === member.id
                        ? 'bg-red-xhs text-white shadow-md'
                        : 'bg-white dark:bg-black/20 text-charcoal dark:text-white'
                    }`}
                  >
                    <div className={`${selectedMemberId === member.id ? 'ring-2 ring-white' : ''} rounded-full`}>
                      {renderAvatar(member.image, 'w-8 h-8', 'text-[12px]')}
                    </div>
                    <div className="text-left">
                      <p className="text-[12px] font-semibold leading-tight">{member.name}</p>
                      <p className={`text-[10px] leading-tight ${selectedMemberId === member.id ? 'text-white/70' : 'text-stone'}`}>{member.role}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-safe">
              {/* Current Avatar Preview */}
              {selectedMember && (
                <div className="flex items-center gap-4 mb-5 p-3 bg-white dark:bg-black/20 rounded-mag">
                  <div className="ring-4 ring-stone/10 rounded-full">
                    {renderAvatar(selectedMember.image, 'w-16 h-16', 'text-[24px]')}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-charcoal dark:text-white">{selectedMember.name}</p>
                    <p className="text-[11px] text-stone">點選下方選項更換頭貼</p>
                  </div>
                </div>
              )}

              {/* Upload Photo Button */}
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
                className="w-full py-3 mb-4 border-2 border-dashed border-stone/30 rounded-mag flex items-center justify-center gap-2 text-stone"
              >
                <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                <span className="text-[13px] font-medium">上傳照片</span>
              </motion.button>

              {/* Emoji Section */}
              <div className="mb-4">
                <p className="text-[11px] text-stone font-medium mb-2">😊 表情符號</p>
                <div className="grid grid-cols-8 gap-2">
                  {presetAvatars.map((emoji, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleSelectEmoji(emoji)}
                      className="aspect-square rounded-mag bg-white dark:bg-black/20 flex items-center justify-center text-[22px] shadow-sm active:shadow-none"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Gradient Section */}
              <div className="mb-8">
                <p className="text-[11px] text-stone font-medium mb-2">🎨 字母頭像</p>
                <div className="grid grid-cols-4 gap-2">
                  {gradients.map((gradient, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSelectGradient(gradient.class)}
                      className={`aspect-square rounded-full bg-gradient-to-br ${gradient.class} flex items-center justify-center text-white text-[20px] font-bold shadow-md`}
                    >
                      {selectedMember?.name.charAt(0).toUpperCase()}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
