import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

/* ─── servicios de catálogo ─── */
import { getAllAmenities } from '../services/amenity.service';
import { getAllOwners } from '../services/owner.service';
import { getAllNeighborhoods } from '../services/neighborhood.service';
import { getAllTypes } from '../services/type.service';
import { getAllProperties, getPropertyById } from '../services/property.service';
import { getMaintenanceByPropertyId } from '../services/maintenance.service';
import { getCommentsByPropertyId } from '../services/comment.service';


/* ─── tipos ─── */
import { Amenity } from '../types/amenity';
import { Owner } from '../types/owner';
import { Neighborhood } from '../types/neighborhood';
import { Type } from '../types/type';
import { Property } from '../types/property';
import { Maintenance } from '../types/maintenance';
import { Comment } from '../types/comment';
import { SearchParams } from '../types/searchParams';

export type Category = 'amenity' | 'owner' | 'type' | 'neighborhood';
/* ---------- selección GENÉRICA ---------- */
type Picked =
  | { type: 'category'; value: Category | null }
  | { type: 'property'; value: Property | null }
  | { type: 'maintenance'; value: Maintenance | null }
  | { type: 'comment'; value: Comment | null };


/* ---------- selección “tradicional” (IDs) ---------- */
interface SelectedIds {
  owner: number | null;
  neighborhood: number | null;
  type: number | null;
  amenities: number[];
}


/* ---------- contexto ---------- */
interface Ctx {
  /* catálogos */
  amenitiesList: Amenity[];
  ownersList: Owner[];
  neighborhoodsList: Neighborhood[];
  typesList: Type[];
  maintenancesList: Maintenance[];
  commentsList: Comment[];

  operationsList: string[];

  /* picked genérico */
  pickedItem: Picked | null;
  pickItem: (type: Picked['type'], value: any) => void;
  currentCategory: Category | null;

  /* selección tradicional */
  selected: SelectedIds;
  setSelected: (n: SelectedIds) => void;
  toggleSelect: (id: number) => void;
  resetSelected: () => void;
  refreshMaintenances: () => Promise<void>;
  refreshComments: () => Promise<void>;

  /* data de categoría */
  data: any[] | null;
  categoryLoading: boolean;
  refresh: () => Promise<void>;

  /* helpers */
  refreshAllCatalogs: () => Promise<void>;
  refreshTypes: () => void;
  buildSearchParams: (n: Partial<SearchParams>) => Partial<SearchParams>;

  // propiedades / comparación 
  currentProperty: Property | null;
  loadProperty: (id: number) => Promise<void>;
  loadingProperty: boolean;
  errorProperty: string | null;

  comparisonItems: Property[];
  selectedPropertyIds: number[];
  toggleCompare: (id: number) => void;
  addToComparison: (property: Property) => void;
  clearComparison: () => void;
}

const Context = createContext<Ctx | null>(null);

/* ═════════ Provider ═════════ */
export function PropertyCrudProvider({ children }: { children: ReactNode }) {
  /* — catálogos — */
  const [amenitiesList, setAmenities] = useState<Amenity[]>([]);
  const [ownersList, setOwners] = useState<Owner[]>([]);
  const [neighborhoodsList, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [typesList, setTypes] = useState<Type[]>([]);
  const [maintenancesList, setMaintenances] = useState<Maintenance[]>([]);
  const [commentsList, setComments] = useState<Maintenance[]>([]);
  const [operationsList, setOperations] = useState<string[]>([]);

  /* — picked genérico — */
  const [pickedItem, setPickedItem] = useState<Picked | null>(null);
  const pickItem = (type: Picked['type'], value: any) =>
    setPickedItem({ type, value } as Picked);

  /* categoría derivada */
  const currentCategory =
    pickedItem?.type === 'category' ? pickedItem.value : null;

  /* — data de categoría actual — */
  const [data, setData] = useState<any[] | null>(null);
  const [categoryLoading, setCatLoading] = useState(false);

  const fetchers = {
    amenity: getAllAmenities,
    owner: getAllOwners,
    type: getAllTypes,
    neighborhood: getAllNeighborhoods,
    property: getAllProperties,
  } as const;

  /* — selección tradicional — */
  const [selected, setSelected] = useState<SelectedIds>({
    owner: null, neighborhood: null, type: null, amenities: []
  });
  const resetSelected = () =>
    setSelected({ owner: null, neighborhood: null, type: null, amenities: [] });

  const toggleSelect = (id: number) => {
    if (!currentCategory) return;
    if (currentCategory === 'amenity') {
      setSelected(prev => ({
        ...prev,
        amenities: prev.amenities.includes(id)
          ? prev.amenities.filter(x => x !== id)
          : [...prev.amenities, id],
      }));
    } else if (currentCategory === 'owner' ||
      currentCategory === 'type' ||
      currentCategory === 'neighborhood') {
      setSelected(prev => ({
        ...prev,
        [currentCategory]: prev[currentCategory] === id ? null : id
      }));
    }
  };

  /* — mantenimiento vinculado a propiedad — */
  const loadMaintenances = useCallback(async (propertyId: number) => {
    try { setMaintenances(await getMaintenanceByPropertyId(propertyId)); }
    catch { setMaintenances([]); }
  }, []);

  const loadComments = useCallback(async (propertyId: number) => {
    try { setComments(await getCommentsByPropertyId(propertyId)); }
    catch { setComments([]); }
  }, []);

  const refreshMaintenances = useCallback(async () => {
    if (pickedItem?.type === 'property' && pickedItem.value) {
      await loadMaintenances(pickedItem.value.id);
    }
  }, [pickedItem, loadMaintenances]);

  const refreshComments = useCallback(async () => {
    if (pickedItem?.type === 'property' && pickedItem.value) {
      await loadComments(pickedItem.value.id);
    }
  }, [pickedItem, loadComments]);

  useEffect(() => {
    if (pickedItem?.type === 'property' && pickedItem.value) {
      loadMaintenances(pickedItem.value.id);
    } else {
      setMaintenances([]);
    }
  }, [pickedItem, loadMaintenances]);

  useEffect(() => {
    if (pickedItem?.type === 'property' && pickedItem.value) {
      loadComments(pickedItem.value.id);
    } else {
      setComments([]);
    }
  }, [pickedItem, loadComments]);

  /* — refresco global — */
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

      const ops = Array.from(
        new Set((pr as Property[]).map((p: Property) => p.operation))
      ).filter((o): o is string => !!o);

      setOperations(ops);
    } catch (e) {
      console.error('refreshAllCatalogs', e);
    }
  }, []);


  const refresh = useCallback(async () => {
    if (!currentCategory || !(currentCategory in fetchers)) return;
    setCatLoading(true);
    try { setData(await fetchers[currentCategory]() as any[]); }
    finally { setCatLoading(false); }
  }, [currentCategory]);


  const refreshTypes = async () => {
    try { setTypes(await getAllTypes()); } catch { setTypes([]); }
  };

  /* — buildSearchParams — */
  const buildSearchParams = useCallback(
    (numeric: Partial<SearchParams>) => {
      const amNames = selected.amenities
        .map(id => amenitiesList.find(a => a.id === id)?.name)
        .filter((x): x is string => !!x);
      return { ...numeric, amenities: amNames };
    },
    [selected, amenitiesList]
  );

  // Property detail states
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [errorProperty, setErrorProperty] = useState<string | null>(null);

  // Comparison states
  const [comparisonItems, setComparisonItems] = useState<Property[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);

  const loadProperty = useCallback(async (id: number) => {
    setLoadingProperty(true);
    try { setCurrentProperty(await getPropertyById(id)); setErrorProperty(null); }
    catch { setErrorProperty('No se pudo cargar'); }
    finally { setLoadingProperty(false); }
  }, []);
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
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else if (prev.length < 3) {
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

  /* efectos init */
  useEffect(() => { refreshAllCatalogs(); }, [refreshAllCatalogs]);
  useEffect(() => { refresh(); }, [currentCategory, refresh]);

  /* provider */
  return (
    <Context.Provider value={{
      amenitiesList, ownersList, neighborhoodsList, typesList,
      maintenancesList, operationsList, commentsList,

      pickedItem, pickItem, currentCategory,

      selected, setSelected, toggleSelect, resetSelected,

      data, categoryLoading, refresh,
      refreshAllCatalogs, refreshTypes, buildSearchParams,
      refreshMaintenances, refreshComments,

      currentProperty, loadProperty, loadingProperty, errorProperty,
      comparisonItems, selectedPropertyIds,
      toggleCompare, addToComparison, clearComparison,
    }}>
      {children}
    </Context.Provider>
  );
}

/* hook */
export function usePropertyCrud() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('usePropertyCrud debe usarse dentro de PropertyCrudProvider');
  return ctx;
}
