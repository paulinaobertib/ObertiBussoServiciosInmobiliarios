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
    showActions?: boolean;
    filterAvailable?: boolean;
}

export const PropertyList = ({
    properties,
    loading,
    columns,
    gridCols,
    toggleSelect,
    isSelected,
    getActions,
    showActions = true,
    filterAvailable = false,
}: Props) => {

    const filtered = filterAvailable
        ? properties.filter(
            (p) => p.status?.toLowerCase() === 'disponible' || !p.status
        )
        : properties;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={36} />
            </Box>
        );
    }

    if (filtered.length === 0) {
        return <Typography sx={{ mt: 2 }}>No hay propiedades disponibles.</Typography>;
    }

    return (
        <Box sx={{ px: 2, flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
            {filtered.map((prop) => (
                <PropertyItem
                    key={prop.id}
                    prop={prop}
                    columns={columns}
                    gridCols={gridCols}
                    toggleSelect={toggleSelect}
                    isSelected={isSelected}
                    actions={showActions ? getActions(prop) : []}
                />
            ))}
        </Box>
    );
};