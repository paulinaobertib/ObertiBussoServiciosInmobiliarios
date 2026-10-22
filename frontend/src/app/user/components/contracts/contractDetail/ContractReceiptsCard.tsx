import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Box, Button, Card, CircularProgress, MenuItem, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import AddIcon from "@mui/icons-material/Add";
import { ReceiptsList } from "../../receipts/ReceiptsList";
import { ReceiptFormDialog } from "../../receipts/ReceiptFormDialog";
import { getMyReceipts, getReceiptsByContract } from "../../../services/receipt.service";
import type { Receipt, ReceiptCreate } from "../../../types/receipt";
import type { ContractGet } from "../../../types/contract";
import type { Payment } from "../../../types/payment";
import { receiptFromContract } from "../../../utils/receiptPrefill";
import { formatAmount } from "../../../../shared/utils/numberFormat";
import { useApiErrors } from "../../../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../../../shared/context/AlertContext";

type Props = {
  contract: ContractGet;
  isAdmin: boolean;
  canViewReceipts: boolean;
  /** nombre de cada servicio del contrato (para describir los pagos de servicios) */
  utilityNames?: Record<number, string>;
};

export default function ContractReceiptsCard({ contract, isAdmin, canViewReceipts, utilityNames = {} }: Props) {
  const { handleError } = useApiErrors();
  const { showAlert } = useGlobalAlert();
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [initial, setInitial] = useState<ReceiptCreate | null>(null);
  const [preparing, setPreparing] = useState(false);

  const load = useCallback(async () => {
    try {
      if (isAdmin) setReceipts(await getReceiptsByContract(contract.id));
      else setReceipts((await getMyReceipts()).filter((r) => r.contractId === contract.id));
    } catch (e) {
      handleError(e);
      setReceipts([]);
    }
  }, [contract.id, isAdmin, handleError]);

  useEffect(() => {
    if (isAdmin || canViewReceipts) load();
  }, [isAdmin, canViewReceipts, load]);

  if (!isAdmin && !canViewReceipts) return null;

  const payments: Payment[] = [...((contract.payments ?? []) as Payment[])]
    .filter((p) => p && p.concept !== "COMISION")
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
    .slice(0, 24);

  const open = async (payment?: Payment | null, kind: ReceiptCreate["kind"] = "RECIBO") => {
    setPreparing(true);
    try {
      const utilityId = (payment as any)?.contractUtilityId as number | undefined;
      const utilityName = utilityId ? utilityNames[utilityId] : null;
      const data = await receiptFromContract(contract, payment, utilityName);
      setInitial({ ...data, kind });
      setFormOpen(true);
    } catch (e) {
      handleError(e);
    } finally {
      setPreparing(false);
    }
  };

  const paymentLabel = (p: Payment) => {
    const name = p.concept === "EXTRA" ? utilityNames[(p as any).contractUtilityId] ?? "Servicio" : "Alquiler";
    return `${dayjs(p.date).format("DD/MM/YYYY")} · ${name} · ${p.paymentCurrency === "USD" ? "U$S" : "$"} ${formatAmount(p.amount)}`;
  };

  return (
    <Grid size={{ xs: 12, md: isAdmin ? 6 : 12 }} sx={{ display: "flex", minWidth: 0 }}>
      <Card elevation={2} sx={{ p: "1.5rem", borderRadius: "0.75rem", display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: "1.25rem", display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography sx={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem", fontWeight: 600, color: "primary.main" }}>
            <ReceiptLongOutlined />
            Recibos
          </Typography>
          {isAdmin && (
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Button size="small" variant="outlined" disabled={preparing} onClick={() => open(null, "LIQUIDACION")}>
                Liquidación
              </Button>
              <Button size="small" variant="contained" startIcon={<AddIcon />} disabled={preparing} onClick={() => open(null)}>
                Recibo
              </Button>
            </Box>
          )}
        </Box>

        {isAdmin && payments.length > 0 && (
          <TextField
            select
            size="small"
            fullWidth
            label="Hacer el recibo de un pago registrado"
            value=""
            onChange={(e) => open(payments.find((p) => p.id === Number(e.target.value)))}
            sx={{ mb: 2 }}
          >
            {payments.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {paymentLabel(p)}
              </MenuItem>
            ))}
          </TextField>
        )}

        {receipts === null ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <ReceiptsList receipts={receipts} showIssuer={false} emptyTitle="Todavía no hay recibos de este contrato." />
        )}
      </Card>

      {isAdmin && (
        <ReceiptFormDialog
          open={formOpen}
          initial={initial}
          lockContract
          onClose={() => setFormOpen(false)}
          onCreated={(r) => {
            showAlert(`Se emitió el comprobante ${r.number}.`, "success");
            load();
          }}
        />
      )}
    </Grid>
  );
}
