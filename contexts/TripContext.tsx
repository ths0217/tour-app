import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip, ScheduleItem, Expense } from '../types';
import { useAuth } from './AuthContext';

interface TripContextType {
    currentTrip: Trip | null;
    schedule: ScheduleItem[];
    expenses: Expense[];
    loading: boolean;
    addScheduleItem: (item: ScheduleItem) => Promise<void>;
    updateScheduleItem: (item: ScheduleItem) => Promise<void>;
    removeScheduleItem: (id: number) => Promise<void>;
    addExpense: (expense: Expense) => Promise<void>;
    memberLocations: Record<string, { lat: number; lng: number; lastSeen: number }>;
    updateMyLocation: (lat: number, lng: number) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

import { db } from '../services/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, query, where, Timestamp } from 'firebase/firestore';

export function TripProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth(); // Depend on auth loading
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [memberLocations, setMemberLocations] = useState<Record<string, { lat: number; lng: number; lastSeen: number }>>({});
    const [loading, setLoading] = useState(true);

    // Hardcoded Trip ID for MVP (Single Trip Mode)
    const TRIP_ID = 'trip-bkk-2025';

    useEffect(() => {
        if (authLoading) return; // Wait for auth
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // 1. Listen to Trip Metadata
        const tripRef = doc(db, 'trips', TRIP_ID);
        const unsubTrip = onSnapshot(tripRef, (doc) => {
            if (doc.exists()) {
                setCurrentTrip({ id: doc.id, ...doc.data() } as Trip);
            } else {
                // Create initial trip if not exists (One-time setup)
                setDoc(tripRef, {
                    name: 'Bangkok Family Trip',
                    startDate: '2025-01-27',
                    endDate: '2025-01-31',
                    members: [user.id],
                    budget: { total: 50000, currency: 'THB' }
                }, { merge: true });
            }
        });

        // 2. Listen to Schedule (Real-time!)
        const scheduleRef = collection(db, 'trips', TRIP_ID, 'schedule');
        const unsubSchedule = onSnapshot(scheduleRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as ScheduleItem));
            setSchedule(items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
        });

        // 3. Listen to Expenses
        const expenseRef = collection(db, 'trips', TRIP_ID, 'expenses');
        const unsubExpense = onSnapshot(expenseRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as Expense));
            setExpenses(items);
        });

        // 4. Listen to Family Locations (Users collection)
        // In a real app, query by tripId. For now, just listen to known family IDs if possible or all users
        const usersRef = collection(db, 'users');
        const unsubUsers = onSnapshot(usersRef, (snapshot) => {
            const locations: Record<string, any> = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.location) {
                    locations[doc.id] = data.location;
                }
            });
            setMemberLocations(locations);
        });

        setLoading(false);

        return () => {
            unsubTrip();
            unsubSchedule();
            unsubExpense();
            unsubUsers();
        };
    }, [user]);

    const addScheduleItem = async (item: ScheduleItem) => {
        // ID is used as doc ID for simplicity in this migration
        const ref = doc(db, 'trips', TRIP_ID, 'schedule', String(item.id));
        await setDoc(ref, item);
    };

    const updateScheduleItem = async (item: ScheduleItem) => {
        const ref = doc(db, 'trips', TRIP_ID, 'schedule', String(item.id));
        await updateDoc(ref, { ...item });
    };

    const removeScheduleItem = async (id: number) => {
        // await deleteDoc(...) - not implemented in interface yet
    };

    const addExpense = async (expense: Expense) => {
        const ref = doc(db, 'trips', TRIP_ID, 'expenses', String(expense.id));
        await setDoc(ref, expense);
    };

    const updateMyLocation = async (lat: number, lng: number) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, {
            location: { lat, lng, lastSeen: Date.now() },
            displayName: user.name,
            photoURL: user.image
        }, { merge: true });
    };

    return (
        <TripContext.Provider value={{
            currentTrip, schedule, expenses, loading,
            addScheduleItem, updateScheduleItem, removeScheduleItem, addExpense,
            memberLocations, updateMyLocation
        }}>
            {children}
        </TripContext.Provider>
    );
}

export function useTrip() {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
}
