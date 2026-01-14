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

import { auth, GoogleAuthProvider } from '../services/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase Auth state
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log('Auth State Changed:', firebaseUser ? 'Logged In' : 'Logged Out');
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'Traveler',
                    role: 'Member', // Default role
                    image: firebaseUser.photoURL || './avatars/me.jpg',
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Login failed', error);
        }
        setLoading(false);
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Logout failed', error);
        }
        setLoading(false);
    };

    const updateUser = async (data: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        setUser(updated);
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
