import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

const users = [
    { id: 'vickly', name: 'Vickly', role: '我', image: '/avatars/me.jpg' },
    { id: 'sherry', name: 'Sherry', role: '姊姊', image: '/avatars/sister.jpg' },
    { id: 'alex', name: 'Alexsander', role: '哥哥', image: '/avatars/father.jpg' },
    { id: 'jenny', name: 'Jenny', role: '媽媽', image: '/avatars/mother.jpg' },
];

interface LoginViewProps {
    onLogin: (user: User) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
    return (
        <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-text-primary rounded-b-[3rem] z-0"></div>

            <div className="relative z-10 w-full max-w-sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/20 mb-4 backdrop-blur-sm border border-white/10">
                        <span className="material-symbols-outlined text-3xl text-gold">flight_takeoff</span>
                    </div>
                    <h1 className="text-3xl font-serif text-ivory mb-2 tracking-wide">Bangkok<br />Luxury Tour</h1>
                    <p className="text-ivory/60 text-xs tracking-[0.2em] uppercase">Private Family Expedition</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl p-6 shadow-xl border border-black/5"
                >
                    <h2 className="text-center text-sm font-bold text-text-muted uppercase tracking-widest mb-6">歡迎回來，請問您是？</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {users.map((user) => (
                            <motion.button
                                key={user.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onLogin(user)}
                                className="flex flex-col items-center p-4 rounded-2xl border border-black/5 hover:border-gold/50 hover:bg-bone transition-all group"
                            >
                                <div className="w-16 h-16 rounded-full mb-3 overflow-hidden border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-medium text-text-primary group-hover:text-gold transition-colors">{user.name}</span>
                                <span className="text-[10px] text-text-muted">{user.role}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            <p className="absolute bottom-8 text-[10px] text-text-muted opacity-50">Designed for the Luxury Experience</p>
        </div>
    );
}
