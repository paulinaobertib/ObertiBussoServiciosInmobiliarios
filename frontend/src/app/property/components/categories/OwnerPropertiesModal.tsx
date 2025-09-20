// OwnerPropertiesModal.tsx
import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Typography, Card } from "@mui/material";
import { Modal } from "../../../shared/components/Modal"; // <-- ajustar
import { EmptyState } from "../../../shared/components/EmptyState"; // <-- ajustar
import type { Owner } from "../../types/owner"; // <-- ajustar
import type { Property } from "../../types/property"; // <-- ajustar
import { useApiErrors } from "../../../shared/hooks/useErrors"; // <-- ajustar
import { getPropertiesByOwner } from "../../services/owner.service"; // <-- ajustar

type Props = {
  open: boolean;
  onClose: () => void;
  owner: Owner | null;
};

// Altura aproximada por card y límite antes del scroll
const CARD_HEIGHT = 50; // título + subtítulo compacto
const MAX_VISIBLE = 5;

export const OwnerPropertiesModal = ({ open, onClose, owner }: Props) => {
  const [loading, setLoading] = useState(false);
  const [propsRaw, setPropsRaw] = useState<Property[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const { handleError } = useApiErrors();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!open || !owner) return;
      setLoading(true);
      setErr(null);
      try {
        const list = await getPropertiesByOwner(Number(owner.id));
        if (mounted) setPropsRaw(Array.isArray(list) ? list : []);
      } catch (e) {
        if (mounted) {
          setErr("No se pudieron cargar las propiedades.");
          handleError(e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, owner, handleError]);

  const title = owner ? `Propiedades de ${owner.firstName} ${owner.lastName}` : "Propiedades del propietario";

  const items = useMemo(() => {
    const fmtPrice = (val: any, cur: any) => {
      if (val == null || val === "") return "-";
      try {
        return new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: (cur as string) || "ARS",
          maximumFractionDigits: 0,
        }).format(Number(val));
      } catch {
        return `${cur ?? ""} ${val}`;
      }
    };

    return (propsRaw ?? []).map((r) => {
      const id = Number(r.id);
      const title = r.title ? String(r.title) : `Propiedad #${id}`;
      const neighborhoodName = r?.neighborhood?.name ?? "-";
      const neighborhoodCity = (r as any)?.neighborhood?.city ?? "";
      const currency = (r as any)?.currency ?? "ARS";
      const price = fmtPrice((r as any)?.price, currency);

      return {
        id,
        title,
        price,
        subtitle: [neighborhoodName, neighborhoodCity].filter(Boolean).join(" · "),
      };
    });
  }, [propsRaw]);

  const listMaxH = CARD_HEIGHT * MAX_VISIBLE;

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="md">
      <Box>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && !err && items.length === 0 && <EmptyState title="No hay propiedades asociadas" />}

        {!loading && !err && items.length > 0 && (
          <Box sx={{ maxHeight: listMaxH, overflowY: "auto" }}>
            {items.map((it) => (
              <Card
                key={it.id}
                elevation={0} // <- sin sombra
                sx={{
                  mb: 0.5,
                  px: 1.25,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: "none", // <- sin sombra (extra por si el theme fuerza algo)
                }}
              >
                {/* Fila 1: Título ——— Precio (centrado verticalmente) */}
                <Box
                  title={`${it.title} — ${it.price}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto auto",
                    alignItems: "center", // <- centra verticalmente todos los children
                    columnGap: 8,
                    minHeight: 40,
                  }}
                >
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, minWidth: 0 }}>
                    {it.title}
                  </Typography>

                  <Box
                    aria-hidden
                    sx={{
                      borderBottom: "1px dotted",
                      borderColor: "divider",
                      height: 0,
                      opacity: 0.7,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: 0.2,
                      whiteSpace: "nowrap",
                      display: "flex", // <- asegura centrado vertical propio
                      alignItems: "center", // <- centrado vertical del precio
                      justifyContent: "flex-end",
                    }}
                  >
                    {it.price}
                  </Typography>
                </Box>

                {/* Fila 2: Barrio · Ciudad */}
                <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.25 }} title={it.subtitle}>
                  {it.subtitle}
                </Typography>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
};
