import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

type ButtonCompareFloatingProps = {
  onClick: () => void;
  selectedCount: number;
};

export default function CompareButtonFloating({
  onClick,
  selectedCount,
}: ButtonCompareFloatingProps) {
  const navigate = useNavigate();
  const disabled = selectedCount !== 2;
  const tooltipMessage = disabled
    ? 'Selecciona exactamente 2 propiedades para comparar'
    : 'Comparar propiedades';

  const handleClick = () => {
    if (!disabled) {
      onClick();
      navigate('/compare');
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 30, right: 110, zIndex: 1500 }}>
      <Tooltip title={tooltipMessage} placement="right">
        <span>
          <Fab
            color="primary"
            onClick={handleClick}
            disabled={disabled}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 70,
              height: 70,
              '& .MuiSvgIcon-root': {
                fontSize: 35,
              },
            }}
          >
            <CompareArrowsIcon />
          </Fab>
        </span>
      </Tooltip>
    </Box>
  );
}
