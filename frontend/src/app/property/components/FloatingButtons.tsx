import { Box, Fab, Tooltip, SpeedDial, SpeedDialAction } from '@mui/material';
import Settings from '@mui/icons-material/Settings';
import Add from '@mui/icons-material/AddCircleOutline';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CompareIcon from '@mui/icons-material/Compare';
import { useIsAdmin } from "../../user/context/AuthContext";

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
];

export default function FloatingButtons({
    onAction,
    selectionMode,
    toggleSelectionMode,
    onCompare,
    compareCount,
}: Props) {
    const size = 56;
    const gap = 2;
    const off = 16;
    const disabledCompare = compareCount < 2 || compareCount > 3;
    const isAdmin = useIsAdmin();

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: off,
                right: off,
                display: 'flex',
                flexDirection: 'row',
                gap: gap,
                zIndex: theme => theme.zIndex.tooltip,
            }}
        >
            {/* FAB Comparar */}
            <Tooltip
                title={
                    disabledCompare
                        ? 'Selecciona 2 o 3 propiedades'
                        : 'Comparar propiedades'
                }
                arrow
            >
                <div>
                    <Fab
                        aria-label="Comparar propiedades"
                        color="primary"
                        disabled={disabledCompare}
                        onClick={onCompare}
                        sx={{ width: size, height: size }}
                    >
                        <CompareIcon />
                    </Fab>
                </div>
            </Tooltip>
            {/* FAB Selección */}
            <Tooltip title={selectionMode ? 'Cancelar selección' : 'Seleccionar'} arrow>
                <Fab
                    aria-label={selectionMode ? 'Cancelar selección' : 'Seleccionar'}
                    color={selectionMode ? 'secondary' : 'primary'}
                    onClick={toggleSelectionMode}
                    sx={{ width: size, height: size }}
                >
                    <CheckBoxIcon />
                </Fab>
            </Tooltip>

            {isAdmin && (
                <Box
                    sx={{
                        position: 'relative',
                        width: size,
                        height: size,
                    }}
                >
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
                                bgcolor: 'primary.main',
                                color: '#fff',
                                '&:hover': { bgcolor: 'primary.dark' },
                            },
                        }}
                    >
                        {actions.map(a => (
                            <SpeedDialAction
                                key={a.name}
                                icon={a.icon}
                                aria-label={a.name}
                                tooltipTitle={a.name}
                                onClick={() => onAction(a.action)}
                                FabProps={{
                                    sx: {
                                        width: size,
                                        height: size,
                                        bgcolor: 'primary.main',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'primary.dark' },
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
