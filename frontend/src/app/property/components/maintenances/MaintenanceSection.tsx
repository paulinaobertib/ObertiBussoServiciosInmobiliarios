import { useState } from 'react';
import { Box, Typography, Divider, CircularProgress } from '@mui/material';
import type { Maintenance } from '../../types/maintenance';
import { MaintenanceForm } from '../forms/MaintenanceForm';
import { MaintenanceList } from './MaintenanceList';
import { deleteMaintenance } from '../../services/maintenance.service';

export interface Props {
    propertyId: number;
    loading: boolean;
    items: Maintenance[];
    refresh: () => Promise<void>;
}

export const MaintenanceSection = ({ propertyId, loading, items, refresh }: Props) => {
    const [action, setAction] = useState<'add' | 'edit'>('add');
    const [selected, setSelected] = useState<Maintenance>();

    const startEdit = (m: Maintenance) => { setAction('edit'); setSelected(m); };

    const handleDelete = async (m: Maintenance) => {
        await deleteMaintenance(m);
        await refresh();
    };
    const handleDone = () => {
        setAction('add');
        setSelected(undefined);
    };

    return (
        <Box>
            <Box sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {action === 'add' ? 'Agregar Mantenimiento' : 'Editar Mantenimiento'}
                    </Typography>
                </Box>

                <MaintenanceForm
                    propertyId={propertyId}
                    action={action}
                    item={selected}
                    refresh={refresh}
                    onDone={handleDone}
                />
            </Box>

            {/* — Listado debajo — */}
            <Box sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Mantenimientos ({items.length})
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <MaintenanceList
                        items={items}
                        onEditItem={startEdit}
                        onDeleteItem={handleDelete}
                    />
                )}
            </Box>
        </Box>
    );
};
