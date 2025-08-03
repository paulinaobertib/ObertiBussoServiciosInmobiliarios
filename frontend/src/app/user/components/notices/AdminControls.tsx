// components/AdminControls.tsx
import { useState, useRef } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NoticeForm, NoticeFormHandle } from './NoticeForm';

export default function AdminControls({ onAdd }: { onAdd: (data: any) => Promise<void> }) {
    const [open, setOpen] = useState(false);
    const formRef = useRef<NoticeFormHandle>(null);

    const [canSubmit, setCanSubmit] = useState(false);

    const handleAdd = async () => {
        if (formRef.current?.validate()) {
            await onAdd(formRef.current.getCreateData());
            setOpen(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mt: 2 }}>
                Nueva noticia
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Crear noticia</DialogTitle>
                <DialogContent dividers>
                    <NoticeForm
                        ref={formRef}
                        onValidityChange={(v: boolean | ((prevState: boolean) => boolean)) => setCanSubmit(v)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={!canSubmit}
                    >
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
