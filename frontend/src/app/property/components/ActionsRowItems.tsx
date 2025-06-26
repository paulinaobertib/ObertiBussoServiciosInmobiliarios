// src/app/property/components/getRowActions.tsx
import React from 'react';
import CommentIcon from '@mui/icons-material/Comment';
import BuildIcon from '@mui/icons-material/Build';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ROUTES } from '../../../lib';
import { buildRoute } from '../../../buildRoute';
import type { Category } from '../context/PropertiesContext';
import type { Info } from './ModalItem';

export type RowAction = {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
};

export function getRowActions(
    category: Category,
    item: any,
    navigate: (path: string) => void,
    setModal: (info: Info) => void,
    ask: (question: string, cb: () => Promise<void>) => void,
    deleteFn: (entity: any) => Promise<void>,
    showAlert: (msg: string, variant: 'success' | 'error' | 'info' | 'warning') => void
): RowAction[] {

    if (category === 'property') {
        return [
            {
                label: 'Comentarios',
                icon: <CommentIcon fontSize="small" />,
                onClick: () =>
                    navigate(buildRoute(ROUTES.PROPERTY_COMMENTS, item.id)),
            },
            {
                label: 'Mantenimientos',
                icon: <BuildIcon fontSize="small" />,
                onClick: () =>
                    navigate(buildRoute(ROUTES.PROPERTY_MAINTENANCE, { id: item.id })),
            },
            {
                label: 'Ver propiedad',
                icon: <VisibilityIcon fontSize="small" />,
                onClick: () =>
                    navigate(buildRoute(ROUTES.PROPERTY_DETAILS, { id: item.id })),
            },
            {
                label: 'Editar',
                icon: <EditIcon fontSize="small" />,
                onClick: () =>
                    navigate(buildRoute(ROUTES.EDIT_PROPERTY, { id: item.id })),
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

    // Acciones genéricas para cualquier otra categoría
    return [
        {
            label: `Editar ${category}`,
            icon: <EditIcon fontSize="small" />,
            onClick: () => setModal({ action: 'edit', formKey: category, item }),
        },
        {
            label: `Eliminar ${category}`,
            icon: <DeleteIcon fontSize="small" />,
            onClick: () => setModal({ action: 'delete', formKey: category, item }),
        },
    ];
}
