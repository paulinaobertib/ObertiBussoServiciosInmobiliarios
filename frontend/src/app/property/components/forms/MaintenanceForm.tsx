import { useEffect } from "react";
import { Grid, TextField, Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useCategories } from "../../hooks/useCategories";
import { postMaintenance, putMaintenance, deleteMaintenance } from "../../services/maintenance.service";
import type { Maintenance, MaintenanceCreate } from "../../types/maintenance";

interface Props {
  propertyId: number;
  action: "add" | "edit" | "delete";
  item?: Maintenance;
  refresh: () => Promise<void>;
  onDone: () => void;
}

export const MaintenanceForm = ({ propertyId, action, item, refresh, onDone }: Props) => {
  const initialPayload = {
    id: item?.id ?? 0,
    propertyId: propertyId,
    title: item?.title ?? "",
    description: item?.description ?? "",
    date: item?.date ?? "",
  };

  const { form, setForm, invalid, run, loading } = useCategories<Maintenance>({
    initial: initialPayload,
    action,
    save: async (payload) => {
      if (action === "add") return postMaintenance(payload as MaintenanceCreate);
      if (action === "edit") return putMaintenance(payload as Maintenance);
      if (action === "delete") return deleteMaintenance(payload as Maintenance);
    },
    refresh,
    onDone,
  });

  const isDirty =
    form.title !== initialPayload.title ||
    form.date !== initialPayload.date ||
    form.description !== initialPayload.description;

  useEffect(() => {
    if (action === "edit" && item) {
      setForm({
        id: item.id,
        propertyId: propertyId,
        title: item.title,
        description: item.description,
        date: item.date,
      });
    } else {
      setForm(initialPayload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, item?.id, propertyId]);

  const handleSubmit = async () => {
    await run();
    setForm(initialPayload);
  };

  const handleCancel = () => {
    setForm(initialPayload);
    onDone();
  };

  return (
    <Box component="form" noValidate>
      <Grid container spacing={1} mb={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Título"
            size="small"
            disabled={action === "delete"}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="datetime-local"
            label="Fecha"
            size="small"
            InputLabelProps={{ shrink: true }}
            disabled={action === "delete"}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descripción"
            size="small"
            disabled={action === "delete"}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          mt: 2,
        }}
      >
        {/* Cancelar disponible en add y edit */}
        {(action === "edit" || action === "add") && (
          <LoadingButton loading={loading} onClick={handleCancel} disabled={!isDirty || loading}>
            Cancelar
          </LoadingButton>
        )}

        <LoadingButton
          onClick={handleSubmit}
          loading={loading}
          disabled={invalid || loading}
          variant="contained"
          color={action === "delete" ? "error" : "primary"}
        >
          {action === "delete" ? "Eliminar" : "Confirmar"}
        </LoadingButton>
      </Box>
    </Box>
  );
};
