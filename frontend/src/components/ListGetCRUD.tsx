import { Box, List, ListItem, ListItemText, IconButton, Typography, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import ModalCRUD from './ModalCRUD';
import { adaptDataForList } from '../utils/adapter';
import { useCRUD } from '../context/CRUDContext';

const ListGetCRUD = () => {
    const { selectedCategory, data, loading, setSelectedItem, selectedItem } = useCRUD();
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState<string | null>(null);

    const adaptedData = adaptDataForList(selectedCategory, data || []);

    const handleOpenModal = (actionType: string, selectedItem?: any) => {
        setAction(actionType);
        setSelectedItem(selectedItem || null);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setAction(null);
        setSelectedItem(null);
    };

    if (!selectedCategory) return null;

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    Datos de {selectedCategory}:
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => handleOpenModal('Agregar')}
                >
                    Nuevo
                </Button>
            </Box>

            {loading ? (
                <Typography variant="body2">Cargando datos...</Typography>
            ) : adaptedData.length > 0 ? (
                <List sx={{ maxHeight: '75%', overflowY: 'auto' }}>
                    {adaptedData.map((selectedItem: any, index: number) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={selectedCategory === 'barrio' ? `${selectedItem.name}, ${selectedItem.city || ''}` : selectedItem.name}
                            />
                            <IconButton onClick={() => handleOpenModal('Editar', selectedItem)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleOpenModal('Borrar', selectedItem)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body2">No hay datos disponibles.</Typography>
            )}

            {/* Modal dinámico */}
            <ModalCRUD
                open={open}
                onClose={handleCloseModal}
                action={action}
                item={selectedItem}
            />
        </>
    );
};

export default ListGetCRUD;
