// src/app/property/components/CategoryItems.tsx
import {
  Box, CircularProgress, IconButton, Typography, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePropertyCrud } from '../context/PropertiesContext';
import { translate } from '../utils/translate';
import ModalItem from './ModalItem';
import { getPropertyRowData } from './PropertyRowItems';
import { ROUTES } from '../../../lib';
import { buildRoute } from '../../../buildRoute';
import { useConfirmDialog } from '../utils/confirmDialog';
import { deleteProperty } from '../services/property.service';
import { useGlobalAlert } from '../context/AlertContext';

export default function CategoryItems() {
  const navigate = useNavigate();
  const {
    currentCategory: category,
    data, categoryLoading,
    selected, toggleSelect, refresh,
  } = usePropertyCrud();

  const [modal, setModal] = useState<{ action: 'add' | 'edit' | 'delete'; formKey?: string; item?: any } | null>(null);
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();

  if (!category) return null;

  const isSel = (id: number) => {
    if (category === 'amenity') return selected.amenities.includes(id);
    if (category === 'owner') return selected.owner === id;
    if (category === 'neighborhood') return selected.neighborhood === id;
    if (category === 'type') return selected.type === id;
    return false;
  };

  const isProperty = (category as unknown as string) === 'property';

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
      { label: 'Area Cubierta', key: 'hasCoveredArea' }
    ],
    amenity: [{ label: 'Nombre', key: 'name' }],
    property: [
      { label: 'Título', key: 'title' },
      { label: 'Moneda', key: 'currency' },
      { label: 'Precio', key: 'price' },
    ],
  };

  const columns = isProperty ? categoryFields.property : (categoryFields[category] ?? []);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        <Box sx={{
          px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexShrink: 0, bgcolor: '#FFF3E0',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF6C00' }}>
            {translate(category)}
          </Typography>

          <Tooltip title={`Agregar nuevo ${translate(category)}`}>
            <IconButton
              onClick={() =>
                isProperty
                  ? navigate(ROUTES.NEW_PROPERTY)
                  : setModal({ action: 'add', formKey: category })
              }
              sx={{ color: '#EF6C00' }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: `${columns.length > 0 ? `repeat(${columns.length},1fr)` : ''} auto`,
          alignItems: 'center', px: 2, py: 1,
          bgcolor: '#f9f9f9', fontSize: 14, fontWeight: 600,
          color: 'text.secondary',
        }}>
          {columns.map(c => (
            <Typography key={c.key}>{c.label}</Typography>
          ))}
          <Typography>Acciones</Typography>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1 }}>
          {categoryLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={28} sx={{ color: '#EF6C00' }} />
            </Box>
          ) : data && data.length ? (
            data.map((it: any) => {
              const itemData = {
                ...it,
                fullName: `${it.firstName ?? ''} ${it.lastName ?? ''}`.trim(),
              };

              const { columns: propCols, extraActions } =
                isProperty ? getPropertyRowData(itemData, navigate) : { columns: [], extraActions: [] };

              return (
                <Box
                  key={it.id}
                  onClick={isProperty ? undefined : () => toggleSelect(it.id)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `${columns.length > 0 ? `repeat(${columns.length},1fr)` : ''} auto`,
                    alignItems: 'center', p: 1, mb: 0.5, borderRadius: 1,
                    bgcolor: isSel(it.id) ? '#FFE0B2' : 'transparent',
                    transition: 'background-color .2s',
                    ...(isProperty ? {} : {
                      cursor: 'pointer',
                      '&:hover': { bgcolor: isSel(it.id) ? '#FFD699' : '#f5f5f5' }
                    }),
                  }}
                >
                  {isProperty ? (
                    <>
                      {propCols.map((v, i) => (
                        <Typography key={i}>{v ?? '-'}</Typography>
                      ))}

                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                        {extraActions.map(({ label, icon, onClick }, i) => (
                          <Tooltip key={i} title={label}>
                            <IconButton size="small" onClick={onClick} sx={{ color: '#EF6C00' }}>
                              {icon}
                            </IconButton>
                          </Tooltip>
                        ))}

                        {/* editar */}
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(buildRoute(ROUTES.EDIT_PROPERTY, { id: it.id }))}
                            sx={{ color: '#EF6C00' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() =>
                              ask(`¿Eliminar "${it.title}"?`, async () => {
                                try {
                                  await deleteProperty(it);
                                  showAlert('Propiedad eliminada', 'success');
                                  refresh();
                                } catch { showAlert('Error al eliminar', 'error'); }
                              })}
                            sx={{ color: '#EF6C00' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Ver propiedad">
                          <IconButton
                            size="small"
                            onClick={() => navigate(buildRoute(ROUTES.PROPERTY_DETAILS, { id: it.id }))}
                            sx={{ color: '#EF6C00' }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </>
                  ) : (
                    <>
                      {columns.map(col => {
                        const raw = itemData[col.key];
                        const val = typeof raw === 'boolean' ? (raw ? 'Sí' : 'No') : (raw ?? '-');
                        return <Typography key={col.key}>{val}</Typography>;
                      })}
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => setModal({ action: 'edit', formKey: category, item: it })} sx={{ color: '#EF6C00' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setModal({ action: 'delete', formKey: category, item: it })} sx={{ color: '#EF6C00' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Box>
              );
            })
          ) : (
            <Typography sx={{ mt: 2 }}>No hay datos disponibles.</Typography>
          )}
        </Box>

        <ModalItem info={modal} close={() => setModal(null)} />
      </Box>

      {DialogUI}
    </>
  );
}
