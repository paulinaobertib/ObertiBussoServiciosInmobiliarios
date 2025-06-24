import {
  Box,
  Fab,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  useTheme,
} from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Add from '@mui/icons-material/AddCircleOutline';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CompareIcon from '@mui/icons-material/Compare';
import { useAuthContext } from '../../user/context/AuthContext';

type Props = {
  onAction: (a: 'create' | 'edit' | 'delete') => void;
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  onCompare: () => void;
  compareCount: number;
};

const actions = [
  { icon: <Add />, name: 'Agregar', action: 'create' as const },
  { icon: <Edit />, name: 'Editar', action: 'edit' as const },
  { icon: <Delete />, name: 'Eliminar', action: 'delete' as const },
] as const;

export default function FloatingButtons({
  onAction,
  selectionMode,
  toggleSelectionMode,
  onCompare,
  compareCount,
}: Props) {
  const theme = useTheme();
  const { isAdmin } = useAuthContext();
  const size = 56;
  const off = 16;
  const disabledCompare = compareCount < 2 || compareCount > 3;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: off,
        right: off,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        zIndex: theme.zIndex.tooltip,
      }}
    >
      {/* — Compare FAB — */}
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
            aria-label="Comparar propiedades"
            disabled={disabledCompare}
            onClick={onCompare} // Only call onCompare, don't toggle selection mode
            sx={{
              width: size,
              height: size,
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              color: theme.palette.common.white,
              cursor: 'pointer',
            }}
          >
            <CompareIcon />
          </Fab>
        </span>
      </Tooltip>

      {/* — Selection FAB — */}
      <Tooltip title={selectionMode ? 'Cancelar selección' : 'Seleccionar'} arrow>
        <Fab
          aria-label={selectionMode ? 'Cancelar selección' : 'Seleccionar'}
          onClick={toggleSelectionMode}
          sx={{
            width: size,
            height: size,
            bgcolor: theme.palette.primary.main,
            '&:hover': { bgcolor: theme.palette.primary.dark },
            color: theme.palette.common.white,
            cursor: 'pointer',
          }}
        >
          <CheckBoxIcon />
        </Fab>
      </Tooltip>

      {/* — Admin SpeedDial — */}
      {isAdmin && (
        <Box sx={{ position: 'relative', width: size, height: size }}>
          <SpeedDial
            ariaLabel="Acciones de Propiedad"
            icon={<Settings />}
            direction="up"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              '& .MuiFab-primary': {
                width: size,
                height: size,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.common.white,
                '&:hover': { bgcolor: theme.palette.primary.dark },
                cursor: 'pointer',
              },
            }}
          >
            {actions.map(a => (
              <SpeedDialAction
                key={a.name}
                icon={a.icon}
                tooltipTitle={a.name}
                onClick={() => {
                  if (selectionMode) toggleSelectionMode();
                  onAction(a.action);
                }}
                FabProps={{
                  sx: {
                    width: size,
                    height: size,
                    bgcolor: theme.palette.primary.main,
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                    color: theme.palette.common.white,
                    cursor: 'pointer',
                  },
                }}
              />
            ))}
          </SpeedDial>
        </Box>
      )}
    </Box>
  );
}