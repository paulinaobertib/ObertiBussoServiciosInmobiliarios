import { Box, List, ListItem, ListItemText, IconButton, Typography, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';
import ModalCRUD from './ModalCRUD';
import { adaptDataForList } from '../utils/adapter';
import { useCRUD } from '../context/CRUDContext';
import { translateCategory } from '../utils/translateCategory';
const ListGetCRUD = () => {
    const {
        selectedCategory,
        data,
        loading,
        selectedCategories,
        setSelectedCategoryItem,
        refreshData
    } = useCRUD();

    const [open, setOpen] = useState(false);
    const [action, setAction] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null); // Añadimos un estado para el item seleccionado

    const adaptedData = adaptDataForList(selectedCategory, data || []);

    const handleSelectItem = (item: any) => {
        if (!selectedCategory) return;

        setSelectedCategoryItem(selectedCategory, item);
        setSelectedItem(item); // Guardamos el item seleccionado
    };

    const handleOpenModal = (actionType: string, item?: any) => {
        setAction(actionType);
        if (item) {
            setSelectedCategoryItem(selectedCategory, item);
            setSelectedItem(item); // Pasamos el item seleccionado al estado
        }
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setAction(null);
        setSelectedItem(null); // Limpiamos el item cuando se cierra el modal
    };

    useEffect(() => {
        if (selectedCategory) {
            refreshData();
        }
    }, [selectedCategory]);

    if (!selectedCategory) return null;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#EF6C00', fontSize: { xs: '1rem', md: '1.3rem' } }}>
                    {`Listado de ${translateCategory(selectedCategory)}`}
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => handleOpenModal('Agregar')}
                    size="small"
                    sx={{
                        bgcolor: '#EF6C00',
                        '&:hover': { bgcolor: '#e65100' },
                        fontSize: { xs: '0.7rem', md: '0.8rem' },
                        padding: { xs: '6px 8px', md: '8px 16px' },
                        minWidth: { xs: '40px', sm: 'auto' },
                    }}
                >
                    Nuevo
                </Button>
            </Box>

            {loading ? (
                <Typography variant="body2">Cargando datos...</Typography>
            ) : adaptedData.length > 0 ? (
                <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0, maxHeight: { xs: '300px', md: '65vh' } }}>
                    <List disablePadding>
                        {adaptedData.map((item: any) => (
                            <ListItem
                                key={item.id}
                                onClick={() => handleSelectItem(item)} // Manejamos la selección
                                sx={{
                                    bgcolor: isSelected(item) ? '#ffe0b2' : 'inherit', // Aplica el color si está seleccionado
                                    border: 'none'
                                }}
                            >
                                <ListItemText
                                    primary={selectedCategory === 'neighborhood' ? `${item.name}, ${item.city || ''}` : item.name}
                                />
                                <IconButton onClick={() => handleOpenModal('Editar', item)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleOpenModal('Borrar', item)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ) : (
                <Typography variant="body2">No hay datos disponibles.</Typography>
            )}

            <ModalCRUD
                open={open}
                onClose={handleCloseModal}
                action={action}
                item={selectedItem} // Ahora pasamos el item directamente
            />
        </>
    );

    function isSelected(item: any) {
        if (!selectedCategory) return false;

        if (selectedCategory === 'amenity') {
            return selectedCategories.amenities?.some((a: any) => a.id === item.id);
        } else {
            return selectedCategories[selectedCategory as keyof typeof selectedCategories] === item.id;
        }
    }
};

export default ListGetCRUD;
