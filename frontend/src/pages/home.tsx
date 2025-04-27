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

        <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: -3 }}>
          <Box sx={{ width: '270px', flexShrink: 0 }}>
            <SearchFilters />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0, ml: 8 }}>
            <PropertyCatalog />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Home;
