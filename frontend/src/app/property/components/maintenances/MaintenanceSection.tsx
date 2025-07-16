import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { MaintenanceList } from "./MaintenanceList";
import AddIcon from '@mui/icons-material/Add';

export const MaintenanceSection = ({
    loading,
    items,
    onAdd,
    onEditItem,
    onDeleteItem,
}: {
    loading: boolean;
    items: { title: string; description: string; date: string }[];
    onAdd: () => void;
    onEditItem: (item: any) => void;
    onDeleteItem: (item: any) => void;
}) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
            sx={{
                px: 3,
                py: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Mantenimientos
            </Typography>
            <Button variant='contained' startIcon={<AddIcon />} onClick={onAdd}>
                Agregar
            </Button>
        </Box>

        <Box sx={{ px: 3, py: 2, flexGrow: 1, overflowY: 'auto' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : items.length === 0 ? (
                <Typography color="text.secondary">
                    No hay mantenimientos de la propiedad registrados.
                </Typography>
            ) : (
                <MaintenanceList
                    items={items}
                    onEditItem={onEditItem}
                    onDeleteItem={onDeleteItem}
                />
            )}
        </Box>
    </Box>
);