import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInquiriesByUser,
  getAllInquiries,
  getInquiriesByStatus,
  getInquiriesByProperty,
  updateInquiry,
} from "../services/inquiry.service";
import { getAllChatSessions } from "../../chat/services/chatSession.service"; // Asegúrate de importar correctamente
import { getAllProperties } from "../services/property.service";
import { Inquiry, InquiryStatus } from "../types/inquiry";
import { useAuthContext } from "../../user/context/AuthContext";
import { buildRoute, ROUTES } from "../../../lib";
import { ChatSessionDTO } from "../../chat/types/chatSession";

export const STATUS_OPTIONS: InquiryStatus[] = ["ABIERTA", "CERRADA"];

interface UseInquiriesArgs {
  propertyIds?: number[];
}

export const useInquiries = ({ propertyIds }: UseInquiriesArgs = {}) => {
  const { info, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  // Datos
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<{ id: number; title: string }[]>(
    []
  );
  const [chatSessions, setChatSessions] = useState<ChatSessionDTO[]>([]);

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

  // Llamada a las sesiones de chat solo para admins
  const loadChatSessions = useCallback(async () => {
    if (isAdmin && chatSessions.length === 0) {
      // Verifica que no se hayan cargado previamente
      try {
        const sessions = await getAllChatSessions();
        setChatSessions(sessions); // Guardar las sesiones de chat
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
      }
    }
  }, [isAdmin, chatSessions.length]); // Dependencia para evitar múltiples ejecuciones

  useEffect(() => {
    loadChatSessions(); // Llamar a las sesiones de chat solo cuando sea necesario
  }, [loadChatSessions]);

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

  // Filtrado local para usuarios no administradores
  useEffect(() => {
    if (!isAdmin) {
      const filteredInquiries = inquiries.filter((inq) => {
        const matchesStatus = filterStatus ? inq.status === filterStatus : true;
        const matchesProperty = filterProp
          ? inq.propertyTitles?.includes(filterProp)
          : true;
        return matchesStatus && matchesProperty;
      });

      // Actualiza las consultas filtradas solo si hay un cambio
      if (filteredInquiries.length !== inquiries.length) {
        setInquiries(filteredInquiries);
      }
    }
  }, [isAdmin, filterStatus, filterProp, inquiries]);

  // Marcar consulta como resuelta
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

  // Navegar a detalle de propiedad
  const goToProperty = (propId: number) =>
    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, propId));

  // Efecto principal de carga (lista, filtros, por propiedad)
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

  // Sincroniza selected.propertyTitles con selectedProps (detalles)
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

  // Return ordenado y explícito
  return {
    inquiries,
    properties,
    loading,
    errorList,
    selected,
    setSelected,
    selectedProps,
    filterStatus,
    setFilterStatus,
    filterProp,
    setFilterProp,
    STATUS_OPTIONS,
    markResolved,
    actionLoadingId,
    goToProperty,
    chatSessions, // Ahora puedes acceder a las sesiones de chat
  };
};
