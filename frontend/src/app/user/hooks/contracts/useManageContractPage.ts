// src/app/user/hooks/useManageContractPage.ts
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import {
  getContractById,
  postContract,
  putContract,
} from "../../services/contract.service";
import type { Contract, ContractCreate } from "../../types/contract";
import type { ContractFormHandle } from "../../components/contracts/ContractForm";
import { ROUTES } from "../../../../lib";

export function useManageContractPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  // Confirm dialog & global alert
  const { ask, DialogUI } = useConfirmDialog();
  const { showAlert } = useGlobalAlert();

  // Form ref & estado de validez
  const formRef = useRef<ContractFormHandle>(null);
  const [formReady, setFormReady] = useState(false);

  // Datos de contrato (solo en edición) y carga
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);

  // Stepper
  const [activeStep, setActiveStep] = useState<number>(0);

  // Paso 1 & 2: IDs seleccionados
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ── Preload en edición ──
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);
      try {
        // Si tu servicio devuelve directamente el Contract:
        const data = await getContractById(Number(id!));
        // Si tu servicio retorna axios.Response<Contract>, usa:
        // const { data } = await getContractById(Number(id!));

        setContract(data);
        setSelectedPropertyId(data.propertyId);
        setSelectedUserId(data.userId);
      } catch {
        // Si falla, enviamos al listado y mostramos alerta
        navigate("/contracts");
        showAlert("Error al cargar contrato", "error");
      } finally {
        setLoading(false);
      }
    })();
    // ————————
    // Dependencias: solo id e isEdit para que NO se repita en cada render
  }, [id, isEdit]);

  // ── Lógica de habilitación de botones ──
  // Siguiente/Guardar depende del paso actual
  const canProceed = () => {
    if (activeStep === 0) return selectedPropertyId != null;
    if (activeStep === 1) return selectedUserId != null;
    if (activeStep === 2) return formReady;
    return false;
  };

  // ── Guardar / crear ──
  const save = async () => {
    // envía el formulario y valida
    const values = await formRef.current?.submit();
    if (!values) return;

    setLoading(true);
    try {
      if (isEdit) {
        // actualización: incluye id en el payload
        await putContract({ id: Number(id!), ...values } as Contract);
        showAlert("Contrato actualizado", "success");
      } else {
        // creación: postContract recibe payload + amount, currency
        const payload: ContractCreate = {
          propertyId: selectedPropertyId!,
          userId: selectedUserId!,
          contractType: values.contractType,
          contractStatus: values.contractStatus,
          startDate: values.startDate,
          endDate: values.endDate,
          increase: values.amount,
          increaseFrequency: values.increaseFrequency,
        };
        await postContract(payload, values.amount, values.currency);
        showAlert("Contrato creado", "success");
      }
      navigate("/contracts");
    } catch {
      showAlert("Error al guardar contrato", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Cancelar / Back ──
  const cancel = () =>
    ask("¿Cancelar los cambios?", async () => {
      formRef.current?.reset();
      navigate(ROUTES.CONTRACT);
    });

  // Título dinámico
  const title = isEdit ? "Editar Contrato" : "Crear Contrato";

  return {
    // Datos & loader
    contract,
    loading,

    // Stepper
    activeStep,
    setActiveStep,

    // Selecciones
    selectedPropertyId,
    setSelectedPropertyId,
    selectedUserId,
    setSelectedUserId,

    // Form
    formRef,
    formReady,
    setFormReady,

    // Controls
    canProceed,
    save,
    cancel,

    // Meta
    title,
    DialogUI,
  };
}
