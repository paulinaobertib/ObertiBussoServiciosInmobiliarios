import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useState } from 'react';

type SelectButtonFloatingProps = {
  onClick: () => void;
  isActive: boolean;
};

export default function SelectButtonFloating({
  onClick,
}: SelectButtonFloatingProps) {
  const [selectionMode, setSelectionMode] = useState(false);

  const handleClick = () => {
    setSelectionMode(!selectionMode);
    onClick(); 
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 47, right: 45, zIndex: 1500 }}>
      <Tooltip
        title={selectionMode ? 'Cancelar' : 'Seleccionar'}
        placement="bottom"
        PopperProps={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 22],
              },
            },
          ],
        }}
      >
        <span>
          <Fab
            color={selectionMode ? 'secondary' : 'primary'}
            onClick={handleClick}
            sx={{
              width: 70,
              height: 70,
              '& .MuiSvgIcon-root': {
                fontSize: 35,
              },
            }}
          >
            <CheckBoxIcon />
          </Fab>
        </span>
      </Tooltip>
    </Box>
  );
}
