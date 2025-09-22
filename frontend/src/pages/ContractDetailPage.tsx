import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, CircularProgress, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import ReplyIcon from "@mui/icons-material/Reply";
import BasePage from "./BasePage";
import { getContractById, patchContractStatus, deleteContract } from "../app/user/services/contract.service.ts";
import type { ContractGet } from "../app/user/types/contract.ts";
import { useContractNames } from "../app/user/hooks/contracts/useContractNames.ts";
import { useUtilityNames } from "../app/user/hooks/contracts/useUtilityNames.ts";
import { useAuthContext } from "../app/user/context/AuthContext";

import Header from "../app/user/components/contracts/contractDetail/Header";
import InfoPrincipalCard from "../app/user/components/contracts/contractDetail/InfoPrincipalCard";
import PeriodCard from "../app/user/components/contracts/contractDetail/PeriodCard";
import DepositCard from "../app/user/components/contracts/contractDetail/DepositCard";
import FinancialCard from "../app/user/components/contracts/contractDetail/FinancialCard";
import GuarantorsCard from "../app/user/components/contracts/contractDetail/GuarantorsCard";
import CommissionCard from "../app/user/components/contracts/contractDetail/CommissionCard.tsx";
import ServicesExpensesCard from "../app/user/components/contracts/contractDetail/ServicesExpensesCard";
import { PaymentDialog } from "../app/user/components/payments/PaymentDialogBase";
import { PaymentRentDialog } from "../app/user/components/payments/PaymentRentDialog";
import { PaymentCommissionDialog } from "../app/user/components/payments/PaymentCommission";
import { IncreaseDialog } from "../app/user/components/increases/IncreaseDialog";
import { buildRoute, ROUTES } from "../lib";
import { UtilitiesPickerDialog } from "../app/user/components/contract-utilities/SelectUtilitiesDialog";
import { GuarantorPickerDialog } from "../app/user/components/guarantors/SelectGuarantorDialog";
import NotesCard from "../app/user/components/contracts/contractDetail/NotesCard";
import { PaymentExtrasDialog } from "../app/user/components/payments/PaymentExtrasDialog";
import { ContractUtilityDialog } from "../app/user/components/contract-utilities/ManageContractUtility";
import { ContractUtilityIncreaseDialog } from "../app/user/components/contract-utilities/ContractUtilityIncreaseDialog";
import { CommissionDialog } from "../app/user/components/commission/CommissionDialog";

import { getTime } from "../app/user/components/contracts/contractDetail/utils.ts";
import { useGlobalAlert } from "../app/shared/context/AlertContext";
import { useApiErrors } from "../app/shared/hooks/useErrors";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuthContext();

  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractGet | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { userName, propertyName } = useContractNames(contract?.userId ?? "", contract?.propertyId ?? 0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!id) return;
        const resp = await getContractById(Number(id));
        const data = (resp as any)?.data ?? resp;
        if (alive) setContract(data as ContractGet);
      } catch (e) {
        handleError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, handleError]);

  useEffect(() => {
    setRetryCount(0);
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
  const commissionPayments = (() => {
    if (!commission || !commission.id) return [] as any[];
    return payments
      .filter((p: any) => p?.concept === "COMISION" && Number(p?.commissionId) === Number(commission.id))
      .sort((a: any, b: any) => getTime(a) - getTime(b));
  })();
  const commissionPaidCount = commissionPayments.length;

  useEffect(() => {
    if (!contract || !id) return;
    if (retryCount >= 3) return;

    const rawPayments = (contract as any)?.payments;
    const commissionData = (contract as any)?.commission;

    const paymentsReady = Array.isArray(rawPayments) && rawPayments.every((p: any) => p != null);
    const commissionReady = (() => {
      if (!commissionData) return true;
      if (!commissionData.currency || commissionData.totalAmount == null) return false;
      if (commissionData.paymentType === "CUOTAS") {
        return Number(commissionData.installments) > 0;
      }
      return true;
    })();

    if (paymentsReady && commissionReady) return;

    const timer = setTimeout(async () => {
      try {
        const fresh = await getContractById(Number(id));
        const data = (fresh as any)?.data ?? fresh;
        setContract(data as ContractGet);
      } catch (e) {
        handleError(e);
      } finally {
        setRetryCount((prev) => prev + 1);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [contract, id, retryCount, handleError]);

  // helpers de confirmación/éxito
  const confirmDanger = async (title: string, description = "Esta acción no se puede deshacer.") => {
    if (typeof alertApi?.doubleConfirm === "function") {
      return await alertApi.doubleConfirm({
        kind: "error",
        title,
        description,
      });
    }
  };

  const notifySuccess = async (title: string, description?: string) => {
    if (typeof alertApi?.success === "function") {
      await alertApi.success({ title, description, primaryLabel: "Ok" });
    }
  };

  // acciones admin
  const onEdit = () => contract && navigate(buildRoute(ROUTES.EDIT_CONTRACT, contract.id));
  const [openPayments, setOpenPayments] = useState(false);
  const [openRent, setOpenRent] = useState(false);
  const [openCommissionPay, setOpenCommissionPay] = useState<{ open: boolean; installment: number | null }>({
    open: false,
    installment: null,
  });
  const onPayments = () => {
    if (!contract) return;
    setOpenPayments(true);
  };
  const onIncrease = () => setOpenIncrease(true);
  const [openIncrease, setOpenIncrease] = useState(false);
  const [openUtilities, setOpenUtilities] = useState(false);
  const [openGuarantors, setOpenGuarantors] = useState(false);
  const [openCommissionEdit, setOpenCommissionEdit] = useState<{ open: boolean; action: "add" | "edit" }>({
    open: false,
    action: "add",
  });
  const [openServicePay, setOpenServicePay] = useState<number | null>(null);
  const [openServiceEdit, setOpenServiceEdit] = useState<number | null>(null);
  const [openServiceIncrease, setOpenServiceIncrease] = useState<number | null>(null);

  const onDelete = async () => {
    if (!contract) return;
    const ok = await confirmDanger("¿Eliminar el contrato?");
    if (!ok) return;
    try {
      await deleteContract(contract.id);
      await notifySuccess("Contrato eliminado");
      navigate(ROUTES.CONTRACT);
    } catch (e) {
      handleError(e);
    }
  };

  const onToggleStatus = async () => {
    if (!contract || savingStatus) return;
    const msg =
      contract.contractStatus === "ACTIVO"
        ? "Este contrato se inactivará y se avisará por email que está terminado."
        : "¿Reactivar contrato?";
    const ok = await confirmDanger(msg);
    if (!ok) return;

    setSavingStatus(true);
    try {
      await patchContractStatus(contract.id);
      const fresh = await getContractById(contract.id);
      setContract((fresh as any)?.data ?? (fresh as ContractGet));
      await notifySuccess("Estado actualizado");
    } catch (e) {
      handleError(e);
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

  const refreshContract = async () => {
    try {
      const fresh = await getContractById(Number(id));
      const data = (fresh as any)?.data ?? fresh;
      setContract(data as ContractGet);
    } catch (e) {
      handleError(e);
    }
  };

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
        <Header
          contract={contract}
          isAdmin={isAdmin}
          savingStatus={savingStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onPayments={() => onPayments()}
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
            onRegisterIncrease={isAdmin ? () => setOpenIncrease(true) : undefined}
            onRegisterRentPayment={isAdmin ? () => setOpenRent(true) : undefined}
          />

          {/* Servicios y Expensas */}
          <ServicesExpensesCard
            currency={contract.currency}
            utilities={utilities}
            utilityNameMap={utilityNameMap}
            onManage={isAdmin ? () => setOpenUtilities(true) : undefined}
            onPay={isAdmin ? (id) => setOpenServicePay(id) : undefined}
            onIncrease={isAdmin ? (id) => setOpenServiceIncrease(id) : undefined}
            onEdit={isAdmin ? (id) => setOpenServiceEdit(id) : undefined}
            onUnlink={
              isAdmin
                ? async (cuid) => {
                    const ok = await confirmDanger("¿Desvincular este servicio?");
                    if (!ok) return;
                    try {
                      const { deleteContractUtility } = await import("../app/user/services/contractUtility.service");
                      await deleteContractUtility(cuid);
                      await notifySuccess("Servicio desvinculado");
                      await refreshContract();
                    } catch (e) {
                      handleError(e);
                    }
                  }
                : undefined
            }
          />

          {/* Garantes */}
          <GuarantorsCard
            guarantors={guarantors}
            onManage={isAdmin ? () => setOpenGuarantors(true) : undefined}
            onUnlink={
              isAdmin
                ? async (gid) => {
                    const ok = await confirmDanger("¿Quitar garante del contrato?");
                    if (!ok) return;
                    try {
                      const { removeGuarantorFromContract } = await import("../app/user/services/guarantor.service");
                      await removeGuarantorFromContract(gid, Number(id));
                      await notifySuccess("Garante desvinculado");
                      await refreshContract();
                    } catch (e) {
                      handleError(e);
                    }
                  }
                : undefined
            }
          />

          {/* Comisión (admin) a ancho completo */}
          {isAdmin && (
            <CommissionCard
              gridFull
              commission={commission}
              paidCount={commissionPaidCount}
              payments={commissionPayments}
              onAdd={() => setOpenCommissionEdit({ open: true, action: "add" })}
              onEdit={() => setOpenCommissionEdit({ open: true, action: "edit" })}
              onRegisterPayment={() => setOpenCommissionPay({ open: true, installment: null })}
              onRegisterInstallment={(n: any) => setOpenCommissionPay({ open: true, installment: n })}
            />
          )}

          {/* Depósito (admin) + Notas (admin) en la misma fila */}
          {isAdmin && (
            <>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", minWidth: 0 }}>
                <DepositCard
                  sxHeight="80%"
                  currency={contract.currency}
                  hasDeposit={contract.hasDeposit}
                  depositAmount={contract.depositAmount}
                  depositNote={contract.depositNote}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", minWidth: 0 }}>
                <NotesCard note={contract.note} />
              </Grid>
            </>
          )}

          {/* Notas ya incluidas junto a Depósito cuando es admin */}
        </Grid>
      </BasePage>

      <PaymentDialog
        open={openPayments}
        contract={contract as any}
        onClose={() => setOpenPayments(false)}
        onSaved={async () => {
          setOpenPayments(false);
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      <PaymentRentDialog
        open={openRent}
        contract={contract as any}
        onClose={() => setOpenRent(false)}
        onSaved={async () => {
          setOpenRent(false);
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      <PaymentCommissionDialog
        open={openCommissionPay.open}
        installment={openCommissionPay.installment}
        contract={contract as any}
        onClose={() => setOpenCommissionPay({ open: false, installment: null })}
        onSaved={async () => {
          setOpenCommissionPay({ open: false, installment: null });
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      <UtilitiesPickerDialog
        open={openUtilities}
        contractId={Number(id)}
        onClose={() => setOpenUtilities(false)}
        onUpdated={async () => {
          await refreshContract();
        }}
      />
      <PaymentExtrasDialog
        open={openServicePay != null}
        contract={contract as any}
        contractUtilityId={openServicePay ?? undefined}
        onClose={() => setOpenServicePay(null)}
        onSaved={async () => {
          setOpenServicePay(null);
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      <ContractUtilityDialog
        open={openServiceEdit != null}
        mode="edit"
        contractId={Number(id)}
        contractUtilityId={openServiceEdit}
        onClose={() => setOpenServiceEdit(null)}
        onSaved={async () => {
          setOpenServiceEdit(null);
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      <ContractUtilityIncreaseDialog
        open={openServiceIncrease != null}
        contractUtilityId={openServiceIncrease}
        onClose={() => setOpenServiceIncrease(null)}
        onSaved={async () => {
          setOpenServiceIncrease(null);
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      <GuarantorPickerDialog
        open={openGuarantors}
        contractId={Number(id)}
        onClose={() => setOpenGuarantors(false)}
        onLinked={async () => {
          await refreshContract();
        }}
      />
      <IncreaseDialog
        open={openIncrease}
        contract={contract as any}
        onClose={() => setOpenIncrease(false)}
        onSaved={async () => {
          setOpenIncrease(false);
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      <CommissionDialog
        open={openCommissionEdit.open}
        action={openCommissionEdit.action}
        item={commission as any}
        contractId={contract?.id}
        onClose={() => setOpenCommissionEdit({ open: false, action: "add" })}
        onSaved={async () => {
          setOpenCommissionEdit({ open: false, action: "add" });
          const fresh = await getContractById(Number(id));
          const data = (fresh as any)?.data ?? fresh;
          setContract(data as ContractGet);
        }}
      />
      {/* Eliminado: {DialogUI} */}
    </>
  );
}
