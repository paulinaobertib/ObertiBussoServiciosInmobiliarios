import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Container, Tab, Tabs, Typography } from "@mui/material";
import RealEstateAgentIcon from "@mui/icons-material/RealEstateAgent";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BasePage from "./BasePage";
import { ROUTES } from "../lib";
import { useAuthContext } from "../app/user/context/AuthContext";
import { getContractsByUserId } from "../app/user/services/contract.service";
import { getMyReceipts } from "../app/user/services/receipt.service";
import { ContractList } from "../app/user/components/contracts/ContractList";
import { ReceiptsList } from "../app/user/components/receipts/ReceiptsList";
import type { Contract } from "../app/user/types/contract";
import type { Receipt } from "../app/user/types/receipt";
import { useApiErrors } from "../app/shared/hooks/useErrors";
import { EmptyState } from "../app/shared/components/EmptyState";

type TabKey = "contratos" | "recibos";

// Lo que ve el inquilino: sus contratos, sus recibos, o ambos (lo define el admin)
export default function TenantPortalPage() {
  const { info, isAdmin, canViewContracts, canViewReceipts } = useAuthContext();
  const { handleError } = useApiErrors();
  const [params, setParams] = useSearchParams();

  const tabs = useMemo(() => {
    const t: TabKey[] = [];
    if (canViewContracts) t.push("contratos");
    if (canViewReceipts) t.push("recibos");
    return t;
  }, [canViewContracts, canViewReceipts]);

  const requested = params.get("tab") as TabKey | null;
  const tab: TabKey | undefined = requested && tabs.includes(requested) ? requested : tabs[0];

  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);

  useEffect(() => {
    if (tab !== "contratos" || contracts || !info?.id) return;
    getContractsByUserId(info.id)
      .then((data) => setContracts(Array.isArray(data) ? data : []))
      .catch((e) => {
        handleError(e);
        setContracts([]);
      });
  }, [tab, contracts, info?.id, handleError]);

  useEffect(() => {
    if (tab !== "recibos" || receipts) return;
    getMyReceipts()
      .then(setReceipts)
      .catch((e) => {
        handleError(e);
        setReceipts([]);
      });
  }, [tab, receipts, handleError]);

  // el admin tiene sus propias pantallas
  if (isAdmin) return <Navigate to={ROUTES.CONTRACT} replace />;

  const loading = (tab === "contratos" && !contracts) || (tab === "recibos" && !receipts);

  return (
    <BasePage maxWidth={false}>
      <Container sx={{ py: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Hola{info?.firstName ? `, ${info.firstName}` : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Acá tenés la información de tu alquiler con Oberti Busso Servicios Inmobiliarios.
        </Typography>

        {!tabs.length ? (
          <EmptyState
            title="Todavía no tenés secciones habilitadas. Consultá con la inmobiliaria."
            minHeight={220}
          />
        ) : (
          <>
            {tabs.length > 1 && (
              <Tabs
                value={tab}
                onChange={(_, v) => setParams({ tab: v }, { replace: true })}
                sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
              >
                <Tab value="contratos" icon={<RealEstateAgentIcon />} iconPosition="start" label="Mis contratos" />
                <Tab value="recibos" icon={<ReceiptLongIcon />} iconPosition="start" label="Mis recibos" />
              </Tabs>
            )}

            {loading ? (
              <Box sx={{ display: "grid", placeItems: "center", minHeight: 220 }}>
                <CircularProgress size={36} />
              </Box>
            ) : tab === "contratos" ? (
              <ContractList contracts={contracts ?? []} />
            ) : (
              <ReceiptsList
                receipts={receipts ?? []}
                showIssuer={false}
                emptyTitle="Todavía no hay recibos para mostrar."
              />
            )}
          </>
        )}
      </Container>
    </BasePage>
  );
}
