import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface FamilyMember {
    id: string;
    name: string;
    role: string;
    image: string;
}

interface LoginViewProps {
    onLogin: (user: User) => void;
    familyMembers: FamilyMember[];
}

export default function LoginView({ onLogin, familyMembers }: LoginViewProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80)',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
            
            <div className="relative z-10 w-full max-w-sm">
                {/* Logo & Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-mag-lg bg-white/20 backdrop-blur-xl mb-5 border border-white/30"
                    >
                        <span className="text-4xl">🛫</span>
                    </motion.div>
                    <h1 className="text-[32px] font-bold text-white mb-2 tracking-tight drop-shadow-lg">
                        曼谷探險
                    </h1>
                    <p className="text-white/80 text-mag-body">7天6夜・家庭之旅</p>
                </motion.div>

                {/* User Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="glass-strong rounded-mag-xl p-6 shadow-mag"
                >
                    <p className="text-center text-mag-caption text-stone mb-5">選擇你的身份開始旅程</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {familyMembers.map((user, index) => (
                            <motion.button
                                key={user.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onLogin(user)}
                                className="flex flex-col items-center p-4 rounded-mag bg-cream hover:bg-white transition-colors duration-200 group"
                            >
                                <div className="relative mb-3">
                                    {user.image.startsWith('gradient:') ? (
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${user.image.split(':')[1]} flex items-center justify-center text-white text-[24px] font-bold shadow-mag ring-2 ring-white group-hover:ring-red-xhs transition-all duration-200`}>
                                            {user.image.split(':')[2]}
                                        </div>
                                    ) : (
                                        <img 
                                            src={user.image} 
                                            alt={user.name} 
                                            className="w-16 h-16 rounded-full object-cover shadow-mag ring-2 ring-white group-hover:ring-red-xhs transition-all duration-200" 
                                        />
                                    )}
                                </div>
                                <span className="text-mag-body font-semibold text-charcoal">{user.name}</span>
                                <span className="text-mag-badge text-stone">{user.role}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-mag-badge text-white/50 mt-8"
                >
                    ✨ 2025.01.27 - 02.02 ✨
                </motion.p>
            </div>
        </div>
    );
}
