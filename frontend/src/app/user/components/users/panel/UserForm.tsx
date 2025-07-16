// src/app/user/components/users/UserForm.tsx
import { useState, useEffect, ChangeEvent } from 'react';
import { Box, TextField, Grid, Button } from '@mui/material';
import { useAuthContext } from '../../../context/AuthContext';
import {
  postUser,
  putUser,
  deleteUser,
  addRoleToUser
} from '../../../services/user.service';
import { useGlobalAlert } from '../../../../shared/context/AlertContext';
import type { User, UserCreate } from '../../../types/user';

type Action = 'add' | 'edit' | 'delete';

interface UserFormProps {
  action?: Action;
  item?: User;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const UserForm = ({
  action,
  item,
  onSuccess,
  onClose,
}: UserFormProps) => {
  const { info } = useAuthContext();
  const { showAlert } = useGlobalAlert();

  const isAdd = action === 'add';
  const isEdit = action === 'edit';
  const isDelete = action === 'delete';

  // inicializo el form según el modo
  const [form, setForm] = useState<UserCreate & Pick<User, 'id'>>({
    id: item?.id ?? '',
    userName: item?.userName ?? '',
    email: item?.email ?? '',
    firstName: item?.firstName ?? '',
    lastName: item?.lastName ?? '',
    phone: item?.phone ?? '',
  } as any);

  const [saving, setSaving] = useState(false);

  // si es edición, cargo datos al montar
  useEffect(() => {
    if (isEdit && item) {
      setForm({
        id: item.id,
        userName: item.userName,
        email: item.email,
        firstName: item.firstName,
        lastName: item.lastName,
        phone: item.phone ?? '',
      });
    }
  }, [action, info, item]);

  const handleChange = (field: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (isAdd) {
        // 1. Creamos el usuario
        const body: UserCreate = {
          userName: form.userName,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        };
        const created: User = await postUser(body);  // postUser devuelve el User creado :contentReference[oaicite:0]{index=0}

        // 2. Asignamos rol "user" por defecto
        await addRoleToUser(created.id, 'user');      // addRoleToUser devuelve Role[] :contentReference[oaicite:1]{index=1}

        showAlert('Usuario creado con éxito y rol "user" asignado', 'success');
      } else if (isDelete && form.id) {
        await deleteUser(form.id);
        showAlert('Usuario eliminado con éxito', 'success');
      } else {
        await putUser(form as User);
        showAlert('Usuario actualizado con éxito', 'success');
      }
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      showAlert(err.response?.data ?? 'Error desconocido', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', md: 'center' },
      }}
    >
      {/* Campos del formulario */}
      <Grid container spacing={2} flexGrow={1}>
        {/* Username */}
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Username"
            value={form.userName}
            fullWidth
            disabled={!isAdd}
            size="small"
            onChange={handleChange('userName')}
          />
        </Grid>
        {/* Nombre y Apellido */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Nombre"
            value={form.firstName}
            onChange={handleChange('firstName')}
            fullWidth size="small"
            disabled={!(isAdd || isEdit)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Apellido"
            value={form.lastName}
            onChange={handleChange('lastName')}
            fullWidth size="small"
            disabled={!(isAdd || isEdit)}
          />
        </Grid>
        {/* Email y Teléfono */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Correo electrónico"
            value={form.email}
            onChange={handleChange('email')}
            fullWidth size="small"
            disabled={!(isAdd || isEdit)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Teléfono"
            value={form.phone}
            onChange={handleChange('phone')}
            fullWidth size="small"
            disabled={!(isAdd || isEdit)}
          />
        </Grid>
        {/* Botones */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {!isDelete && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving || (isAdd || isEdit ? false : true)}
              >
                {isAdd ? 'Crear usuario' : 'Guardar cambios'}
              </Button>
            )}
            {isDelete && (
              <Button
                variant="contained"
                color="error"
                onClick={handleSubmit}
                disabled={saving}
              >
                Eliminar usuario
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
