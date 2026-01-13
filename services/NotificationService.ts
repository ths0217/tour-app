// NotificationService for activity reminders
// Uses the browser Notification API for local notifications

export interface ScheduledNotification {
    id: string;
    title: string;
    body: string;
    scheduledTime: Date;
    timeoutId?: ReturnType<typeof setTimeout>;
}

class NotificationService {
    private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
    private permissionGranted: boolean = false;

    constructor() {
        this.checkPermission();
    }

    async checkPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permissionGranted = permission === 'granted';
            return this.permissionGranted;
        }

        return false;
    }

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        const permission = await Notification.requestPermission();
        this.permissionGranted = permission === 'granted';
        return this.permissionGranted;
    }

    getPermissionStatus(): NotificationPermission | 'unsupported' {
        if (!('Notification' in window)) {
            return 'unsupported';
        }
        return Notification.permission;
    }

    // Schedule a notification for a specific time
    scheduleNotification(
        id: string,
        title: string,
        body: string,
        scheduledTime: Date,
        options?: NotificationOptions
    ): boolean {
        if (!this.permissionGranted) {
            console.warn('Notification permission not granted');
            return false;
        }

        // Cancel existing notification with same ID
        this.cancelNotification(id);

        const now = new Date();
        const delay = scheduledTime.getTime() - now.getTime();

        // Don't schedule if time has passed
        if (delay < 0) {
            console.warn('Cannot schedule notification in the past');
            return false;
        }

        const timeoutId = setTimeout(() => {
            this.showNotification(title, body, options);
            this.scheduledNotifications.delete(id);
        }, delay);

        this.scheduledNotifications.set(id, {
            id,
            title,
            body,
            scheduledTime,
            timeoutId
        });

        return true;
    }

    // Schedule notification X minutes before an activity
    scheduleActivityReminder(
        activityId: number,
        title: string,
        location: string,
        activityTime: Date,
        minutesBefore: number = 30
    ): boolean {
        const reminderTime = new Date(activityTime.getTime() - minutesBefore * 60 * 1000);

        return this.scheduleNotification(
            `activity-${activityId}`,
            `⏰ ${title}`,
            `${minutesBefore}分鐘後開始 📍 ${location || ''}`,
            reminderTime,
            {
                icon: '/tour-app/pwa-192x192.png',
                badge: '/tour-app/pwa-192x192.png',
                tag: 'activity-reminder'
            }
        );
    }

    // Show notification immediately
    showNotification(title: string, body: string, options?: NotificationOptions): void {
        if (!this.permissionGranted) {
            console.warn('Notification permission not granted');
            return;
        }

        const notification = new Notification(title, {
            body,
            icon: '/tour-app/pwa-192x192.png',
            badge: '/tour-app/pwa-192x192.png',
            ...options
        });

        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }

    // Cancel a scheduled notification
    cancelNotification(id: string): void {
        const scheduled = this.scheduledNotifications.get(id);
        if (scheduled?.timeoutId) {
            clearTimeout(scheduled.timeoutId);
            this.scheduledNotifications.delete(id);
        }
    }

    // Cancel all scheduled notifications
    cancelAllNotifications(): void {
        this.scheduledNotifications.forEach((notification) => {
            if (notification.timeoutId) {
                clearTimeout(notification.timeoutId);
            }
        });
        this.scheduledNotifications.clear();
    }

    // Get all scheduled notifications
    getScheduledNotifications(): ScheduledNotification[] {
        return Array.from(this.scheduledNotifications.values());
    }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;
