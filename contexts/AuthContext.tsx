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
import { signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle redirect result (for mobile login flow)
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    console.log('Redirect login successful');
                }
            })
            .catch((error) => {
                console.error('Redirect result error:', error);
            });

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
            // Use redirect instead of popup for mobile compatibility
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error('Login failed', error);
            setLoading(false);
        }
        // Note: setLoading(false) not needed here as page will redirect
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
