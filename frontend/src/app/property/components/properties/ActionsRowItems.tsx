import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { ROUTES, buildRoute } from '../../../../lib';
import type { Category } from '../../context/PropertiesContext';

export type Entity = Category | 'property';

export type RowAction = {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
};

export const getRowActions = (
    entity: Entity,
    item: any,
    ask: (q: string, cb: () => Promise<void>) => void,
    deleteFn: (entity: any) => Promise<void>,
    showAlert: (msg: string, v: 'success' | 'error' | 'info' | 'warning') => void
) => {
    const navigate = useNavigate();
    const { pickItem } = usePropertiesContext();

    if (entity === 'property') {
        return [
            {
                label: 'Notas',
                icon: <CommentIcon fontSize="small" />,
                onClick: () => {
                    pickItem('property', item);
                    navigate(buildRoute(ROUTES.PROPERTY_NOTES, item.id));
                },
            },
            {
                label: 'Ver propiedad',
                icon: <VisibilityIcon fontSize="small" />,
                onClick: () => {
                    pickItem('property', item);
                    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, item.id));
                },
            },
            {
                label: 'Editar',
                icon: <EditIcon fontSize="small" />,
                onClick: () => navigate(buildRoute(ROUTES.EDIT_PROPERTY, item.id)),
            },
            {
                label: 'Eliminar',
                icon: <DeleteIcon fontSize="small" />,
                onClick: () =>
                    ask(`¿Eliminar "${item.title}"?`, async () => {
                        try {
                            await deleteFn(item);
                            showAlert('Propiedad eliminada', 'success');
                        } catch {
                            showAlert('Error al eliminar', 'error');
                        }
                    }),
            },
        ];
    }
};