import { Box, Fab, Tooltip, SpeedDial, SpeedDialAction, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CompareIcon from '@mui/icons-material/Compare';
import { useAuthContext } from '../../../user/context/AuthContext';
import { usePropertiesContext } from '../../context/PropertiesContext';

interface FloatingButtonsProps {
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

export const FloatingButtons = ({ onAction, selectionMode, toggleSelectionMode, onCompare }: FloatingButtonsProps) => {
  const theme = useTheme();
  const { isAdmin } = useAuthContext();
  const { disabledCompare } = usePropertiesContext();
  const size = { xs: '3rem', sm: '3.5rem' };
  const off = 16;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: off,
        right: {
          xs: `calc(${off}px + ${size.xs} + 8px)`, // 16 + 3rem + 8px
          sm: 86,
        },
        display: 'flex',
        flexDirection: 'row',  // siempre en fila
        alignItems: 'center',
        gap: { xs: 1, sm: 2 }, // 8px en xs, 16px en sm+
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
              <CompareIcon />
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
            <CheckBoxIcon />
          </Fab>
        </Tooltip>
      )}

      {/* SpeedDial para admins */}
      {isAdmin && (
        <SpeedDial
          ariaLabel="Acciones de Propiedad"
          icon={<SettingsIcon />}
          direction="up"
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
