import { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { usePropertyCrud } from '../context/PropertiesContext';
import { translate } from '../utils/translate';
import ModalItem, { Info } from './ModalItem';
import SearchBarOwner from './SearchBarOwners';
import { Owner } from '../types/owner';
import { useConfirmDialog } from '../utils/ConfirmDialog';
import { deleteProperty } from '../services/property.service';
import { useGlobalAlert } from '../context/AlertContext';
import { getRowActions, RowAction } from './ActionsRowItems';
import { ROUTES } from '../../../lib';

export default function CategoryItems() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    currentCategory: category,
    data: rawData,
    loading,
    selected,
    toggleSelect,
  } = usePropertyCrud();
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();

  const [modal, setModal] = useState<Info | null>(null);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const isProperty = category === 'property';
  const data = category === 'owner' ? filteredOwners : rawData ?? [];

  // Para mantener la lógica original de multi‐select only en amenity, single‐select en las demás
  const isSel = (id: number) => {
    if (category === 'amenity') return selected.amenities.includes(id);
    if (category === 'owner') return selected.owner === id;
    if (category === 'neighborhood') return selected.neighborhood === id;
    if (category === 'type') return selected.type === id;
    if (isProperty) return selectedPropertyId === id;
    return false;
  };

  useEffect(() => {
    if (category === 'owner') {
      setFilteredOwners((rawData as Owner[]) ?? []);
    }
  }, [rawData, category]);

  if (!category) return null;

  const handleRowClick = (id: number) => {
    if (category === 'amenity') {
      // multi-select
      toggleSelect(id);
    } else if (isProperty) {
      // single-select
      setSelectedPropertyId(prev => (prev === id ? null : id));
    } else {
      // single-select para otras categorías
      toggleSelect(id);
    }
  };
  const categoryFields: Record<string, { label: string; key: string }[]> = {
    owner: [
      { label: 'Nombre Completo', key: 'fullName' },
      { label: 'Email', key: 'mail' },
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
      { label: 'Habitaciones', key: 'hasBedrooms' },
      { label: 'Baños', key: 'hasBathrooms' },
      { label: 'Área Cubierta', key: 'hasCoveredArea' },
    ],
    amenity: [
      { label: 'Nombre', key: 'name' },
    ],
    property: [
      { label: 'Título', key: 'title' },
      { label: 'Precio', key: 'price' },
    ],
  };
  const columns = categoryFields[category] ?? [];

  // 1fr por cada campo + ancho fijo para acciones
  const ACTIONS_COLUMN_WIDTH = 75;
  const gridTemplate = `${columns.map(() => '1fr').join(' ')} ${ACTIONS_COLUMN_WIDTH}px`;

  return (
    <>
      {/* Header principal */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          {translate(category)}
        </Typography>
        {category === 'owner' && (
          <SearchBarOwner aria-label="Buscar propietario" onSearch={setFilteredOwners} />
        )}
        <Tooltip title={`Agregar nuevo ${translate(category)}`}>
          <IconButton
            onClick={() =>
              isProperty
                ? navigate(ROUTES.NEW_PROPERTY)
                : setModal({ action: 'add', formKey: category })
            }
            sx={{ color: theme.palette.primary.main }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Sub-header + filas dentro de un mismo wrapper con px uniforme */}
      <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {/* Sub-header (solo en desktop) */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'grid' },
            gridTemplateColumns: gridTemplate,
            alignItems: 'center',
            py: 1,
            fontSize: 14,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {columns.map(col => (
            <Typography key={col.key}>{col.label}</Typography>
          ))}
          <Typography>Acciones</Typography>
        </Box>

        {/* Filas */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data.length ? (
          data.map((it: any) => {
            const itemData = category === 'owner'
              ? {
                ...(it as Owner),
                fullName: `${it.firstName ?? ''} ${it.lastName ?? ''}`.trim(),
              }
              : it;

            const rowActions: RowAction[] = getRowActions(
              category,
              itemData,
              navigate,
              setModal,
              ask,
              deleteProperty,
              showAlert
            );

            return (
              <Box
                key={it.id}
                onClick={() => handleRowClick(it.id)}

                sx={{
                  display: { xs: 'block', sm: 'grid' },
                  gridTemplateColumns: gridTemplate,
                  alignItems: 'center',
                  py: 1,
                  mb: 1,
                  columnGap: 2,
                  bgcolor: isSel(it.id)
                    ? theme.palette.quaternary.main
                    : 'transparent',
                  border: '1px solid white',
                  borderRadius: 2,
                  transition: 'background-color .2s, border-color .2s',
                  '&:hover': {
                    borderColor: theme.palette.tertiary.main,
                  },
                }}
              >
                {/* Celdas de datos */}
                {columns.map(col => {
                  const raw = (itemData as any)[col.key];
                  const val = typeof raw === 'boolean'
                    ? (raw ? 'Sí' : 'No')
                    : raw ?? '-';

                  return (
                    <Box
                      key={col.key}
                      sx={{
                        display: { xs: 'flex', sm: 'block' },
                        gap: 1,
                        alignItems: 'baseline',
                        mb: { xs: 0.5, sm: 0 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          display: { xs: 'inline', sm: 'none' },
                          minWidth: 90,
                        }}
                      >
                        {col.label}:
                      </Typography>
                      <Typography sx={{ display: 'inline' }}>{val}</Typography>
                    </Box>
                  );
                })}

                {/* Botones de acción */}
                <Box
                  onClick={e => e.stopPropagation()}
                  sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
                >
                  {rowActions.map((a, i) => (
                    <Tooltip key={i} title={a.label}>
                      <IconButton
                        size="small"
                        onClick={a.onClick}
                        sx={{ color: theme.palette.secondary.main }}
                      >
                        {a.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ mt: 2 }}>No hay datos disponibles.</Typography>
        )}
      </Box>

      {/* Modal genérico */}
      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </>
  );
}
