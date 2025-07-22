import React from "react";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Contract } from "../../../user/types/contract";

interface ContractItemProps {
    contract: Contract;

    /** Selección de filas */
    isSelected?: (id: number) => boolean;
    toggleSelect?: (id: number) => void;

    /** Acciones */
    onEdit?: (c: Contract) => void;
    onDelete?: (c: Contract) => void;
}

export const ContractItem: React.FC<ContractItemProps> = ({
    contract,
    isSelected,
    toggleSelect,
    onEdit,
    onDelete,
}) => {
    const theme = useTheme();
    const selected = isSelected?.(contract.id) ?? false;
    const handleClick = () => toggleSelect && toggleSelect(contract.id);

    const mobileFields = [
        { label: "ID Contrato", value: contract.id.toString() },
        { label: "Propiedad", value: contract.propertyId.toString() },
        { label: "Usuario", value: contract.userId },
        { label: "Tipo", value: contract.contractType },
        { label: "Estado", value: contract.contractStatus },
        { label: "Desde", value: contract.startDate.split("T")[0] },
        { label: "Hasta", value: contract.endDate.split("T")[0] },
    ];

    return (
        <Box
            onClick={handleClick}
            sx={{
                display: { xs: "block", sm: "grid" },
                gridTemplateColumns: "repeat(7, 1fr) 75px",
                alignItems: "center",
                py: 1,
                mb: 0.5,
                bgcolor: selected
                    ? theme.palette.action.selected
                    : "transparent",
                cursor: toggleSelect ? "pointer" : "default",
                "&:hover": {
                    bgcolor: toggleSelect
                        ? theme.palette.action.hover
                        : "transparent",
                },
            }}
        >
            {/* MOBILE */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
                {mobileFields.map((f) => (
                    <Box
                        key={f.label}
                        sx={{ display: "flex", gap: 1, mb: 0.5 }}
                    >
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                        >
                            {f.label}:
                        </Typography>
                        <Tooltip title={f.value} arrow>
                            <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {f.value}
                            </Typography>
                        </Tooltip>
                    </Box>
                ))}
            </Box>

            {/* DESKTOP */}
            <Typography
                variant="body2"
                sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                }}
            >
                {contract.id}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                }}
            >
                {contract.propertyId}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                }}
            >
                {contract.userId}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                }}
            >
                {contract.contractType}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                }}
            >
                {contract.contractStatus}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                }}
            >
                {contract.startDate.split("T")[0]}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                }}
            >
                {contract.endDate.split("T")[0]}
            </Typography>

            {/* ACCIONES */}
            {(onEdit || onDelete) && (
                <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                    {onEdit && (
                        <Tooltip title="Editar" arrow>
                            <IconButton
                                size="small"
                                onClick={() => onEdit(contract)}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onDelete && (
                        <Tooltip title="Eliminar" arrow>
                            <IconButton
                                size="small"
                                onClick={() => onDelete(contract)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )}
        </Box>
    );
};
