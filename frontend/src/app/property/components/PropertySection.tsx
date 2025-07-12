import { useState } from 'react';
import { Box, Typography, IconButton, CircularProgress, Tooltip, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { usePropertyPanel } from '../hooks/usePropertySection';
import { ModalItem, Info } from './ModalItem';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { useGlobalAlert } from '../../shared/context/AlertContext';
import { getRowActions, RowAction } from './ActionsRowItems';
import { SearchBar } from '../../shared/components/SearchBar';
import { getAllProperties, getPropertiesByText, deleteProperty, } from '../services/property.service';
import { ROUTES } from '../../../lib';

export const PropertyPanel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();
  const { data: properties, loading, onSearch, toggleSelect, isSelected } = usePropertyPanel();
  const [modal, setModal] = useState<Info | null>(null);

  // columnas fijas
  const columns = [
    { label: 'Título', key: 'title' },
    { label: 'Operación', key: 'operation' },
    { label: 'Precio', key: 'price' },
  ] as const;

  const gridCols = '2fr 0.7fr 1.3fr 75px';

  return (
    <>
      {/* Top bar: buscador + “+” */}
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
        <Box sx={{ width: { xs: '12rem', sm: '20rem' } }}>
          <SearchBar
            fetchAll={getAllProperties}
            fetchByText={getPropertiesByText}
            onSearch={onSearch}
            placeholder="Buscar propiedad"
            debounceMs={400}
          />
        </Box>
        <IconButton onClick={() => navigate(ROUTES.NEW_PROPERTY)}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Encabezados (desktop) */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns: gridCols,
          px: 2,
          py: 1,
        }}
      >
        {columns.map(col => (
          <Typography key={col.key} fontWeight={700}>
            {col.label}
          </Typography>
        ))}
        <Typography fontWeight={700}>Acciones</Typography>
      </Box>

      {/* Filas */}
      <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : properties.length > 0 ? (
          properties.map(prop => {
            const actions: RowAction[] = getRowActions(
              'property',
              prop,
              navigate,
              setModal,
              ask,
              deleteProperty,
              showAlert
            );
            const sel = isSelected(prop.id);

            return (
              <Box
                key={prop.id}
                onClick={() => toggleSelect(prop.id)}
                sx={{
                  display: { xs: 'block', sm: 'grid' },
                  gridTemplateColumns: gridCols,
                  alignItems: 'center',
                  py: 1,
                  mb: 0.5,
                  bgcolor: sel ? theme.palette.action.selected : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: theme.palette.action.hover },
                }}
              >
                {/* móvil: etiquetas + valores */}
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  {columns.map(col => {
                    const raw = (prop as any)[col.key];
                    let val: string;
                    if (col.key === 'price') {
                      const curr = prop.currency ?? '';
                      val = raw != null ? `${curr} ${raw}` : '—';
                    } else {
                      val = typeof raw === 'boolean' ? raw ? 'Sí' : 'No' : raw ?? '—';
                    }
                    return (
                      <Box
                        key={col.key}
                        sx={{ display: 'flex', gap: 1, mb: 0.5 }}
                      >
                        <Typography fontWeight={600}>
                          {col.label}:
                        </Typography>
                        <Typography>{val}</Typography>
                      </Box>
                    );
                  })}
                </Box>

                {/* desktop: solo valores */}
                {columns.map(col => {
                  const raw = (prop as any)[col.key];
                  let val: string;
                  if (col.key === 'price') {
                    const curr = prop.currency ?? '';
                    val = raw != null ? `${curr} ${raw}` : '—';
                  } else {
                    val = typeof raw === 'boolean' ? raw ? 'Sí' : 'No' : raw ?? '—';
                  }
                  return (
                    <Typography
                      key={col.key}
                      sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                      {val}
                    </Typography>
                  );
                })}

                {/* acciones */}
                <Box
                  onClick={e => e.stopPropagation()}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'flex-end',
                  }}
                >
                  {actions.map((a, i) => (
                    <Tooltip key={i} title={a.label}>
                      <IconButton size="small" onClick={a.onClick}>
                        {a.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ mt: 2 }}>
            No hay propiedades disponibles.
          </Typography>
        )}
      </Box>

      {/* modal & dialog */}
      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </>
  );
};
