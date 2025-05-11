// src/app/property/context/PropertiesContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { getAllAmenities } from '../services/amenity.service';
import { getAllOwners } from '../services/owner.service';
import { getAllNeighborhoods } from '../services/neighborhood.service';
import { getAllTypes } from '../services/type.service';
import { getAllProperties } from '../services/property.service';

import { Amenity } from '../types/amenity';
import { Owner } from '../types/owner';
import { Neighborhood } from '../types/neighborhood';
import { Type } from '../types/type';

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
  // CRUD dinámico
  category: Category | null;
  data: any[] | null;
  categoryLoading: boolean;
  pickCategory: (c: Category | null) => void;
  refresh: () => Promise<void>;
  setCategoryLoading: (v: boolean) => void;

  // Selecciones
  selected: SelectedIds;
  setSelected: (v: SelectedIds) => void;
  toggleSelect: (id: number) => void;
  resetSelected: () => void;

  // Listados completos
  amenitiesList: Amenity[];
  ownersList: Owner[];
  neighborhoodsList: Neighborhood[];
  typesList: Type[];
  operationsList: string[];
  refreshAllCatalogs: () => Promise<void>;

  // Para el CRUD de propiedades
  allTypes: Type[];
  setAllTypes: (t: Type[]) => void;
  refreshTypes: () => void;
  // Construcción de parámetros de búsqueda
  buildSearchParams: (numeric: Partial<SearchParams>) => Partial<SearchParams>;
}

const Context = createContext<Ctx | null>(null);

export function PropertyCrudProvider({ children }: { children: ReactNode }) {
  // Estado CRUD genérico
  const [category, setCategory] = useState<Category | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Catálogos en memoria
  const [amenitiesList, setAmenities] = useState<Amenity[]>([]);
  const [ownersList, setOwners] = useState<Owner[]>([]);
  const [neighborhoodsList, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [typesList, setTypes] = useState<Type[]>([]);
  const [allTypes, setAllTypes] = useState<Type[]>([]);
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

  // Fetchers para CRUD dinámico
  const fetchers = {
    amenity: getAllAmenities,
    owner: getAllOwners,
    type: getAllTypes,
    neighborhood: getAllNeighborhoods,
  } as const;

  // Carga inicial: catálogos + operaciones únicas
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
      setAllTypes(tp);
      const ops = Array.from(new Set(pr.map((p: { operation: any; }) => p.operation))).filter(Boolean) as string[];
      setOperationsList(ops);
    } catch (e) {
      console.error('Error en refreshAllCatalogs:', e);
    }
  }, []);
  // Función para refrescar el catálogo dinámico según category
  const refresh = useCallback(async () => {
    if (!category) return;
    setCategoryLoading(true);
    setData([]);
    try {
      const res = await fetchers[category]();
      setData(res);
    } finally {
      setCategoryLoading(false);
    }
  }, [category]);

  // Dispara refresh cuando cambia categoría
  useEffect(() => {
    refresh();
  }, [category, refresh]);

  // Solo para Create/Edit
  const refreshTypes = async () => {
    setAllTypes([]);
    try {
      const t = await getAllTypes();
      setAllTypes(Array.isArray(t) ? t : []);
    } catch {
      setAllTypes([]);
    }
  };

  // Toggle select en los CRUD dinámicos
  const toggleSelect = (id: number) => {
    if (!category) return;
    setSelected(prev => {
      if (category === 'amenity') {
        const hit = prev.amenities.includes(id);
        return {
          ...prev,
          amenities: hit
            ? prev.amenities.filter(a => a !== id)
            : [...prev.amenities, id],
        };
      }
      const current = prev[category];
      return { ...prev, [category]: current === id ? null : id };
    });
  };

  // Construye SearchParams combinando inputs numéricos + selecciones
  const buildSearchParams = useCallback(
    (numeric: Partial<SearchParams>): Partial<SearchParams> => {
      const amNames = selected.amenities
        .map(id => amenitiesList.find(a => a.id === id)?.name)
        .filter((x): x is string => !!x);

      return {
        // Numéricos y texto directos
        priceFrom: numeric.priceFrom ?? 0,
        priceTo: numeric.priceTo ?? 0,
        areaFrom: numeric.areaFrom ?? 0,
        areaTo: numeric.areaTo ?? 0,
        rooms: numeric.rooms ?? 0,
        operation: numeric.operation ?? '',
        type: numeric.type ?? '',
        city: numeric.city ?? '',
        neighborhood: numeric.neighborhood ?? '',
        neighborhoodType: numeric.neighborhoodType ?? '',
        amenities: amNames,
      };
    },
    [selected, neighborhoodsList, amenitiesList]
  );

  // Memoizar valor de contexto
  const value = useMemo<Ctx>(
    () => ({
      category,
      data,
      categoryLoading,
      pickCategory: setCategory,
      refresh,
      setCategoryLoading,

      selected,
      setSelected,
      toggleSelect,
      resetSelected,

      amenitiesList,
      ownersList,
      neighborhoodsList,
      typesList,
      operationsList,
      refreshAllCatalogs,

      allTypes,
      setAllTypes,
      refreshTypes,

      buildSearchParams,
    }),
    [
      category,
      data,
      categoryLoading,
      selected,
      amenitiesList,
      ownersList,
      neighborhoodsList,
      typesList,
      operationsList,
      allTypes,
      buildSearchParams,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePropertyCrud() {
  const ctx = useContext(Context);
  if (!ctx)
    throw new Error(
      'usePropertyCrud debe usarse dentro de PropertyCrudProvider'
    );
  return ctx;
}
