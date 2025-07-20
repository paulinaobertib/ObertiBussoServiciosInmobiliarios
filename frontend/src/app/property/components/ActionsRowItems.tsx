import React from 'react';
import CommentIcon from '@mui/icons-material/Comment';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ROUTES, buildRoute } from '../../../lib';
import type { Category } from '../context/PropertiesContext';
import type { Info } from './ModalItem';
import { translate } from '../utils/translate';
import { AmenityForm } from './forms/AmenityForm';
import { OwnerForm } from './forms/OwnerForm';
import { TypeForm } from './forms/TypeForm';
import { NeighborhoodForm } from './forms/NeighborhoodForm';
import { StatusForm } from './forms/StatusForm';

const formRegistry = {
    amenity: AmenityForm,
    owner: OwnerForm,
    type: TypeForm,
    neighborhood: NeighborhoodForm,
    status: StatusForm,
} as const;
type FormKey = keyof typeof formRegistry;
// ————————————————————————————————————————

export type Entity = Category | 'property';

export type RowAction = {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
};

export const getRowActions = (
    entity: Entity,
    item: any,
    navigate: (path: string) => void,
    setModal: (info: Info) => void,
    ask: (question: string, cb: () => Promise<void>) => void,
    deleteFn: (entity: any) => Promise<void>,
    showAlert: (msg: string, variant: 'success' | 'error' | 'info' | 'warning') => void
): RowAction[] => {
    if (entity === 'property') {
        return [
            {
                label: 'Comentarios',
                icon: <CommentIcon fontSize="small" />,
                onClick: () => navigate(buildRoute(ROUTES.PROPERTY_COMMENTS, item.id)),
            },
            {
                label: 'Mantenimientos',
                icon: <BuildIcon fontSize="small" />,
                onClick: () => navigate(buildRoute(ROUTES.PROPERTY_MAINTENANCE, item.id)),
            },
            {
                label: 'Ver propiedad',
                icon: <VisibilityIcon fontSize="small" />,
                onClick: () => navigate(buildRoute(ROUTES.PROPERTY_DETAILS, item.id)),
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

    return [
        {
            label: `Editar ${translate(entity)}`,
            icon: <EditIcon fontSize="small" />,
            onClick: () =>
                setModal({
                    title: `Editar ${translate(entity)}`,
                    Component: formRegistry[entity as FormKey],
                    componentProps: { action: 'edit' as const, item },
                }),
        },
        {
            label: `Eliminar ${translate(entity)}`,
            icon: <DeleteIcon fontSize="small" />,
            onClick: () =>
                setModal({
                    title: `Eliminar ${translate(entity)}`,
                    Component: formRegistry[entity as FormKey],
                    componentProps: { action: 'delete' as const, item },
                }),
        },
    ];
};
