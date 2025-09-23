import { useMemo, useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { putPropertyStatus } from "../../services/property.service";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useApiErrors } from "../../../shared/hooks/useErrors";

type PropertyStatus = "DISPONIBLE" | "RESERVADA" | "ALQUILADA" | "VENDIDA" | "ESPERA" | "INACTIVA";
const ALL_STATUSES: PropertyStatus[] = ["DISPONIBLE", "RESERVADA", "ALQUILADA", "VENDIDA", "ESPERA", "INACTIVA"];

interface Props {
  /** Propiedad a editar */
  item: { id: number; status: string };
  /** Llamado al finalizar OK */
  onDone: () => void;
  /** Opcional: limitar estados visibles */
  allowed?: PropertyStatus[];
  /** Opcional: botón cancelar (por ej. cerrar modal) */
  onCancel?: () => void;
}

export const StatusForm = ({ item, onDone, allowed, onCancel }: Props) => {
  const { loadProperty } = usePropertiesContext();
  const { showAlert } = useGlobalAlert();
  const { handleError } = useApiErrors();

  const propertyId = useMemo(() => item.id, [item.id]);
  const [status, setStatus] = useState<PropertyStatus>((item.status as PropertyStatus) ?? "DISPONIBLE");
  const [saving, setSaving] = useState(false);

  const options = allowed?.length ? allowed : ALL_STATUSES;

  const handleChange = (e: SelectChangeEvent<string>) => {
    setStatus(e.target.value as PropertyStatus);
  };

  const save = async () => {
    if (propertyId == null) {
      showAlert("ID de propiedad inválido.", "error");
      return;
    }
    // Evita pedir guardar si no hay cambios
    if ((item.status as PropertyStatus) === status) return;

    setSaving(true);
    try {
      await putPropertyStatus(propertyId, status);
      showAlert("Estado actualizado con éxito", "success");
      await loadProperty(propertyId);
      onDone();
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const unchanged = (item.status as PropertyStatus) === status;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormControl fullWidth size="small">
        <InputLabel id="status-select-label">Estado</InputLabel>
        <Select labelId="status-select-label" value={status} label="Estado" onChange={handleChange}>
          {options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" justifyContent="flex-end" gap={1}>
        {onCancel && (
          <Button onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
        <LoadingButton onClick={save} loading={saving} variant="contained" disabled={saving || unchanged}>
          Guardar
        </LoadingButton>
      </Box>
    </Box>
  );
};
