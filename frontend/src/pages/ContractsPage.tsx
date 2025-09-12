import {
    Container,
    Box,
    Button,
    CircularProgress,
    Typography,
    IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ReplyIcon from "@mui/icons-material/Reply";
import { ROUTES } from "../lib";

import { useContractsPage } from "../app/user/hooks/contracts/useContractsPage";
import { ContractStatus } from "../app/user/types/contract";
import { ContractsStats } from "../app/user/components/contracts/ContractsStats";
import { ContractsFilters } from "../app/user/components/contracts/ContractsFilters";
import { ContractList } from "../app/user/components/contracts/ContractList";
import { PaymentDialog } from "../app/user/components/payments/PaymentDialog";
// import { IncreaseDialog } from "../app/user/components/increases/IncreaseDialog";
import { HistoryDialog } from "../app/user/components/contracts/HistoryDialog";
// removed utilities dialog per UX preference
import BasePage from "./BasePage";

export default function ContractsPage() {
    const {
        all,
        filtered: disp,
        loading,
        statusFilter: filter,
        setStatusFilter: setFilter,
        handleSearch,
        paying,
        setPaying,
        // increasing,
        // setIncreasing,
        history,
        setHistory,
        handleDelete,
        handleToggleStatus,
        refresh,
        isAdmin,
        navigate,
        DialogUI,
    } = useContractsPage();


    const activeCount = all.filter(
        (c) => c.contractStatus === ContractStatus.ACTIVO
    ).length;
    const inactiveCount = all.filter(
        (c) => c.contractStatus === ContractStatus.INACTIVO
    ).length;

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: "absolute", top: 64, left: 8, zIndex: 3000 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage maxWidth={false}>
                {/* Contenedor relativo para posicionar el overlay */}
                <Box sx={{ position: "relative" }}>
                    <Container sx={{ py: 2 }}>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={3}
                        >
                            <Typography variant="h5" fontWeight={600}>
                                Contratos de Alquiler
                            </Typography>
                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate(ROUTES.NEW_CONTRACT)}
                                >
                                    Nuevo Contrato
                                </Button>
                            )}
                        </Box>

                        <ContractsStats
                            activeCount={activeCount}
                            totalCount={all.length}
                            inactiveCount={inactiveCount}
                        />

                        {isAdmin && (
                            <ContractsFilters
                                filter={filter}
                                onFilterChange={setFilter}
                                onSearch={handleSearch}
                            />
                        )}

                        <ContractList
                            contracts={disp}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
                        />

                        <PaymentDialog
                            open={!!paying}
                            contract={paying}
                            onClose={() => setPaying(null)}
                            onSaved={async () => {
                                setPaying(null);
                                await refresh();
                            }}
                        />
                        {/* <IncreaseDialog
                            open={!!increasing}
                            contract={increasing}
                            onClose={() => setIncreasing(null)}
                            onSaved={async () => {
                                setIncreasing(null);
                                await refresh();
                            }}
                        /> */}
                        <HistoryDialog
                            open={!!history}
                            contract={history}
                            onClose={() => setHistory(null)}
                        />

                        {null}

                        {DialogUI}
                    </Container>

                    {loading && (
                        <CircularProgress size={36} />
                    )}
                    
                </Box>
            </BasePage>
        </>
    );
}
