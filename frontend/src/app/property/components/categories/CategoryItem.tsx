import { Box, Typography, IconButton, useTheme, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Column { label: string; key: string; }

export interface Props {
    item: any;
    columns: Column[];
    gridColumns: string;
    isSelected: (id: number) => boolean;
    toggleSelect: (id: number) => void;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
}

export const CategoryItem = ({ item, columns, gridColumns, isSelected, toggleSelect, onEdit, onDelete }: Props) => {
    const theme = useTheme();

    return (
        <Box
            onClick={() => toggleSelect(item.id)}
            sx={{
                display: { xs: 'block', sm: 'grid' },
                gridTemplateColumns: gridColumns,
                alignItems: 'center',
                py: 1,
                mb: 0.5,
                bgcolor: isSelected(item.id)
                    ? theme.palette.action.selected
                    : 'transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.palette.action.hover },
            }}
        >
            {/* Mobile: etiqueta + valor */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {columns.map(c => (
                    <Box key={c.key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {c.label}:
                        </Typography>
                        <Typography variant="body2" noWrap>
                            {typeof item[c.key] === 'boolean'
                                ? item[c.key] ? 'Sí' : 'No'
                                : item[c.key] ?? '—'}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Desktop: solo valor con truncamiento */}
            {columns.map(c => (
                <Tooltip title={item[c.key]}>
                    <Typography
                        variant="body2"
                        key={c.key}
                        noWrap
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {typeof item[c.key] === 'boolean'
                            ? item[c.key] ? 'Sí' : 'No'
                            : item[c.key] ?? '—'}
                    </Typography>

                </Tooltip>
            ))}

            {/* Acciones */}
            <Box
                onClick={e => e.stopPropagation()}
                sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
            >
                <IconButton size="small" onClick={() => onEdit(item)}>
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(item)}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
};
