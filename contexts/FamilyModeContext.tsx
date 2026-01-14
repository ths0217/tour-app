import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FamilyModeContextType {
    isElderlyMode: boolean;
    toggleElderlyMode: () => void;
}

const FamilyModeContext = createContext<FamilyModeContextType | undefined>(undefined);

export function FamilyModeProvider({ children }: { children: ReactNode }) {
    const [isElderlyMode, setIsElderlyMode] = useState(false);

    const toggleElderlyMode = () => {
        setIsElderlyMode(prev => !prev);
    };

    return (
        <FamilyModeContext.Provider value={{ isElderlyMode, toggleElderlyMode }}>
            {children}
        </FamilyModeContext.Provider>
    );
}

export function useFamilyMode() {
    const context = useContext(FamilyModeContext);
    if (context === undefined) {
        throw new Error('useFamilyMode must be used within a FamilyModeProvider');
    }
    return context;
}
