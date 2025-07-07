import { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface Props {
    onAdd: (input: { title: string; description: string }) => Promise<void>;
}

export default function AdminControls({ onAdd }: Props) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleAdd = async () => {
        await onAdd({ title, description });
        setTitle("");
        setDescription("");
        setOpen(false);
    };

    return (
        <>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
                sx={{ mt: 2 }}
            >
                Nueva noticia
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Crear noticia</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Título"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <TextField
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={10}
                        margin="normal"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={!title || !description}
                    >
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
