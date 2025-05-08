// src/pages/home.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Navbar from '../components/navbar';
import SpeedDialTooltipOpen from '../components/selectActions';
import ImageCarousel from '../components/imageCarousel';
import SearchFilters from '../components/searchFilters';
import SearchBar from '../components/searchBar';
import PropertyCatalog from '../components/propertyCatalog';
import ButtonSelect from '../components/buttonSelect';
import CompareButtonFloating from '../components/buttonCompare';
import { getAllProperties } from '../services/propertyService';
import { useComparison } from '../context/comparisonContext';
import { Property } from '../types/property';

function Home() {
  const navigate = useNavigate();
  const { selectedPropertyIds, toggleSelection, addToComparison, clearComparison } = useComparison();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [shouldNavigateToCompare, setShouldNavigateToCompare] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case 'create':
        navigate('/properties/new');
        break;
      case 'edit':
        navigate('/properties/edit/123');
        break;
      case 'delete':
        console.log('Eliminar algo');
        break;
      default:
        console.log('Acción no reconocida');
        break;
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getAllProperties();
        let fetchedProperties: Property[] = [];
        if (Array.isArray(response?.data)) {
          fetchedProperties = response.data;
        } else if (Array.isArray(response)) {
          fetchedProperties = response;
        } else {
          console.error('Estructura inesperada de respuesta:', response);
          fetchedProperties = [];
        }

        const propertiesWithStatus = fetchedProperties.map((property) => ({
          ...property,
          status: property.status || 'Desconocido',
        }));

        setProperties(propertiesWithStatus);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (shouldNavigateToCompare) {
      console.log('Navigating to /compare'); // Depuración
      navigate('/compare');
      setShouldNavigateToCompare(false);
    }
  }, [shouldNavigateToCompare, navigate]);

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      const newMode = !prev;
      if (!newMode) {
        clearComparison(); // Limpiamos el contexto al salir del modo de selección
      }
      return newMode;
    });
  };

  const isSelected = (id: number) => selectedPropertyIds.includes(id);

  const handleCompareClick = () => {
    console.log('Selected Property IDs:', selectedPropertyIds); // Depuración
    clearComparison();
    const selectedProperties = properties.filter((property) =>
      selectedPropertyIds.includes(property.id)
    );
    console.log('Selected Properties:', selectedProperties); // Depuración
    selectedProperties.forEach((property) => {
      addToComparison(property);
    });
    setShouldNavigateToCompare(true);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ height: '100%', position: 'relative', p: 2 }}>
        <SpeedDialTooltipOpen onAction={handleAction} />
        <ImageCarousel />
        <Box sx={{ mt: 2, mb: 0, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <SearchBar />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: { xs: 'center', md: 'flex-start' },
            gap: 1,
            width: '100%',
            mt: -3,
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: '10%' },
              maxWidth: { xs: '400px', md: 'none' },
              flexShrink: 0,
              display: { xs: 'flex', md: 'block' },
              alignItems: { xs: 'center', md: 'flex-start' },
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <SearchFilters />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              ml: { xs: 0, md: 26 },
              width: { xs: '100%', md: 'auto' },
              maxWidth: { xs: '400px', md: 'none' },
              display: { xs: 'flex', md: 'block' },
              alignItems: { xs: 'center', md: 'flex-start' },
              justifyContent: { xs: 'center', md: 'flex-start' },
              flexDirection: 'column',
            }}
          >
            {loading ? (
              <Typography>Cargando propiedades...</Typography>
            ) : properties.length > 0 ? (
              <PropertyCatalog
                properties={properties}
                selectionMode={selectionMode}
                selectedPropertyIds={selectedPropertyIds}
                toggleSelection={toggleSelection}
                isSelected={isSelected}
              />
            ) : (
              <Typography variant="h5" color="text.secondary" sx={{ mt: 4 }}>
                No se encontraron propiedades.
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1500 }}>
          <ButtonSelect onClick={toggleSelectionMode} isActive={selectionMode} />
          <CompareButtonFloating
            onClick={handleCompareClick}
            selectedCount={selectedPropertyIds.length}
          />
        </Box>
      </Box>
    </>
  );
}

export default Home;