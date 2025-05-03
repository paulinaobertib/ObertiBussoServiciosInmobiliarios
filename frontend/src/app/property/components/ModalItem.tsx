import { Dialog, DialogContent, DialogTitle } from '@mui/material';
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
        <Dialog open onClose={close} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <Form action={info.action} item={info.item} onDone={close} />
            </DialogContent>
        </Dialog>
    );
}
