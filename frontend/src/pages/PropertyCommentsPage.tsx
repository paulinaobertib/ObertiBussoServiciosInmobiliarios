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

    const [modal, setModal] = useState<{ action: 'add' | 'edit' | 'delete'; formKey?: string; item?: any } | null>(null);

    const {
        commentsList,
        pickedItem, pickItem, refreshComments,
    } = usePropertyCrud();

    const handleBack = () => {
        navigate('/panel'); 
    };

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
        <BasePage maxWidth={false}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -2 }}>
                <Button variant="contained" color="primary" onClick={handleBack}>
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
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#EF6C00' }}>
                        Comentarios Internos
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        sx={{ bgcolor: '#EF6C00', ':hover': { bgcolor: '#e65100' } }}
                        onClick={() => setModal({ action: 'add', formKey: 'comment' })}
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
                    {commentsList.length === 0 ? (
                        <Typography color="text.secondary">
                            No hay comentarios registrados.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {commentsList.map(c => (
                                <Box
                                    key={c.id}
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
                                            <IconButton size="small" onClick={() => setModal({ action: 'edit', formKey: 'comment', item: c })}>
                                                <EditIcon fontSize="small" sx={{ color: '#EF6C00' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" onClick={() => setModal({ action: 'delete', formKey: 'comment', item: c })}>
                                                <DeleteIcon fontSize="small" sx={{ color: '#EF6C00' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <Typography sx={{ fontSize: 14, whiteSpace: 'pre-line' }}>
                                        {c.description}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>

                <ModalItem
                    info={modal}
                    close={async () => { setModal(null); await refreshComments(); }}
                />
            </Box>
        </BasePage>
    );
}