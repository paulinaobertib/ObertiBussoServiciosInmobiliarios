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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { usePropertyCrud, Category } from '../context/PropertiesContext';
import { translate } from '../utils/translate';
import ModalItem, { Info } from '../components/ModalItem';
import SearchBarOwner from './SearchBarOwners';
import { Owner } from '../types/owner';
import { useConfirmDialog } from '../utils/ConfirmDialog';
import { useGlobalAlert } from '../../shared/context/AlertContext';

// Formularios para cada categoría
import AmenityForm from '../components/forms/AmenityForm';
import OwnerForm from '../components/forms/OwnerForm';
import TypeForm from '../components/forms/TypeForm';
import NeighborhoodForm from '../components/forms/NeighborhoodForm';
import StatusForm from '../components/forms/StatusForm';

const formRegistry = {
  amenity: AmenityForm,
  owner: OwnerForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
  status: StatusForm,
} as const;

interface Props {
  category: Category;
}

export default function CategoryPanel({ category }: Props) {
  const theme = useTheme();
  const { pickItem, data: rawData, loading, selected, toggleSelect } = usePropertyCrud();
  const { DialogUI } = useConfirmDialog();
  useGlobalAlert();

  const [modal, setModal] = useState<Info | null>(null);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);

  // Sincronizar categoría
  useEffect(() => {
    pickItem('category', category);
  }, [category]);

  // Datos (propietarios filtrados o todo)
  const data = category === 'owner'
    ? (filteredOwners as any[])
    : rawData ?? [];

  // Inicializar owners
  useEffect(() => {
    if (category === 'owner') {
      setFilteredOwners((rawData as Owner[]) ?? []);
    }
  }, [rawData, category]);

  // ¿Está seleccionado?
  const isSel = (id: number) => {
    if (category === 'amenity') return selected.amenities.includes(id);
    if (category === 'owner') return selected.owner === id;
    if (category === 'neighborhood') return selected.neighborhood === id;
    if (category === 'type') return selected.type === id;
    return false;
  };

  const handleRowClick = (id: number) => {
    toggleSelect(id);
  };

  // Definición de columnas por categoría
  const categoryFields: Record<Category, { label: string; key: string }[]> = {
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
    amenity: [{ label: 'Nombre', key: 'name' }],
  };
  const columns = categoryFields[category];
  const ACTIONS_COLUMN_WIDTH = 75;
  const gridTemplate = `${columns.map(() => '1fr').join(' ')} ${ACTIONS_COLUMN_WIDTH}px`;

  return (
    <>
      {/* ─── Header ─────────────────────────────── */}
      <Box
        sx={{
          px: 2, py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: theme.palette.primary.main }}
        >
          {translate(category)}
        </Typography>

        {category === 'owner' && (
          <SearchBarOwner
            aria-label="Buscar propietario"
            onSearch={setFilteredOwners}
          />
        )}

        <Tooltip title={`Agregar nuevo ${translate(category)}`}>
          <IconButton
            onClick={() =>
              setModal({
                title: `Crear ${translate(category)}`,
                Component: formRegistry[category],
                componentProps: { action: 'add' as const },
              })
            }
            sx={{ color: theme.palette.primary.main }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {/* Cabecera (solo en sm+) */}
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data.length ? (
          data.map((it: any) => {
            // Si es owner, construyo fullName
            const itemData =
              category === 'owner'
                ? {
                  ...(it as Owner),
                  fullName: `${it.firstName ?? ''} ${it.lastName ?? ''}`.trim(),
                }
                : it;

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
                  '&:hover': { borderColor: theme.palette.tertiary.main },
                }}
              >
                {/* Celdas de datos */}
                {columns.map(col => {
                  const raw = (itemData as any)[col.key];
                  const val =
                    typeof raw === 'boolean' ? (raw ? 'Sí' : 'No') : raw ?? '-';
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
                  {/* Editar */}
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setModal({
                          title: `Editar ${translate(category)}`,
                          Component: formRegistry[category],
                          componentProps: { action: 'edit' as const, item: it },
                        })
                      }
                      sx={{ color: theme.palette.secondary.main }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Eliminar */}
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setModal({
                          title: `Eliminar ${translate(category)}`,
                          Component: formRegistry[category],
                          componentProps: { action: 'delete' as const, item: it },
                        })
                      }
                      sx={{ color: theme.palette.secondary.main }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ mt: 2 }}>No hay datos disponibles.</Typography>
        )}
      </Box>

      {/* Modal genérico y diálogo de confirmación */}
      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </>
  );
}
