import { createContext, useContext, useState, useEffect } from 'react';
import { getAllOwners } from '../services/ownerService';
import { getAllAmenities } from '../services/amenityService';
import { getAllTypes } from '../services/typeService';
import { getAllNeighborhood } from '../services/neighborhoodService';

interface CRUDContextProps {
    selectedCategory: string;
    setSelectedCategoryName: (category: string) => void;
    selectedCategories: {
        owner: number | null;
        neighborhood: number | null;
        type: number | null;
        amenities: number[] | null;  // Ahora almacenamos solo los ids de amenities
    };
    setSelectedCategoryItem: (category: string, item: any) => void;
    data: any[] | null;
    setData: (data: any[] | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    refreshData: () => Promise<void>;
}

// CONTEXTO
export const CRUDContext = createContext<CRUDContextProps>({
    selectedCategory: '',
    setSelectedCategoryName: () => { },
    selectedCategories: {
        owner: null,
        neighborhood: null,
        type: null,
        amenities: null,
    },
    setSelectedCategoryItem: () => { },
    data: null,
    setData: () => { },
    loading: false,
    setLoading: () => { },
    refreshData: async () => { },
});

export const CRUDProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const [selectedCategories, setSelectedCategories] = useState<{
        owner: any | null;
        neighborhood: any | null;
        type: any | null;
        amenities: any[] | null;
    }>({
        owner: null,
        neighborhood: null,
        type: null,
        amenities: null,
    });

    const [data, setData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async (category: string) => {
        switch (category) {
            case 'owner':
                return await getAllOwners();
            case 'neighborhood':
                return await getAllNeighborhood();
            case 'amenity':
                return await getAllAmenities();
            case 'type':
                return await getAllTypes();
            default:
                return null;
        }
    };

    const refreshData = async () => {
        if (selectedCategory) {
            try {
                setLoading(true);
                const result = await fetchData(selectedCategory);
                if (result && result.length > 0) {
                    setData(result);
                } else {
                    setData(null);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        } else {
            console.warn('No selected category to fetch.');
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!data && selectedCategory) {
                refreshData();
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [data, selectedCategory]);

    const setSelectedCategoryItem = (category: string, item: any) => {
        setSelectedCategories(prev => {
            if (category === 'amenity') {
                const amenitiesArray = prev.amenities ? [...prev.amenities] : [];
    
                const alreadyExists = amenitiesArray.some((amenity: any) => amenity.id === item.id);
    
                if (alreadyExists) {
                    const updatedAmenities = amenitiesArray.filter((amenity: any) => amenity.id !== item.id);
                    return { ...prev, amenities: updatedAmenities };
                } else {
                    const updatedAmenities = [...amenitiesArray, item.id];  // Aquí solo almacenamos el id
                    return { ...prev, amenities: updatedAmenities };
                }
            } else {
                return { ...prev, [category]: item.id };  // Aquí solo almacenamos el id
            }
        });
    };

    const value: CRUDContextProps = {
        selectedCategory,
        setSelectedCategoryName: setSelectedCategory,
        selectedCategories,
        setSelectedCategoryItem,
        data,
        setData,
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
        throw new Error('useCRUD must be used within a CRUDProvider');
    }
    return context;
};
