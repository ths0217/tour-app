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

// Initial mock data
const INITIAL_TRIP: Trip = {
    id: 'trip-bkk-2025',
    name: 'Bangkok Family Trip',
    startDate: '2025-01-27',
    endDate: '2025-01-31',
    members: ['mock-user-1'],
    budget: { total: 50000, currency: 'THB' },
};

export function TripProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [memberLocations, setMemberLocations] = useState<Record<string, { lat: number; lng: number; lastSeen: number }>>({});
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        if (!user) return;

        // Simulate Firestore listener
        setLoading(true);

        // Check LocalStorage first (migration path)
        const storedSchedule = localStorage.getItem('tourapp_schedule');
        const storedExpenses = localStorage.getItem('tourapp_expenses');

        setCurrentTrip(INITIAL_TRIP);
        if (storedSchedule) setSchedule(JSON.parse(storedSchedule));
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses));

        setLoading(false);
    }, [user]);

    // Sync to Cloud (Mock)
    const syncToCloud = async () => {
        // In real app: firestore.collection('trips').doc(id).update(...)
        console.log('Syncing to cloud...');
        localStorage.setItem('tourapp_schedule', JSON.stringify(schedule));
        localStorage.setItem('tourapp_expenses', JSON.stringify(expenses));
    };

    useEffect(() => {
        if (!loading) syncToCloud();
    }, [schedule, expenses]);

    const addScheduleItem = async (item: ScheduleItem) => {
        setSchedule(prev => [...prev, item]);
    };

    const updateScheduleItem = async (updatedItem: ScheduleItem) => {
        setSchedule(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const removeScheduleItem = async (id: number) => {
        setSchedule(prev => prev.filter(item => item.id !== id));
    };

    const addExpense = async (expense: Expense) => {
        setExpenses(prev => [...prev, expense]);
    };

    const updateMyLocation = async (lat: number, lng: number) => {
        if (!user) return;
        // In real app: firestore.collection('users').doc(user.id).update({ location: ... })
        setMemberLocations(prev => ({
            ...prev,
            [user.id]: { lat, lng, lastSeen: Date.now() }
        }));

        // Simulate other members moving randomly near me (for demo continuity)
        if (Math.random() > 0.9) {
            ['sherry', 'mom'].forEach(id => {
                setMemberLocations(prev => ({
                    ...prev,
                    [id]: {
                        lat: lat + (Math.random() - 0.5) * 0.005,
                        lng: lng + (Math.random() - 0.5) * 0.005,
                        lastSeen: Date.now()
                    }
                }));
            });
        }
    };

    return (
        <TripContext.Provider value={{
            currentTrip,
            schedule,
            expenses,
            loading,
            addScheduleItem,
            updateScheduleItem,
            removeScheduleItem,
            addExpense,
            memberLocations,
            updateMyLocation
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
