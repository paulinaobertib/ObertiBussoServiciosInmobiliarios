import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, useTheme, useMediaQuery,
} from '@mui/material';

import { ImageCarousel } from '../app/shared/components/images/ImageCarousel';
import { SearchBar } from '../app/shared/components/SearchBar';
import { SearchFilters } from '../app/property/components/catalog/SearchFilters';
import { PropertyCatalog } from '../app/property/components/catalog/PropertyCatalog';
import { FloatingButtons } from '../app/property/components/catalog/FloatingButtons';

import { useGlobalAlert } from '../app/shared/context/AlertContext';
import { Property } from '../app/property/types/property';
import { BasePage } from './BasePage';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import {
  getAllProperties,
  getPropertiesByText,
} from '../app/property/services/property.service';
import { useCatalog } from '../app/property/hooks/useCatalog';

export default function Home() {
  localStorage.setItem('selectedPropertyId', '');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { showAlert } = useGlobalAlert();
  const {
    selectedPropertyIds,
    toggleCompare,
    clearComparison,
    refreshProperties,
    disabledCompare,
  } = usePropertiesContext();

  // Memoizamos onFinish para romper bucles infinitos
  const onFinish = useCallback(() => {
    // aquí podrías resetear algún estado o refetch si hace falta
  }, []);
  const { propertiesList } = useCatalog(onFinish);

  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal');
  const [selectionMode, setSelectionMode] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Cada vez que cambie la ruta, refrescamos
  useEffect(() => {
    refreshProperties();
  }, [location.pathname, refreshProperties]);

  // Cuando propertiesList cambia, actualizamos resultados
  useEffect(() => {
    const newResults = propertiesList.map(p => ({
      ...p,
      status: p.status ?? 'Desconocido',
    }));
    setResults(prev =>
      JSON.stringify(prev) === JSON.stringify(newResults) ? prev : newResults
    );
    setLoading(false);
  }, [propertiesList]);

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

        {isMobile ? (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <SearchFilters onSearch={setResults} />
            <Box sx={{ flexGrow: 1, maxWidth: '25rem' }}>
              <SearchBar
                fetchAll={getAllProperties}
                fetchByText={getPropertiesByText}
                onSearch={items => setResults(items as Property[])}
                placeholder="Buscar propiedad"
                debounceMs={400}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '40rem' }}>
              <SearchBar
                fetchAll={getAllProperties}
                fetchByText={getPropertiesByText}
                onSearch={items => setResults(items as Property[])}
                placeholder="Buscar propiedad"
                debounceMs={400}
              />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, mt: 2 }}>
          {!isMobile && (
            <Box sx={{ width: 300 }}>
              <SearchFilters onSearch={setResults} />
            </Box>
          )}

          <Box sx={{ flexGrow: 1, ml: { md: 3 } }}>
            {loading ? (
              <Typography>Cargando propiedades…</Typography>
            ) : results.length ? (
              <PropertyCatalog
                properties={results}
                mode={mode}
                onFinishAction={() => setMode('normal')}
                selectionMode={selectionMode}
                toggleSelection={toggleCompare}
                isSelected={id => selectedPropertyIds.includes(id)}
              />
            ) : (
              <Typography variant="h5" color="text.secondary">
                No se encontraron propiedades.
              </Typography>
            )}
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
