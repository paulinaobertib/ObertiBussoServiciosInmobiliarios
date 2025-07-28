import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { ImageCarousel } from '../app/shared/components/images/ImageCarousel';
import { SearchBar } from '../app/shared/components/SearchBar';
import { SearchFilters } from '../app/property/components/catalog/SearchFilters';
import { PropertyCatalog } from '../app/property/components/catalog/PropertyCatalog';
import { FloatingButtons } from '../app/property/components/catalog/FloatingButtons';
import { useGlobalAlert } from '../app/shared/context/AlertContext';
import { Property } from '../app/property/types/property';
import { BasePage } from './BasePage';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { getAllProperties, getPropertiesByText } from '../app/property/services/property.service';

export default function Home() {
  localStorage.setItem('selectedPropertyId', '');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { showAlert } = useGlobalAlert();
  const { selectedPropertyIds, toggleCompare, clearComparison, disabledCompare, } = usePropertiesContext();

  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal');
  const [selectionMode, setSelectionMode] = useState(false);
  const [results, setResults] = useState<Property[] | null>(null);

  const handleAction = (action: 'create' | 'edit' | 'delete') => {
    if (action === 'create') {
      navigate('/properties/new');
      return;
    }
    if (mode === action) {
      setMode('normal');
      showAlert(
        action === 'delete'
          ? 'Saliste del modo eliminación'
          : 'Saliste del modo edición',
        'info'
      );
    } else {
      setMode(action);
      showAlert(
        action === 'delete'
          ? 'Modo eliminación: selecciona una propiedad'
          : 'Modo edición: selecciona una propiedad',
        action === 'delete' ? 'warning' : 'info'
      );
    }
  };

  const toggleSelectionMode = () =>
    setSelectionMode(prev => {
      if (prev) {
        clearComparison();
        showAlert('Saliendo del modo comparación', 'info');
      } else {
        showAlert('Entrando al modo comparación', 'info');
      }
      return !prev;
    });

  const handleCompare = () => {
    if (disabledCompare) {
      showAlert('Debes seleccionar 2 o 3 propiedades', 'warning');
      return;
    }
    navigate('/properties/compare', { state: { ids: selectedPropertyIds } });
    setSelectionMode(false);
  };

  return (
    <BasePage maxWidth={false}>
      <Box sx={{ p: 2 }}>
        <ImageCarousel />

        {/* ---------------- SearchBar junto al botón (el botón ya lo gestiona SearchFilters) ---------------- */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: isMobile ? '100%' : '40rem',
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <SearchBar
                fetchAll={getAllProperties}
                fetchByText={getPropertiesByText}
                onSearch={items => setResults(items as Property[])}
                placeholder="Buscar propiedad"
                debounceMs={400}
              />
            </Box>
          </Box>
        </Box>

        {/* ---------------- Área de filtros + catálogo ---------------- */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            mt: 2,
          }}
        >
          {/* UNA sola instancia de filtros.
              SearchFilters decide si es Drawer (mobile) o panel fijo (desktop) */}
          <Box sx={{ width: { md: 300 } }}>
            <SearchFilters onSearch={setResults} />
          </Box>

          <Box sx={{ flexGrow: 1, ml: { md: 3 } }}>
            <PropertyCatalog
              {...(results !== null ? { properties: results } : {})}
              mode={mode}
              onFinishAction={() => setMode('normal')}
              selectionMode={selectionMode}
              toggleSelection={toggleCompare}
              isSelected={id => selectedPropertyIds.includes(id)}
            />
          </Box>
        </Box>
      </Box>

      <FloatingButtons
        onAction={handleAction}
        selectionMode={selectionMode}
        toggleSelectionMode={toggleSelectionMode}
        onCompare={handleCompare}
      />
    </BasePage>
  );
}
