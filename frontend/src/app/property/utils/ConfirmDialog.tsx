import { useState, ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [message, setMsg] = useState<ReactNode>('');
  const [onYes, setYes] = useState<() => void>(() => { });

  const ask = (msg: ReactNode, yes: () => void) => {
    setMsg(msg); setYes(() => yes); setOpen(true);
  };

  const DialogUI = (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          width: '100%',
          maxWidth: 420,
          bgcolor: '#fff',
          boxShadow: 6,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 20,
          color: '#EF6C00',
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
        <Button variant="outlined" color="inherit" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
        <Button variant="contained" color="warning" onClick={() => { onYes(); setOpen(false); }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );


  return { ask, DialogUI };
}
