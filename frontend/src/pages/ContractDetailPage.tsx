import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, CircularProgress, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import ReplyIcon from "@mui/icons-material/Reply";

import BasePage from "./BasePage.tsx";
import { getContractById, patchContractStatus } from "../app/user/services/contract.service.ts";
import type { ContractDetail } from "../app/user/types/contract.ts";
import { useContractNames } from "../app/user/hooks/contracts/useContractNames.ts";
import { useUtilityNames } from "../app/user/hooks/contracts/useUtilityNames.ts";
import { useAuthContext } from "../app/user/context/AuthContext.tsx";

import Header from "../app/user/components/contracts/contractDetail/Header.tsx";
import InfoPrincipalCard from "../app/user/components/contracts/contractDetail/InfoPrincipalCard.tsx";
import PeriodCard from "../app/user/components/contracts/contractDetail/PeriodCard.tsx";
import DepositCard from "../app/user/components/contracts/contractDetail/DepositCard.tsx";
import FinancialCard from "../app/user/components/contracts/contractDetail/FinancialCard.tsx";
import GuarantorsCard from "../app/user/components/contracts/contractDetail/GuarantorsCard.tsx";
import CommissionCard from "../app/user/components/contracts/contractDetail/ComissionCard.tsx";
import ServicesExpensesCard from "../app/user/components/contracts/contractDetail/ServicesExpensesCard.tsx";
import NotesCard from "../app/user/components/contracts/contractDetail/NotesCard.tsx";

import { getTime } from "../app/user/components/contracts/contractDetail/utils.ts";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const { userName, propertyName } = useContractNames(
    contract?.userId ?? "",
    contract?.propertyId ?? 0
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) return;
        const resp = await getContractById(Number(id));
        const data = (resp as any)?.data ?? resp;
        if (alive) setContract(data as ContractDetail);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const utilities = contract?.contractUtilities ?? [];
  const utilityNameMap = useUtilityNames(utilities);

  const propertyHref = `/properties/${contract?.propertyId}`;
  const guarantors = contract?.guarantors ?? [];
  const commission = (contract as any)?.commission ?? null;
  const payments = (contract as any)?.payments ?? [];
  const increasesRaw = (contract as any)?.contractIncrease ?? [];

  const paymentsSorted = [...payments].sort((a, b) => getTime(b) - getTime(a));
  const increasesSorted = [...increasesRaw].sort((a, b) => getTime(b) - getTime(a));

  // acciones admin
  const onEdit = () => contract && navigate(`/contracts/${contract.id}/edit`);
  const onPayments = () => contract && navigate(`/contracts/${contract.id}/payments`);
  const onIncrease = () => contract && navigate(`/contracts/${contract.id}/increase`);
  const onDelete = () =>
    contract &&
    window.confirm("¿Eliminar el contrato? Esta acción no se puede deshacer.") &&
    navigate("/contracts");

  const onToggleStatus = async () => {
    if (!contract || savingStatus) return;
    try {
      setSavingStatus(true);
      await patchContractStatus(contract.id);
      const fresh = await getContractById(contract.id);
      setContract(fresh as ContractDetail);
    } finally {
      setSavingStatus(false);
    }
  };

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
          <Typography sx={{ fontSize: "1rem" }}>No se encontró el contrato.</Typography>
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
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Header */}
          <Header
            contract={contract}
            isAdmin={isAdmin}
            savingStatus={savingStatus}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onPayments={onPayments}
            onIncrease={onIncrease}
          />

          {/* Grid */}
          <Grid container rowSpacing={3} columnSpacing={3} sx={{ alignItems: "stretch" }}>
            {/* Información principal (solo admin) */}
            {isAdmin && (
              <InfoPrincipalCard
                userName={userName}
                propertyName={propertyName}
                propertyHref={propertyHref}
                userId={contract.userId}
              />
            )}

            {/* Período */}
            <PeriodCard startDate={contract.startDate} endDate={contract.endDate} />

            {/* Depósito junto al período (solo tenant) */}
            {!isAdmin && (
              <DepositCard
                //isAdmin={false}
                currency={contract.currency}
                hasDeposit={contract.hasDeposit}
                depositAmount={contract.depositAmount}
                depositNote={contract.depositNote}
              />
            )}

            {/* Info financiera + historiales */}
            <FinancialCard
              currency={contract.currency}
              initialAmount={contract.initialAmount}
              lastPaidAmount={contract.lastPaidAmount}
              lastPaidDate={contract.lastPaidDate}
              adjustmentFrequencyMonths={contract.adjustmentFrequencyMonths}
              adjustmentIndex={contract.adjustmentIndex}
              paymentsSorted={paymentsSorted}
              increasesSorted={increasesSorted}
            />

            {/* Garantes */}
            <GuarantorsCard guarantors={guarantors} />

            {/* Depósito (admin) */}
            {isAdmin && (
              <DepositCard
                //isAdmin
                sxHeight="80%"
                currency={contract.currency}
                hasDeposit={contract.hasDeposit}
                depositAmount={contract.depositAmount}
                depositNote={contract.depositNote}
              />
            )}

            {/* Comisión (admin) */}
            {isAdmin && (
              <CommissionCard commission={commission} />
            )}

            {/* Servicios y Expensas */}
            <ServicesExpensesCard
              currency={contract.currency}
              utilities={utilities}
              utilityNameMap={utilityNameMap}
            />

            {/* Notas (admin) */}
            {isAdmin && contract.note && <NotesCard note={contract.note} />}
          </Grid>
        </Container>
      </BasePage>
    </>
  );
}
