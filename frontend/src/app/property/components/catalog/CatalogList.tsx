import { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../user/context/AuthContext";
import { PropertyCard } from "./PropertyCard";
import type { Property } from "../../types/property";
import { EmptyState } from "../../../shared/components/EmptyState";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { hasWaitingPromptBeenDismissed, promptWaitingProperty } from "../../utils/waitingPropertyPrompt";

interface Props {
  properties: Property[];
  selectionMode?: boolean;
  toggleSelection?: (id: number) => void;
  isSelected?: (id: number) => boolean;
  onCardClick?: (property: Property) => void;
  isLoading?: boolean;
}

export const CatalogList = ({
  properties = [],
  selectionMode = false,
  toggleSelection = () => {},
  isSelected = () => false,
  onCardClick = () => {},
  isLoading = false,
}: Props) => {
  const { isAdmin } = useAuthContext();
  const alertApi: any = useGlobalAlert();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(() => Boolean(isLoading) || properties.length === 0);

  const safeProperties = Array.isArray(properties) ? properties : [];

  // 1) Filtrado según permisos
  const filtered = useMemo(
    () =>
      isAdmin ? safeProperties : safeProperties.filter((p) => p.status?.toLowerCase() === "disponible" || !p.status),
    [safeProperties, isAdmin]
  );

  // 2) Ordenar: primero outstanding por fecha, luego el resto por fecha
  const sorted = useMemo(() => {
    const byDateDesc = (a: Property, b: Property) => new Date(b.date).getTime() - new Date(a.date).getTime();
    const outstandingProps = filtered.filter((p) => p.outstanding).sort(byDateDesc);
    const normalProps = filtered.filter((p) => !p.outstanding).sort(byDateDesc);
    return [...outstandingProps, ...normalProps];
  }, [filtered]);

  // 3) Aviso de propiedades en ESPERA (solo admin). Se muestra una vez por propiedad (localStorage).
  const promptingRef = useRef(false);
  useEffect(() => {
    if (!isAdmin) return;
    if (promptingRef.current) return;

    const waiting = filtered.filter((p) => String(p?.status ?? "").toUpperCase() === "ESPERA") as Property[];

    if (!waiting.length) return;

    const candidate = waiting.find((p) => !hasWaitingPromptBeenDismissed(Number(p.id)));
    if (!candidate) return;

    promptingRef.current = true;

    (async () => {
      try {
        await promptWaitingProperty({
          property: candidate,
          alertApi,
          onRenewContract: () => navigate("/contracts/new"),
          onViewProperty: () => {
            navigate(`/properties/${candidate.id}`);
          },
        });
      } finally {
        // dejamos que vuelva a chequear por si aparece otra en ESPERA más adelante
        promptingRef.current = false;
      }
    })();
  }, [isAdmin, filtered, alertApi, navigate]);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }
    // delay toggling off until we actually received properties (avoid flicker when still empty)
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (properties.length > 0) {
      setLoading(false);
    }
  }, [properties]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          p: 3,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  // 4) Mensaje si no hay nada
  if (sorted.length === 0) {
    return (
      <EmptyState
        title={isAdmin ? "No hay propiedades cargadas." : "No hay propiedades disponibles."}
        minHeight={220}
      />
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 0, sm: 2 },
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        },
        gap: 4,
      }}
    >
      {sorted.map((prop) => (
        <PropertyCard
          key={prop.id}
          property={prop}
          selectionMode={selectionMode}
          toggleSelection={toggleSelection}
          isSelected={isSelected}
          onClick={() => onCardClick(prop)}
        />
      ))}
    </Box>
  );
};
