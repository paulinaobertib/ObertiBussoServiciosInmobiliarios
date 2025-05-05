import {
    Box, CircularProgress, IconButton, List, ListItem, ListItemText, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

import { usePropertyCrud } from '../context/PropertyCrudContext';
import { getLabel } from '../utils/getLabel';
import { translate } from '../utils/translate';
import ModalItem from './ModalItem';

export default function CategoryItems() {
    const { category, data, categoryLoading, selected, toggleSelect } = usePropertyCrud();
    const [modal, setModal] = useState<{ action: 'add' | 'edit' | 'delete'; item?: any } | null>(null);
    if (!category) return null;

    const isSel = (id: number) =>
        category === 'amenity' ? selected.amenities.includes(id) : selected[category] === id;

    return (
        <>
            {/* cabecera */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#EF6C00' }}>
                    {translate(category)}
                </Typography>
                <IconButton onClick={() => setModal({ action: 'add' })}><AddIcon /></IconButton>
            </Box>

            {/* lista con scroll propio */}
            {categoryLoading ? <CircularProgress /> : data && data.length ? (
                <List disablePadding
                    sx={{ minHeight: 0, maxHeight: '80%', overflowY: 'auto' }}>
                    {data.map((it: any) => (
                        <ListItem key={it.id}
                            onClick={() => toggleSelect(it.id)}
                            sx={{
                                bgcolor: isSel(it.id) ? '#ffe0b2' : 'transparent',
                                '&:hover': { cursor: 'pointer' },
                            }}
                            secondaryAction={
                                <>
                                    <IconButton onClick={() => setModal({ action: 'edit', item: it })}><EditIcon /></IconButton>
                                    <IconButton onClick={() => setModal({ action: 'delete', item: it })}><DeleteIcon /></IconButton>
                                </>
                            }
                        >
                            <ListItemText primary={getLabel(category, it.id, data)} />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography>No hay datos.</Typography>
            )}

            <ModalItem info={modal} close={() => setModal(null)} />
        </>
    );
}
