import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import { ImageCarousel } from '../app/property/components/ImageCarousel';
import { SearchBar } from '../app/shared/components/SearchBar';
import { SearchFilters } from '../app/property/components/catalog/SearchFilters';
import { PropertyCatalog } from '../app/property/components/catalog/PropertyCatalog';
import { FloatingButtons } from '../app/property/components/catalog/FloatingButtons';

import { useGlobalAlert } from '../app/shared/context/AlertContext';
import { Property } from '../app/property/types/property';
import { BasePage } from './BasePage';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import { getAllProperties, getPropertiesByText } from '../app/property/services/property.service';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useGlobalAlert();
  const { selectedPropertyIds, toggleCompare, refreshProperties, propertiesList } = usePropertyCrud();

  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal');
  const [selectionMode, setSelectionMode] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProperties();
  }, [location.pathname]);

  useEffect(() => {
    setResults(propertiesList.map(p => ({ ...p, status: p.status ?? 'Desconocido' })));
    setLoading(false);
  }, [propertiesList]);

  useEffect(() => {
    setMode('normal');
  }, [location]);

  const handleAction = (action: 'create' | 'edit' | 'delete') => {
    if (action === 'create') {
      navigate('/properties/new');
      return;
    }
    if (mode === action) {
      setMode('normal');
      showAlert(
        action === 'delete' ? 'Saliste del modo eliminación' : 'Saliste del modo edición',
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

  const toggleSelectionMode = () => {
    setSelectionMode(prev => {
      showAlert(
        prev ? 'Saliendo del modo comparación' : 'Entrando al modo comparación',
        'info'
      );
      return !prev;
    });
  };

  const handleCompare = () => {
    navigate('/properties/compare');
    setSelectionMode(false); // Exit selection mode after navigation
  };

  // console.log('Token: ', document.cookie);

  return (
    <BasePage maxWidth={false}>
      <Box sx={{ p: 2 }}>
        <ImageCarousel />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: { xs: '70%' } }}>
            <SearchBar
              fetchAll={getAllProperties}
              fetchByText={getPropertiesByText}
              onSearch={items => setResults(items as Property[])}
              placeholder="Buscar propiedad"
              debounceMs={400}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            mt: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ width: { xs: '100%', md: 270 } }}>
            <SearchFilters onSearch={setResults} />
          </Box>
          <Box sx={{ flexGrow: 1, ml: { md: 8 } }}>
            {loading ? (
              <Typography>Cargando propiedades...</Typography>
            ) : results.length > 0 ? (
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
        compareCount={selectedPropertyIds.length}
      />
    </BasePage>
  );
}