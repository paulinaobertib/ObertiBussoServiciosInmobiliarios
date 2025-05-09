import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { usePropertyCrud } from '../context/PropertyCrudContext';
import { translate } from '../utils/translate';
import ModalItem from './ModalItem';


export default function CategoryItems() {
  const { category, data, categoryLoading, selected, toggleSelect } = usePropertyCrud();
  const [modal, setModal] = useState<{ action: 'add' | 'edit' | 'delete'; item?: any } | null>(null);
  if (!category) return null;

  const isSel = (id: number) =>
    category === 'amenity' ? selected.amenities.includes(id) : selected[category] === id;

  const categoryFields: Record<string, { label: string; key: string }[]> = {
    owner: [
      { label: 'Nombre Completo', key: 'fullName' },
      { label: 'Email', key: 'mail' },
      { label: 'Teléfono', key: 'phone' },
    ],
    neighborhood: [
      { label: 'Nombre', key: 'name' },
      { label: 'Ciudad', key: 'city' },
      { label: 'Tipo de Barrio', key: 'type' }
    ],
    type: [
      { label: 'Nombre', key: 'name' },
      { label: 'Ambientes', key: 'hasRooms' },
      { label: 'Habitaciones', key: 'hasBedrooms' },
      { label: 'Baños', key: 'hasBathrooms' },
    ],
    amenity: [
      { label: 'Nombre', key: 'name' },
    ],
  };

  const columns = categoryFields[category] || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Título y botón agregar */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: '#FFF3E0',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00' }}>
          {translate(category)}
        </Typography>
        <Tooltip title={`Agregar nuevo ${translate(category)}`}>
          <IconButton onClick={() => setModal({ action: 'add' })}>
            <AddIcon sx={{ color: '#EF6C00' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Encabezado de tabla */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `${columns.length > 0 ? `repeat(${columns.length}, 1fr)` : ''} auto`,
          alignItems: 'center',
          px: 2,
          py: 1,
          bgcolor: '#f9f9f9',
          borderBottom: '1px solid #eee',
          fontSize: 14,
          fontWeight: 500,
          color: 'text.secondary',
          flexShrink: 0,
        }}
      >
        {columns.map((col) => (
          <span key={col.key}>{col.label}</span>
        ))}
        <span>Acciones</span>
      </Box>

      {/* Lista scrollable */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1 }}>
        {categoryLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data && data.length ? (
          data.map((it: any) => {
            const itemData = {
              ...it,
              fullName: `${it.firstName ?? ''} ${it.lastName ?? ''}`.trim(),
            };

            return (
              <Box
                key={it.id}
                onClick={() => toggleSelect(it.id)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `${columns.length > 0 ? `repeat(${columns.length}, 1fr)` : ''} auto`,
                  alignItems: 'center',
                  p: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: isSel(it.id) ? '#FFE0B2' : 'transparent',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isSel(it.id) ? '#FFD699' : '#f5f5f5',
                  },
                }}
              >
                {columns.map((col) => {
                  const value = itemData[col.key];
                  const displayValue =
                    typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value ?? '-';

                  return (
                    <Typography key={col.key} sx={{ fontSize: 14 }}>
                      {displayValue}
                    </Typography>
                  );
                })}

                <Box
                  sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton
                    size="small"
                    onClick={() => setModal({ action: 'edit', item: it })}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setModal({ action: 'delete', item: it })}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ mt: 2, fontSize: 14 }}>No hay datos disponibles.</Typography>
        )}
      </Box>

      <ModalItem info={modal} close={() => setModal(null)} />
    </Box>
  );
}