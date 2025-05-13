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
import { getAllProperties } from '../services/property.service';

import { Amenity } from '../types/amenity';
import { Owner } from '../types/owner';
import { Neighborhood } from '../types/neighborhood';
import { Type } from '../types/type';

import { SearchParams } from '../types/searchParams';
import { CategoryKey } from '../utils/translate';

export type Category = CategoryKey;
// export type Category = 'amenity' | 'owner' | 'type' | 'neighborhood';

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

  selected: SelectedIds;
  setSelected: (next: SelectedIds) => void;
  setCategoryLoading: (v: boolean) => void;
  toggleSelect: (id: number) => void;

  setTypes: (types: any[]) => void;
  resetSelected: () => void;
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

      const ops = Array.from(new Set(pr.map((p: { operation: any; }) => p.operation))).filter(Boolean) as string[];
      setOperationsList(ops);

    } catch (e) {
      console.error('Error en refreshAllCatalogs:', e);
    }
  }, []);


  // Función para refrescar el catálogo dinámico según category
  const refresh = useCallback(async () => {
    if (!category) return;

    setData([]);                 // ← 1️⃣  limpia la vista al instante
    setCategoryLoading(true);    // ← 2️⃣  dispara el spinner

    try {
      const res = await fetchers[category]();
      setData(res);              // ← 3️⃣  rellena con la respuesta nueva
    } finally {
      setCategoryLoading(false);
    }
  }, [category]);

  const refreshTypes = async () => {
    setTypes([]);
    try {
      const res = await fetchers.type();
      setTypes(Array.isArray(res) ? res
        : Array.isArray(res?.content) ? res.content
          : Array.isArray(res?.data) ? res.data
            : []);                        // último fallback
    } catch {
      setTypes([]);
    }
  };

  const toggleSelect = (id: number) => {
    if (!category) return;

    setSelected((prev) => {
      if (category === 'amenity') {
        const list = prev.amenities.includes(id)
          ? prev.amenities.filter((n) => n !== id)
          : [...prev.amenities, id];
        return { ...prev, amenities: list };
      }
      const current = prev[category];
      return { ...prev, [category]: current === id ? null : id };
    });
  };

  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getAllTypes();
      setTypes(types);
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    refresh();
  }, [category, refresh]);

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

  return (
    <Context.Provider
      value={{
        category,
        data,
        categoryLoading,
        setCategoryLoading,
        pickCategory: setCategory,
        selected,
        setSelected,
        toggleSelect,
        refresh,

        setTypes,
        resetSelected,
        refreshTypes,
        operationsList,


        refreshAllCatalogs,
        buildSearchParams,
        amenitiesList,
        ownersList,
        neighborhoodsList,
        typesList,

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
