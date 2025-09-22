import { useEffect, useMemo, useState, ChangeEvent } from "react";
import { Box, Grid, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import type { Guarantor, GuarantorCreate } from "../../types/guarantor";
import { useGuarantors } from "../../hooks/useGuarantors";

type Action = "add" | "edit" | "delete";

export interface GuarantorFormProps {
  action?: Action;
  item?: Guarantor | null;
  onSuccess?: () => void; // cerrar/refresh en el padre
}

type FormState = {
  name: string;
  email: string;
  phone: string;
};

const empty: FormState = {
  name: "",
  email: "",
  phone: "",
};

export default function GuarantorForm({ action, item, onSuccess }: GuarantorFormProps) {
  const { create, update, remove } = useGuarantors();

  const mode: Action = useMemo(() => {
    if (action) return action;
    return item && (item as any).id != null ? "edit" : "add";
  }, [action, item]);

  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";

  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && item) {
      setForm({
        name: (item as any).name ?? "",
        email: (item as any).email ?? "",
        phone: (item as any).phone ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [isEdit, item]);

  const onChange = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid = isDelete || (!!form.name && !!form.email && !!form.phone);

  const toCreateDto = (): GuarantorCreate => ({
    // Ajustá si tu DTO real tiene otros nombres/campos
    name: form.name,
    email: form.email,
    phone: form.phone,
  });

  const handleSubmit = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      if (isDelete) {
        if (!item?.id) return;
        const ok = await remove(item.id); // confirm + alertas en el hook
        if (ok) onSuccess?.();
        return;
      }

      if (isAdd) {
        const ok = await create(toCreateDto());
        if (ok) onSuccess?.();
        return;
      }

      if (isEdit && item?.id != null) {
        const ok = await update(item.id, toCreateDto());
        if (ok) onSuccess?.();
        return;
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {!isDelete && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Nombre" size="small" fullWidth value={form.name} onChange={onChange("name")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Teléfono" size="small" fullWidth value={form.phone} onChange={onChange("phone")} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Email"
                type="email"
                size="small"
                fullWidth
                value={form.email}
                onChange={onChange("email")}
              />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }} textAlign="right">
          <LoadingButton
            variant="contained"
            color={isDelete ? "error" : "primary"}
            loading={saving}
            disabled={!isValid || saving}
            onClick={handleSubmit}
          >
            {isDelete ? "Eliminar" : isEdit ? "Guardar" : "Confirmar"}
          </LoadingButton>
        </Grid>
      </Grid>
    </Box>
  );
}
