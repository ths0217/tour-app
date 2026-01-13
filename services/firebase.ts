// firebase.ts - Firebase sync service (Mock implementation)
// This is a placeholder that doesn't require Firebase SDK installation.
// To enable real Firebase sync, install firebase and uncomment the real implementation.

import { ScheduleItem, Expense } from '../types';

// ⚠️ FIREBASE NOT INSTALLED
// To enable real-time sync:
// 1. Run: npm install firebase
// 2. Replace this file with the real Firebase implementation
// 3. Add your Firebase config from Firebase Console

// Mock Firebase config - replace with real config when ready
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase is configured (always false in mock mode)
const isFirebaseConfigured = (): boolean => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
};

class FirebaseSyncService {
    private tripId: string | null = null;
    private userId: string | null = null;

    isEnabled(): boolean {
        return false; // Mock mode - always disabled
    }

    setUser(_userId: string, _userName: string): void {
        console.log('[Firebase Mock] setUser called - Firebase not installed');
    }

    async joinTrip(_tripId: string, _userName: string): Promise<boolean> {
        console.log('[Firebase Mock] joinTrip called - Firebase not installed');
        return false;
    }

    async syncSchedule(_schedule: ScheduleItem[]): Promise<void> {
        console.log('[Firebase Mock] syncSchedule called - Firebase not installed');
    }

    onScheduleChange(_callback: (schedule: ScheduleItem[]) => void): () => void {
        console.log('[Firebase Mock] onScheduleChange called - Firebase not installed');
        return () => { };
    }

    async syncExpenses(_expenses: Expense[]): Promise<void> {
        console.log('[Firebase Mock] syncExpenses called - Firebase not installed');
    }

    onExpensesChange(_callback: (expenses: Expense[]) => void): () => void {
        console.log('[Firebase Mock] onExpensesChange called - Firebase not installed');
        return () => { };
    }

    onMembersChange(_callback: (members: Record<string, { name: string; online: boolean }>) => void): () => void {
        console.log('[Firebase Mock] onMembersChange called - Firebase not installed');
        return () => { };
    }

    async leaveTrip(): Promise<void> {
        console.log('[Firebase Mock] leaveTrip called - Firebase not installed');
    }

    generateTripCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}

// Export singleton instance
export const firebaseSync = new FirebaseSyncService();

// Hook for React components
export function useFirebaseSync() {
    return {
        isEnabled: firebaseSync.isEnabled(),
        joinTrip: (tripId: string, userName: string) => firebaseSync.joinTrip(tripId, userName),
        syncSchedule: (schedule: ScheduleItem[]) => firebaseSync.syncSchedule(schedule),
        syncExpenses: (expenses: Expense[]) => firebaseSync.syncExpenses(expenses),
        onScheduleChange: (cb: (s: ScheduleItem[]) => void) => firebaseSync.onScheduleChange(cb),
        onExpensesChange: (cb: (e: Expense[]) => void) => firebaseSync.onExpensesChange(cb),
        onMembersChange: (cb: (m: Record<string, { name: string; online: boolean }>) => void) => firebaseSync.onMembersChange(cb),
        leaveTrip: () => firebaseSync.leaveTrip(),
        generateTripCode: () => firebaseSync.generateTripCode(),
    };
}
