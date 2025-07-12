import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { putPropertyStatus } from '../../services/property.service';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { useLoading } from '../../utils/useLoading';
import { useGlobalAlert } from '../../../shared/context/AlertContext';

interface Props {
  item: { id: number; status: string };
  onDone: () => void;
}

const options = ['DISPONIBLE', 'RESERVADA', 'ALQUILADA', 'VENDIDA'];

export const StatusForm = ({ item, onDone }: Props) => {
  const { loadProperty } = usePropertiesContext();
  const { showAlert } = useGlobalAlert();
  const [status, setStatus] = useState(item.status);

  const handleChange = (e: SelectChangeEvent<string>) => {
    setStatus(e.target.value);
  };

  /** guardar */
  const save = async () => {
    try {
      await putPropertyStatus(item.id, status);
      showAlert('Estado actualizado con éxito', 'success');
      await loadProperty(item.id);
      onDone();
    } catch (err: any) {
      showAlert(err.response?.data ?? 'Error desconocido', 'error');
    }
  };

  const { loading, run } = useLoading(save);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {loading && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100%"
          height="100%"
          zIndex={theme => theme.zIndex.modal + 1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        />
      )}

      <FormControl fullWidth>
        <InputLabel id="status-select-label">Estado</InputLabel>
        <Select
          labelId="status-select-label"
          value={status}
          label="Estado"
          onChange={handleChange}
        >
          {options.map(opt => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box textAlign="right">
        <LoadingButton
          onClick={run}
          loading={loading}
          variant="contained"
          disabled={status === item.status || loading}
        >
          Guardar
        </LoadingButton>
      </Box>
    </Box>
  );
};
