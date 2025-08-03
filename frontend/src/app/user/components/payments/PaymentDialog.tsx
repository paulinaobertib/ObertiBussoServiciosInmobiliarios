// src/components/payments/PaymentDialog.tsx
import { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import { Modal } from "../../../shared/components/Modal";
import { PaymentForm, PaymentFormValues } from "./PaymentForm";
import { postPayment } from "../../services/payment.service";
import type { Contract } from "../../types/contract";
import type { PaymentCreate } from "../../types/payment";
import { PaymentCurrency } from "../../types/payment";

interface Props {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSaved: () => void;
}

export const PaymentDialog = ({ open, contract, onClose, onSaved }: Props) => {
  const empty: PaymentFormValues = {
    date: "",
    amount: 0,
    description: "",
    paymentCurrency: PaymentCurrency.ARS,
  };
  const [vals, setVals] = useState<PaymentFormValues>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVals(empty);
  }, [contract]);

  const handleSave = async () => {
    if (!contract) return;
    setSaving(true);

    const payload: PaymentCreate = {
      contract: { id: contract.id },
      amount: vals.amount,
      date: `${vals.date}T00:00:00`,
      description: vals.description,
      paymentCurrency: vals.paymentCurrency,
    };

    try {
      await postPayment(payload);
      onSaved();
      onClose();
    } catch (e) {
      console.error("Error creating payment:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Registrar Pago" onClose={onClose}>
      <PaymentForm initialValues={vals} onChange={setVals} />
      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" disabled={saving} onClick={handleSave}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </Box>
    </Modal>
  );
};
