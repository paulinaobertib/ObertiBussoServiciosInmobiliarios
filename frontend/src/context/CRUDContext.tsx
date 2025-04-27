import { createContext, useContext, useState, useEffect } from 'react';
import { getAllOwners } from '../services/ownerService';
import { getAllAmenities } from '../services/amenityService';
import { getAllPropertyTypes } from '../services/typeService';
import { getAllNeighborhood } from '../services/neighborhoodService';

interface CRUDContextProps {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    data: any[] | null;
    setData: (data: any[] | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    refreshData: () => Promise<void>;
    selectedItem: any;
    setSelectedItem: (item: any) => void;
}

export const CRUDContext = createContext<CRUDContextProps>({
    selectedCategory: '',
    setSelectedCategory: () => { },
    data: null,
    setData: () => { },
    loading: false,
    setLoading: () => { },
    refreshData: async () => { },
    selectedItem: null,
    setSelectedItem: () => { },
});

export const CRUDProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const fetchData = async (category: string) => {
        switch (category) {
            case 'owner':
                return await getAllOwners();
            case 'neighborhood':
                return await getAllNeighborhood();
            case 'amenity':
                return await getAllAmenities();
            case 'type':
                return await getAllPropertyTypes();
            default:
                return null;
        }
    };

    const refreshData = async () => {
        if (selectedCategory) {
            try {
                setLoading(true);
                const result = await fetchData(selectedCategory);
                setData(result);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            refreshData();
        } else {
            setData(null);
        }
    }, [selectedCategory]);

    const value: CRUDContextProps = {
        selectedCategory,
        setSelectedCategory,
        data,
        setData,
        selectedItem,
        setSelectedItem,
        loading,
        setLoading,
        refreshData,
    };

    return (
        <CRUDContext.Provider value={value}>
            {children}
        </CRUDContext.Provider>
    );
};

export const useCRUD = () => {
    const context = useContext(CRUDContext);
    if (!context) {
        throw new Error();
    }
    return context;
};
