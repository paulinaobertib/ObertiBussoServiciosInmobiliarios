import { useEffect, useRef, useState, useCallback } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Box, Button, Typography, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import type { Guarantor } from "../../types/guarantor";
import { getGuarantorsByContract, deleteGuarantor } from "../../services/guarantor.service";

type Props = {
  open: boolean;
  contractId?: number | null; // <-- AHORA por contrato
  onClose: () => void;
  onPick: (g: Guarantor) => void;
};

export default function SelectGuarantorDialog({ open, contractId, onClose, onPick }: Props) {
  const fetchedRef = useRef(false); // evita re-fetch en la misma apertura
  const lastContractRef = useRef<number | string | null>(null);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Guarantor[]>([]);
  const [error, setError] = useState<string | null>(null);

  // si tenés un modal hijo (confirmación), no cierres el padre
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Guarantor | null>(null);

  const safeClose = useCallback(() => {
    if (confirmOpen) return; // no cierres si el hijo está abierto
    onClose();
  }, [confirmOpen, onClose]);

  const fetchOnce = useCallback(async () => {
    if (!open) return;

    // Si ya fetcheamos para este contrato, no repitas
    if (fetchedRef.current && lastContractRef.current === (contractId ?? null)) return;

    // Si no hay contractId, no intentes fetch
    if (contractId == null) {
      fetchedRef.current = true;
      lastContractRef.current = contractId ?? null;
      setItems([]);
      setError(null);
      return;
    }

    fetchedRef.current = true;
    lastContractRef.current = contractId ?? null;

    setLoading(true);
    setError(null);
    try {
      const res = await getGuarantorsByContract(contractId);
      setItems(res ?? []); // si no hay, queda []
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar garantes del contrato");
      setItems([]); // importante: no reintentar en loop
    } finally {
      setLoading(false);
    }
  }, [open, contractId]);

  // fetchea una sola vez por apertura/contrato
  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  // al cerrar, reseteá el guard para la próxima apertura
  useEffect(() => {
    if (!open) {
      fetchedRef.current = false;
      setConfirmOpen(false);
      setToDelete(null);
    }
  }, [open]);

  // si cambia el contrato mientras está abierto, permití un fetch nuevo
  useEffect(() => {
    if (open && lastContractRef.current !== (contractId ?? null)) {
      fetchedRef.current = false;
      // fetchOnce se disparará por el efecto anterior
    }
  }, [contractId, open]);

  const handleAskDelete = (g: Guarantor) => {
    setToDelete(g);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteGuarantor(toDelete.id!);
      setItems((arr) => arr.filter((x) => x.id !== toDelete.id));
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  return (
    <Modal open={open} title="Seleccionar garante" onClose={safeClose}>
      <Box sx={{ minWidth: 420 }}>
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} /> <Typography>Cargando…</Typography>
          </Box>
        )}

        {!loading && error && <Typography color="error">{error}</Typography>}

        {!loading && !error && items.length === 0 && (
          <Typography color="text.secondary">Este contrato no tiene garantes.</Typography>
        )}

        {!loading && !error && items.length > 0 && (
          <List dense>
            {items.map((g) => (
              <ListItem
                key={g.id}
                secondaryAction={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => onPick(g)}>
                      Seleccionar
                    </Button>
                    <Button size="small" color="error" onClick={() => handleAskDelete(g)}>
                      Eliminar
                    </Button>
                  </Box>
                }
              >
                <ListItemText primary={g.name} secondary={g.email} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Modal hijo de confirmación */}
      <Modal open={confirmOpen} title="Confirmar eliminación" onClose={() => setConfirmOpen(false)}>
        <Typography sx={{ mb: 2 }}>
          ¿Eliminar definitivamente a <strong>{toDelete?.name}</strong>?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </Box>
      </Modal>
    </Modal>
  );
}
