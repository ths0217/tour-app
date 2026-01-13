// firebase.ts - Firebase configuration and real-time sync service
// Replace with your Firebase project credentials to enable multi-user sync

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getDatabase,
    ref,
    set,
    onValue,
    push,
    update,
    remove,
    Database,
    DataSnapshot
} from 'firebase/database';
import { ScheduleItem, Expense } from '../types';

// ⚠️ REPLACE WITH YOUR FIREBASE CONFIG
// Get this from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase is configured
const isFirebaseConfigured = (): boolean => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
};

let app: FirebaseApp | null = null;
let database: Database | null = null;

// Initialize Firebase
const initFirebase = (): boolean => {
    if (!isFirebaseConfigured()) {
        console.warn('[Firebase] Not configured. Real-time sync disabled.');
        return false;
    }

    try {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
        console.log('[Firebase] Initialized successfully');
        return true;
    } catch (error) {
        console.error('[Firebase] Initialization failed:', error);
        return false;
    }
};

// Trip room management
interface TripRoom {
    id: string;
    name: string;
    ownerId: string;
    members: Record<string, { name: string; joinedAt: number; online: boolean }>;
    createdAt: number;
}

class FirebaseSyncService {
    private tripId: string | null = null;
    private userId: string | null = null;
    private initialized = false;
    private listeners: Map<string, () => void> = new Map();

    constructor() {
        this.initialized = initFirebase();
    }

    isEnabled(): boolean {
        return this.initialized && database !== null;
    }

    // Set current user
    setUser(userId: string, userName: string): void {
        this.userId = userId;
        if (this.isEnabled() && this.tripId) {
            this.updatePresence(userName);
        }
    }

    // Create or join a trip room
    async joinTrip(tripId: string, userName: string): Promise<boolean> {
        if (!this.isEnabled() || !database) return false;

        this.tripId = tripId;
        const memberRef = ref(database, `trips/${tripId}/members/${this.userId}`);

        try {
            await set(memberRef, {
                name: userName,
                joinedAt: Date.now(),
                online: true,
            });
            console.log(`[Firebase] Joined trip: ${tripId}`);
            return true;
        } catch (error) {
            console.error('[Firebase] Failed to join trip:', error);
            return false;
        }
    }

    // Update user presence
    private async updatePresence(userName: string): Promise<void> {
        if (!this.isEnabled() || !database || !this.tripId || !this.userId) return;

        const presenceRef = ref(database, `trips/${this.tripId}/members/${this.userId}`);
        await update(presenceRef, {
            name: userName,
            lastSeen: Date.now(),
            online: true,
        });

        // Set up disconnect handler
        // Note: In production, use onDisconnect() for automatic cleanup
    }

    // Sync schedule to Firebase
    async syncSchedule(schedule: ScheduleItem[]): Promise<void> {
        if (!this.isEnabled() || !database || !this.tripId) return;

        const scheduleRef = ref(database, `trips/${this.tripId}/schedule`);
        try {
            await set(scheduleRef, schedule);
            console.log('[Firebase] Schedule synced');
        } catch (error) {
            console.error('[Firebase] Failed to sync schedule:', error);
        }
    }

    // Listen for schedule changes
    onScheduleChange(callback: (schedule: ScheduleItem[]) => void): () => void {
        if (!this.isEnabled() || !database || !this.tripId) {
            return () => { };
        }

        const scheduleRef = ref(database, `trips/${this.tripId}/schedule`);
        const unsubscribe = onValue(scheduleRef, (snapshot: DataSnapshot) => {
            const data = snapshot.val();
            if (Array.isArray(data)) {
                callback(data);
            }
        });

        const key = `schedule-${this.tripId}`;
        this.listeners.set(key, unsubscribe);

        return () => {
            unsubscribe();
            this.listeners.delete(key);
        };
    }

    // Sync expenses to Firebase
    async syncExpenses(expenses: Expense[]): Promise<void> {
        if (!this.isEnabled() || !database || !this.tripId) return;

        const expensesRef = ref(database, `trips/${this.tripId}/expenses`);
        try {
            await set(expensesRef, expenses);
            console.log('[Firebase] Expenses synced');
        } catch (error) {
            console.error('[Firebase] Failed to sync expenses:', error);
        }
    }

    // Listen for expense changes
    onExpensesChange(callback: (expenses: Expense[]) => void): () => void {
        if (!this.isEnabled() || !database || !this.tripId) {
            return () => { };
        }

        const expensesRef = ref(database, `trips/${this.tripId}/expenses`);
        const unsubscribe = onValue(expensesRef, (snapshot: DataSnapshot) => {
            const data = snapshot.val();
            if (Array.isArray(data)) {
                callback(data);
            }
        });

        const key = `expenses-${this.tripId}`;
        this.listeners.set(key, unsubscribe);

        return () => {
            unsubscribe();
            this.listeners.delete(key);
        };
    }

    // Get online members
    onMembersChange(callback: (members: Record<string, { name: string; online: boolean }>) => void): () => void {
        if (!this.isEnabled() || !database || !this.tripId) {
            return () => { };
        }

        const membersRef = ref(database, `trips/${this.tripId}/members`);
        const unsubscribe = onValue(membersRef, (snapshot: DataSnapshot) => {
            const data = snapshot.val();
            if (data) {
                callback(data);
            }
        });

        const key = `members-${this.tripId}`;
        this.listeners.set(key, unsubscribe);

        return () => {
            unsubscribe();
            this.listeners.delete(key);
        };
    }

    // Leave trip and cleanup
    async leaveTrip(): Promise<void> {
        if (!this.isEnabled() || !database || !this.tripId || !this.userId) return;

        const memberRef = ref(database, `trips/${this.tripId}/members/${this.userId}`);
        await update(memberRef, { online: false, leftAt: Date.now() });

        // Clean up all listeners
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners.clear();
        this.tripId = null;
    }

    // Generate shareable trip code
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
