import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Mode = 'work' | 'shortBreak' | 'longBreak';

interface Colors {
    work: string;
    shortBreak: string;
    longBreak: string;
}

interface Settings {
    work: number;
    shortBreak: number;
    longBreak: number;
    colors: Colors;
}

interface SessionContextType {
    mode: Mode;
    setMode: (mode: Mode) => void;
    settings: Settings;
    sessionsCompleted: number;
    updateSettings: (newSettings: Partial<Settings>) => void;
    resetSettings: () => void;
    refreshTrigger: number;
    triggerRefresh: () => void;
    nextSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    colors: {
        work: '#f05454',
        shortBreak: '#4e9f3d',
        longBreak: '#30475e',
    },
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Try to load settings from localStorage
    const [mode, setMode] = useState<Mode>('work');
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('pomodoro-settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all fields exist
                return {
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    colors: { ...DEFAULT_SETTINGS.colors, ...(parsed.colors || {}) }
                };
            } catch (e) {
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
    }, [settings]);

    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            // If colors is being updated partially, handle nested merge
            if (newSettings.colors) {
                updated.colors = { ...prev.colors, ...newSettings.colors };
            }
            return updated;
        });
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    const nextSession = useCallback(() => {
        if (mode === 'work') {
            const nextCount = sessionsCompleted + 1;
            setSessionsCompleted(nextCount);
            if (nextCount > 0 && nextCount % 4 === 0) {
                setMode('longBreak');
            } else {
                setMode('shortBreak');
            }
        } else {
            setMode('work');
        }
    }, [mode, sessionsCompleted]);

    return (
        <SessionContext.Provider value={{
            mode,
            setMode,
            settings,
            sessionsCompleted,
            refreshTrigger,
            updateSettings,
            resetSettings,
            nextSession,
            triggerRefresh
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
