import CommentIcon from '@mui/icons-material/Comment';
import BuildIcon from '@mui/icons-material/Build';
import { ROUTES } from '../../../lib';
import { buildRoute } from '../../../buildRoute';

export function getPropertyRowData(item: any, navigate: (path: string) => void) {
    const columns = [item.title, item.currency, item.price];

    const extraActions = [
        {
            label: 'Comentarios',
            icon: <CommentIcon fontSize="small" />,
            onClick: () => navigate(buildRoute(ROUTES.PROPERTY_COMMENTS, { id: item.id })),
        },
        {
            label: 'Mantenimiento',
            icon: <BuildIcon fontSize="small" />,
            onClick: () => navigate(buildRoute(ROUTES.PROPERTY_MAINTENANCE, { id: item.id })),
        },
    ];

    return { columns, extraActions };
}