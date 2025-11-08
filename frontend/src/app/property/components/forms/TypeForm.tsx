import { Grid, TextField, FormControlLabel, Checkbox, Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useCategories } from "../../hooks/useCategories";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { Type, TypeCreate } from "../../types/type";
import { postType, putType, deleteType } from "../../services/type.service";

interface Props {
  action: "add" | "edit" | "delete";
  item?: Type;
  onDone: () => void;
}

export const TypeForm = ({ action, item, onDone }: Props) => {
  /* ───── contexto ───── */
  const { refreshTypes } = usePropertiesContext();

  /* ───── hook genérico ───── */

  const initialPayload = {
    id: item?.id ?? 0,
    name: item?.name ?? "",
    hasRooms: item?.hasRooms ?? false,
    hasBathrooms: item?.hasBathrooms ?? false,
    hasBedrooms: item?.hasBedrooms ?? false,
    hasCoveredArea: item?.hasCoveredArea ?? false,
  };

  const { form, setForm, invalid, run, loading } = useCategories<Type>({
    initial: initialPayload,
    action,
    save: async (payload) => {
      if (action === "add") return postType(payload as TypeCreate);
      if (action === "edit") return putType(payload as Type);
      if (action === "delete") return deleteType(payload as Type);
    },
    refresh: refreshTypes,
    onDone,
  });

  /* ───── helpers de cambio ───── */
  const setString = (k: keyof Type) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const setBool = (k: keyof Type) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.checked });

  /* ───── render ───── */
  return (
    <>
      {/* overlay de carga */}
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100%"
          height="100%"
          zIndex={(theme) => theme.zIndex.modal + 1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        />
      )}

      {/* campos */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={form.name}
            disabled={action === "delete"}
            onChange={setString("name")}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={<Checkbox checked={form.hasRooms} onChange={setBool("hasRooms")} disabled={action === "delete"} />}
            label="Ambientes"
          />
          <FormControlLabel
            control={
              <Checkbox checked={form.hasBedrooms} onChange={setBool("hasBedrooms")} disabled={action === "delete"} />
            }
            label="Dormitorios"
          />
          <FormControlLabel
            control={
              <Checkbox checked={form.hasBathrooms} onChange={setBool("hasBathrooms")} disabled={action === "delete"} />
            }
            label="Baños"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.hasCoveredArea}
                onChange={setBool("hasCoveredArea")}
                disabled={action === "delete"}
              />
            }
            label="Superficie cubierta"
          />
        </Grid>
      </Grid>

      {/* botón guardar / eliminar */}
      <Box textAlign="right">
        <LoadingButton
          onClick={run}
          loading={loading}
          disabled={invalid || loading}
          variant="contained"
          color={action === "delete" ? "error" : "primary"}
        >
          {action === "delete" ? "Eliminar" : "Confirmar"}
        </LoadingButton>
      </Box>
    </>
  );
};
