import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

const users = [
    { id: 'vickly', name: 'Vickly', role: '我', image: '/avatars/me.jpg' },
    { id: 'sherry', name: 'Sherry', role: '姊姊', image: '/avatars/sister.jpg' },
    { id: 'alex', name: 'Alexsander', role: '哥哥', image: '/avatars/brother.jpg' },
    { id: 'jenny', name: 'Jenny', role: '媽媽', image: '/avatars/mother.jpg' },
];

interface LoginViewProps {
    onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
    return (
        <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-ios-blue/10 via-transparent to-transparent" />
            
            <div className="relative z-10 w-full max-w-sm">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-ios-blue mb-5 shadow-ios-lg"
                    >
                        <span className="material-symbols-outlined text-4xl text-white">flight_takeoff</span>
                    </motion.div>
                    <h1 className="text-ios-title1 text-text-primary mb-2">曼谷家庭旅遊</h1>
                    <p className="text-ios-subhead text-ios-secondary">選擇您的身份開始使用</p>
                </motion.div>

                {/* User Selection Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="bg-white rounded-ios-2xl p-5 shadow-ios"
                >
                    <div className="grid grid-cols-2 gap-3">
                        {users.map((user, index) => (
                            <motion.button
                                key={user.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onLogin(user)}
                                className="flex flex-col items-center p-4 rounded-ios-lg bg-ios-bg hover:bg-bone-alt active:bg-ios-tertiary/30 transition-all duration-200"
                            >
                                <div className="w-16 h-16 rounded-full mb-3 overflow-hidden ring-2 ring-white shadow-ios">
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-ios-callout font-semibold text-text-primary">{user.name}</span>
                                <span className="text-ios-caption1 text-ios-secondary">{user.role}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-ios-caption2 text-ios-tertiary mt-8"
                >
                    2025 曼谷家庭之旅 • 1/27 - 2/2
                </motion.p>
            </div>
        </div>
    );
}
