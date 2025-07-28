/**
 * Generar turnos disponibles (30 min).
 * Al generar, recarga inmediatamente el panel admin.
 */
import { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Stack, TextField, Alert, Button, Box } from '@mui/material';

import { Calendar } from '../../Calendar';
import { Modal } from '../../../../shared/components/Modal';
import { useAppointments } from '../../../hooks/useAppointments';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GenerateSlotsDialog({ open, onClose }: Props) {
  const {
    genDate,
    setGenDate,
    genStartTime,
    setGenStartTime,
    genEndTime,
    setGenEndTime,
    generateSlots,
  } = useAppointments();

  const [submitting, setSubmitting] = useState(false);

  const slots = useMemo(() => {
    const st = dayjs(`${genDate.format('YYYY-MM-DD')}T${genStartTime}`);
    const et = dayjs(`${genDate.format('YYYY-MM-DD')}T${genEndTime}`);
    const arr: Dayjs[] = [];
    let t = st;
    while (t.isBefore(et)) {
      arr.push(t);
      t = t.add(30, 'minute');
    }
    return arr;
  }, [genDate, genStartTime, genEndTime]);

  const handleSubmit = async () => {
    setSubmitting(true);
    await generateSlots();   // crea y refresca admin
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal open={open} title="Generar turnos" onClose={onClose}>
      <Stack spacing={3}>
        <Calendar initialDate={genDate} onSelectDate={setGenDate} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Desde"
            type="time"
            value={genStartTime}
            onChange={(e) => setGenStartTime(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Hasta"
            type="time"
            value={genEndTime}
            onChange={(e) => setGenEndTime(e.target.value)}
            fullWidth
            size="small"
          />
        </Stack>

        <Alert severity="info">
          Se generarán <strong>{slots.length}</strong> turnos cada&nbsp;30&nbsp;min.
        </Alert>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || slots.length === 0}
          >
            Generar
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
}
