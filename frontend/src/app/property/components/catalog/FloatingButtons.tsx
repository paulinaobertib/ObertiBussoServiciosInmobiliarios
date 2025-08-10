import { Box, Fab, Tooltip, SpeedDial, SpeedDialAction, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import selectIcon from '../../../../assets/ic_select.png';
import compareIcon from '../../../../assets/ic_comparer.png'
import { useAuthContext } from '../../../user/context/AuthContext';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { useState } from 'react';

interface Props {
  onAction: (action: 'create' | 'edit' | 'delete') => void;
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  onCompare: () => void;
}

const adminActions = [
  { icon: <AddCircleOutlineIcon />, name: 'Agregar', action: 'create' as const },
  { icon: <EditIcon />, name: 'Editar', action: 'edit' as const },
  { icon: <DeleteIcon />, name: 'Eliminar', action: 'delete' as const },
];

export const FloatingButtons = ({ onAction, selectionMode, toggleSelectionMode, onCompare }: Props) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const { isAdmin } = useAuthContext();
  const { disabledCompare } = usePropertiesContext();
  const size = { xs: '3rem', sm: '3.5rem' };
  const off = 16;

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: off,
        right: {
          xs: `calc(${off}px + ${size.xs} + 8px)`,
          sm: 86,
        },
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: { xs: 1, sm: 2 },
        zIndex: 1300,
      }}
    >

      {/* Botón comparar (usuarios) */}
      {!isAdmin && (
        <Tooltip
          title={
            disabledCompare
              ? 'Selecciona 2 o 3 propiedades'
              : 'Comparar propiedades'
          }
          arrow
        >
          <span>
            <Fab
              disabled={disabledCompare}
              onClick={onCompare}
              sx={{
                width: size,
                height: size,
                bgcolor: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                color: '#fff',
              }}
            >
              <img src={compareIcon} alt="Comparer" style={{ width: '2.2rem', height: '2.2rem' }} />
            </Fab>
          </span>
        </Tooltip>
      )}

      {/* Botón seleccionar/deseleccionar */}
      {!isAdmin && (
        <Tooltip
          title={selectionMode ? 'Cancelar selección' : 'Seleccionar'}
          arrow
        >
          <Fab
            onClick={toggleSelectionMode}
            sx={{
              width: size,
              height: size,
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              color: '#fff',
            }}
          >
            <img src={selectIcon} alt="Select" style={{ width: '2.2rem', height: '2.2rem' }} />
          </Fab>
        </Tooltip>
      )}

      {/* SpeedDial para admins */}
      {isAdmin && (
        <SpeedDial
          ariaLabel="Acciones de Propiedad"
          icon={<SettingsIcon />}
          direction="up"
          onClick={handleOpen}
          open={open}
          sx={{
            position: 'fixed',
            bottom: off,
            right: off,
            zIndex: 1300,
            '& .MuiFab-primary': {
              width: size,
              height: size,
              bgcolor: theme.palette.primary.main,
              color: '#fff',
              '&:hover': { bgcolor: theme.palette.primary.dark },
            },
          }}
        >

          {adminActions.map(({ icon, name, action }) => (
            <SpeedDialAction
              key={name}
              icon={icon}
              tooltipTitle={name}
              onClick={() => {
                setOpen(false);
                if (selectionMode) toggleSelectionMode();
                onAction(action);
              }}
              FabProps={{
                sx: {
                  width: size,
                  height: size,
                  bgcolor: theme.palette.primary.main,
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  color: '#fff',
                },
              }}
            />
          ))}
        </SpeedDial>
      )}
    </Box>
  );
};
