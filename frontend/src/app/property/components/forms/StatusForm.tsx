import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { useGlobalAlert } from '../../context/AlertContext';
import { putPropertyStatus } from '../../services/property.service';

interface Props {
  item: { id: number; status: string };
  onDone: () => void;
}

const options = ['DISPONIBLE', 'RESERVADA', 'ALQUILADA', 'VENDIDA'];

export default function StatusForm({ item, onDone }: Props) {
  const { loadProperty } = usePropertyCrud();
  const { showAlert } = useGlobalAlert();
  const [status, setStatus] = useState(item.status);

  const handleChange = (e: SelectChangeEvent<string>) => {
    setStatus(e.target.value);
  };

  const save = async () => {
    try {
      await putPropertyStatus(item.id, status);
      showAlert('Estado actualizado con éxito', 'success');
      await loadProperty(item.id);
      onDone();
    } catch {
      showAlert('Error al actualizar estado', 'error');
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormControl fullWidth>
        <InputLabel id="status-select-label">Estado</InputLabel>
        <Select
          labelId="status-select-label"
          value={status}
          label="Estado"
          onChange={handleChange}
        >
          {options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box textAlign="right">
        <Button
          variant="contained"
          onClick={save}
          disabled={status === item.status}
        >
          Guardar
        </Button>
      </Box>
    </Box>
  );
}
