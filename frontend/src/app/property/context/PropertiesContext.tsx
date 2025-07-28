import { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';

/* ─── servicios de catálogo ─── */
import { getAllAmenities } from '../services/amenity.service';
import { getAllOwners } from '../services/owner.service';
import { getAllNeighborhoods } from '../services/neighborhood.service';
import { getAllTypes } from '../services/type.service';
import { getAllProperties, getPropertyById } from '../services/property.service';

import { Amenity } from '../types/amenity';
import { Owner } from '../types/owner';
import { Neighborhood } from '../types/neighborhood';
import { Type } from '../types/type';
import { Property } from '../types/property';
import { SearchParams } from '../types/searchParams';

export type Category = 'amenity' | 'owner' | 'type' | 'neighborhood';
export type Picked =
  | { type: 'category'; value: Category | null }
  | { type: 'property'; value: Property | null };

interface SelectedIds {
  owner: number | null;
  neighborhood: number | null;
  type: number | null;
  amenities: number[];
}

interface Ctx {
  amenitiesList: Amenity[];
  ownersList: Owner[];
  neighborhoodsList: Neighborhood[];
  typesList: Type[];
  propertiesList: Property[] | null;
  loading: boolean;
  pickedItem: Picked | null;
  pickItem: (type: Picked['type'], value: any) => void;
  currentCategory: Category | null;
  selected: SelectedIds;
  setSelected: (n: SelectedIds) => void;
  toggleSelect: (id: number) => void;
  resetSelected: () => void;
  refreshAmenities: () => Promise<void>;
  refreshOwners: () => Promise<void>;
  refreshNeighborhoods: () => Promise<void>;
  refreshTypes: () => Promise<void>;
  refreshProperties: () => Promise<void>;
  data: any[] | null;
  buildSearchParams: (n: Partial<SearchParams>) => Partial<SearchParams>;
  currentProperty: Property | null;
  loadProperty: (id: number) => Promise<void>;
  errorProperty: string | null;
  comparisonItems: Property[];
  selectedPropertyIds: number[];
  toggleCompare: (id: number) => void;
  addToComparison: (p: Property) => void;
  clearComparison: () => void;
  disabledCompare: boolean;
}

const Context = createContext<Ctx | null>(null);

export function PropertyCrudProvider({ children }: { children: ReactNode }) {
  /* — listados de items — */
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [ownersList, setOwnersList] = useState<Owner[]>([]);
  const [neighborhoodsList, setNeighborhoodsList] = useState<Neighborhood[]>([]);
  const [typesList, setTypesList] = useState<Type[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[] | null>(null);

  /* — flags — */
  const [loading, setLoading] = useState(true);

  /* — picked y categoría actual — */
  const [pickedItem, setPickedItem] = useState<Picked | null>(null);

  const pickItem = useCallback(
    (type: Picked['type'], value: any) =>
      setPickedItem({ type, value } as Picked),
    []
  );

  const currentCategory = pickedItem?.type === 'category' ? pickedItem.value : null;

  /* — data de listado dinámico — */
  const [data, setData] = useState<any[] | null>(null);
  const setDataIfCategory = (cat: Category, list: any[]) => {
    if (currentCategory === cat) setData(list);
  };

  /* — refrescos — */
  const refreshAmenities = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllAmenities();
      const arr = Array.isArray(list) ? list : [];
      setAmenitiesList(arr);
      setDataIfCategory('amenity', arr);
    } catch (e) {
      console.error('refreshAmenities', e);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  const refreshOwners = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllOwners();
      const arr = Array.isArray(list) ? list : [];
      setOwnersList(arr);
      setDataIfCategory('owner', arr);
    } catch (e) {
      console.error('refreshOwners', e);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  const refreshNeighborhoods = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllNeighborhoods();
      const arr = Array.isArray(list) ? list : [];
      setNeighborhoodsList(arr);
      setDataIfCategory('neighborhood', arr);
    } catch (e) {
      console.error('refreshNeighborhoods', e);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  const refreshTypes = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllTypes();
      const arr = Array.isArray(list) ? list : [];
      setTypesList(arr);
      setDataIfCategory('type', arr);
    } catch (e) {
      console.error('refreshTypes', e);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  const refreshProperties = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllProperties();
      setPropertiesList(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('refreshProperties', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* — selección tradicional y buildSearchParams — */
  const [selected, setSelected] = useState<SelectedIds>({
    owner: null,
    neighborhood: null,
    type: null,
    amenities: [],
  });

  const resetSelected = useCallback(
    () => setSelected({ owner: null, neighborhood: null, type: null, amenities: [] }),
    []
  );

  const toggleSelect = (id: number) => {
    if (!currentCategory) return;
    if (currentCategory === 'amenity') {
      setSelected(prev => ({
        ...prev,
        amenities: prev.amenities.includes(id) ? prev.amenities.filter(x => x !== id) : [...prev.amenities, id],
      }));
    } else {
      setSelected(prev => ({
        ...prev,
        [currentCategory]: prev[currentCategory] === id ? null : id,
      }));
    }
  };

  const buildSearchParams = useCallback((numeric: Partial<SearchParams>) => {
    const amNames = selected.amenities
      .map(id => amenitiesList.find(a => a.id === id)?.name)
      .filter((x): x is string => !!x);
    return { ...numeric, amenities: amNames };
  }, [selected, amenitiesList]);

  /* — detalle de propiedad — */
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [errorProperty, setErrorProperty] = useState<string | null>(null);

  const loadProperty = useCallback(async (id: number) => {
    setLoading(true);
    try {
      setCurrentProperty(await getPropertyById(id));
      setErrorProperty(null);
    } catch {
      setErrorProperty('No se pudo cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  /* — comparación — */
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);
  const [comparisonItems, setComparisonItems] = useState<Property[]>([]);

  useEffect(() => {
    if (selectedPropertyIds.length === 0) {
      setComparisonItems([]);
      return;
    }
    (async () => {
      const items: Property[] = [];
      for (const id of selectedPropertyIds) {
        try {
          items.push(await getPropertyById(id));
        } catch (err) {
          console.error(`No se pudo cargar la propiedad ${id}`, err);
        }
      }
      setComparisonItems(items);
    })();
  }, [selectedPropertyIds]);

  const toggleCompare = useCallback(
    (id: number) =>
      setSelectedPropertyIds(prev =>
        prev.includes(id)
          ? prev.filter(x => x !== id)
          : prev.length < 3
            ? [...prev, id]
            : [...prev.slice(1), id],
      ),
    []
  );

  const addToComparison = (p: Property) =>
    setComparisonItems(prev => (prev.length < 2 ? [...prev, p] : prev));

  const clearComparison = () => {
    setComparisonItems([]);
    setSelectedPropertyIds([]);
  };

  const disabledCompare = useMemo(
    () => selectedPropertyIds.length < 2 || selectedPropertyIds.length > 3,
    [selectedPropertyIds]
  );

  return (
    <Context.Provider
      value={{
        amenitiesList,
        ownersList,
        neighborhoodsList,
        typesList,
        propertiesList,
        loading,
        pickedItem,
        pickItem,
        currentCategory,
        selected,
        setSelected,
        toggleSelect,
        resetSelected,
        refreshAmenities,
        refreshOwners,
        refreshNeighborhoods,
        refreshTypes,
        refreshProperties,
        data,
        buildSearchParams,
        currentProperty,
        loadProperty,
        errorProperty,
        comparisonItems,
        selectedPropertyIds,
        toggleCompare,
        addToComparison,
        clearComparison,
        disabledCompare,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePropertiesContext() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('usePropertiesContext debe usarse dentro de PropertyCrudProvider');
  return ctx;
}