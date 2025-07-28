import { Box, CircularProgress, Typography } from '@mui/material';
import { PropertyItem } from './PropertyItem';
import { RowAction } from '../ActionsRowItems';

interface ColumnDef { label: string; key: string }
interface Props {
    properties: any[];
    loading: boolean;
    columns: ColumnDef[];
    gridCols: string;
    toggleSelect: (id: number) => void;
    isSelected: (id: number) => boolean;
    getActions: (prop: any) => RowAction[];
}

export const PropertyList = ({ properties, loading, columns, gridCols, toggleSelect, isSelected, getActions }: Props) => (
    <Box sx={{ px: 2, flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={28} />
            </Box>
        ) : (properties ?? []).length > 0 ? (
            (properties ?? []).map(prop => (
                <PropertyItem
                    key={prop.id}
                    prop={prop}
                    columns={columns}
                    gridCols={gridCols}
                    toggleSelect={toggleSelect}
                    isSelected={isSelected}
                    actions={getActions(prop)}
                />
            ))
        ) : (
            <Typography sx={{ mt: 2 }}>No hay propiedades disponibles.</Typography>
        )}
    </Box>
);
