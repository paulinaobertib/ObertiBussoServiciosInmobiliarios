import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, MenuItem, Grid, Typography } from "@mui/material";
import { PaymentCurrency, PaymentConcept } from "../../types/payment";
import { getContractUtilitiesByContract } from "../../services/contractUtility.service";
import { getUtilityById } from "../../services/utility.service";
import { getCommissionByContractId } from "../../services/commission.service";
import type { Commission } from "../../types/commission";
import type { ContractUtility } from "../../types/contractUtility";

export interface PaymentFormValues {
  date: string;
  amount: number | "";
  description: string;
  paymentCurrency: PaymentCurrency | "";
  concept: PaymentConcept | "";
  contractUtilityId?: number | "";
  commissionId?: number | "";
}

interface Props {
  contractId: number;
  initialValues?: Partial<PaymentFormValues>;
  onChange: (vals: PaymentFormValues) => void;
  externalConcept?: PaymentConcept | "";
  externalContractUtilityId?: number | "";
  hideConceptSelect?: boolean;
  hideUtilitySelect?: boolean;
  hideCommissionInfo?: boolean;
  disableAmount?: boolean;
  disableCurrency?: boolean;
}

const buildState = (source?: Partial<PaymentFormValues>): PaymentFormValues => ({
  date: source?.date ?? "",
  amount: source?.amount ?? "",
  description: source?.description ?? "",
  paymentCurrency: source?.paymentCurrency ?? "",
  concept: source?.concept ?? "",
  contractUtilityId: source?.contractUtilityId ?? "",
  commissionId: source?.commissionId ?? "",
});

const shallowEqual = (a: PaymentFormValues, b: PaymentFormValues) =>
  a.date === b.date &&
  a.amount === b.amount &&
  a.description === b.description &&
  a.paymentCurrency === b.paymentCurrency &&
  a.concept === b.concept &&
  a.contractUtilityId === b.contractUtilityId &&
  a.commissionId === b.commissionId;

export const PaymentForm = ({
  contractId,
  initialValues,
  onChange,
  externalConcept,
  externalContractUtilityId,
  hideConceptSelect,
  hideUtilitySelect,
  hideCommissionInfo,
  disableAmount,
  disableCurrency,
}: Props) => {
  const currencies = Object.values(PaymentCurrency) as PaymentCurrency[];
  const currencyLabel = (c: PaymentCurrency) =>
    c === PaymentCurrency.ARS ? "Peso argentino" : c === PaymentCurrency.USD ? "Dólar" : c;
  const concepts = Object.values(PaymentConcept) as PaymentConcept[];
  const labelize = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : "");

  const [utilities, setUtilities] = useState<ContractUtility[]>([]);
  const [utilNames, setUtilNames] = useState<Record<number, string>>({});
  const [commission, setCommission] = useState<Commission | null>(null);

  const [vals, setVals] = useState<PaymentFormValues>(buildState(initialValues));
  const prevInitialRef = useRef<PaymentFormValues | null>(initialValues ? buildState(initialValues) : null);

  useEffect(() => {
    if (!initialValues) return;
    const next = buildState(initialValues);
    if (!prevInitialRef.current || !shallowEqual(prevInitialRef.current, next)) {
      prevInitialRef.current = next;
      setVals(next);
    }
  }, [initialValues]);

  useEffect(() => {
    onChange(vals);
  }, [vals, onChange]);

  const handle = (field: keyof PaymentFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    if (field === "amount") {
      value = value === "" ? "" : Number(value);
    } else if (field === "paymentCurrency") {
      value = value as PaymentCurrency;
    } else if (field === "concept") {
      value = value as PaymentConcept;
      if (value !== PaymentConcept.EXTRA) {
        setVals((prev) => ({ ...prev, concept: value, contractUtilityId: "" }));
        return;
      }
      if (value !== PaymentConcept.COMISION) {
        setVals((prev) => ({ ...prev, concept: value, commissionId: "" }));
        return;
      }
    }
    setVals((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    (async () => {
      if (!contractId || contractId <= 0) return;

      if (!hideUtilitySelect) {
        try {
          const list = await getContractUtilitiesByContract(contractId);
          setUtilities(list as any);
          const names: Record<number, string> = {};
          for (const cu of (list as any) || []) {
            try {
              const u = await getUtilityById(cu.utilityId);
              names[cu.utilityId] = (u as any).name ?? String(cu.utilityId);
            } catch {
              // noop
            }
          }
          setUtilNames(names);
        } catch {
          setUtilities([]);
          setUtilNames({});
        }
      }

      if (!hideCommissionInfo) {
        try {
          const com = await getCommissionByContractId(contractId);
          setCommission(com as any);
          if (com?.id) {
            setVals((prev) => ({ ...prev, commissionId: com.id as any }));
          } else {
            setVals((prev) => ({ ...prev, commissionId: "" }));
          }
        } catch {
          setCommission(null);
          setVals((prev) => ({ ...prev, commissionId: "" }));
        }
      }
    })();
  }, [contractId, hideUtilitySelect, hideCommissionInfo]);

  useEffect(() => {
    if (externalConcept !== undefined) {
      setVals((prev) => ({ ...prev, concept: externalConcept ?? "" }));
    }
  }, [externalConcept]);

  useEffect(() => {
    if (externalContractUtilityId !== undefined) {
      setVals((prev) => ({ ...prev, contractUtilityId: externalContractUtilityId ?? "" }));
    }
  }, [externalContractUtilityId]);

  return (
    <Box component="form" noValidate>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="date"
            fullWidth
            label="Fecha"
            InputLabelProps={{ shrink: true }}
            value={vals.date}
            onChange={handle("date")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            type="number"
            fullWidth
            label="Monto"
            value={vals.amount}
            onChange={handle("amount")}
            disabled={!!disableAmount}
          />
        </Grid>

        {!hideConceptSelect && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select fullWidth label="Concepto" value={vals.concept} onChange={handle("concept")}>
              {concepts.map((c) => (
                <MenuItem key={c} value={c}>
                  {labelize(c)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Descripción" value={vals.description} onChange={handle("description")} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            label="Moneda"
            value={vals.paymentCurrency}
            onChange={handle("paymentCurrency")}
            disabled={!!disableCurrency}
          >
            {currencies.map((c) => (
              <MenuItem key={c} value={c}>
                {currencyLabel(c)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {!hideUtilitySelect && vals.concept === PaymentConcept.EXTRA && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Servicio del contrato"
              value={vals.contractUtilityId ?? ""}
              onChange={handle("contractUtilityId")}
            >
              {utilities.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {utilNames[u.utilityId] ?? "Servicio"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {!hideCommissionInfo && vals.concept === PaymentConcept.COMISION && (
          <Grid size={{ xs: 12, sm: 6 }}>
            {commission ? (
              <TextField fullWidth label="Comisión" value={`Comisión #${commission.id}`} disabled />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay comisión asociada a este contrato.
              </Typography>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
