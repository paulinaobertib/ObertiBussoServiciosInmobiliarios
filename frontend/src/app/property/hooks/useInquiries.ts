import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInquiriesByUser,
  getAllInquiries,
  getInquiriesByStatus,
  getInquiriesByProperty,
  updateInquiry,
} from "../services/inquiry.service";
import { getAllChatSessions } from "../../chat/services/chatSession.service";
import { getAllProperties } from "../services/property.service";
import { Inquiry, InquiryStatus } from "../types/inquiry";
import { useAuthContext } from "../../user/context/AuthContext";
import { buildRoute, ROUTES } from "../../../lib";
import { ChatSession } from "../../chat/types/chatSession"; // <-- Asegurate que este tipo existe

export const STATUS_OPTIONS: InquiryStatus[] = ["ABIERTA", "CERRADA"];

interface UseInquiriesArgs {
  propertyIds?: number[];
}

export const useInquiries = ({ propertyIds }: UseInquiriesArgs = {}) => {
  const { info, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<{ id: number; title: string }[]>(
    []
  );
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]); // <-- ahora bien tipado

  const [loading, setLoading] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "">("");
  const [filterProp, setFilterProp] = useState<string>("");

  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [selectedProps, setSelectedProps] = useState<
    { id: number; title: string }[]
  >([]);

  // Traer propiedades para Autocomplete
  useEffect(() => {
    getAllProperties()
      .then((r) =>
        setProperties(
          r.map((p: { id: any; title: any }) => ({ id: p.id, title: p.title }))
        )
      )
      .catch(() => setProperties([]));
  }, []);

  // Traer sesiones de chat solo para admin (ahora mapeado correctamente)
  const loadChatSessions = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const sessions: ChatSession[] = await getAllChatSessions();
      // Mapeá cada sesión para cumplir el tipo ChatSession (si hace falta)
      const mapped: ChatSession[] = sessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        phone: s.phone,
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        date: s.date,
        dateClose: s.dateClose,
        derived: s.derived,
        property: s.property,
      }));
      setChatSessions(mapped);
    } catch {
      setChatSessions([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  // Función para cerrar chat
  const closeChatSession = async (sessionId: number) => {
    setActionLoadingId(sessionId);
    try {
      await loadChatSessions(); // refresca la lista
    } catch {
      // podrías setear error si querés
    } finally {
      setActionLoadingId(null);
    }
  };

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
    chatSessions, // Ahora es tipo ChatSession[]
    closeChatSession, // Ya está lista para pasar a tu MixedList
  };
};
