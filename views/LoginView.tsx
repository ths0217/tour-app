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
        <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center p-6 safe-top safe-bottom">
            {/* Logo & Title */}
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
                    className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-ios-blue mb-5 shadow-ios-md"
                >
                    <span className="text-4xl">🛫</span>
                </motion.div>
                <h1 className="text-ios-largeTitle text-[#1C1C1E] mb-2">曼谷探險</h1>
                <p className="text-ios-subhead text-ios-gray">7天6夜・家庭之旅</p>
            </motion.div>

            {/* User Selection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="w-full max-w-sm"
            >
                <p className="text-ios-footnote text-ios-gray uppercase tracking-wide text-center mb-4">
                    選擇身份
                </p>
                
                <div className="ios-list">
                    {users.map((user, index) => (
                        <motion.button
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileTap={{ scale: 0.98, backgroundColor: 'rgba(0,0,0,0.03)' }}
                            onClick={() => onLogin(user)}
                            className="ios-list-item flex items-center gap-4 w-full text-left"
                        >
                            <img 
                                src={user.image} 
                                alt={user.name}
                                className="w-14 h-14 rounded-full object-cover" 
                            />
                            <div className="flex-1">
                                <p className="text-ios-body text-[#1C1C1E] font-medium">{user.name}</p>
                                <p className="text-ios-caption1 text-ios-gray">{user.role}</p>
                            </div>
                            <span className="material-symbols-outlined text-ios-gray3 text-[20px]">chevron_right</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Footer */}
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-ios-caption2 text-ios-gray mt-10"
            >
                2025.01.27 - 02.02 ✈️
            </motion.p>
        </div>
    );
}
