import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo, useRef } from "react";
import { getAllAmenities } from "../services/amenity.service";
import { getAllOwners } from "../services/owner.service";
import { getAllNeighborhoods } from "../services/neighborhood.service";
import { getAllTypes } from "../services/type.service";
import { getAllProperties, getAvailableProperties, getPropertyById } from "../services/property.service";

import { Amenity } from "../types/amenity";
import { Owner } from "../types/owner";
import { Neighborhood } from "../types/neighborhood";
import { Type } from "../types/type";
import { Property } from "../types/property";
import { SearchParams } from "../types/searchParams";

export type Category = "amenity" | "owner" | "type" | "neighborhood";
export type Picked = { type: "category"; value: Category | null } | { type: "property"; value: Property | null };

interface SelectedIds {
  owner: number | null;
  neighborhood: number | null;
  type: number | null;
  amenities: number[];
  address: {
    street: string;
    number: string;
    latitude: number | null;
    longitude: number | null;
  };
}

interface Ctx {
  amenitiesList: Amenity[];
  ownersList: Owner[];
  neighborhoodsList: Neighborhood[];
  typesList: Type[];
  propertiesList: Property[] | null;
  propertiesLoading: boolean;
  setPropertiesLoading: (loading: boolean) => void;
  pickItem: (type: Picked["type"], value: any) => void;
  selected: SelectedIds;
  setSelected: (n: SelectedIds) => void;
  toggleSelect: (category: Category, id: number) => void;
  setAddress: (address: SelectedIds["address"]) => void;
  resetSelected: () => void;
  refreshAmenities: () => Promise<void>;
  refreshOwners: () => Promise<void>;
  refreshNeighborhoods: () => Promise<void>;
  refreshTypes: () => Promise<void>;
  refreshProperties: (mode?: "all" | "available") => Promise<void>;
  buildSearchParams: (n: Partial<SearchParams>) => Partial<SearchParams>;
  currentProperty: Property | null;
  loadProperty: (id: number) => Promise<void>;
  comparisonItems: Property[];
  comparisonLoading: boolean;
  selectedPropertyIds: number[];
  toggleCompare: (id: number) => void;
  clearComparison: () => void;
  disabledCompare: boolean;
  seedSelectionsFromProperty: (p: Property | null) => void; //Items seleccionados
}

const Context = createContext<Ctx | null>(null);

export function PropertyCrudProvider({ children }: { children: ReactNode }) {
  // Listados de items
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [ownersList, setOwnersList] = useState<Owner[]>([]);
  const [neighborhoodsList, setNeighborhoodsList] = useState<Neighborhood[]>([]);
  const [typesList, setTypesList] = useState<Type[]>([]);
  const [propertiesList, setPropertiesList] = useState<Property[] | null>(null);
  const [propertiesLoading, setPropertiesLoading] = useState<boolean>(true);

  // Picked item
  const pickedItem = useRef<Picked | null>(null);
  const pickItem = useCallback((type: Picked["type"], value: any) => {
    pickedItem.current = { type, value } as Picked; // no re-render
  }, []);

  // Refrescos
  const refreshAmenities = useCallback(async () => {
    const list = await getAllAmenities();
    setAmenitiesList(Array.isArray(list) ? list : []);
  }, []);

  const refreshOwners = useCallback(async () => {
    const list = await getAllOwners();
    setOwnersList(Array.isArray(list) ? list : []);
  }, []);

  const refreshNeighborhoods = useCallback(async () => {
    const list = await getAllNeighborhoods();
    setNeighborhoodsList(Array.isArray(list) ? list : []);
  }, []);

  const refreshTypes = useCallback(async () => {
    const list = await getAllTypes();
    setTypesList(Array.isArray(list) ? list : []);
  }, []);

  const refreshProperties = useCallback(async (mode: "all" | "available" = "all") => {
    setPropertiesLoading(true);
    try {
      const fetcher = mode === "available" ? getAvailableProperties : getAllProperties;
      const list = await fetcher();
      setPropertiesList(Array.isArray(list) ? list : []);
    } finally {
      setPropertiesLoading(false);
    }
  }, []);

  // Selección de items
  const [selected, setSelected] = useState<SelectedIds>({
    owner: null,
    neighborhood: null,
    type: null,
    amenities: [],
    address: {
      street: "",
      number: "",
      latitude: null,
      longitude: null,
    },
  });

  const resetSelected = useCallback(
    () =>
      setSelected({
        owner: null,
        neighborhood: null,
        type: null,
        amenities: [],
        address: {
          street: "",
          number: "",
          latitude: null,
          longitude: null,
        },
      }),
    []
  );

  const toggleSelect = (category: Category, id: number) => {
    if (category === "amenity") {
      setSelected((prev) => ({
        ...prev,
        amenities: prev.amenities.includes(id) ? prev.amenities.filter((x) => x !== id) : [...prev.amenities, id],
      }));
    } else if (category === "neighborhood") {
      // Al cambiar de barrio, resetear la dirección
      setSelected((prev) => ({
        ...prev,
        neighborhood: prev.neighborhood === id ? null : id,
        address: {
          street: "",
          number: "",
          latitude: null,
          longitude: null,
        },
      }));
    } else {
      setSelected((prev) => ({
        ...prev,
        [category]: prev[category] === id ? null : id,
      }));
    }
  };

  const setAddress = useCallback((address: SelectedIds["address"]) => {
    setSelected((prev) => ({ ...prev, address }));
  }, []);

  //Items seleccionados
  const seedSelectionsFromProperty = useCallback((p: Property | null) => {
    if (!p) {
      // limpia selección
      setSelected({
        owner: null,
        neighborhood: null,
        type: null,
        amenities: [],
        address: {
          street: "",
          number: "",
          latitude: null,
          longitude: null,
        },
      });
      return;
    }
    setSelected({
      owner: p.owner?.id ?? null,
      neighborhood: p.neighborhood?.id ?? null,
      type: p.type?.id ?? null,
      amenities: Array.isArray(p.amenities) ? p.amenities.map((a) => a.id) : [],
      address: {
        street: p.street ?? "",
        number: p.number ?? "",
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
      },
    });
  }, []);

  const buildSearchParams = useCallback(
    (numeric: Partial<SearchParams>) => {
      const amNames = selected.amenities
        .map((id) => amenitiesList.find((a) => a.id === id)?.name)
        .filter((x): x is string => !!x);
      return { ...numeric, amenities: amNames };
    },
    [selected, amenitiesList]
  );

  // Detalle de propiedad (si todavía lo usás)
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);

  const loadProperty = useCallback(async (id: number) => {
    setCurrentProperty(await getPropertyById(id));
  }, []);

  // Comparación
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);
  const [comparisonItems, setComparisonItems] = useState<Property[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    if (selectedPropertyIds.length === 0) {
      setComparisonItems([]);
      setComparisonLoading(false);
      return;
    }
    (async () => {
      setComparisonLoading(true);
      const items: Property[] = [];
      for (const id of selectedPropertyIds) {
        try {
          items.push(await getPropertyById(id));
        } catch (err) {
          console.error(`No se pudo cargar la propiedad ${id}`, err);
        }
      }
      setComparisonItems(items);
      setComparisonLoading(false);
    })();
  }, [selectedPropertyIds]);

  const toggleCompare = useCallback(
    (id: number) =>
      setSelectedPropertyIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : [...prev.slice(1), id]
      ),
    []
  );

  const clearComparison = () => {
    setComparisonItems([]);
    setSelectedPropertyIds([]);
    setComparisonLoading(false);
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
        propertiesLoading,
        setPropertiesLoading,
        pickItem,
        selected,
        setSelected,
        toggleSelect,
        setAddress,
        resetSelected,
        refreshAmenities,
        refreshOwners,
        refreshNeighborhoods,
        refreshTypes,
        refreshProperties,
        buildSearchParams,
        currentProperty,
        loadProperty,
        comparisonItems,
        comparisonLoading,
        selectedPropertyIds,
        toggleCompare,
        clearComparison,
        disabledCompare,
        seedSelectionsFromProperty, //Items seleccionados
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePropertiesContext() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("usePropertiesContext debe usarse dentro de PropertyCrudProvider");
  return ctx;
}
