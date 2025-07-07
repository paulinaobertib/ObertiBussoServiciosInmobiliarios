import { useEffect, useState } from 'react';
import {
    Box, Typography, IconButton, Stack, Tooltip, Button,
    CircularProgress,
    useTheme,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { BasePage } from './BasePage';
import { ModalItem, Info } from '../app/property/components/ModalItem';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import { MaintenanceForm } from '../app/property/components/forms/MaintenanceForm';

export default function PropertyMaintenancePage() {
    const { id: idParam } = useParams();
    const theme = useTheme();
    const propertyId = Number(idParam ?? 0);
    const navigate = useNavigate();
    const [modal, setModal] = useState<Info | null>(null);

    const {
        maintenancesList, loading,
        pickedItem, pickItem, refreshMaintenances,
    } = usePropertyCrud();


    useEffect(() => {
        if (!propertyId) {
            navigate('/');
            return;
        }
        if (
            pickedItem?.type !== 'property' ||
            pickedItem.value?.id !== propertyId
        ) {
            pickItem('property', { id: propertyId } as any);
        }
    }, [propertyId, pickedItem, pickItem, navigate]);


    return (
        <BasePage>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -2 }}>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                    VOLVER
                </Button>
            </Box>
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>

                <Box sx={{
                    px: 3,
                    py: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        Mantenimientos
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() =>
                            setModal({
                                title: 'Agregar Mantenimiento',
                                Component: MaintenanceForm,
                                componentProps: { action: 'add' as const, onDone: () => { setModal(null); refreshMaintenances(); } }
                            })
                        }
                    >
                        Agregar
                    </Button>
                </Box>

                <Box sx={{
                    px: 3,
                    py: 2,
                    flexGrow: 1,
                    overflowY: 'auto',
                }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : maintenancesList.length === 0 ? (
                        <Typography color="text.secondary">
                            No hay comentarios registrados.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {maintenancesList.map(m => (
                                <Box
                                    key={m.date + m.title}
                                    sx={{
                                        border: '1px solid #ddd',
                                        borderRadius: 2,
                                        p: 2,
                                        bgcolor: 'white',
                                        boxShadow: 1,
                                        position: 'relative',
                                    }}
                                >
                                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                                        <Tooltip title="Editar">
                                            <IconButton
                                                onClick={() =>
                                                    setModal({
                                                        title: 'Editar Mantenimiento',
                                                        Component: MaintenanceForm,
                                                        componentProps: { action: 'edit' as const, item: m, onDone: () => { setModal(null); refreshMaintenances(); } }
                                                    })
                                                }
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                onClick={() =>
                                                    setModal({
                                                        title: 'Eliminar Mantenimiento',
                                                        Component: MaintenanceForm,
                                                        componentProps: { action: 'delete' as const, item: m, onDone: () => { setModal(null); refreshMaintenances(); } }
                                                    })
                                                }
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <Typography sx={{ fontWeight: 600 }}>{m.title}</Typography>
                                    <Typography sx={{ fontSize: 14, color: 'text.secondary', whiteSpace: 'pre-line' }}>
                                        {m.description}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, mt: .5, color: 'text.disabled' }}>
                                        {new Date(m.date).toLocaleString()}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>

                <ModalItem
                    info={modal}
                    close={async () => { setModal(null); await refreshMaintenances(); }}


                />
            </Box>
        </BasePage>
    );
}