import { useState } from 'react';
import { Box, Typography, IconButton, useTheme, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { usePropertyPanel } from '../../hooks/usePropertySection';
import { ModalItem, Info } from '../categories/CategoryModal';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useGlobalAlert } from '../../../shared/context/AlertContext';
import { SearchBar } from '../../../shared/components/SearchBar';
import { getAllProperties, getPropertiesByText, deleteProperty } from '../../services/property.service';
import { getRowActions, RowAction } from '../ActionsRowItems';
import { ROUTES } from '../../../../lib';
import { PropertyList } from './PropertyList';

interface ColumnDef { label: string; key: string }
interface Props {
  toggleSelect?: (id: number) => void;
  isSelected?: (id: number) => boolean;
}

export const PropertySection = ({ toggleSelect: externalToggle, isSelected: externalIsSel, }: Props) => {

  const theme = useTheme();
  const navigate = useNavigate();
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();
  const { data: properties, loading, onSearch, toggleSelect, isSelected, } = usePropertyPanel();
  const selectFn = externalToggle ?? toggleSelect;
  const isSelFn = externalIsSel ?? isSelected;
  const [modal, setModal] = useState<Info | null>(null);

  const columns: ColumnDef[] = [
    { label: 'Título', key: 'title' },
    { label: 'Operación', key: 'operation' },
    { label: 'Precio', key: 'price' },
  ];

  const gridCols = '1.7fr 0.6fr 1.4fr 75px';

  const getActions = (prop: any): RowAction[] =>
    getRowActions(
      'property',
      prop,
      (info) => setModal(info),
      ask,
      deleteProperty,
      showAlert
    );

  // ---- LOADING GLOBAL DE SECCIÓN ----
  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top bar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: { xs: '12rem', sm: '20rem' }, mr: 1 }}>
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

      {/* Encabezados */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns: gridCols,
          px: 2,
          py: 1,
          flexShrink: 0,
        }}
      >
        {columns.map(col => (
          <Typography
            key={col.key}
            fontWeight={700}
            noWrap
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {col.label}
          </Typography>
        ))}
        <Typography
          fontWeight={700}
          noWrap
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          Acciones
        </Typography>
      </Box>

      {/* Lista */}
      <PropertyList
        properties={properties ?? []}
        loading={false} // el loading global ya lo controla arriba
        columns={columns}
        gridCols={gridCols}
        toggleSelect={selectFn}
        isSelected={isSelFn}
        getActions={getActions}
      />

      {/* modal & dialog */}
      <ModalItem info={modal} close={() => setModal(null)} />
      {DialogUI}
    </Box>
  );
};
