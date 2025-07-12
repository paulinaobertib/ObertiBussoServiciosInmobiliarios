import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';

/* ─── servicios de catálogo ─── */
import { getAllAmenities } from '../services/amenity.service';
import { getAllOwners } from '../services/owner.service';
import { getAllNeighborhoods } from '../services/neighborhood.service';
import { getAllTypes } from '../services/type.service';
import { getAllProperties, getPropertyById } from '../services/property.service';
import { getMaintenancesByPropertyId } from '../services/maintenance.service';
import { getCommentsByPropertyId } from '../services/comment.service';

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
  /* listados de items */
  amenitiesList: Amenity[];
  ownersList: Owner[];
  neighborhoodsList: Neighborhood[];
  typesList: Type[];
  propertiesList: Property[];
  operationsList: string[];
  maintenancesList: Maintenance[];
  commentsList: Comment[];

  /* flags de carga */
  loading: boolean;

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
  refreshMaintenances: () => Promise<void>;
  refreshComments: () => Promise<void>;
  refreshOperations: () => void;

  /* data de categoría dinámica */
  data: any[] | null;
  buildSearchParams: (n: Partial<SearchParams>) => Partial<SearchParams>;

  /* detalle de propiedad */
  currentProperty: Property | null;
  loadProperty: (id: number) => Promise<void>;
  errorProperty: string | null;

  /* comparación */
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
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [operationsList, setOperationsList] = useState<string[]>([]);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [maintenancesList, setMaintenancesList] = useState<Maintenance[]>([]);

  /* — flags — */
  const [loading, setLoading] = useState(false);

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
      const arr = Array.isArray(list) ? list : [];
      setPropertiesList(arr);
      const ops = Array.from(new Set(arr.map(p => p.operation))).filter((o): o is string => !!o);
      setOperationsList(ops);
    } catch (e) {
      console.error('refreshProperties', e);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  /* — recalcular operaciones sin pegar al backend — */
  const refreshOperations = useCallback(() => {
    const ops = Array.from(new Set(propertiesList.map(p => p.operation))).filter((o): o is string => !!o);
    setOperationsList(ops);
  }, [propertiesList]);

  const refreshComments = useCallback(async () => {
    setLoading(true);
    try {
      if (pickedItem?.type === 'property' && pickedItem.value) {
        const list = await getCommentsByPropertyId(pickedItem.value.id);
        setCommentsList(Array.isArray(list) ? list : []);
      } else {
        setCommentsList([]);
      }
    } catch (e) {
      console.error('refreshComments', e);
    } finally {
      setLoading(false);
    }
  }, [pickedItem]);

  const refreshMaintenances = useCallback(async () => {
    setLoading(true);
    try {
      if (pickedItem?.type === 'property' && pickedItem.value) {
        const list = await getMaintenancesByPropertyId(pickedItem.value.id);
        setMaintenancesList(Array.isArray(list) ? list : []);
      } else {
        setMaintenancesList([]);
      }
    } catch (e) {
      console.error('refreshMaintenances', e);
    } finally {
      setLoading(false);
    }
  }, [pickedItem]);

  /* — inicializar catálogos al montar — */
  useEffect(() => {
    refreshAmenities();
    refreshNeighborhoods();
    refreshTypes();
    refreshProperties();
  }, []);

  /* — refrescos por categoría — */
  // const categoryRefreshers = useMemo(() => ({
  //   amenity: refreshAmenities,
  //   owner: refreshOwners,
  //   type: refreshTypes,
  //   neighborhood: refreshNeighborhoods,
  // }), [refreshAmenities, refreshOwners, refreshTypes, refreshNeighborhoods]);

  // useEffect(() => {
  //   if (!currentCategory) return;
  //   categoryRefreshers[currentCategory]?.();
  // }, [currentCategory, categoryRefreshers]);


  useEffect(() => {
    if (!currentCategory) return;
    switch (currentCategory) {
      case 'amenity': refreshAmenities(); break;
      case 'owner': refreshOwners(); break;
      case 'type': refreshTypes(); break;
      case 'neighborhood': refreshNeighborhoods(); break;
    }
  }, [currentCategory, refreshAmenities, refreshOwners, refreshTypes, refreshNeighborhoods]);

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

  /* — mantenimientos y comentarios por cambio de pickedItem — */
  useEffect(() => {
    refreshMaintenances();
    refreshComments();
  }, [pickedItem]);

  // ───────────────────────── detalle de propiedad
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

  // ───────────────────────── comparación (versión fetch por ID)
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);
  const [comparisonItems, setComparisonItems] = useState<Property[]>([]);

  // llena comparisonItems cada vez que cambia la lista de IDs
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
    [],
  );

  const addToComparison = (p: Property) =>
    setComparisonItems(prev => (prev.length < 2 ? [...prev, p] : prev));

  const clearComparison = () => {
    setComparisonItems([]);
    setSelectedPropertyIds([]);
  };

  const disabledCompare = useMemo(
    () => selectedPropertyIds.length < 2 || selectedPropertyIds.length > 3,
    [selectedPropertyIds],
  );

  return (
    <Context.Provider
      value={{
        amenitiesList,
        ownersList,
        neighborhoodsList,
        typesList,
        propertiesList,
        operationsList,

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
        refreshOperations,

        data,
        buildSearchParams,

        maintenancesList,
        commentsList,
        refreshMaintenances,
        refreshComments,

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
