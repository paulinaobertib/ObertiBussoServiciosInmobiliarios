import * as React from 'react';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

type SpeedDialTooltipOpenProps = {
  onAction: (action: string) => void;
};

const actions = [
  { icon: <AddCircleOutlineIcon />, name: 'Agregar Propiedad', action: 'create' },
  { icon: <EditIcon />, name: 'Editar Propiedad', action: 'edit'  },
  { icon: <DeleteIcon />, name: 'Eliminar Propiedad', action: 'delete'  },
];

export default function SpeedDialTooltipOpen({ onAction }: SpeedDialTooltipOpenProps) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1500 }}>

      <SpeedDial
        ariaLabel="SpeedDial tooltip"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SettingsIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              handleClose();
              onAction(action.action);
            }}
            FabProps={{
              sx: {
                bgcolor: 'primary.main',
                color: 'white', 
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}