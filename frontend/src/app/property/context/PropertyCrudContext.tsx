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
  pickCategory: (c: Category | null) => void;
  refresh: () => Promise<void>;
  selected: SelectedIds;
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
    setCategoryLoading(true);
    try {
      const res = await fetchers[category]();
      setData(res);
    } finally {
      setCategoryLoading(false);
    }
  }, [category]);

  const refreshTypes = async () => {
    const types = await getAllTypes();
    setAllTypes(types);
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
