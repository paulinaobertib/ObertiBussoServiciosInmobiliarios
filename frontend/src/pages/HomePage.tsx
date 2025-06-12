import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import ImageCarousel from '../app/property/components/ImageCarousel';
import SearchBar from '../app/property/components/SearchBar';
import FiltersSidebar from '../app/property/components/SearchFilters';
import PropertyCatalog from '../app/property/components/PropertyCatalog';
import FloatingButtons from '../app/property/components/FloatingButtons';

import { useGlobalAlert } from '../app/property/context/AlertContext';
import { Property } from '../app/property/types/property';
import { BasePage } from './BasePage';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useGlobalAlert();
  const { selectedPropertyIds, toggleCompare, clearComparison, refreshAllCatalogs, propertiesList } = usePropertyCrud();

  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal');
  const [selectionMode, setSelectionMode] = useState(false);
  const [results, setResults] = useState<Property[]>([]);

  const [properties, _] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [goCompare, setGoCompare] = useState(false);

  useEffect(() => {
    refreshAllCatalogs();
  }, [location.pathname, refreshAllCatalogs]);

  useEffect(() => {
    const normalized = propertiesList.map(p => ({
      ...p,
      status: p.status ?? 'Desconocido'
    }));
    setResults(normalized);
    setLoading(false);
  }, [propertiesList]);


  useEffect(() => {
    if (goCompare) {
      navigate('/properties/compare');
      setGoCompare(false);
    }
  }, [goCompare, navigate]);

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
      if (prev) clearComparison();
      return !prev;
    });
  };

  const handleCompare = () => {
    clearComparison();
    properties
      .filter(p => selectedPropertyIds.includes(p.id))
      .forEach(p => toggleCompare(p.id));
    setGoCompare(true);
  };

  return (
    <BasePage maxWidth={false}>

      <Box sx={{ p: 2 }}>
        <ImageCarousel />

        <Box sx={{ mt: 2 }}>
          <SearchBar onSearch={setResults} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            mt: -3,
          }}
        >
          <Box sx={{ width: { xs: '100%', md: 270 } }}>
            <FiltersSidebar onSearch={setResults} />
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
                selectedPropertyIds={selectedPropertyIds}
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
    </BasePage >
  );
}