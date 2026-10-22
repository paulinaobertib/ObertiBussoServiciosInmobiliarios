import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { createReceipt, getReceiptPdf, previewReceipt, receiptFileName } from "../../services/receipt.service";
import { getAllContracts } from "../../services/contract.service";
import { getAllUsers } from "../../services/user.service";
import { getAllProperties } from "../../../property/services/property.service";
import {
  CONCEPT_LABEL,
  MONTHS,
  type Receipt,
  type ReceiptConcept,
  type ReceiptCreate,
  type ReceiptItem,
} from "../../types/receipt";
import { PaymentCurrency } from "../../types/payment";
import type { Contract } from "../../types/contract";
import { emptyReceipt, receiptFromContract, rememberIssuer } from "../../utils/receiptPrefill";
import { downloadBlob } from "../../../shared/utils/download";
import { formatAmount } from "../../../shared/utils/numberFormat";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import { extractApiError } from "../../../shared/utils/error";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (receipt: Receipt) => void;
  /** datos para arrancar (desde un contrato, un pago o "duplicar") */
  initial?: ReceiptCreate | null;
  /** si se abre desde un contrato no se muestra el buscador de contratos */
  lockContract?: boolean;
}

const QUICK_ITEMS = ["Rentas", "Municipalidad", "Expensas", "Luz", "Agua", "Gas", "Honorarios"];

type ContractOption = { contract: Contract; label: string };
type UserOption = { id: string; firstName: string; lastName: string; email: string };

export function ReceiptFormDialog({ open, onClose, onCreated, initial, lockContract }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { handleError } = useApiErrors();

  const [form, setForm] = useState<ReceiptCreate>(initial ?? emptyReceipt());
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const previewSeq = useRef(0);

  useEffect(() => {
    if (open) setForm(initial ?? emptyReceipt());
  }, [open, initial]);

  // contratos para autocompletar (con nombre de inquilino y propiedad)
  useEffect(() => {
    if (!open || lockContract || contractOptions.length) return;
    let alive = true;
    setContractsLoading(true);
    Promise.all([getAllContracts(), getAllUsers().catch(() => null), getAllProperties().catch(() => [])])
      .then(([contracts, usersResp, properties]) => {
        if (!alive) return;
        const users: any[] = (usersResp as any)?.data ?? usersResp ?? [];
        setUserOptions(users);
        const userName = (id: string) => {
          const u = users.find((x) => x.id === id);
          return u ? `${u.firstName} ${u.lastName}` : "Inquilino";
        };
        const propName = (id: number) => (properties as any[]).find((p) => p.id === id)?.title ?? `Propiedad ${id}`;
        setContractOptions(
          (contracts as Contract[])
            .slice()
            .sort((a, b) => (a.contractStatus === b.contractStatus ? b.id - a.id : a.contractStatus === "ACTIVO" ? -1 : 1))
            .map((c) => ({
              contract: c,
              label: `${userName(c.userId)} · ${propName(c.propertyId)}${c.contractStatus === "ACTIVO" ? "" : " (inactivo)"}`,
            }))
        );
      })
      .catch(() => alive && setContractOptions([]))
      .finally(() => alive && setContractsLoading(false));
    return () => {
      alive = false;
    };
  }, [open, lockContract, contractOptions.length]);

  const set = <K extends keyof ReceiptCreate>(key: K, value: ReceiptCreate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setItem = (index: number, patch: Partial<ReceiptItem>) =>
    setForm((prev) => ({ ...prev, items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));

  const addItem = (description = "") =>
    setForm((prev) => ({ ...prev, items: [...prev.items, { description, amount: 0 }] }));

  const removeItem = (index: number) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const total = useMemo(() => form.items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0), [form.items]);

  const problems = useMemo(() => {
    const p: string[] = [];
    if (!form.payerName.trim()) p.push("Completá quién paga.");
    if (!form.items.length) p.push("Agregá al menos un concepto.");
    if (form.items.some((i) => !i.description.trim())) p.push("Hay conceptos sin descripción.");
    if (total <= 0) p.push("El total tiene que ser mayor a cero.");
    return p;
  }, [form, total]);

  const payload = useCallback(
    (): ReceiptCreate => ({
      ...form,
      payerName: form.payerName.trim(),
      payerDni: form.payerDni?.trim() || null,
      ownerName: form.ownerName?.trim() || null,
      propertyAddress: form.propertyAddress?.trim() || null,
      notes: form.notes?.trim() || null,
      items: form.items.map((i) => ({ description: i.description.trim(), amount: Number(i.amount) || 0 })),
    }),
    [form]
  );

  // vista previa: se regenera sola un rato después del último cambio
  const refreshPreview = useCallback(async () => {
    if (problems.length) return;
    const seq = ++previewSeq.current;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const blob = await previewReceipt(payload());
      if (seq !== previewSeq.current) return;
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
    } catch (e) {
      if (seq === previewSeq.current) setPreviewError(extractApiError(e));
    } finally {
      if (seq === previewSeq.current) setPreviewLoading(false);
    }
  }, [payload, problems.length]);

  useEffect(() => {
    if (!open || fullScreen) return;
    const t = setTimeout(refreshPreview, 900);
    return () => clearTimeout(t);
  }, [open, fullScreen, refreshPreview]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const pickContract = async (opt: ContractOption | null) => {
    if (!opt) {
      setForm((prev) => ({ ...prev, contractId: null, userId: null }));
      return;
    }
    setPrefilling(true);
    try {
      const prefilled = await receiptFromContract(opt.contract);
      setForm((prev) => ({ ...prefilled, issuer: prev.issuer, kind: prev.kind }));
    } catch (e) {
      handleError(e);
    } finally {
      setPrefilling(false);
    }
  };

  const submit = async () => {
    if (problems.length) return;
    setSaving(true);
    try {
      const created = await createReceipt(payload());
      rememberIssuer(created.issuer);
      const pdf = await getReceiptPdf(created.id);
      downloadBlob(pdf, receiptFileName(created));
      onCreated?.(created);
      onClose();
    } catch (e) {
      handleError(e);
    } finally {
      setSaving(false);
    }
  };

  const isLiquidacion = form.kind === "LIQUIDACION";
  const currencySymbol = form.currency === PaymentCurrency.USD ? "U$S" : "$";
  const selectedContract = contractOptions.find((o) => o.contract.id === form.contractId) ?? null;

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => reason !== "backdropClick" && onClose()}
      fullScreen={fullScreen}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, height: fullScreen ? "100%" : "92vh" } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main", fontWeight: 700 }}>
        <ReceiptLongIcon />
        {isLiquidacion ? "Nueva liquidación" : "Nuevo recibo"}
        <IconButton onClick={onClose} sx={{ ml: "auto", color: "primary.main" }} aria-label="cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: "flex", overflow: "hidden" }}>
        {/* ---------------- formulario ---------------- */}
        <Box sx={{ flex: fullScreen ? 1 : "0 0 560px", overflowY: "auto", p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Emite
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                color="primary"
                value={form.issuer}
                onChange={(_, v) => v && set("issuer", v)}
              >
                <ToggleButton value="CORREDOR">Luis María Oberti</ToggleButton>
                <ToggleButton value="INMOBILIARIA">Oberti Busso Inmobiliaria</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="overline" color="text.secondary">
                Tipo de comprobante
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                color={isLiquidacion ? "warning" : "primary"}
                value={form.kind}
                onChange={(_, v) => v && set("kind", v)}
              >
                <ToggleButton value="RECIBO">Recibo de pago</ToggleButton>
                <ToggleButton value="LIQUIDACION">Liquidación · no válida como recibo</ToggleButton>
              </ToggleButtonGroup>
              {isLiquidacion && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: "block" }}>
                  Sirve para avisar cuánto hay que pagar. Lleva la leyenda “NO VÁLIDO COMO RECIBO DE PAGO” y no lleva firma.
                </Typography>
              )}
            </Box>

            {!lockContract && (
              <Autocomplete
                options={contractOptions}
                loading={contractsLoading || prefilling}
                value={selectedContract}
                onChange={(_, v) => pickContract(v)}
                isOptionEqualToValue={(a, b) => a.contract.id === b.contract.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Completar desde un contrato (opcional)"
                    helperText="Trae inquilino, propietario, dirección y monto. Si no está en el sistema, completalo a mano."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {contractsLoading || prefilling ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Concepto"
                  value={form.concept}
                  onChange={(e) => set("concept", e.target.value as ReceiptConcept)}
                >
                  {Object.entries(CONCEPT_LABEL).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  label="Fecha"
                  InputLabelProps={{ shrink: true }}
                  value={form.issueDate}
                  onChange={(e) => set("issueDate", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 7, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Mes del período"
                  value={form.periodMonth ?? ""}
                  onChange={(e) => set("periodMonth", e.target.value === "" ? null : Number(e.target.value))}
                >
                  <MenuItem value="">Sin período</MenuItem>
                  {MONTHS.map((m, i) => (
                    <MenuItem key={m} value={i + 1}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 5, sm: 3 }}>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  label="Año"
                  disabled={form.periodMonth == null}
                  value={form.periodYear ?? ""}
                  onChange={(e) => set("periodYear", e.target.value === "" ? null : Number(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Moneda"
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value as PaymentCurrency)}
                >
                  <MenuItem value={PaymentCurrency.ARS}>Pesos</MenuItem>
                  <MenuItem value={PaymentCurrency.USD}>Dólares</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                {isLiquidacion ? "Destinatario" : form.issuer === "INMOBILIARIA" ? "Recibimos de" : "Recibí de"}
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Nombre y apellido"
                  value={form.payerName}
                  onChange={(e) => set("payerName", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="DNI (opcional)"
                  value={form.payerDni ?? ""}
                  onChange={(e) => set("payerDni", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Inmueble"
                  placeholder="9 de Julio 3.225 – Depto. 3 – 1° Piso, Córdoba"
                  value={form.propertyAddress ?? ""}
                  onChange={(e) => set("propertyAddress", e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Por cuenta y orden de (propietario, opcional)"
                  value={form.ownerName ?? ""}
                  onChange={(e) => set("ownerName", e.target.value)}
                />
              </Grid>
            </Grid>

            {!lockContract && !form.contractId && (
              <Autocomplete
                options={userOptions}
                value={userOptions.find((u) => u.id === form.userId) ?? null}
                onChange={(_, u) => set("userId", u?.id ?? null)}
                getOptionLabel={(u) => `${u.firstName} ${u.lastName} · ${u.email}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Lo ve en su portal (opcional)"
                    helperText="Elegí el usuario si querés que pueda ver y descargar este recibo cuando entra a la web."
                  />
                )}
              />
            )}

            <Divider textAlign="left">
              <Typography variant="caption" color="text.secondary">
                Conceptos
              </Typography>
            </Divider>

            <Stack spacing={1.5}>
              {form.items.map((it, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Descripción"
                    value={it.description}
                    onChange={(e) => setItem(i, { description: e.target.value })}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Importe"
                    sx={{ width: 170, flexShrink: 0 }}
                    value={it.amount === 0 ? "" : it.amount}
                    onChange={(e) => setItem(i, { amount: e.target.value === "" ? 0 : Number(e.target.value) })}
                    InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                  />
                  <Tooltip title="Quitar">
                    <span>
                      <IconButton onClick={() => removeItem(i)} disabled={form.items.length === 1} sx={{ mt: 0.5 }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              ))}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                <Button size="small" startIcon={<AddIcon />} onClick={() => addItem()}>
                  Agregar concepto
                </Button>
                {QUICK_ITEMS.map((q) => (
                  <Chip key={q} label={q} size="small" variant="outlined" onClick={() => addItem(q)} />
                ))}
              </Box>
            </Stack>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: isLiquidacion ? "warning.main" : "primary.main",
                color: "common.white",
                borderRadius: 2,
                px: 2,
                py: 1.5,
              }}
            >
              <Typography fontWeight={800} letterSpacing={1.5} fontSize={13}>
                {isLiquidacion ? "TOTAL A PAGAR" : "TOTAL RECIBIDO"}
              </Typography>
              <Typography fontWeight={800} fontSize={22}>
                {currencySymbol} {formatAmount(total)}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Observaciones (opcional)"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />

            {problems.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {problems.join(" ")}
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", pb: 1 }}>
              {fullScreen && (
                <Button
                  variant="outlined"
                  disabled={problems.length > 0}
                  onClick={async () => {
                    try {
                      const blob = await previewReceipt(payload());
                      window.open(URL.createObjectURL(blob), "_blank", "noopener");
                    } catch (e) {
                      handleError(e);
                    }
                  }}
                >
                  Vista previa
                </Button>
              )}
              <LoadingButton variant="contained" loading={saving} disabled={problems.length > 0} onClick={submit}>
                {isLiquidacion ? "Emitir liquidación y descargar" : "Emitir recibo y descargar"}
              </LoadingButton>
            </Box>
          </Stack>
        </Box>

        {/* ---------------- vista previa ---------------- */}
        {!fullScreen && (
          <Box sx={{ flex: 1, bgcolor: "#ECECEC", position: "relative", borderLeft: 1, borderColor: "divider" }}>
            <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, display: "flex", gap: 1, alignItems: "center" }}>
              {previewLoading && <CircularProgress size={18} />}
              <Tooltip title="Actualizar vista previa">
                <span>
                  <IconButton size="small" onClick={refreshPreview} disabled={problems.length > 0} sx={{ bgcolor: "white" }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            {previewUrl && !previewError ? (
              <iframe
                title="Vista previa del recibo"
                src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            ) : (
              <Box sx={{ height: "100%", display: "grid", placeItems: "center", p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  {previewError ?? (problems.length ? problems[0] : "Generando vista previa…")}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
