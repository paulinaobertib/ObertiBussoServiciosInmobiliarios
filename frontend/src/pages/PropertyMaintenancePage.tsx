import { useEffect, useState } from 'react';
import {
    Box, Typography, IconButton, Stack, Tooltip, Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { BasePage } from './BasePage';
import ModalItem from '../app/property/components/ModalItem';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';

export default function PropertyMaintenancePage() {
    const { id: idParam } = useParams();
    const propertyId = Number(idParam ?? 0);
    const navigate = useNavigate();

    const {
        maintenancesList,
        pickedItem, pickItem, refreshMaintenances,
    } = usePropertyCrud();

    const [modal, setModal] = useState<{ action: 'add' | 'edit' | 'delete'; formKey?: string; item?: any } | null>(null);

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
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>

                <Box sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#EF6C00' }}>
                        Mantenimientos
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        sx={{ bgcolor: '#EF6C00', ':hover': { bgcolor: '#e65100' } }}
                        onClick={() => setModal({ action: 'add', formKey: 'maintenance' })}
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
                    {maintenancesList.length === 0 ? (
                        <Typography color="text.secondary">
                            No hay mantenimientos registrados.
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
                                        bgcolor: '#fff',
                                        boxShadow: 1,
                                        position: 'relative',
                                    }}
                                >
                                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => setModal({ action: 'edit', formKey: 'maintenance', item: m })}>
                                                <EditIcon fontSize="small" sx={{ color: '#EF6C00' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" onClick={() => setModal({ action: 'delete', formKey: 'maintenance', item: m })}>
                                                <DeleteIcon fontSize="small" sx={{ color: '#EF6C00' }} />
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