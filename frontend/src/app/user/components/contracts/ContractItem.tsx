// src/app/user/components/contracts/ContractItem.tsx

import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    IconButton,
    Typography,
    Tooltip,
    Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import MonetizationOnOutlined from "@mui/icons-material/MonetizationOnOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate } from "react-router-dom";
import type { Contract } from "../../types/contract";
import { useContractNames } from "../../hooks/contracts/useContractNames";
import { buildRoute, ROUTES } from "../../../../lib";
import { useAuthContext } from "../../../user/context/AuthContext";

interface Props {
    contract: Contract;
    onRegisterPayment: (c: Contract) => void;
    onIncrease: (c: Contract) => void;
    onHistory: (c: Contract) => void;
    onDelete: (c: Contract) => void;
    onToggleStatus: (c: Contract) => void;
}

export const ContractItem = ({
    contract,
    onRegisterPayment,
    onIncrease,
    onHistory,
    onDelete,
    onToggleStatus,
}: Props) => {
    const navigate = useNavigate();
    const { userName, propertyName } = useContractNames(
        contract.userId,
        contract.propertyId
    );
    const { isAdmin } = useAuthContext();

    const fmtDate = (iso: string) => {
        const d = new Date(iso);
        const m = d.toLocaleString("es-AR", { month: "long" });
        return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)
            } del ${d.getFullYear()}`;
    };

    return (
        <Card
            elevation={1}

        >
            <CardHeader
                // Permite el truncado dentro del flex container
                sx={{
                    "& .MuiCardHeader-content": {
                        minWidth: 0,
                    },
                }}
                // Tooltip sobre el título completo
                title={
                    <Tooltip title={`Contrato de ${userName}`}>
                        <Typography
                            noWrap
                            sx={{ fontSize: "1.4rem", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                            Contrato de {userName}
                        </Typography>
                    </Tooltip>
                }
                // Tooltip sobre el subtítulo completo
                subheader={
                    <Tooltip title={`en ${propertyName}`}>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                            en {propertyName}
                        </Typography>
                    </Tooltip>
                }
                action={
                    isAdmin ? (
                        <Box>
                            <Tooltip title="Editar">
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        navigate(buildRoute(ROUTES.EDIT_CONTRACT, contract.id))
                                    }
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title={
                                    contract.contractStatus === "ACTIVO"
                                        ? "Inactivar"
                                        : "Reactivar"
                                }
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => onToggleStatus(contract)}
                                >
                                    <BlockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                                <IconButton size="small" onClick={() => onDelete(contract)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : undefined
                }
            />

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2">
                    <strong>Desde:</strong> {fmtDate(contract.startDate)}
                </Typography>
                <Typography variant="body2">
                    <strong>Hasta:</strong> {fmtDate(contract.endDate)}
                </Typography>
                <Typography variant="body2">
                    <strong>Monto Inicial:</strong> $ {contract.initialAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                    <strong>Frecuencia:</strong> {contract.adjustmentFrequencyMonths} meses
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end" }}>
                {isAdmin && (
                    <>
                        <Tooltip title="Registrar Pago">
                            <IconButton onClick={() => onRegisterPayment(contract)}>
                                <MonetizationOnOutlined />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Aumentar">
                            <IconButton onClick={() => onIncrease(contract)}>
                                <TrendingUpOutlined />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
                <Tooltip title="Historial">
                    <IconButton onClick={() => onHistory(contract)}>
                        <HistoryIcon />
                    </IconButton>
                </Tooltip>
            </CardActions>
        </Card>
    );
};
