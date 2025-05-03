import React, { createContext, useContext, useState, useEffect } from 'react';

interface Property {
  id: number;
  title: string;
  price: number;
  img: string;
}

interface ComparisonContextType {
  comparisonItems: Property[];
  addToComparison: (property: Property) => void;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState<Property[]>([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('comparisonItems');
    if (storedItems) {
      setComparisonItems(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('comparisonItems', JSON.stringify(comparisonItems));
  }, [comparisonItems]);

  const addToComparison = (property: Property) => {
    setComparisonItems((prev) => {
      const exists = prev.find((item) => item.id === property.id);
      if (exists) return prev;
      if (prev.length >= 2) return [prev[1], property];
      return [...prev, property];
    });
  };

  const clearComparison = () => {
    setComparisonItems([]);
    localStorage.removeItem('comparisonItems');
  };

  return (
    <ComparisonContext.Provider value={{ comparisonItems, addToComparison, clearComparison }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
