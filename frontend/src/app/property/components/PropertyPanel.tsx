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
import { useConfirmDialog } from '../utils/ConfirmDialog';
import { deleteProperty } from '../services/property.service';
import { useGlobalAlert } from '../../shared/context/AlertContext';
import { getRowActions, RowAction } from './ActionsRowItems';

export default function PropertyPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    propertiesList,
    loading,
    refreshProperties,
  } = usePropertyCrud();
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();

  const [modal, setModal] = useState<Info | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // cargo al montar
  useEffect(() => {
    refreshProperties();
  }, [refreshProperties]);

  // columnas "Título", "Precio"
  const propertyFields = [
    { label: 'Título', key: 'title' },
    { label: 'Precio', key: 'price' },
  ];

  const columns = propertyFields;
  const ACTIONS_COLUMN_WIDTH = 75;
  const gridTemplate = `${columns.map(() => '1fr').join(' ')} ${ACTIONS_COLUMN_WIDTH}px`;

  const handleRowClick = (id: number) =>
    setSelectedId(prev => (prev === id ? null : id));

  const isSel = (id: number) => selectedId === id;

  return (
    <>
      {/* Header */}
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
          {translate('property')}
        </Typography>
        <Tooltip title="Agregar nueva propiedad">
          <IconButton
            onClick={() => setModal({ action: 'add', formKey: 'property' })}
            sx={{ color: theme.palette.primary.main }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Listado */}
      <Box sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
        {/* Cabecera cols */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'grid' },
            gridTemplate,
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
        ) : propertiesList.length ? (
          propertiesList.map((it: any) => {
            const rowActions: RowAction[] = getRowActions(
              'property',
              it,
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
                  gridTemplate,
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
                {columns.map(col => {
                  const raw = (it as any)[col.key];
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

                {/* Acciones */}
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
          <Typography sx={{ mt: 2 }}>No hay propiedades disponibles.</Typography>
        )}
      </Box>

      {/* Modal */}
      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </>
  );
}
