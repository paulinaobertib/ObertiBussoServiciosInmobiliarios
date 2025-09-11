// src/app/user/hooks/useManageContractPage.ts
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { getContractById, postContract, putContract } from "../../services/contract.service";
import type { ContractCreate, ContractGet } from "../../types/contract";
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
  const [contract, setContract] = useState<ContractGet | null>(null);
  const [loading, setLoading] = useState<boolean>(isEdit);

  // Stepper
  const [activeStep, setActiveStep] = useState<number>(0);

  // Paso 1 & 2: IDs seleccionados
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [addGuarantors, setAddGuarantors] = useState<boolean>(false);
  const [selectedGuarantorIds, setSelectedGuarantorIds] = useState<number[]>([]);
  const [selectedUtilityIds, setSelectedUtilityIds] = useState<number[]>([]);

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
        // Precargar garantes desde el contrato (GetDTO)
        const guarIds = Array.isArray((data as any)?.guarantors)
          ? ((data as any).guarantors as Array<{ id: number }>).map((g) => g.id)
          : [];
        setSelectedGuarantorIds(guarIds);
      } catch {
        // Si falla, enviamos al listado y mostramos alerta
        navigate(ROUTES.CONTRACT);
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
    if (activeStep === 1) return selectedUserId != null; // garantes opcional
    if (activeStep === 2) return formReady; // Datos
    if (activeStep === 3) return true; // Utilities (opcional)
    return false;
  };

  // ── Guardar / crear ──
  const save = async () => {
    console.log('[ManageContractPage.save] start', {
      activeStep,
      selectedPropertyId,
      selectedUserId,
      selectedGuarantorIds,
      selectedUtilityIds,
    });

    await formRef.current?.submit();

    setLoading(true);
    try {
      if (isEdit) {
        // actualización: mapeo a ContractUpdate (sin id) y envío id por path
        const payload: ContractCreate = formRef.current!.getCreateData();
        await putContract(Number(id!), payload as any);
        showAlert("Contrato actualizado", "success");
      } else {
        // creación
        const payload: ContractCreate = formRef.current!.getCreateData();
        await postContract(payload as any);
        showAlert("Contrato creado", "success");
      }
      navigate(ROUTES.CONTRACT);
    } catch (e) {
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
    addGuarantors,
    setAddGuarantors,
    selectedGuarantorIds,
    setSelectedGuarantorIds,
    selectedUtilityIds,
    setSelectedUtilityIds,

    // Form
    formRef,
    formReady,
    setFormReady,
    // extras integrados

    // Controls
    canProceed,
    save,
    cancel,

    // Meta
    title,
    DialogUI,
  };
}
