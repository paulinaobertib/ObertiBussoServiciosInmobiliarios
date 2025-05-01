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
  { icon: <AddCircleOutlineIcon fontSize="large" />, name: 'Agregar Propiedad', action: 'create' },
  { icon: <EditIcon fontSize="large" />, name: 'Editar Propiedad', action: 'edit' },
  { icon: <DeleteIcon fontSize="large" />, name: 'Eliminar Propiedad', action: 'delete' },
];

export default function SpeedDialTooltipOpen({ onAction }: SpeedDialTooltipOpenProps) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ position: 'fixed', bottom: 30, right: 24, zIndex: 1500 }}>
      <SpeedDial
        ariaLabel="SpeedDial tooltip"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          '& .MuiFab-primary': {
            width: 70,
            height: 70,
          },
          '& .MuiSvgIcon-root': {
            fontSize: 35,
          },
        }}
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
                width: 64,
                height: 64,
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