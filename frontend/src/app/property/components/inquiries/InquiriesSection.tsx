import React, { useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { MixedList } from "./InquiriesList";
import { useInquiries, STATUS_OPTIONS } from "../../hooks/useInquiries";
import { InquiriesFilter } from "./InquiriesFilter";
import { InquiryStatus } from "../../types/inquiry";
import theme from "../../../../theme";
import { EmptyState } from "../../../shared/components/EmptyState";
import { useAuthContext } from "../../../user/context/AuthContext";

interface Props {
  propertyIds?: number[];
}
type ItemType = "" | "CONSULTAS" | "CHAT";

export const InquiriesSection: React.FC<Props> = ({ propertyIds }) => {
  const {
    inquiries,
    chatSessions,
    properties,
    loading,
    filterStatus,
    setFilterStatus,
    filterProp,
    setFilterProp,
    markResolved,
    actionLoadingId,
    closeChatSession,
  } = useInquiries({ propertyIds });

  const [filterType, setFilterType] = useState<ItemType>("");
  const { isAdmin } = useAuthContext();

  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];
  const safeChats = Array.isArray(chatSessions) ? chatSessions : [];

  const filteredCount = useMemo(() => {
    const titleToId = new Map<string, number>();
    properties.forEach((p) => titleToId.set(p.title, p.id));

    const includeInquiries = filterType !== "CHAT";
    const includeChats = filterType !== "CONSULTAS";

    const items = [
      ...(includeInquiries ? safeInquiries.map((inq) => ({ type: "inquiry" as const, data: inq })) : []),
      ...(includeChats ? safeChats.map((chat) => ({ type: "chat" as const, data: chat })) : []),
    ];

    const propId = filterProp === "" ? null : Number(filterProp);

    const matchesStatus = (item: { type: "inquiry" | "chat"; data: any }) => {
      if (!filterStatus) return true;
      const status = item.type === "inquiry" ? item.data.status : item.data.dateClose ? "CERRADA" : "ABIERTA";
      if (filterStatus === "ABIERTA" && item.type === "chat") return false;
      return status === filterStatus;
    };

    const matchesProperty = (item: { type: "inquiry" | "chat"; data: any }) => {
      if (propId == null) return true;
      if (item.type === "chat") return item.data.propertyId === propId;
      const titles: string[] = item.data.propertyTitles ?? [];
      return titles.some((t) => titleToId.get(t) === propId);
    };

    return items.filter((it) => matchesStatus(it) && matchesProperty(it)).length;
  }, [safeInquiries, safeChats, filterStatus, filterProp, properties, filterType]);

  const inquiriesForList = filterType === "CHAT" ? [] : safeInquiries;
  const chatsForList = filterType === "CONSULTAS" ? [] : safeChats;

  const hasContent = filteredCount > 0;
  const isChatFilter = filterType === "CHAT";
  const isInquiryFilter = filterType === "CONSULTAS";

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <>
      {/* -------- filtros -------- */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <InquiriesFilter
          statusOptions={STATUS_OPTIONS}
          propertyOptions={properties}
          selectedStatus={filterStatus}
          selectedProperty={filterProp ? Number(filterProp) : ""}
          onStatusChange={(status: string) => setFilterStatus(status as InquiryStatus)}
          onPropertyChange={(val) => setFilterProp(val ? val.toString() : "")}
          // NUEVO:
          selectedType={filterType}
          onTypeChange={setFilterType}
        />
      </Box>

      {/* -------- lista mixta -------- */}
      <Box sx={{ mt: 2, px: 2, flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {hasContent ? (
          <MixedList
            inquiries={inquiriesForList || []}
            chatSessions={chatsForList || []}
            loadingId={actionLoadingId}
            onResolve={markResolved}
            onCloseChat={closeChatSession}
            filterStatus={filterStatus}
            filterProp={filterProp ? Number(filterProp) : ""} // mismo criterio que usás para el Autocomplete
            properties={properties}
          />
        ) : (
          <Box sx={{ py: { xs: 2, sm: 3 }, flexGrow: 1 }}>
            <EmptyState
              title={(() => {
                if (isChatFilter) return isAdmin ? "No hay chats registrados." : "No hay chats disponibles.";
                if (isInquiryFilter) return isAdmin ? "No hay consultas registradas." : "No hay consultas disponibles.";
                return isAdmin ? "No hay consultas registradas." : "No hay consultas disponibles.";
              })()}
              description={(() => {
                if (isChatFilter)
                  return isAdmin
                    ? "Todavía no hay sesiones de chat vinculadas para administrar."
                    : "Cuando inicies una conversación la vas a ver en este listado.";
                if (isInquiryFilter)
                  return isAdmin
                    ? "Aún no ingresaron consultas. Revisa los filtros o espera nuevas novedades."
                    : "Cuando envíes una consulta vas a verla reflejada aquí.";
                return isAdmin
                  ? "Aún no hay actividad registrada. Ajusta los filtros o espera nuevas consultas."
                  : "Pronto verás aquí tus consultas y mensajes.";
              })()}
            />
          </Box>
        )}
      </Box>
    </>
  );
};
