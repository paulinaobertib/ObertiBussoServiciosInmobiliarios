import { Box, Typography, IconButton, Tooltip, useTheme } from '@mui/material';
import { RowAction } from '../ActionsRowItems';

interface ColumnDef { label: string; key: string }

interface Props {
    prop: any;
    columns: ColumnDef[];
    gridCols: string;
    isSelected: (id: number) => boolean;
    toggleSelect: (id: number) => void;
    actions: RowAction[];
}

export const PropertyItem = ({ prop, columns, gridCols, isSelected, toggleSelect, actions }: Props) => {
    const theme = useTheme();
    return (
        <Box
            onClick={() => toggleSelect(prop.id)}
            sx={{
                display: { xs: 'block', sm: 'grid' },
                gridTemplateColumns: gridCols,
                alignItems: 'center',
                py: 1,
                mb: 0.5,
                bgcolor: isSelected(prop.id)
                    ? theme.palette.action.selected
                    : 'transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.palette.action.hover },
            }}
        >
            {/* Mobile: etiqueta + valor */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {columns.map(col => {
                    const raw = prop[col.key];
                    const val = col.key === 'price'
                        ? `${prop.currency ?? ''} ${raw ?? '—'}`
                        : typeof raw === 'boolean'
                            ? raw ? 'Sí' : 'No'
                            : raw ?? '—';
                    return (
                        <Box key={col.key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {col.label}:
                            </Typography>
                            <Typography variant="body2" noWrap>
                                {val}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {/* Desktop: solo valores */}
            {columns.map(col => {
                const raw = prop[col.key];
                const val = col.key === 'price'
                    ? `${prop.currency ?? ''} ${raw ?? '—'}`
                    : typeof raw === 'boolean'
                        ? raw ? 'Sí' : 'No'
                        : raw ?? '—';
                return (
                    <Tooltip title={val} key={col.key}>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {val}
                        </Typography>
                    </Tooltip>
                );
            })}

            {/* Acciones */}
            <Box
                onClick={e => e.stopPropagation()}
                sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
            >
                {actions.map((action, i) => (
                    <Tooltip key={i} title={action.label}>
                        <IconButton size="small" onClick={action.onClick}>
                            {action.icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </Box>
        </Box>
    );
};
