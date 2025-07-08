import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import type { User, Role } from "../../../types/user";

interface UserItemProps {
    user: User & { roles: Role[] };
    onEdit: (u: User) => void;
    onDelete: (u: User) => void;
    onRoles: (u: User) => void;
}

export const UserItem = ({
    user,
    onEdit,
    onDelete,
    onRoles,
}: UserItemProps) => {
    const theme = useTheme();
    const gridTemplate = "1fr 1fr 1fr 1fr 75px";
    const cellSx = {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
    };

    return (
        <Box
            sx={{
                display: { xs: "block", sm: "grid" },
                gridTemplateColumns: gridTemplate,
                alignItems: "center",
                py: 1,
                mb: 0.5,
                bgcolor: "transparent",
                cursor: "pointer",
                "&:hover": { bgcolor: theme.palette.action.hover },
            }}
        >
            {/* móvil: stacked */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
                <Tooltip title={`${user.firstName} ${user.lastName}`} arrow>
                    <Typography fontWeight={600} sx={cellSx}>
                        {user.firstName} {user.lastName}
                    </Typography>
                </Tooltip>
                <Tooltip title={user.email} arrow>
                    <Typography color="text.secondary" sx={cellSx}>
                        {user.email}
                    </Typography>
                </Tooltip>
                <Tooltip title={user.phone} arrow>
                    <Typography color="text.secondary" sx={cellSx}>
                        {user.phone}
                    </Typography>
                </Tooltip>
            </Box>

            {/* desktop: columnas */}
            <Tooltip title={`${user.firstName} ${user.lastName}`} arrow>
                <Typography
                    sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
                >
                    {user.firstName} {user.lastName}
                </Typography>
            </Tooltip>
            <Tooltip title={user.email} arrow>
                <Typography
                    sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
                >
                    {user.email}
                </Typography>
            </Tooltip>
            <Tooltip title={user.phone} arrow>
                <Typography
                    sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
                >
                    {user.phone}
                </Typography>
            </Tooltip>
            <Tooltip title={user.roles.join(", ") || "—"} arrow>
                <Typography
                    sx={{ ...cellSx, display: { xs: "none", sm: "block" } }}
                >
                    {user.roles.join(", ") || "—"}
                </Typography>
            </Tooltip>

            {/* acciones */}
            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "flex-end",
                }}
            >
                <IconButton size="small" onClick={() => onEdit(user)}>
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(user)}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onRoles(user)}>
                    <PeopleIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
};
