import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AmenityForm from './forms/AmenityForm';
import OwnerForm from './forms/OwnerForm';
import TypeForm from './forms/TypeForm';
import NeighborhoodForm from './forms/NeighborhoodForm';
import { usePropertyCrud } from '../context/PropertyCrudContext';
import { translate } from '../utils/translate';

const registry = {
    amenity: AmenityForm,
    owner: OwnerForm,
    type: TypeForm,
    neighborhood: NeighborhoodForm,
} as const;

interface Props {
    info: { action: 'add' | 'edit' | 'delete'; item?: any } | null;
    close: () => void;
}

export default function ModalItem({ info, close }: Props) {
    const { category } = usePropertyCrud();
    if (!info || !category) return null;

    const Form = registry[category];
    const title =
        info.action === 'add' ? `Crear ${translate(category)}` : info.action === 'edit'
            ? `Editar ${translate(category)}`
            : `Eliminar ${translate(category)}`;

    return (
        // <Dialog open onClose={() => null} maxWidth="sm" fullWidth>
        //     <DialogTitle>{title}</DialogTitle>
        //     <DialogContent dividers>
        //         <Form action={info.action} item={info.item} onDone={close} />
        //     </DialogContent>
        // </Dialog>

        <Dialog
            open
            // onClose={close}
            onClose={(_, reason) => {
                if (reason === 'backdropClick') return;
                close;
            }}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3, p: 2 },
            }}
        >
            {/* Encabezado con título + botón de cerrar */}
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
                <IconButton
                    aria-label="close"
                    onClick={close}
                    sx={{
                        color: '#EF6C00',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Contenido del Form */}
            <DialogContent dividers>
                <Form action={info.action} item={info.item} onDone={close} />
            </DialogContent>
        </Dialog>
    );
};

