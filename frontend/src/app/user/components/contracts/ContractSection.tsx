import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    useTheme,
} from "@mui/material";
import { SearchBar } from "../../../shared/components/SearchBar";
import { ContractsList } from "./ContractList";
import { getAllContracts } from "../../../user/services/contract.service";
import type { Contract } from "../../../user/types/contract";

export function ContractsSection() {
    const theme = useTheme();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [displayed, setDisplayed] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "ACTIVO" | "INACTIVO">("ALL");

    useEffect(() => {
        (async () => {
            try {
                const data = await getAllContracts();
                setContracts(data);           // :contentReference[oaicite:2]{index=2}
                setDisplayed(data);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        setDisplayed(
            filter === "ALL"
                ? contracts
                : contracts.filter((c) => c.contractStatus === filter)
        );
    }, [filter, contracts]);

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="h6">Contratos</Typography>
                <ToggleButtonGroup
                    size="small"
                    value={filter}
                    exclusive
                    onChange={(_, v) => v && setFilter(v)}
                >
                    <ToggleButton value="ALL">Todos</ToggleButton>
                    <ToggleButton value="ACTIVO">Activos</ToggleButton>
                    <ToggleButton value="INACTIVO">Inactivos</ToggleButton>
                </ToggleButtonGroup>
                <Box sx={{ flexGrow: 1, maxWidth: 300 }}>
                    <SearchBar
                        placeholder="Buscar contrato…"
                        fetchAll={getAllContracts}
                        fetchByText={async () => displayed}
                        onSearch={setDisplayed}
                    />
                </Box>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <ContractsList
                    contracts={displayed}
                    onEdit={() => {/* … */ }}
                    onDelete={() => {/* … */ }}
                />
            )}
        </Box>
    );
}
