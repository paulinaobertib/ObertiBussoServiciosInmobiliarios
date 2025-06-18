// src/context/PropertyCrudProvider.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAsync } from '../hooks/useAsync';

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
export type Picked =
  | { type: 'category'; value: Category | null }
  | { type: 'property'; value: Property | null }
  | { type: 'maintenance'; value: Maintenance | null }
  | { type: 'comment'; value: Comment | null };

interface SelectedIds {
  owner: number | null;
  neighborhood: number | null;
  type: number | null;
  amenities: number[];
}

interface Ctx {
  /* catálogos y flags */
  amenitiesList: Amenity[];
  ownersList: Owner[];
  neighborhoodsList: Neighborhood[];
  typesList: Type[];
  propertiesList: Property[];
  operationsList: string[];
  maintenancesList: Maintenance[];
  commentsList: Comment[];

  amenitiesLoading: boolean;
  ownersLoading: boolean;
  neighborhoodsLoading: boolean;
  typesLoading: boolean;
  propertiesLoading: boolean;
  maintenancesLoading: boolean;
  commentsLoading: boolean;

  /* picked genérico */
  pickedItem: Picked | null;
  pickItem: (type: Picked['type'], value: any) => void;
  currentCategory: Category | null;

  /* selección tradicional */
  selected: SelectedIds;
  setSelected: (n: SelectedIds) => void;
  toggleSelect: (id: number) => void;
  resetSelected: () => void;

  /* refrescos de catálogos */
  refreshAmenities: () => Promise<void>;
  refreshOwners: () => Promise<void>;
  refreshNeighborhoods: () => Promise<void>;
  refreshTypes: () => Promise<void>;
  refreshProperties: () => Promise<void>;
  refreshOperations: () => void;
  refreshMaintenances: () => Promise<void>;
  refreshComments: () => Promise<void>;

  /* data de categoría dinámica */
  data: any[] | null;
  categoryLoading: boolean;
  refresh: () => Promise<void>;
  buildSearchParams: (n: Partial<SearchParams>) => Partial<SearchParams>;

  /* detalle de propiedad */
  currentProperty: Property | null;
  loadProperty: (id: number) => Promise<void>;
  loadingProperty: boolean;
  errorProperty: string | null;

  /* comparación */
  comparisonItems: Property[];
  selectedPropertyIds: number[];
  toggleCompare: (id: number) => void;
  addToComparison: (property: Property) => void;
  clearComparison: () => void;
}

const Context = createContext<Ctx | null>(null);

export function PropertyCrudProvider({ children }: { children: ReactNode }) {
  /* — catálogos — */
  const [amenitiesList, setAmenities] = useState<Amenity[]>([]);
  const [ownersList, setOwnersList] = useState<Owner[]>([]);
  const [neighborhoodsList, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [typesList, setTypes] = useState<Type[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [operationsList, setOperations] = useState<string[]>([]);

  /* — useAsync para cada catálogo + flags — */
  const { execute: refreshAmenities, loading: amenitiesLoading } = useAsync(
    () => getAllAmenities(),
    list => setAmenities(Array.isArray(list) ? list : []),
    e => console.error('refreshAmenities', e)
  );
  const { execute: refreshOwners, loading: ownersLoading } = useAsync(
    () => getAllOwners(),
    list => setOwnersList(Array.isArray(list) ? list : []),
    e => console.error('refreshOwners', e)
  );
  const { execute: refreshNeighborhoods, loading: neighborhoodsLoading } = useAsync(
    () => getAllNeighborhoods(),
    list => setNeighborhoods(Array.isArray(list) ? list : []),
    e => console.error('refreshNeighborhoods', e)
  );
  const { execute: refreshTypes, loading: typesLoading } = useAsync(
    () => getAllTypes(),
    list => setTypes(Array.isArray(list) ? list : []),
    e => console.error('refreshTypes', e)
  );
  const { execute: refreshProperties, loading: propertiesLoading } = useAsync(
    () => getAllProperties(),
    raw => {
      const list = Array.isArray(raw) ? raw : [];
      setPropertiesList(list);
      // recalcular operaciones
      const ops = Array.from(new Set(list.map(p => p.operation)))
        .filter((o): o is string => !!o);
      setOperations(ops);
    },
    e => console.error('refreshProperties', e)
  );

  /* — refrescar sólo operaciones sin llamar al backend — */
  const refreshOperations = useCallback(() => {
    const ops = Array.from(new Set(propertiesList.map(p => p.operation)))
      .filter((o): o is string => !!o);
    setOperations(ops);
  }, [propertiesList]);

  /* — inicializar catálogos al montar — */
  useEffect(() => {
    refreshAmenities();
    refreshOwners();
    refreshNeighborhoods();
    refreshTypes();
    refreshProperties();
  }, []);

  /* — picked genérico y categoría dinámica — */
  const [pickedItem, setPickedItem] = useState<Picked | null>(null);
  const pickItem = (type: Picked['type'], value: any) =>
    setPickedItem({ type, value } as Picked);
  const currentCategory =
    pickedItem?.type === 'category' ? pickedItem.value : null;

  const [data, setData] = useState<any[] | null>(null);
  const [categoryLoading, setCatLoading] = useState(false);
  const fetchers = {
    amenity: getAllAmenities,
    owner: getAllOwners,
    type: getAllTypes,
    neighborhood: getAllNeighborhoods,
    property: getAllProperties,
  } as const;

  const refresh = useCallback(async () => {
    if (!currentCategory) return;
    setCatLoading(true);
    try {
      const items = (await fetchers[currentCategory]()) as any[];
      setData(items);
      switch (currentCategory) {
        case 'amenity':
          setAmenities(items as Amenity[]);
          break;
        case 'owner':
          setOwnersList(items as Owner[]);
          break;
        case 'type':
          setTypes(items as Type[]);
          break;
        case 'neighborhood':
          setNeighborhoods(items as Neighborhood[]);
          break;
      }
    } catch (e) {
      console.error(`Error al refrescar ${currentCategory}`, e);
    } finally {
      setCatLoading(false);
    }
  }, [currentCategory]);

  /* — selección tradicional y buildSearchParams — */
  const [selected, setSelected] = useState<SelectedIds>({
    owner: null,
    neighborhood: null,
    type: null,
    amenities: [],
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
    } else {
      setSelected(prev => ({
        ...prev,
        [currentCategory]: prev[currentCategory] === id ? null : id,
      }));
    }
  };
  const buildSearchParams = useCallback(
    (numeric: Partial<SearchParams>) => {
      const amNames = selected.amenities
        .map(id => amenitiesList.find(a => a.id === id)?.name)
        .filter((x): x is string => !!x);
      return { ...numeric, amenities: amNames };
    },
    [selected, amenitiesList]
  );

  /* — mantenimientos y comentarios — */
  const [maintenancesList, setMaintenances] = useState<Maintenance[]>([]);
  const [commentsList, setComments] = useState<Comment[]>([]);

  const loadMaintenances = useCallback(
    (id: number) => getMaintenanceByPropertyId(id),
    []
  );
  const { execute: refreshMaintenances, loading: maintenancesLoading } = useAsync(
    () =>
      pickedItem?.type === 'property' && pickedItem.value
        ? loadMaintenances(pickedItem.value.id)
        : Promise.resolve([]),
    list => setMaintenances(list as Maintenance[]),
    e => console.error('refreshMaintenances', e)
  );

  const loadComments = useCallback(
    (id: number) => getCommentsByPropertyId(id),
    []
  );
  const { execute: refreshComments, loading: commentsLoading } = useAsync(
    () =>
      pickedItem?.type === 'property' && pickedItem.value
        ? loadComments(pickedItem.value.id)
        : Promise.resolve([]),
    list => setComments(list as Comment[]),
    e => console.error('refreshComments', e)
  );

  useEffect(() => {
    refreshMaintenances();
    refreshComments();
  }, [pickedItem]);

  /* — detalle de propiedad — */
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [errorProperty, setErrorProperty] = useState<string | null>(null);

  const loadProperty = useCallback(async (id: number) => {
    setLoadingProperty(true);
    try {
      setCurrentProperty(await getPropertyById(id));
      setErrorProperty(null);
    } catch {
      setErrorProperty('No se pudo cargar');
    } finally {
      setLoadingProperty(false);
    }
  }, []);

  /* — comparación de propiedades — */
  const [comparisonItems, setComparisonItems] = useState<Property[]>([]);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);
  useEffect(() => {
    (async () => {
      const items: Property[] = [];
      for (const id of selectedPropertyIds) {
        try {
          items.push(await getPropertyById(id));
        } catch { }
      }
      setComparisonItems(items);
    })();
  }, [selectedPropertyIds]);

  const toggleCompare = (id: number) =>
    setSelectedPropertyIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : [...prev.slice(1), id]
    );
  const addToComparison = (p: Property) =>
    setComparisonItems(prev => (prev.length < 2 ? [...prev, p] : prev));
  const clearComparison = () => {
    setComparisonItems([]);
    setSelectedPropertyIds([]);
  };

  /* — efecto por cambio de categoría — */
  useEffect(() => {
    refresh();
  }, [currentCategory, refresh]);

  return (
    <Context.Provider
      value={{
        amenitiesList,
        ownersList,
        neighborhoodsList,
        typesList,
        propertiesList,
        operationsList,

        amenitiesLoading,
        ownersLoading,
        neighborhoodsLoading,
        typesLoading,
        propertiesLoading,

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
        refreshOperations,

        data,
        categoryLoading,
        refresh,
        buildSearchParams,

        maintenancesList,
        commentsList,
        refreshMaintenances,
        refreshComments,
        maintenancesLoading,
        commentsLoading,

        currentProperty,
        loadProperty,
        loadingProperty,
        errorProperty,

        comparisonItems,
        selectedPropertyIds,
        toggleCompare,
        addToComparison,
        clearComparison,
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
