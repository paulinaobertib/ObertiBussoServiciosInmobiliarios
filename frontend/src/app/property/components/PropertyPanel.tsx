import { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress, useTheme, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { usePropertyCrud } from '../context/PropertiesContext';
import { ModalItem, Info } from './ModalItem';
import { useConfirmDialog } from '../utils/ConfirmDialog';
import { deleteProperty, getAllProperties, getPropertiesByText } from '../services/property.service';
import { useGlobalAlert } from '../../shared/context/AlertContext';
import { getRowActions, RowAction } from './ActionsRowItems';
import { SearchBar } from '../../shared/components/SearchBar';
import { ROUTES } from '../../../lib';

export const PropertyPanel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { propertiesList, loading, refreshProperties } = usePropertyCrud();
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();
  const [modal, setModal] = useState<Info | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);

  // sincronizar lista
  useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  // cuando cambian propiedades
  useEffect(() => {
    setFilteredProperties(propertiesList);
  }, [propertiesList]);

  // definir columnas
  const propertyFields = [
    { label: 'Título', key: 'title' },
    { label: 'Operación', key: 'operation' },
    { label: 'Precio', key: 'price' },
  ];
  const columns = propertyFields;
  const gridTemplateColumns = '2fr 0.7fr 1.3fr 75px'; // aquí ajustas anchos relativos

  const toggleSelect = (id: number) =>
    setSelectedId((prev) => (prev === id ? null : id));
  const isSel = (id: number) => selectedId === id;


  return (
    <>
      {/* ─── Top bar: SearchBar + “+” a la derecha ─── */}
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
            onSearch={(res) => setFilteredProperties(res)}
            placeholder="Buscar propiedad"
            debounceMs={400}
          />
        </Box>
        <IconButton
          onClick={() => navigate(ROUTES.NEW_PROPERTY)}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* ─── Encabezados (desktop) ─── */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns,
          px: 2,
          py: 1,
        }}
      >
        {columns.map((col) => (
          <Typography key={col.key} fontWeight={700}>
            {col.label}
          </Typography>
        ))}
        <Typography fontWeight={700}>Acciones</Typography>
      </Box>

      {/* ─── Filas ─── */}
      <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : filteredProperties.length ? (
          filteredProperties.map((it: any) => {
            const rowActions: RowAction[] = getRowActions(
              'property',
              it,
              navigate,
              setModal,
              ask,
              deleteProperty,
              showAlert
            );

            const sel = isSel(it.id);

            return (
              <Box
                key={it.id}
                onClick={() => toggleSelect(it.id)}
                sx={{
                  display: { xs: 'block', sm: 'grid' },
                  gridTemplateColumns,
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
                  {columns.map((col) => {
                    const raw = (it as any)[col.key];
                    let val: string;
                    if (col.key === 'price') {
                      const curr = (it as any).currency ?? '';
                      val = raw != null ? `${curr} ${raw}` : '—';
                    } else if (typeof raw === 'boolean') {
                      val = raw ? 'Sí' : 'No';
                    } else {
                      val = raw ?? '—';
                    }
                    return (
                      <Box key={col.key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                        <Typography fontWeight={600}>{col.label}:</Typography>
                        <Typography>{val}</Typography>
                      </Box>
                    );
                  })}
                </Box>

                {/* desktop: solo valores */}
                {columns.map((col) => {
                  const raw = (it as any)[col.key];
                  let val: string;
                  if (col.key === 'price') {
                    const curr = (it as any).currency ?? '';
                    val = raw != null ? `${curr} ${raw}` : '—';
                  } else if (typeof raw === 'boolean') {
                    val = raw ? 'Sí' : 'No';
                  } else {
                    val = raw ?? '—';
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
                  onClick={(e) => e.stopPropagation()}
                  sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}
                >
                  {rowActions.map((a, i) => (
                    <Tooltip key={i} title={a.label}>
                      <IconButton
                        size="small"
                        onClick={a.onClick}
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
          <Typography sx={{ mt: 2 }}>No hay propiedades disponibles.</Typography>
        )}
      </Box>

      {/* modal */}
      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </>
  );
};
