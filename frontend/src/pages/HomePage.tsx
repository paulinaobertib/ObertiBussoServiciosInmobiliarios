import { Box, useTheme, useMediaQuery, Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { ImageCarousel } from '../app/shared/components/images/ImageCarousel';
import { SearchBar } from '../app/shared/components/SearchBar';
import { SearchFilters } from '../app/property/components/catalog/SearchFilters';
import { PropertyCatalog } from '../app/property/components/catalog/PropertyCatalog';
import { FloatingButtons } from '../app/property/components/catalog/FloatingButtons';
import { useGlobalAlert } from '../app/shared/context/AlertContext';
import { Property } from '../app/property/types/property';
import { BasePage } from './BasePage';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { getAllProperties, getAvailableProperties, getPropertiesByText } from '../app/property/services/property.service';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../app/user/context/AuthContext';

export default function Home() {
  localStorage.setItem('selectedPropertyId', '');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin } = useAuthContext();
  const [filtersOpen, setFiltersOpen] = useState(false);


  const { showAlert } = useGlobalAlert();
  const { selectedPropertyIds, toggleCompare, clearComparison, disabledCompare, refreshProperties, resetSelected } = usePropertiesContext();

  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal');
  const [selectionMode, setSelectionMode] = useState(false);
  const [results, setResults] = useState<Property[] | null>(null);

  useEffect(() => {
    resetSelected();
    refreshProperties(isAdmin ? 'all' : 'available');
  }, [resetSelected, refreshProperties, isAdmin]);


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

        {/* ── SearchBar con botón FILTROS a la izquierda (solo mobile) ── */}
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
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFiltersOpen(true)}
                sx={{ flexShrink: 0 }}
              >
                Filtros
              </Button>
            )}

            <Box sx={{ flexGrow: 1 }}>
              <SearchBar
                fetchAll={isAdmin ? getAllProperties : getAvailableProperties}
                fetchByText={async (value) => {
                  const results = await getPropertiesByText(value);
                  return isAdmin
                    ? results
                    : (results ?? []).filter((p: any) => String(p?.status ?? '').toUpperCase() === 'DISPONIBLE');
                }}
                onSearch={items => setResults(items as Property[])}
                placeholder="Buscar propiedad"
                debounceMs={400}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Filtros + catálogo ── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            mt: 2,
          }}
        >
          <Box sx={{ width: { md: 300 } }}>
            <SearchFilters
              onSearch={setResults}
              mobileOpen={filtersOpen}                // control externo del Drawer
              onMobileOpenChange={setFiltersOpen}
              hideMobileTrigger                        // ocultamos el botón interno
            />
          </Box>

          <Box sx={{ flexGrow: 1, ml: { md: 3 } }}>
            <PropertyCatalog
              {...(results !== null ? { properties: results } : {})}
              mode={mode}
              onFinishAction={() => {
                setMode('normal');
                setResults(null);
              }}
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
