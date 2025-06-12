import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import AmenityForm from './forms/AmenityForm';
import OwnerForm from './forms/OwnerForm';
import TypeForm from './forms/TypeForm';
import NeighborhoodForm from './forms/NeighborhoodForm';
import StatusForm from './forms/StatusForm';
import PropertyForm from './forms/PropertyForm';
import MaintenanceForm from './forms/MaintenanceForm';
import CommentForm from './forms/CommentForm';
import { translate } from '../utils/translate';

type Action = 'add' | 'edit' | 'delete' | 'edit-status';

interface Info {
    action: Action;
    formKey?: string;
    item?: any;
}

export function handleClose(reason: string | undefined, close: () => void) {
  if (reason !== 'backdropClick') {
    close();
  }
}


export default function ModalItem({
    info,
    close,
}: {
    info: Info | null;
    close: () => void;
}) {
    if (!info) return null;

    const registry = {
        amenity: AmenityForm,
        owner: OwnerForm,
        type: TypeForm,
        neighborhood: NeighborhoodForm,
        property: PropertyForm,
        maintenance: MaintenanceForm,
        comment: CommentForm,
    } as const;

    if (info.action === 'edit-status') {
        return (
            <Dialog
                data-testid="modal"
                open
                fullWidth
                maxWidth="sm"
                onClose={(_, r) => handleClose(r, close)}
                PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        color: '#EF6C00',
                        mb: 1,
                    }}
                >
                    Editar estado
                    <IconButton onClick={close} sx={{ color: '#EF6C00' }} aria-label="cerrar modal">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <StatusForm item={info.item} onDone={close} />
                </DialogContent>
            </Dialog>
        );
    }

    const formKey = info.formKey ?? 'property';
    const Form = registry[formKey as keyof typeof registry]
        ?? PropertyForm;

    const label = translate(formKey);
    const title =
      info.action === 'add'
        ? `Crear ${label}`
        : info.action === 'edit'
          ? `Editar ${label}`
          : `Eliminar ${label}`;

    return (
        <Dialog
            data-testid="modal"
            open
            fullWidth
            maxWidth="sm"
            onClose={(_, r) => handleClose(r, close)}
            PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    color: '#EF6C00',
                    mb: 1,
                }}
            >
                {title}
                <IconButton onClick={close} sx={{ color: '#EF6C00' }} aria-label="cerrar modal">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Form action={info.action} item={info.item} onDone={close} />
            </DialogContent>
        </Dialog>
    );
}
