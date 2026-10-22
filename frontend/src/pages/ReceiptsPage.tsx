import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import ReplyIcon from "@mui/icons-material/Reply";
import SearchIcon from "@mui/icons-material/Search";
import BasePage from "./BasePage";
import { Modal } from "../app/shared/components/Modal";
import { ReceiptsList } from "../app/user/components/receipts/ReceiptsList";
import { ReceiptFormDialog } from "../app/user/components/receipts/ReceiptFormDialog";
import { annulReceipt, searchReceipts } from "../app/user/services/receipt.service";
import type { Receipt, ReceiptCreate, ReceiptFilters } from "../app/user/types/receipt";
import { nextMonthCopy, receiptToCreate } from "../app/user/utils/receiptPrefill";
import { useApiErrors } from "../app/shared/hooks/useErrors";
import { useGlobalAlert } from "../app/shared/context/AlertContext";

export default function ReceiptsPage() {
  const navigate = useNavigate();
  const { handleError } = useApiErrors();
  const { showAlert } = useGlobalAlert();

  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [query, setQuery] = useState("");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<ReceiptCreate | null>(null);

  const [annulling, setAnnulling] = useState<Receipt | null>(null);
  const [annulReason, setAnnulReason] = useState("");
  const [annulSaving, setAnnulSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReceipts(await searchReceipts({ ...filters, q: query }));
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [filters, query, handleError]);

  // la búsqueda por texto espera a que se deje de tipear
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (key: keyof ReceiptFilters) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const openNew = () => {
    setFormInitial(null);
    setFormOpen(true);
  };

  const duplicate = (r: Receipt) => {
    setFormInitial(nextMonthCopy(receiptToCreate(r)));
    setFormOpen(true);
  };

  const confirmAnnul = async () => {
    if (!annulling) return;
    setAnnulSaving(true);
    try {
      await annulReceipt(annulling.id, annulReason);
      showAlert(`El comprobante ${annulling.number} quedó anulado.`, "success");
      setAnnulling(null);
      setAnnulReason("");
      await load();
    } catch (e) {
      handleError(e);
    } finally {
      setAnnulSaving(false);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 3000, display: { xs: "none", sm: "inline-flex" } }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage maxWidth={false}>
        <Container sx={{ py: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Recibos y liquidaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los recibos se numeran solos. Para corregir uno, anulalo y emití otro.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
              Nuevo recibo
            </Button>
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre, número, dirección o propietario"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField select fullWidth size="small" label="Emite" value={filters.issuer ?? ""} onChange={setFilter("issuer")}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="CORREDOR">Luis Oberti</MenuItem>
                <MenuItem value="INMOBILIARIA">Inmobiliaria</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField select fullWidth size="small" label="Tipo" value={filters.kind ?? ""} onChange={setFilter("kind")}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="RECIBO">Recibos</MenuItem>
                <MenuItem value="LIQUIDACION">Liquidaciones</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                type="date"
                fullWidth
                size="small"
                label="Desde"
                InputLabelProps={{ shrink: true }}
                value={filters.from ?? ""}
                onChange={setFilter("from")}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                type="date"
                fullWidth
                size="small"
                label="Hasta"
                InputLabelProps={{ shrink: true }}
                value={filters.to ?? ""}
                onChange={setFilter("to")}
              />
            </Grid>
          </Grid>

          {loading && !receipts.length ? (
            <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <ReceiptsList
              receipts={receipts}
              onDuplicate={duplicate}
              onAnnul={(r) => setAnnulling(r)}
              emptyTitle="No hay recibos con esos filtros."
            />
          )}
        </Container>
      </BasePage>

      <ReceiptFormDialog
        open={formOpen}
        initial={formInitial}
        onClose={() => setFormOpen(false)}
        onCreated={(r) => {
          showAlert(`Se emitió el ${r.kind === "RECIBO" ? "recibo" : "comprobante"} ${r.number}.`, "success");
          load();
        }}
      />

      <Modal open={Boolean(annulling)} title={`Anular ${annulling?.number ?? ""}`} onClose={() => setAnnulling(null)}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          El comprobante queda guardado con la marca “ANULADO” y su número no se vuelve a usar. El inquilino deja de verlo en su
          portal.
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="Motivo (opcional)"
          value={annulReason}
          onChange={(e) => setAnnulReason(e.target.value)}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          <Button onClick={() => setAnnulling(null)}>Cancelar</Button>
          <LoadingButton color="error" variant="contained" loading={annulSaving} onClick={confirmAnnul}>
            Anular
          </LoadingButton>
        </Box>
      </Modal>
    </>
  );
}
