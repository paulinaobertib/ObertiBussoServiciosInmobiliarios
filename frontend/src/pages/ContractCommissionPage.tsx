import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BasePage } from "./BasePage";
import { Box, Button, Card, CardContent, CircularProgress, Divider, Typography } from "@mui/material";
import { getCommissionByContractId } from "../app/user/services/commission.service";
import type { Commission } from "../app/user/types/commission";
import { CommissionInlineStep } from "../app/user/components/commission/CommissionSection";
import { ROUTES } from "../lib";

export default function ContractCommissionPage() {
  const { id } = useParams<{ id: string }>();
  const contractId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [commission, setCommission] = useState<Commission | null>(null);
  const [showEdit, setShowEdit] = useState<boolean>(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const c = await getCommissionByContractId(contractId);
      setCommission(c as Commission);
    } catch {
      setCommission(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [contractId]);

  const renderExisting = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography fontWeight={700}>Comisión del contrato</Typography>
        <Typography variant="body2" color="text.secondary">
          Monto: ${Number(commission?.totalAmount ?? 0).toLocaleString()} {commission?.currency}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fecha: {(commission?.date || "").split("T")[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tipo de pago: {commission?.paymentType}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cuotas: {commission?.installments}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Estado: {commission?.status}
        </Typography>
        {commission?.note && (
          <Typography variant="body2" color="text.secondary">
            Nota: {commission?.note}
          </Typography>
        )}
        <Box mt={1} display="flex" gap={1}>
          <Button variant="outlined" onClick={() => setShowEdit((s) => !s)}>
            {showEdit ? "Cancelar" : "Editar"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <BasePage>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Comisión del contrato
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" onClick={() => navigate(ROUTES.CONTRACT)}>
            Cancelar
          </Button>
        </Box>

        {loading ? (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        ) : commission ? (
          <>
            {renderExisting()}
            <Divider sx={{ my: 1 }} />
            {showEdit && (
              <CommissionInlineStep
                contractId={contractId}
                onSaved={async () => {
                  await refresh();
                  setShowEdit(false);
                }}
              />
            )}
          </>
        ) : (
          <CommissionInlineStep contractId={contractId} onSaved={() => navigate(ROUTES.CONTRACT)} />
        )}
      </Box>
    </BasePage>
  );
}
