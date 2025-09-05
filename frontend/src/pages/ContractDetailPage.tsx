// src/pages/ContractDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, CircularProgress, Paper, Chip, Divider, Stack, IconButton
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import BasePage from "./BasePage";
import { getContractById } from "../app/user/services/contract.service";
import type { Contract } from "../app/user/types/contract";

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getContractById(String(id));
        if (!mounted) return;
        setContract(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("es-AR") : "-";

  if (loading) {
    return (
      <BasePage>
        <Container sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      </BasePage>
    );
  }

  if (!contract) {
    return (
      <BasePage>
        <Container sx={{ py: 6 }}>
          <Typography>No se encontró el contrato.</Typography>
        </Container>
      </BasePage>
    );
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 3000 }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage>
        <Container sx={{ py: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={2}>
            Detalle de Contrato #{contract.id}
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} mb={2}>
              <Chip label={contract.contractType} />
              <Chip color={contract.contractStatus === "ACTIVO" ? "success" : "default"} label={contract.contractStatus} />
              <Chip label={contract.currency} />
            </Stack>

            <Typography><b>Usuario ID:</b> {contract.userId}</Typography>
            <Typography><b>Propiedad ID:</b> {contract.propertyId}</Typography>
            <Typography><b>Inicio:</b> {fmtDate(contract.startDate)}</Typography>
            <Typography><b>Fin:</b> {fmtDate(contract.endDate)}</Typography>
            <Typography><b>Monto inicial:</b> $ {(contract.initialAmount ?? 0).toLocaleString("es-AR")}</Typography>
            <Typography><b>Frecuencia ajuste:</b> {contract.adjustmentFrequencyMonths} meses</Typography>
            <Typography><b>Último pago (monto):</b> {contract.lastPaidAmount != null ? `$ ${contract.lastPaidAmount.toLocaleString("es-AR")}` : "-"}</Typography>
            <Typography><b>Último pago (fecha):</b> {fmtDate(contract.lastPaidDate)}</Typography>
            <Typography><b>Depósito:</b> {contract.hasDeposit ? "Sí" : "No"}</Typography>
            {contract.hasDeposit && (
              <>
                <Typography><b>Monto depósito:</b> {contract.depositAmount ?? "-"}</Typography>
                <Typography><b>Nota depósito:</b> {contract.depositNote ?? "-"}</Typography>
              </>
            )}
            <Typography><b>Índice ajuste:</b> {contract.adjustmentIndex ? `${contract.adjustmentIndex.code} - ${contract.adjustmentIndex.name}` : "-"}</Typography>
            <Typography sx={{ mt: 1 }}><b>Nota:</b> {contract.note ?? "-"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1"><b>Garantes</b></Typography>
            <Typography>{contract.guarantors?.length ? `${contract.guarantors.length} garante(s)` : "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1"><b>Utilidades</b></Typography>
            <Typography>{contract.contractUtilities?.length ? `${contract.contractUtilities.length} utilidad(es)` : "—"}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1"><b>Pagos</b></Typography>
            <Typography>{contract.payments?.length ? `${contract.payments.length} pago(s)` : "—"}</Typography>
          </Paper>
        </Container>
      </BasePage>
    </>
  );
}
