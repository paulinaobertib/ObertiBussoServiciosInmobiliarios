import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
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
import { CategoryKey } from '../utils/translate';

export type Category = CategoryKey;

interface SelectedIds {
  owner: number | null;
  neighborhood: number | null;
  type: number | null;
  amenities: number[];
}

interface Ctx {
  category: Category | null;
  data: any[] | null;
  categoryLoading: boolean;

  pickCategory: (c: Category | null) => void;
  refresh: () => Promise<void>;

  // Categorias
  selected: SelectedIds;
  setSelected: (next: SelectedIds) => void;
  toggleSelect: (id: number) => void;
  resetSelected: () => void;

  // Detalles de UNA Propiedad
  currentProperty: Property | null;
  loadProperty: (id: number) => Promise<void>;
  loadingProperty: boolean;
  errorProperty: string | null;

  // Detalles de DOS para Comparacion
  comparisonItems: Property[];
  selectedPropertyIds: number[];
  toggleCompare: (id: number) => void;
  addToComparison: (property: Property) => void;
  clearComparison: () => void;

  refreshTypes: () => void;
  refreshAllCatalogs: () => Promise<void>;

  amenitiesList: Amenity[];
  ownersList: Owner[];
  neighborhoodsList: Neighborhood[];
  typesList: Type[];
  operationsList: string[];

  buildSearchParams: (numeric: Partial<SearchParams>) => Partial<SearchParams>;
}

const Context = createContext<Ctx | null>(null);

export function PropertyCrudProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Catálogos en memoria
  const [typesList, setTypes] = useState<Type[]>([]);
  const [amenitiesList, setAmenities] = useState<Amenity[]>([]);
  const [ownersList, setOwners] = useState<Owner[]>([]);
  const [neighborhoodsList, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [operationsList, setOperationsList] = useState<string[]>([]);

  // Selecciones de IDs
  const [selected, setSelected] = useState<SelectedIds>({
    owner: null,
    neighborhood: null,
    type: null,
    amenities: [],
  });
  const resetSelected = () =>
    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });

  // Property detail states
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [errorProperty, setErrorProperty] = useState<string | null>(null);

  // Comparison states
  const [comparisonItems, setComparisonItems] = useState<Property[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  useEffect(() => {
    async function syncComparisonItems() {
      const items: Property[] = [];
      for (const id of selectedPropertyIds) {
        try {
          const p = await getPropertyById(id);
          items.push(p);
        } catch (e) {
          console.warn(`No pude cargar la propiedad ${id}`, e);
        }
      }
      setComparisonItems(items);
    }

    if (selectedPropertyIds.length > 0) {
      syncComparisonItems();
    } else {
      setComparisonItems([]);
    }
  }, [selectedPropertyIds]);

  // Funciones de comparación
  const toggleCompare = (id: number) => {
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
      if (prev.length < 2) {
        return [...prev, property];
      }
      return prev;
    });
  };

  const clearComparison = () => {
    setComparisonItems([]);
    setSelectedPropertyIds([]);
  };

  // Load single property by id
  const loadProperty = async (id: number) => {
    setLoadingProperty(true);
    setErrorProperty(null);
    try {
      const prop = await getPropertyById(id);
      setCurrentProperty(prop);
    } catch {
      setErrorProperty('Error al cargar la propiedad');
    } finally {
      setLoadingProperty(false);
    }
  };

  const fetchers = {
    amenity: getAllAmenities,
    owner: getAllOwners,
    type: getAllTypes,
    neighborhood: getAllNeighborhoods,
  } as const;

  const refreshAllCatalogs = useCallback(async () => {
    try {
      const [am, ow, nh, tp, pr] = await Promise.all([
        getAllAmenities(),
        getAllOwners(),
        getAllNeighborhoods(),
        getAllTypes(),
        getAllProperties(),
      ]);
      setAmenities(am);
      setOwners(ow);
      setNeighborhoods(nh);
      setTypes(tp);
      const ops = Array.from(new Set(pr.map((p: any) => p.operation))).filter(Boolean) as string[];
      setOperationsList(ops);
    } catch (e) {
      console.error('Error en refreshAllCatalogs:', e);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!category) return;
    setData([]);
    setCategoryLoading(true);
    try {
      const res = await fetchers[category]();
      setData(res);
    } finally {
      setCategoryLoading(false);
    }
  }, [category]);

  const refreshTypes = async () => {
    setTypes([]);
    try {
      const res = await fetchers.type();
      setTypes(Array.isArray(res) ? res : []);
    } catch {
      setTypes([]);
    }
  };

  const toggleSelect = (id: number) => {
    if (!category) return;
    setSelected(prev => {
      if (category === 'amenity') {
        const list = prev.amenities.includes(id) ? prev.amenities.filter(n => n !== id) : [...prev.amenities, id];
        return { ...prev, amenities: list };
      }
      const current = prev[category];
      return { ...prev, [category]: current === id ? null : id };
    });
  };

  useEffect(() => { refreshAllCatalogs(); }, [refreshAllCatalogs]);
  useEffect(() => { refresh(); }, [category, refresh]);

  const buildSearchParams = useCallback(
    (numeric: Partial<SearchParams>) => {
      const amNames = selected.amenities
        .map(id => amenitiesList.find(a => a.id === id)?.name)
        .filter((x): x is string => !!x);
      return {
        ...numeric,
        amenities: amNames,
      };
    },
    [selected, amenitiesList]
  );

  return (
    <Context.Provider
      value={{
        category,
        data,
        categoryLoading,
        pickCategory: setCategory,
        refresh,
        selected,
        setSelected,
        toggleSelect,
        resetSelected,
        currentProperty,
        loadProperty,
        loadingProperty,
        errorProperty,
        comparisonItems,
        selectedPropertyIds,
        toggleCompare,
        addToComparison,
        clearComparison,
        refreshTypes,
        refreshAllCatalogs,
        amenitiesList,
        ownersList,
        neighborhoodsList,
        typesList,
        operationsList,
        buildSearchParams,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePropertyCrud() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('usePropertyCrud debe usarse dentro de PropertyCrudProvider');
  return ctx;
}
