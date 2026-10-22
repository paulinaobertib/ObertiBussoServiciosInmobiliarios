import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { getPortalAccess, putPortalAccess } from "../../../services/portalAccess.service";
import { useApiErrors } from "../../../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";

export interface PortalAccessFormProps {
  userId: string;
  userName: string;
  isTenant: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

// el admin decide si el inquilino entra a ver sus contratos, sus recibos o ambos
export const PortalAccessForm = ({ userId, userName, isTenant, onSuccess, onClose }: PortalAccessFormProps) => {
  const { handleError } = useApiErrors();
  const { showAlert } = useGlobalAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contracts, setContracts] = useState(false);
  const [receipts, setReceipts] = useState(false);

  useEffect(() => {
    getPortalAccess(userId)
      .then((a) => {
        setContracts(a.canViewContracts);
        setReceipts(a.canViewReceipts);
      })
      .catch(handleError)
      .finally(() => setLoading(false));
  }, [userId, handleError]);

  const save = async () => {
    setSaving(true);
    try {
      await putPortalAccess(userId, { canViewContracts: contracts, canViewReceipts: receipts });
      showAlert(
        contracts || receipts
          ? `${userName} ya puede entrar con su usuario y ver ${[contracts && "sus contratos", receipts && "sus recibos"].filter(Boolean).join(" y ")}.`
          : `${userName} ya no ve secciones del portal.`,
        "success"
      );
      onSuccess();
    } catch (e) {
      handleError(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box textAlign="center" p={2}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        Elegí qué puede ver <b>{userName}</b> cuando entra con su usuario a la web. Solo ve lo suyo: sus contratos y los recibos
        emitidos a su nombre.
      </Typography>

      <Box>
        <FormControlLabel
          control={<Switch checked={contracts} onChange={(_, v) => setContracts(v)} />}
          label="Contratos (datos del contrato, pagos, aumentos y el PDF adjunto)"
        />
        <FormControlLabel
          control={<Switch checked={receipts} onChange={(_, v) => setReceipts(v)} />}
          label="Recibos (ver y descargar en PDF)"
        />
      </Box>

      {!isTenant && (contracts || receipts) && (
        <Alert severity="info">Se le va a agregar el rol “Inquilino” para que pueda entrar al portal.</Alert>
      )}
      <Typography variant="caption" color="text.secondary">
        Si la persona todavía no tiene usuario, creala con “Crear usuario”: le llega un mail con su usuario y una contraseña temporal.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <LoadingButton variant="contained" loading={saving} onClick={save}>
          Guardar
        </LoadingButton>
      </Box>
    </Stack>
  );
};
