// ThemeContext.tsx - Dark/Light theme management with persistence
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'tour-app-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Load saved theme on mount
    useEffect(() => {
        const saved = localStorage.getItem(THEME_KEY) as Theme | null;
        if (saved) {
            setThemeState(saved);
        }
    }, []);

    // Resolve theme and apply to document
    useEffect(() => {
        const resolve = (): 'light' | 'dark' => {
            if (theme === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return theme;
        };

        const resolved = resolve();
        setResolvedTheme(resolved);

        // Apply to document
        if (resolved === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                const newResolved = mediaQuery.matches ? 'dark' : 'light';
                setResolvedTheme(newResolved);
                if (newResolved === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    };

    const toggleTheme = () => {
        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Theme Toggle Button Component
export function ThemeToggle({ className = '' }: { className?: string }) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${className}`}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {resolvedTheme === 'dark' ? (
                <span className="material-symbols-outlined text-yellow-400">light_mode</span>
            ) : (
                <span className="material-symbols-outlined text-indigo-600">dark_mode</span>
            )}
        </button>
    );
}

// Theme Selector Component (for settings)
export function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    const options: { value: Theme; label: string; icon: string }[] = [
        { value: 'light', label: '淺色', icon: 'light_mode' },
        { value: 'dark', label: '深色', icon: 'dark_mode' },
        { value: 'system', label: '跟隨系統', icon: 'contrast' },
    ];

    return (
        <div className="flex gap-2">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-mag transition-all ${theme === option.value
                            ? 'bg-charcoal text-white dark:bg-white dark:text-charcoal'
                            : 'bg-white dark:bg-charcoal/50 text-charcoal dark:text-white border border-black/5 dark:border-white/10'
                        }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{option.icon}</span>
                    <span className="text-[13px] font-medium">{option.label}</span>
                </button>
            ))}
        </div>
    );
}
