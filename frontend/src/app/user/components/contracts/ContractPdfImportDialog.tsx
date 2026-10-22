import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import dayjs from "dayjs";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { extractContractFromPdf } from "../../services/contractPdf.service";
import { getAllUsers, postUser } from "../../services/user.service";
import { getAllGuarantors, postGuarantor } from "../../services/guarantor.service";
import { getAllIncreaseIndexes, postIncreaseIndex } from "../../services/increaseIndex.service";
import { getAllProperties } from "../../../property/services/property.service";
import type { ContractExtraction, ContractExtraField, ExtractedPerson } from "../../types/contractPdf";
import type { User } from "../../types/user";
import type { Guarantor } from "../../types/guarantor";
import type { IncreaseIndex } from "../../types/increaseIndex";
import { findIndex, findProperty, findUser, splitFullName } from "../../utils/contractPdfMatch";
import { buildContractPrefill, derivedExtraFields, type ContractPrefill } from "../../utils/contractPdfPrefill";
import { formatCurrencyAmount } from "../../../shared/utils/numberFormat";
import { extractApiError } from "../../../shared/utils/error";
import { useApiErrors } from "../../../shared/hooks/useErrors";

export interface ContractPdfImportResult {
  file: File;
  propertyId: number | null;
  userId: string | null;
  guarantorIds: number[];
  prefill: ContractPrefill;
  extraFields: ContractExtraField[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (result: ContractPdfImportResult) => void;
}

type PropertyOption = { id: number; title: string; street?: string; number?: string; operation?: string };

type GuarantorRow = {
  person: ExtractedPerson;
  matchId: number | null;
  link: boolean;
  phone: string;
  email: string;
};

const TYPE_LABEL: Record<string, string> = { VIVIENDA: "Vivienda", COMERCIAL: "Comercial", TEMPORAL: "Temporal" };

function Row({ label, value }: { label: string; value: React.ReactNode | null | undefined }) {
  const missing = value === null || value === undefined || value === "";
  return (
    <Box sx={{ display: "flex", gap: 1, py: 0.75, borderBottom: "1px solid", borderColor: "divider", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 170, flexShrink: 0 }}>
        {label}
      </Typography>
      {missing ? (
        <Chip size="small" color="warning" variant="outlined" icon={<ErrorOutlineIcon />} label="No figura en el contrato" />
      ) : (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

export function ContractPdfImportDialog({ open, onClose, onApply }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { handleError } = useApiErrors();

  const [file, setFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [data, setData] = useState<ContractExtraction | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [indexes, setIndexes] = useState<IncreaseIndex[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [indexId, setIndexId] = useState<number | null>(null);
  const [guarantorRows, setGuarantorRows] = useState<GuarantorRow[]>([]);
  const [extraFields, setExtraFields] = useState<ContractExtraField[]>([]);

  const [newUser, setNewUser] = useState<{ firstName: string; lastName: string; email: string; phone: string } | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingIndex, setCreatingIndex] = useState(false);
  const [applying, setApplying] = useState(false);

  const reset = () => {
    setFile(null);
    setData(null);
    setReadError(null);
    setReading(false);
    setUserId(null);
    setPropertyId(null);
    setIndexId(null);
    setGuarantorRows([]);
    setExtraFields([]);
    setNewUser(null);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const read = async (f: File) => {
    setFile(f);
    setReadError(null);
    setReading(true);
    try {
      // lo que ya está cargado, para encontrar inquilino, propiedad, índice y garantes
      const [extraction, usersResp, props, idx, guars] = await Promise.all([
        extractContractFromPdf(f),
        getAllUsers().catch(() => null),
        getAllProperties().catch(() => []),
        getAllIncreaseIndexes().catch(() => []),
        getAllGuarantors().catch(() => []),
      ]);
      const userList: User[] = (usersResp as any)?.data ?? usersResp ?? [];
      const guarantorList: Guarantor[] = (guars as any)?.data ?? guars ?? [];
      setUsers(userList);
      setProperties(props as PropertyOption[]);
      setIndexes(idx);
      setData(extraction);

      setUserId(findUser(userList, extraction.tenant)?.id ?? null);
      setPropertyId(findProperty(props as PropertyOption[], extraction.property?.address)?.id ?? null);
      setIndexId(findIndex(idx, extraction.adjustmentIndex)?.id ?? null);
      setGuarantorRows(
        extraction.guarantors.map((g) => {
          const match = guarantorList.find(
            (x) => findUser([{ id: String(x.id), firstName: x.name, lastName: "", email: x.email }], g) != null
          );
          return { person: g, matchId: match?.id ?? null, link: true, phone: g.phone ?? "", email: g.email ?? "" };
        })
      );
      setExtraFields(extraction.extraFields);
      if (!findUser(userList, extraction.tenant) && extraction.tenant?.fullName) {
        const { firstName, lastName } = splitFullName(extraction.tenant.fullName);
        setNewUser({ firstName, lastName, email: extraction.tenant.email ?? "", phone: extraction.tenant.phone ?? "" });
      }
    } catch (e) {
      setReadError(extractApiError(e));
    } finally {
      setReading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxSize: 20 * 1024 * 1024,
    disabled: reading,
    onDropAccepted: (files) => files[0] && read(files[0]),
    onDropRejected: (rej) =>
      setReadError(rej[0]?.errors[0]?.code === "file-too-large" ? "El PDF supera los 20 MB." : "El archivo tiene que ser un PDF."),
  });

  const createUser = async () => {
    if (!newUser) return;
    setCreatingUser(true);
    try {
      await postUser({ ...newUser, phone: newUser.phone || "" });
      const resp = await getAllUsers();
      const list: User[] = (resp as any)?.data ?? resp ?? [];
      setUsers(list);
      const created = list.find((u) => u.email?.toLowerCase() === newUser.email.toLowerCase());
      if (created) {
        setUserId(created.id);
        setNewUser(null);
      }
    } catch (e) {
      handleError(e);
    } finally {
      setCreatingUser(false);
    }
  };

  const createIndex = async () => {
    if (!data?.adjustmentIndex) return;
    setCreatingIndex(true);
    try {
      const text = data.adjustmentIndex.trim();
      const code = text.length <= 10 ? text.toUpperCase() : text.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 10);
      await postIncreaseIndex({ code, name: text });
      const list = await getAllIncreaseIndexes();
      setIndexes(list);
      setIndexId(list.find((i) => i.code === code)?.id ?? findIndex(list, text)?.id ?? null);
    } catch (e) {
      handleError(e);
    } finally {
      setCreatingIndex(false);
    }
  };

  const apply = async () => {
    if (!data || !file) return;
    setApplying(true);
    try {
      // garantes: se asocian los que ya existen y se crean los que tienen teléfono y email
      const ids: number[] = [];
      const unlinked: ExtractedPerson[] = [];
      for (const row of guarantorRows) {
        if (!row.link) {
          unlinked.push(row.person);
          continue;
        }
        if (row.matchId) {
          ids.push(row.matchId);
          continue;
        }
        if (row.phone.trim() && row.email.trim()) {
          await postGuarantor({ name: row.person.fullName ?? "", phone: row.phone.trim(), email: row.email.trim() });
          const created = (await getAllGuarantors()).find((g) => g.email.toLowerCase() === row.email.trim().toLowerCase());
          if (created) ids.push(created.id);
        } else {
          unlinked.push(row.person);
        }
      }

      const prefill = buildContractPrefill(data, indexId);
      const derived = derivedExtraFields(data, {
        unlinkedGuarantors: unlinked,
        indexText: data.adjustmentIndex,
        indexLinked: indexId != null,
      });
      const labels = new Set(extraFields.map((f) => f.label.toLowerCase()));
      onApply({
        file,
        propertyId,
        userId,
        guarantorIds: ids,
        prefill,
        extraFields: [...extraFields.filter((f) => f.label.trim() && f.value.trim()), ...derived.filter((f) => !labels.has(f.label.toLowerCase()))],
      });
    } catch (e) {
      handleError(e);
    } finally {
      setApplying(false);
    }
  };

  const selectedUser = users.find((u) => u.id === userId) ?? null;
  const selectedProperty = properties.find((p) => p.id === propertyId) ?? null;
  const selectedIndex = indexes.find((i) => i.id === indexId) ?? null;
  const missingRequired = useMemo(
    () => (data ? buildContractPrefill(data, indexId).missing.length : 0),
    [data, indexId]
  );

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => reason !== "backdropClick" && !reading && onClose()}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main", fontWeight: 700 }}>
        <AutoAwesomeIcon />
        Cargar contrato desde un PDF
        <IconButton onClick={onClose} disabled={reading} sx={{ ml: "auto", color: "primary.main" }} aria-label="cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!data && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Subí el contrato en PDF y el sistema completa el formulario con lo que encuentre: inquilino, inmueble, fechas, monto,
              ajuste, depósito y garantes. Lo que no figure en el contrato queda marcado para que lo completes vos. Al crear el
              contrato, el PDF queda guardado adjunto.
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed",
                borderColor: isDragActive ? "primary.main" : "divider",
                bgcolor: isDragActive ? "#FFF7EF" : "background.paper",
                borderRadius: 3,
                p: 5,
                textAlign: "center",
                cursor: reading ? "default" : "pointer",
                transition: "all .15s",
              }}
            >
              <input {...getInputProps()} />
              {reading ? (
                <Stack spacing={2} alignItems="center">
                  <CircularProgress />
                  <Typography fontWeight={600}>Leyendo {file?.name}…</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Puede tardar hasta un minuto, sobre todo si el contrato está escaneado.
                  </Typography>
                  <LinearProgress sx={{ width: "60%" }} />
                </Stack>
              ) : (
                <Stack spacing={1} alignItems="center">
                  <UploadFileIcon color="primary" sx={{ fontSize: 48 }} />
                  <Typography fontWeight={600}>Arrastrá el PDF acá o hacé clic para elegirlo</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hasta 20 MB. Sirven PDFs escaneados.
                  </Typography>
                </Stack>
              )}
            </Box>
            {readError && <Alert severity="error">{readError}</Alert>}
          </Stack>
        )}

        {data && (
          <Stack spacing={3}>
            <Alert severity={missingRequired ? "warning" : "success"} icon={missingRequired ? undefined : <CheckCircleOutlineIcon />}>
              {missingRequired
                ? `Se leyó ${file?.name}. Faltan ${missingRequired} dato${missingRequired > 1 ? "s" : ""} obligatorio${missingRequired > 1 ? "s" : ""} que vas a tener que completar en el formulario.`
                : `Se leyó ${file?.name}. Revisá los datos antes de seguir.`}
              {data.source === "IMAGES" && " El PDF era un escaneo: revisá bien números y fechas."}
            </Alert>
            {data.warnings.filter((w) => !w.includes("escaneo")).length > 0 && (
              <Alert severity="info">
                <Typography variant="body2" fontWeight={600}>
                  Para revisar
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {data.warnings
                    .filter((w) => !w.includes("escaneo"))
                    .map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                </ul>
              </Alert>
            )}

            {/* ---- inquilino ---- */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Inquilino
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                En el contrato: {data.tenant?.fullName ?? "no figura"}
                {data.tenant?.dni ? ` · DNI ${data.tenant.dni}` : ""}
                {data.tenant?.email ? ` · ${data.tenant.email}` : ""}
              </Typography>
              <Autocomplete
                options={users}
                value={selectedUser}
                onChange={(_, u) => setUserId(u?.id ?? null)}
                getOptionLabel={(u) => `${u.firstName} ${u.lastName} · ${u.email}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(p) => <TextField {...p} size="small" label="Usuario del sistema" />}
              />
              {!selectedUser && newUser && (
                <Box sx={{ mt: 1.5, p: 2, borderRadius: 2, bgcolor: "#FFF7EF", border: "1px solid #FBD9B5" }}>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    No está cargado en el sistema. Podés crearle el usuario ahora: le llega un mail con su usuario y una contraseña
                    temporal para entrar a ver su contrato y sus recibos.
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField size="small" fullWidth label="Nombre" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField size="small" fullWidth label="Apellido" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField size="small" fullWidth required type="email" label="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField size="small" fullWidth label="Teléfono" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                    <LoadingButton
                      size="small"
                      variant="contained"
                      loading={creatingUser}
                      disabled={!newUser.firstName.trim() || !/\S+@\S+\.\S+/.test(newUser.email)}
                      onClick={createUser}
                    >
                      Crear usuario
                    </LoadingButton>
                  </Box>
                </Box>
              )}
            </Box>

            {/* ---- propiedad ---- */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Inmueble
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                En el contrato: {[data.property?.address, data.property?.city].filter(Boolean).join(", ") || "no figura"}
              </Typography>
              <Autocomplete
                options={properties}
                value={selectedProperty}
                onChange={(_, p) => setPropertyId(p?.id ?? null)}
                getOptionLabel={(p) => `${p.title}${p.street ? ` · ${p.street} ${p.number ?? ""}` : ""}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    size="small"
                    label="Propiedad del sistema"
                    helperText={!selectedProperty ? "No la encontramos sola: elegila de la lista (si no está, cargala primero en Propiedades)." : undefined}
                  />
                )}
              />
            </Box>

            {/* ---- datos ---- */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Datos del contrato
              </Typography>
              <Row label="Tipo" value={data.contractType ? TYPE_LABEL[data.contractType] : null} />
              <Row label="Inicio" value={data.startDate ? dayjs(data.startDate).format("DD/MM/YYYY") : null} />
              <Row label="Fin" value={data.endDate ? dayjs(data.endDate).format("DD/MM/YYYY") : null} />
              <Row label="Alquiler inicial" value={data.initialAmount ? formatCurrencyAmount(data.initialAmount, data.currency) : null} />
              <Row label="Moneda" value={data.currency === "USD" ? "Dólares" : data.currency === "ARS" ? "Pesos" : null} />
              <Row label="Ajuste" value={data.adjustmentIndex} />
              <Row label="Cada cuántos meses" value={data.adjustmentFrequencyMonths ? `${data.adjustmentFrequencyMonths} meses` : null} />
              <Row
                label="Depósito"
                value={data.hasDeposit === false ? "Sin depósito" : data.depositAmount ? formatCurrencyAmount(data.depositAmount, data.currency) : null}
              />
              {data.adjustmentIndex && (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1.5 }}>
                  <Autocomplete
                    sx={{ flex: 1 }}
                    options={indexes}
                    value={selectedIndex}
                    onChange={(_, i) => setIndexId(i?.id ?? null)}
                    getOptionLabel={(i) => `${i.code} · ${i.name}`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={(p) => <TextField {...p} size="small" label="Índice de ajuste del sistema" />}
                  />
                  {!selectedIndex && (
                    <LoadingButton size="small" variant="outlined" loading={creatingIndex} onClick={createIndex} sx={{ whiteSpace: "nowrap" }}>
                      Crear “{data.adjustmentIndex.length > 18 ? `${data.adjustmentIndex.slice(0, 18)}…` : data.adjustmentIndex}”
                    </LoadingButton>
                  )}
                </Box>
              )}
            </Box>

            {/* ---- garantes ---- */}
            {guarantorRows.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Garantes
                </Typography>
                <Stack spacing={1.5}>
                  {guarantorRows.map((row, i) => (
                    <Box key={i} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={row.link}
                            onChange={(_, v) => setGuarantorRows((prev) => prev.map((r, j) => (j === i ? { ...r, link: v } : r)))}
                          />
                        }
                        label={
                          <span>
                            <b>{row.person.fullName}</b>
                            {row.person.dni ? ` · DNI ${row.person.dni}` : ""}
                            {row.matchId ? " · ya está cargado" : ""}
                          </span>
                        }
                      />
                      {row.link && !row.matchId && (
                        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              fullWidth
                              label="Teléfono"
                              value={row.phone}
                              onChange={(e) => setGuarantorRows((prev) => prev.map((r, j) => (j === i ? { ...r, phone: e.target.value } : r)))}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              fullWidth
                              label="Email"
                              value={row.email}
                              onChange={(e) => setGuarantorRows((prev) => prev.map((r, j) => (j === i ? { ...r, email: e.target.value } : r)))}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">
                              Para cargarlo como garante hacen falta teléfono y email. Si no los tenés, sus datos quedan guardados en “Otros datos del contrato”.
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {data.utilities.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Servicios a cargo del inquilino
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {data.utilities.map((u) => (
                    <Chip key={u} label={u} size="small" />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Se cargan con su monto desde el detalle del contrato, en “Servicios y expensas”.
                </Typography>
              </Box>
            )}

            {/* ---- datos que no tienen campo ---- */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Otros datos del contrato
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Lo que el contrato dice y no tiene un campo propio. Se guarda junto al contrato y se ve en su detalle.
              </Typography>
              <Stack spacing={1}>
                {extraFields.map((f, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <TextField
                      size="small"
                      label="Dato"
                      sx={{ width: { xs: "38%", sm: 220 } }}
                      value={f.label}
                      onChange={(e) => setExtraFields((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      label="Valor"
                      value={f.value}
                      onChange={(e) => setExtraFields((prev) => prev.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    />
                    <IconButton onClick={() => setExtraFields((prev) => prev.filter((_, j) => j !== i))}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Box>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setExtraFields((prev) => [...prev, { label: "", value: "" }])}>
                    Agregar dato
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>

      {data && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={reset} disabled={applying}>
            Subir otro PDF
          </Button>
          <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />
          <LoadingButton variant="contained" loading={applying} onClick={apply}>
            Usar estos datos
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
}
