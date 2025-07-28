import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInquiriesByUser,
  getAllInquiries,
  getInquiriesByStatus,
  getInquiriesByProperty,
  updateInquiry,
} from "../services/inquiry.service";
import { getAllProperties } from "../services/property.service";
import { Inquiry, InquiryStatus } from "../types/inquiry";
import { useAuthContext } from "../../user/context/AuthContext";
import { buildRoute, ROUTES } from "../../../lib";

export const STATUS_OPTIONS: InquiryStatus[] = ["ABIERTA", "CERRADA"];

interface UseInquiriesArgs {
  propertyIds?: number[];
}

export const useInquiries = ({ propertyIds }: UseInquiriesArgs = {}) => {
  // ────── Contextos y navegación ──────
  const { info, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  // Datos
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<{ id: number; title: string }[]>(
    []
  );

  // Estado UI
  const [loading, setLoading] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "">("");
  const [filterProp, setFilterProp] = useState<string>("");

  // Selección/detalle
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [selectedProps, setSelectedProps] = useState<
    { id: number; title: string }[]
  >([]);

  // ────── Fetch de propiedades para Autocomplete ──────
  useEffect(() => {
    getAllProperties()
      .then((r) =>
        setProperties(
          r.map((p: { id: any; title: any }) => ({ id: p.id, title: p.title }))
        )
      )
      .catch(() => setProperties([]));
  }, []);

  // Trae todas las consultas según usuario o admin
  const loadAll = useCallback(async () => {
    if (!info?.id) return;
    setLoading(true);
    try {
      const res = isAdmin
        ? await getAllInquiries()
        : await getInquiriesByUser(info.id);
      setInquiries(res.data);
      setErrorList(null);
    } catch {
      setErrorList("Error al cargar consultas");
    } finally {
      setLoading(false);
    }
  }, [info?.id, isAdmin]);

  // Aplica los filtros de estado y propiedad
  const loadFiltered = useCallback(async () => {
    setLoading(true);
    try {
      const pid = filterProp ? parseInt(filterProp, 10) : undefined;
      let data: Inquiry[] = [];

      if (filterStatus && pid) {
        data = (await getInquiriesByProperty(pid)).data.filter(
          (i: { status: string }) => i.status === filterStatus
        );
      } else if (filterStatus) {
        data = (await getInquiriesByStatus(filterStatus)).data;
      } else if (pid) {
        data = (await getInquiriesByProperty(pid)).data;
      } else {
        await loadAll();
        return;
      }

      setInquiries(data);
      setErrorList(null);
    } catch {
      setErrorList("Error al aplicar filtros");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterProp, loadAll]);

  // ────── Marcar consulta como resuelta ──────
  const markResolved = async (inqId: number) => {
    setActionLoadingId(inqId);
    try {
      await updateInquiry(inqId);
      // Recarga lista según contexto actual
      if (isAdmin && (filterStatus || filterProp)) {
        await loadFiltered();
      } else {
        await loadAll();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // ────── Navegación a detalle de propiedad ──────
  const goToProperty = (propId: number) =>
    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, propId));

  // ────── Efecto principal de carga (lista, filtros, por propiedad) ──────
  useEffect(() => {
    if (propertyIds?.length) {
      (async () => {
        setLoading(true);
        try {
          const all: Inquiry[] = [];
          for (const pid of propertyIds) {
            const res = await getInquiriesByProperty(pid);
            all.push(...res.data);
          }
          setInquiries(all);
          setErrorList(null);
        } catch {
          setErrorList("Error al cargar consultas");
        } finally {
          setLoading(false);
        }
      })();
    } else if (isAdmin && (filterStatus || filterProp)) {
      loadFiltered();
    } else {
      loadAll();
    }
  }, [propertyIds, isAdmin, filterStatus, filterProp, loadAll, loadFiltered]);

  // ────── Sincroniza selected.propertyTitles con selectedProps (detalles) ──────
  useEffect(() => {
    if (!selected) {
      setSelectedProps([]);
      return;
    }
    const mapped = (selected.propertyTitles ?? [])
      .map((t) => properties.find((p) => p.title === t))
      .filter((p): p is { id: number; title: string } => Boolean(p));
    setSelectedProps(mapped);
  }, [selected, properties]);

  // ────── Return ordenado y explícito ──────
  return {
    // Lista y estado principal
    inquiries,
    properties,
    loading,
    errorList,

    // Selección/detalle
    selected,
    setSelected,
    selectedProps,

    // Filtros
    filterStatus,
    setFilterStatus,
    filterProp,
    setFilterProp,
    STATUS_OPTIONS,

    // Acciones
    markResolved,
    actionLoadingId,
    goToProperty,
  };
};
