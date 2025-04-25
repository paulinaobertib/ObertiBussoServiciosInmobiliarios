import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import SpeedDialTooltipOpen from '../components/selectActions';
import Navbar from '../components/navbar';

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
      <Box sx={{ height: '100%', position: 'relative', padding: 2 }}>
        <SpeedDialTooltipOpen onAction={handleAction} />
      </Box>
    </>
  );
}

export default Home;
