import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import SpeedDialTooltipOpen from '../components/selectActions';
import Navbar from '../components/navbar';
import PropertyCatalog from '../components/propertyCatalog';
import ImageCarousel from '../components/imageCarousel';
import SearchFilters from '../components/searchFilters';
import SearchBar from '../components/searchBar';

function Home() {
  const navigate = useNavigate();

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

  return (
    <>
      <Navbar />
      <Box sx={{ height: '100%', position: 'relative', p: 2 }}>
        <SpeedDialTooltipOpen onAction={handleAction} />
        <ImageCarousel />

        <Box sx={{ mt: 2, mb: 0 }}>
          <SearchBar />
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
            width: { xs: '100%', md: '270px' },
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
            ml: { xs: 0, md: 8 },
            width: { xs: '100%', md: 'auto' },
            maxWidth: { xs: '400px', md: 'none' }, 
            display: { xs: 'flex', md: 'block' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}
        >
          <PropertyCatalog />
        </Box>
        </Box>
      </Box>
    </>
  );
}

export default Home;