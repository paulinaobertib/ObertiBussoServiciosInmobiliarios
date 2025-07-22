import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  postContract,
  putContract,
} from "../../user/services/contract.service";
import type { ContractCreate, Contract } from "../../user/types/contract";
import type { ContractFormHandle } from "../components/contracts/ContractForm";
import type { ContractFormValues } from "./useContractForm";

import { useGlobalAlert } from "../../shared/context/AlertContext";
import { ROUTES } from "../../../lib";

export function useManageContractPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title] = useState(isEdit ? "Editar Contrato" : "Crear Contrato");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const canProceed = !!selectedPropertyId && !!selectedUserId;

  const formRef = useRef<ContractFormHandle>(null);
  const [formReady, setFormReady] = useState(false);

  const { showAlert } = useGlobalAlert();

  const save = async () => {
    if (!formRef.current) return;
    const vals = (await formRef.current.submit()) as ContractFormValues | null;
    if (!vals) return;

    // separo amount y currency del body
    const { amount, currency, ...contractData } = vals;

    setLoading(true);
    try {
      if (isEdit) {
        await putContract(contractData as Contract);
      } else {
        await postContract(contractData as ContractCreate, amount, currency);
      }
      showAlert(isEdit ? "Contrato actualizado" : "Contrato creado", "success");
      navigate(ROUTES.CONTRACT);
    } catch {
      showAlert(
        isEdit ? "Error al actualizar contrato" : "Error al crear contrato",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => navigate(-1);

  return {
    title,
    loading,
    activeStep,
    setActiveStep,
    selectedPropertyId,
    setSelectedPropertyId,
    selectedUserId,
    setSelectedUserId,
    canProceed,
    formRef,
    formReady,
    setFormReady,
    save,
    cancel,
  };
}
