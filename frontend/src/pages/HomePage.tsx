import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, useTheme, useMediaQuery,
} from '@mui/material';

import { ImageCarousel } from '../app/property/components/ImageCarousel';
import { SearchBar } from '../app/shared/components/SearchBar';
import { SearchFilters } from '../app/property/components/catalog/SearchFilters';
import { PropertyCatalog } from '../app/property/components/catalog/PropertyCatalog';
import { FloatingButtons } from '../app/property/components/catalog/FloatingButtons';

import { useGlobalAlert } from '../app/shared/context/AlertContext';
import { Property } from '../app/property/types/property';
import { BasePage } from './BasePage';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import {
  getAllProperties,
  getPropertiesByText,
} from '../app/property/services/property.service';

export default function Home() {
  /* ───── hooks & context ───── */
  localStorage.setItem('selectedPropertyId', '');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { showAlert } = useGlobalAlert();
  const {
    selectedPropertyIds,
    toggleCompare,
    refreshProperties,
    propertiesList,
  } = usePropertyCrud();

  /* ───── local state ───── */
  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal');
  const [selectionMode, setSelectionMode] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  /* ───── effects ───── */
  useEffect(() => {
    refreshProperties();
  }, [location.pathname]);

  useEffect(() => {
    setResults(
      propertiesList.map((p) => ({ ...p, status: p.status ?? 'Desconocido' })),
    );
    setLoading(false);
  }, [propertiesList]);

  useEffect(() => {
    setMode('normal');
  }, [location]);

  /* ───── handlers ───── */
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
        'info',
      );
    } else {
      setMode(action);
      showAlert(
        action === 'delete'
          ? 'Modo eliminación: selecciona una propiedad'
          : 'Modo edición: selecciona una propiedad',
        action === 'delete' ? 'warning' : 'info',
      );
    }
  };

  const toggleSelectionMode = () =>
    setSelectionMode((prev) => {
      showAlert(
        prev ? 'Saliendo del modo comparación' : 'Entrando al modo comparación',
        'info',
      );
      return !prev;
    });

  const handleCompare = () => {
    navigate('/properties/compare');
    setSelectionMode(false);
  };

  /* ───── render ───── */
  return (
    <BasePage maxWidth={false}>
      <Box sx={{ p: 2 }}>
        <ImageCarousel />

        {/* FILA buscador + botón de filtros (solo móvil) */}
        {isMobile && (
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'center',
            }}
          >
            <SearchFilters onSearch={setResults} /> {/* ← botón “Filtros” */}
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
        )}

        {/* buscador centrado (desktop) */}
        {!isMobile && (
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

        {/* layout principal */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            mt: 2,
          }}
        >
          {/* panel filtros fijo en desktop */}
          {!isMobile && (
            <Box sx={{ width: 300 }}>
              <SearchFilters onSearch={setResults} />
            </Box>
          )}

          {/* catálogo */}
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
        compareCount={selectedPropertyIds.length}
      />
    </BasePage>
  );
}