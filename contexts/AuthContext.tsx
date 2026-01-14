import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock initial user for 0-1 phase
const MOCK_USER: User = {
    id: 'mock-user-1',
    name: 'Vickly',
    role: 'Admin',
    image: './avatars/me.jpg',
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate auth check delay
        const initAuth = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            // In real app, check Firebase Auth state here
            const stored = localStorage.getItem('tourapp_auth_user');
            if (stored) {
                setUser(JSON.parse(stored));
            } else {
                // Auto-login for MVP demo comfort
                setUser(MOCK_USER);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const signIn = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setUser(MOCK_USER);
        localStorage.setItem('tourapp_auth_user', JSON.stringify(MOCK_USER));
        setLoading(false);
    };

    const signOut = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        setUser(null);
        localStorage.removeItem('tourapp_auth_user');
        setLoading(false);
    };

    const updateUser = async (data: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem('tourapp_auth_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
