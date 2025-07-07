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
import { CommentForm } from '../app/property/components/forms/CommentForm';

export default function PropertyMaintenancePage() {
    const { id: idParam } = useParams();
    const propertyId = Number(idParam ?? 0);
    const navigate = useNavigate();
    const theme = useTheme();

    const [modal, setModal] = useState<Info | null>(null);

    const {
        commentsList, loading,
        pickedItem, pickItem, refreshComments,
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
                        Comentarios Internos
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        sx={{ bgcolor: theme.palette.secondary.main, ':hover': { bgcolor: theme.palette.primary.main } }}
                        onClick={() =>
                            setModal({
                                title: 'Agregar Comentario',
                                Component: CommentForm,
                                componentProps: { action: 'add' as const, onDone: () => { setModal(null); refreshComments(); } }
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
                    ) : commentsList.length === 0 ? (
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
                                                        title: 'Editar Comentario',
                                                        Component: CommentForm,
                                                        componentProps: { action: 'edit' as const, item: c, onDone: () => { setModal(null); refreshComments(); } }
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
                                                        title: 'Eliminar Comentario',
                                                        Component: CommentForm,
                                                        componentProps: { action: 'delete' as const, item: c, onDone: () => { setModal(null); refreshComments(); } }
                                                    })
                                                }
                                            >
                                                <DeleteIcon />
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