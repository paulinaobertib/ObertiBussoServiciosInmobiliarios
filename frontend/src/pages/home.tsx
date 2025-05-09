// src/pages/home.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

import SpeedDialTooltipOpen from '../app/property/components/selectActions';
import Navbar from '../app/property/components/navbar';
import PropertyCatalog from '../app/property/components/propertyCatalog';
import ImageCarousel from '../app/property/components/imageCarousel';
import SearchFilters from '../app/property/components/searchFilters';
import SearchBar from '../app/property/components/searchBar';
import { useGlobalAlert } from '../app/property/context/AlertContext';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useGlobalAlert();

  const [mode, setMode] = useState<'normal' | 'edit' | 'delete'>('normal');

  const handleAction = (action: string) => {
    switch (action) {
      case 'create':
        navigate('/properties/new');
        break;
      case 'edit':
        if (mode === 'edit') {
          setMode('normal');
          showAlert('¡Saliste del modo edición!', 'info');
        } else {
          setMode('edit');
          showAlert('¡Estás en modo edición!', 'info');
        }
        break;
      case 'delete':
        if (mode === 'delete') {
          setMode('normal');
          showAlert('¡Saliste del modo eliminación!', 'info');
        } else {
          setMode('delete');
          showAlert('¡Estás en modo eliminación! Tené cuidado', 'info');
        }
        break;
      default:
        console.warn('Acción no reconocida:', action);
    }
  };

  // Al cambiar de URL, resetear el modo
  useEffect(() => {
    setMode('normal');
  }, [location]);

  return (
    <>
      <Navbar />
      <Box sx={{ height: '100%', position: 'relative', p: 2 }}>
        <SpeedDialTooltipOpen onAction={handleAction} />
        <ImageCarousel />

        <Box sx={{ mt: 2 }}>
          <SearchBar />
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
            <SearchFilters />
          </Box>
          <Box sx={{ flexGrow: 1, ml: { md: 8 } }}>
            <PropertyCatalog mode={mode} onFinishAction={() => setMode('normal')} />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Home;
