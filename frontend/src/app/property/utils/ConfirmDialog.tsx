import { useState, ReactNode, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useLoading } from '../utils/useLoading';

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMsg] = useState<ReactNode>('');
  const [onYes, setYes] = useState<() => Promise<void>>(() => async () => { });
  const theme = useTheme()

  const { loading, run: runConfirm } = useLoading(useCallback(async () => {
    await onYes();
    setOpen(false);
  }, [onYes]));

  const ask = (msg: ReactNode, yes: () => Promise<void>) => {
    setMsg(msg);
    setYes(() => yes);
    setOpen(true);
  };

  const DialogUI = (
    <Dialog
      open={open}
      onClose={() => { if (!loading) setOpen(false); }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          width: '100%',
          maxWidth: 420,
          bgcolor: 'white',
          boxShadow: 6,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 20,
          color: theme.palette.primary.main,
          textAlign: 'center',
          pb: 0,
        }}
      >
        {message}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Typography sx={{ textAlign: 'center', fontSize: 16 }}>
          Ten en cuenta que no podrás volver atrás.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, mt: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          color="warning"
          loading={loading}
          onClick={() => runConfirm()}
        >
          Confirmar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );

  return { ask, DialogUI };
}
