import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { getAllAmenities } from '../services/amenity.service';
import { getAllOwners } from '../services/owner.service';
import { getAllNeighborhoods } from '../services/neighborhood.service';
import { getAllTypes } from '../services/type.service';

export type Category = 'amenity' | 'owner' | 'type' | 'neighborhood';

interface State {
  category: Category | null;
  data: any[] | null;
  categoryLoading: boolean;
}

interface SelectedIds {
  owner: number | null;
  neighborhood: number | null;
  type: number | null;
  amenities: number[];
}

interface Ctx extends State {
  pickCategory: (c: Category | null) => void; // Toma la categoria seleccionada
  refresh: () => Promise<void>; // Refresca, actualiza datos
  selected: SelectedIds; // Combinacion de los id seleccionadso
  setSelected: (next: SelectedIds) => void;
  setCategoryLoading: (v: boolean) => void;
  toggleSelect: (id: number) => void;
  allTypes: any[];
  setAllTypes: (types: any[]) => void;
  resetSelected: () => void;
  refreshTypes: () => void;
}

const Context = createContext<Ctx | null>(null);

export function PropertyCrudProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [allTypes, setAllTypes] = useState<any[]>([]);

  const [selected, setSelected] = useState<SelectedIds>({
    owner: null,
    neighborhood: null,
    type: null,
    amenities: [],
  });

  const resetSelected = () => {
    setSelected({
      owner: null,
      neighborhood: null,
      type: null,
      amenities: [],
    });
  };

  const fetchers = {
    amenity: getAllAmenities,
    owner: getAllOwners,
    type: getAllTypes,
    neighborhood: getAllNeighborhoods,
  } as const;

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
    setAllTypes([]);          // limpia
    try {
      const res = await fetchers.type();
      setAllTypes(Array.isArray(res) ? res
        : Array.isArray(res?.content) ? res.content
          : Array.isArray(res?.data) ? res.data
            : []);                        // último fallback
    } catch {
      setAllTypes([]);
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
      setAllTypes(types);
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    refresh();
  }, [category, refresh]);

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
        allTypes,
        setAllTypes,
        resetSelected,
        refreshTypes
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

