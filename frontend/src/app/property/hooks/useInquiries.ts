import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInquiriesByUser,
  getAllInquiries,
  getInquiriesByProperty,
  updateInquiry,
} from "../services/inquiry.service";
import { getAllChatSessions } from "../../chat/services/chatSession.service";
import { getAllProperties } from "../services/property.service";
import { Inquiry, InquiryStatus } from "../types/inquiry";
import { useAuthContext } from "../../user/context/AuthContext";
import { buildRoute, ROUTES } from "../../../lib";
import { ChatSessionGetDTO } from "../../chat/types/chatSession";
import { useApiErrors } from "../../shared/hooks/useErrors";

export const STATUS_OPTIONS: InquiryStatus[] = ["ABIERTA", "CERRADA"];

interface UseInquiriesArgs {
  propertyIds?: number[];
}

export const useInquiries = ({ propertyIds }: UseInquiriesArgs = {}) => {
  const { info, isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const { handleError } = useApiErrors();

  // Datos "crudos" (sin filtrar)
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<{ id: number; title: string }[]>(
    []
  );
  const [chatSessions, setChatSessions] = useState<ChatSessionGetDTO[]>([]);

  // Loading SOLO para el bootstrap inicial / cambios reales de dataset
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Filtros (UI state) — NO disparan fetch
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "">("");
  const [filterProp, setFilterProp] = useState<string>("");

  // Otros estados que ya usabas
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [selectedProps] = useState<{ id: number; title: string }[]>([]);

  // ---------- Cargar catálogo de propiedades (una vez) ----------
  useEffect(() => {
    (async () => {
      try {
        const r = await getAllProperties();
        setProperties(r.map((p: { id: number; title: string }) => ({ id: p.id, title: p.title })));
      } catch (e) {
        handleError(e);
        setProperties([]);
      }
    })();
  }, []);

  // ---------- Cargar sesiones de chat (solo admin) ----------
  const loadChatSessions = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const sessions: ChatSessionGetDTO[] = await getAllChatSessions();
      const mapped = sessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        phone: s.phone,
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        date: s.date,
        dateClose: s.dateClose,
        propertyId: s.propertyId,
      }));
      setChatSessions(mapped);
    } catch (e) {
      handleError(e);
      setChatSessions([]);
    }
  }, [isAdmin, handleError]);

  useEffect(() => {
    // No seteamos loading acá — no queremos ocultar la UI por recargar chats
    loadChatSessions();
  }, [loadChatSessions]);

  // (Opcional) cerrar chat — refresca SOLO el listado de chats
  const closeChatSession = async (sessionId: number) => {
    setActionLoadingId(sessionId);
    try {
      await loadChatSessions();
    } catch (e) {
      handleError(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ---------- Cargar consultas ----------
  const loadAll = useCallback(async () => {
    if (!info?.id) return;
    setLoading(true);
    try {
      if (propertyIds?.length) {
        // Lista por propiedades específicas (ej. vista por propiedad)
        const all: Inquiry[] = [];
        for (const pid of propertyIds) {
          const res = await getInquiriesByProperty(pid);
          all.push(...res.data);
        }
        setInquiries(all);
        return;
      }

      // Admin ve todas, usuario ve las suyas
      const res = isAdmin
        ? await getAllInquiries()
        : await getInquiriesByUser(info.id);

      setInquiries(res.data);
    } catch (e) {
      handleError(e);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [info?.id, isAdmin, propertyIds, handleError]);

  // Bootstrap / recarga cuando cambian deps REALES
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------- Marcar consulta como resuelta (optimista) ----------
  const markResolved = async (inqId: number) => {
    setActionLoadingId(inqId);
    try {
      await updateInquiry(inqId);
      // Update local sin refrescar todo
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === inqId
            ? {
                ...i,
                status: "CERRADA",
                dateClose: new Date().toISOString(),
              }
            : i
        )
      );
    } catch (e) {
      handleError(e);
      // fallback: si preferís, podrías llamar loadAll() acá
    } finally {
      setActionLoadingId(null);
    }
  };

  // ---------- Navegar a propiedad ----------
  const goToProperty = (propId: number) =>
    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, propId));

  return {
    // datasets base (sin filtrar)
    inquiries,
    properties,
    chatSessions,

    // estados UI
    loading,              // ahora sólo durante el bootstrap/cambios de dataset
    actionLoadingId,
    selected,
    setSelected,
    selectedProps,

    // filtros (sólo UI; filtra la lista en el render, no en el hook)
    filterStatus,
    setFilterStatus,
    filterProp,
    setFilterProp,
    STATUS_OPTIONS,

    // acciones
    markResolved,
    goToProperty,
    closeChatSession,
  };
};
