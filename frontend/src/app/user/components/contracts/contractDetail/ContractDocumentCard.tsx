import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Box, Button, Card, CircularProgress, Divider, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { LoadingButton } from "@mui/lab";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import {
  deleteContractDocument,
  getContractDocument,
  getContractDocumentInfo,
  getContractExtraFields,
  putContractExtraFields,
  uploadContractDocument,
} from "../../../services/contractPdf.service";
import type { ContractDocumentInfo, ContractExtraField } from "../../../types/contractPdf";
import { downloadBlob } from "../../../../shared/utils/download";
import { useApiErrors } from "../../../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";
import { Modal } from "../../../../shared/components/Modal";

type Props = {
  contractId: number;
  isAdmin: boolean;
};

const sizeLabel = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// PDF original del contrato + datos que no tienen un campo propio
export default function ContractDocumentCard({ contractId, isAdmin }: Props) {
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();
  const fileInput = useRef<HTMLInputElement>(null);

  const [doc, setDoc] = useState<ContractDocumentInfo | null>(null);
  const [fields, setFields] = useState<ContractExtraField[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<ContractExtraField[] | null>(null);
  const [savingFields, setSavingFields] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [info, extra] = await Promise.all([getContractDocumentInfo(contractId), getContractExtraFields(contractId)]);
      setDoc(info);
      setFields(extra);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [contractId, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file?: File | null) => {
    if (!file) return;
    if (file.type && file.type !== "application/pdf") {
      alertApi.showAlert?.("El archivo tiene que ser un PDF.", "warning");
      return;
    }
    setBusy(true);
    try {
      setDoc(await uploadContractDocument(contractId, file));
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const download = async () => {
    if (!doc) return;
    setBusy(true);
    try {
      downloadBlob(await getContractDocument(contractId), doc.fileName);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await alertApi.confirm?.({
      title: "¿Quitar el PDF del contrato?",
      description: "Se borra el archivo adjunto. Los datos del contrato no cambian.",
      primaryLabel: "Quitar",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteContractDocument(contractId);
      setDoc(null);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  const saveFields = async () => {
    if (!editing) return;
    setSavingFields(true);
    try {
      setFields(await putContractExtraFields(contractId, editing.filter((f) => f.label.trim() && f.value.trim())));
      setEditing(null);
    } catch (e) {
      handleError(e);
    } finally {
      setSavingFields(false);
    }
  };

  // el inquilino solo ve la tarjeta si hay algo para mostrarle
  if (!isAdmin && !loading && !doc && !fields.length) return null;

  return (
    <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", minWidth: 0 }}>
      <Card elevation={2} sx={{ p: "1.5rem", borderRadius: "0.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography
          sx={{ mb: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}
        >
          <PictureAsPdfOutlined />
          Contrato firmado
        </Typography>

        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2}>
            {doc ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "#FFF7EF", border: "1px solid #FBD9B5" }}>
                <PictureAsPdfOutlined color="error" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontWeight={600} noWrap title={doc.fileName}>
                    {doc.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {sizeLabel(doc.sizeBytes)} · subido el {dayjs(doc.uploadedAt).format("DD/MM/YYYY")}
                  </Typography>
                </Box>
                <Tooltip title="Descargar">
                  <span>
                    <IconButton color="primary" onClick={download} disabled={busy}>
                      <DownloadIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                {isAdmin && (
                  <>
                    <Tooltip title="Reemplazar">
                      <span>
                        <IconButton onClick={() => fileInput.current?.click()} disabled={busy}>
                          <UploadFileIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Quitar">
                      <span>
                        <IconButton onClick={remove} disabled={busy}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )}
              </Box>
            ) : (
              isAdmin && (
                <Box sx={{ textAlign: "center", p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    No hay PDF adjunto. Subí el contrato firmado para tenerlo a mano (el inquilino también lo puede descargar).
                  </Typography>
                  <LoadingButton variant="outlined" startIcon={<UploadFileIcon />} loading={busy} onClick={() => fileInput.current?.click()}>
                    Adjuntar PDF
                  </LoadingButton>
                </Box>
              )
            )}

            <input ref={fileInput} type="file" accept="application/pdf" hidden onChange={(e) => upload(e.target.files?.[0])} />

            {(fields.length > 0 || isAdmin) && (
              <>
                <Divider />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography fontWeight={600}>Otros datos del contrato</Typography>
                  {isAdmin && (
                    <Button size="small" startIcon={<EditOutlined />} onClick={() => setEditing(fields.length ? fields.map((f) => ({ ...f })) : [{ label: "", value: "" }])}>
                      Editar
                    </Button>
                  )}
                </Box>
                {fields.length ? (
                  <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(120px, 35%) 1fr" }, columnGap: 2, rowGap: 1 }}>
                    {fields.map((f, i) => (
                      <Box key={i} sx={{ display: "contents" }}>
                        <Typography component="dt" variant="body2" color="text.secondary" fontWeight={600}>
                          {f.label}
                        </Typography>
                        <Typography component="dd" variant="body2" sx={{ m: 0, whiteSpace: "pre-line" }}>
                          {f.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Día de pago, punitorios, destino del inmueble… lo que el contrato diga y no tenga un campo propio.
                  </Typography>
                )}
              </>
            )}
          </Stack>
        )}
      </Card>

      <Modal open={Boolean(editing)} title="Otros datos del contrato" onClose={() => setEditing(null)} maxWidth="md">
        <Stack spacing={1.5}>
          {editing?.map((f, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField
                size="small"
                label="Dato"
                sx={{ width: { xs: "40%", sm: 220 } }}
                value={f.label}
                onChange={(e) => setEditing((prev) => prev!.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              <TextField
                size="small"
                fullWidth
                multiline
                label="Valor"
                value={f.value}
                onChange={(e) => setEditing((prev) => prev!.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
              />
              <IconButton onClick={() => setEditing((prev) => prev!.filter((_, j) => j !== i))}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Box>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setEditing((prev) => [...(prev ?? []), { label: "", value: "" }])}>
              Agregar dato
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setEditing(null)}>Cancelar</Button>
            <LoadingButton variant="contained" loading={savingFields} onClick={saveFields}>
              Guardar
            </LoadingButton>
          </Box>
        </Stack>
      </Modal>
    </Grid>
  );
}
