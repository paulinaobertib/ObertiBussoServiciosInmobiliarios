import { createContext, useContext, useState, ReactNode } from 'react';
import { Property } from '../types/property';

interface ComparisonContextType {
    comparisonItems: Property[];
    selectedPropertyIds: number[];
    addToComparison: (property: Property) => void;
    toggleSelection: (id: number) => void;
    clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
    const [comparisonItems, setComparisonItems] = useState<Property[]>([]);
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

    const toggleSelection = (id: number) => {
        setSelectedPropertyIds((prev) => {
            console.log(`Toggling selection for ID ${id}, current: ${prev}`);
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            } else if (prev.length < 2) {
                return [...prev, id];
            } else {
                return [...prev.slice(1), id];
            }
        });
    };

    const addToComparison = (property: Property) => {
        setComparisonItems((prev) => {
            console.log('Adding to comparison:', property);
            console.log('Current comparisonItems:', prev);
            if (prev.length < 2) {
                return [...prev, property];
            }
            return prev;
        });
    };

    const clearComparison = () => {
        setComparisonItems([]);
        setSelectedPropertyIds([]);
        console.log('Cleared comparisonItems and selectedPropertyIds');
    };

    return (
        <ComparisonContext.Provider
            value={{
                comparisonItems,
                selectedPropertyIds,
                addToComparison,
                toggleSelection,
                clearComparison,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};