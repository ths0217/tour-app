// haptics.ts - iOS-like haptic feedback utilities
// Provides tactile feedback for button presses and interactions

type HapticPattern = number | number[];

interface HapticOptions {
    pattern?: HapticPattern;
    fallbackSound?: boolean;
}

// Check if vibration API is available
const canVibrate = (): boolean => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

// Low-level vibrate function
const vibrate = (pattern: HapticPattern): boolean => {
    if (!canVibrate()) return false;
    try {
        return navigator.vibrate(pattern);
    } catch {
        return false;
    }
};

/**
 * Haptic feedback utilities matching iOS feedback styles
 */
export const haptics = {
    /**
     * Light impact - for subtle UI interactions
     * iOS equivalent: UIImpactFeedbackGenerator.style.light
     */
    light: (): boolean => vibrate(10),

    /**
     * Medium impact - for standard button presses
     * iOS equivalent: UIImpactFeedbackGenerator.style.medium
     */
    medium: (): boolean => vibrate(20),

    /**
     * Heavy impact - for significant actions
     * iOS equivalent: UIImpactFeedbackGenerator.style.heavy
     */
    heavy: (): boolean => vibrate(30),

    /**
     * Selection changed - for picker/slider changes
     * iOS equivalent: UISelectionFeedbackGenerator
     */
    selection: (): boolean => vibrate(5),

    /**
     * Success notification - for completed actions
     * iOS equivalent: UINotificationFeedbackGenerator.success
     */
    success: (): boolean => vibrate([10, 50, 20]),

    /**
     * Warning notification - for destructive action warnings
     * iOS equivalent: UINotificationFeedbackGenerator.warning
     */
    warning: (): boolean => vibrate([30, 30, 30]),

    /**
     * Error notification - for failed actions
     * iOS equivalent: UINotificationFeedbackGenerator.error
     */
    error: (): boolean => vibrate([50, 30, 50, 30, 50]),

    /**
     * Soft impact - very subtle feedback
     * iOS equivalent: UIImpactFeedbackGenerator.style.soft
     */
    soft: (): boolean => vibrate(8),

    /**
     * Rigid impact - sharp feedback
     * iOS equivalent: UIImpactFeedbackGenerator.style.rigid
     */
    rigid: (): boolean => vibrate(15),

    /**
     * Check if haptics are available
     */
    isAvailable: canVibrate,

    /**
     * Custom pattern
     */
    custom: (pattern: HapticPattern): boolean => vibrate(pattern),
};

// Hook for using haptics in React components
export function useHaptics() {
    return haptics;
}

// Higher-order function to add haptic feedback to button clicks
export function withHaptics<T extends (...args: any[]) => any>(
    fn: T,
    style: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' | 'soft' | 'rigid' = 'light'
): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
        haptics[style]();
        return fn(...args);
    };
}

export default haptics;
