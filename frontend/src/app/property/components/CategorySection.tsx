import { useState } from 'react';
import {
  Box, Typography, IconButton, CircularProgress, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { translate } from '../utils/translate';
import { ModalItem, Info } from './ModalItem';
import { SearchBar } from '../../shared/components/SearchBar';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { useCategoryPanel } from '../hooks/useCategorySection';
import { Category } from '../context/PropertiesContext';
import { getAllOwners, getOwnersByText } from '../services/owner.service';
import { AmenityForm } from './forms/AmenityForm';
import { NeighborhoodForm } from './forms/NeighborhoodForm';
import { OwnerForm } from './forms/OwnerForm';
import { StatusForm } from './forms/StatusForm';
import { TypeForm } from './forms/TypeForm';

interface Props {
  category: Category;
}

const formRegistry = {
  amenity: AmenityForm,
  owner: OwnerForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
  status: StatusForm,
} as const;

export const CategoryPanel = ({ category }: Props) => {
  const theme = useTheme();
  const { DialogUI } = useConfirmDialog();
  const {
    data,
    loading,
    toggleSelect,
    isSelected,
    searchResults,
  } = useCategoryPanel(category);

  const [modal, setModal] = useState<Info | null>(null);

  // Definición estática de columnas por categoría
  const columnsMap: Record<Category, { label: string; key: string }[]> = {
    owner: [
      { label: 'Nombre Completo', key: 'fullName' },
      { label: 'Email', key: 'email' },
      { label: 'Teléfono', key: 'phone' },
    ],
    neighborhood: [
      { label: 'Nombre', key: 'name' },
      { label: 'Ciudad', key: 'city' },
      { label: 'Tipo de Barrio', key: 'type' },
    ],
    type: [
      { label: 'Nombre', key: 'name' },
      { label: 'Ambientes', key: 'hasRooms' },
      { label: 'Dormitorios', key: 'hasBedrooms' },
      { label: 'Baños', key: 'hasBathrooms' },
      { label: 'Área Cubierta', key: 'hasCoveredArea' },
    ],
    amenity: [
      { label: 'Nombre', key: 'name' },
    ],
  };

  const columns = columnsMap[category] || [];
  const gridColumns = `${columns.map(() => '1fr').join(' ')} 75px`;

  return (
    <>
      {/* Top bar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {category === 'owner' && (
          <Box sx={{ mr: 1, width: { xs: '12rem', sm: '20rem' } }}>
            <SearchBar
              fetchAll={getAllOwners}
              fetchByText={getOwnersByText}
              onSearch={searchResults}
              placeholder="Buscar propietario"
              debounceMs={400}
            />
          </Box>
        )}
        <IconButton
          onClick={() =>
            setModal({
              title: `Crear ${translate(category)}`,
              Component: formRegistry[category],
              componentProps: { action: 'add' as const },
            })
          }
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Headers (desktop) */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns: gridColumns,
          px: 2,
          py: 1,
        }}
      >
        {columns.map(c => (
          <Typography key={c.key} fontWeight={700}>
            {c.label}
          </Typography>
        ))}
        <Typography align="right" fontWeight={700}>
          Acciones
        </Typography>
      </Box>

      {/* Filas */}
      <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data.length > 0 ? (
          data.map((item: any) => (
            <Box
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              sx={{
                display: { xs: 'block', sm: 'grid' },
                gridTemplateColumns: gridColumns,
                alignItems: 'center',
                py: 1,
                mb: 0.5,
                bgcolor: isSelected(item.id)
                  ? theme.palette.action.selected
                  : 'transparent',
                cursor: 'pointer',
                '&:hover': { bgcolor: theme.palette.action.hover },
              }}
            >
              {/* Mobile: etiqueta + valor */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {columns.map(c => (
                  <Box key={c.key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <Typography fontWeight={600}>{c.label}:</Typography>
                    <Typography>
                      {typeof item[c.key] === 'boolean'
                        ? item[c.key] ? 'Sí' : 'No'
                        : item[c.key] ?? '—'}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Desktop: solo valor */}
              {columns.map(c => (
                <Typography
                  key={c.key}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  {typeof item[c.key] === 'boolean'
                    ? item[c.key] ? 'Sí' : 'No'
                    : item[c.key] ?? '—'}
                </Typography>
              ))}

              {/* Acciones */}
              <Box
                onClick={e => e.stopPropagation()}
                sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    setModal({
                      title: `Editar ${translate(category)}`,
                      Component: formRegistry[category],
                      componentProps: { action: 'edit' as const, item },
                    })
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() =>
                    setModal({
                      title: `Eliminar ${translate(category)}`,
                      Component: formRegistry[category],
                      componentProps: { action: 'delete' as const, item },
                    })
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))
        ) : (
          <Typography sx={{ mt: 2 }}>No hay datos disponibles.</Typography>
        )}
      </Box>

      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </>
  );
};
