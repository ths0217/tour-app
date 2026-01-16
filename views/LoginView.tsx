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

                {/* Login Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onLogin({} as any)} // Pass dummy, handled by Google Auth
                        className="bg-white text-charcoal font-bold py-3.5 px-8 rounded-full shadow-lg flex items-center gap-3 w-full max-w-[280px] justify-center border border-stone/10"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        <span>使用 Google 帳號登入</span>
                    </motion.button>

                    <p className="text-white/60 text-[12px] mt-6 text-center max-w-[260px]">
                        登入即代表您同意加入
                        <br />
                        <span className="text-white/90 font-semibold">曼谷家庭旅遊 2025</span>
                        的即時協作群組
                    </p>
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
